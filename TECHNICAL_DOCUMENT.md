# Portfolio Pulse — Technical Architecture & Solutions Document

**Company Assignment:** Dynamic Portfolio Dashboard with React.js, TypeScript, Tailwind & Node.js  
**Organization:** Octa Byte AI Pvt Ltd  
**Product:** Portfolio Pulse Terminal v4.2  

---

## 1. Executive Architecture Overview

Portfolio Pulse is designed as an institutional-grade financial monitoring terminal that aggregates real-time market data, computes portfolio valuations across multiple sector tiers, and delivers a low-latency UI.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS APP ROUTER                              │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     CLIENT UI LAYER (React 19)                   │  │
│  │  • Navbar (Heartbeat, Search, Profile, Tab Switcher)             │  │
│  │  • KpiStrip (5 Metric Glass Cards with SVG Sparklines)          │  │
│  │  • HologramOrb (Three.js 3D Orbital Sector Visualization)        │  │
│  │  • SectorDonut (Recharts Donut with Custom Slices & Legends)     │  │
│  │  • HoldingsTable (TanStack Table with Grouped Sector Subtotals)  │  │
│  │  • StockInspector (Docked Intraday Ratios & Consensus)           │  │
│  │  • Export Suite (Client-side CSV & jsPDF AutoTable Engine)       │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
│                                    │ 15s SWR Polling                   │
│                                    ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   SERVER API ROUTE (/api/portfolio)              │  │
│  │                                                                  │  │
│  │    ┌────────────────────────────────────────────────────────┐    │  │
│  │    │         L1 In-Memory Cache (TTL: 15s, SWR)             │    │  │
│  │    └──────────────┬──────────────────────────┬──────────────┘    │  │
│  │                   │ Cache Miss               │ Cache Hit (<1ms)  │  │
│  │                   ▼                          ▼                   │  │
│  │    ┌──────────────────────────────┐   ┌─────────────────────┐    │  │
│  │    │ Asynchronous Scraper Workers │   │ Immediate JSON Fast │    │  │
│  │    │ • Yahoo Finance CMP Fetcher  │   │ Response Return     │    │  │
│  │    │ • Google Finance P/E Fetcher │   └─────────────────────┘    │  │
│  │    └──────────────┬───────────────┘                              │  │
│  │                   │                                              │  │
│  │                   ▼                                              │  │
│  │    ┌────────────────────────────────────────────────────────┐    │  │
│  │    │ Pure Calculation Engine (portfolioCalc.ts)             │    │  │
│  │    │ • Individual Holding Valuation & P&L                   │    │  │
│  │    │ • Sector Aggregation & Subtotal Matrices               │    │  │
│  │    │ • Portfolio KPI Grand Totals & Alpha vs Nifty          │    │  │
│  │    └────────────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Key Technical Challenges & Solutions

### Challenge 1: Absence of Official Public APIs (Yahoo Finance & Google Finance)
- **Problem:** Neither Yahoo Finance nor Google Finance provides free, unauthenticated official REST APIs for Indian stock markets (NSE/BSE). Free public endpoints frequently experience DOM structure alterations, CAPTCHA hurdles, or IP throttling.
- **Solution:**
  1. **Server-Side Isolation:** All scraping and external network calls are strictly quarantined in `/lib/fetchers/yahooFinance.ts` and `/lib/fetchers/googleFinance.ts`. The browser client never touches external financial domains, preventing CORS issues and client bundle bloat.
  2. **Ticker & Exchange Translation:** NSE tickers are mapped with the `.NS` suffix (e.g. `HDFCBANK.NS`, `BAJFINANCE.NS`), while BSE 6-digit script codes are mapped to `.BO` or resolved through Yahoo's chart v8 endpoints.
  3. **Graceful Fallback & Stale Toleration:** Each scraping promise is wrapped in a strict 3.5s `AbortController` timeout. If an upstream call fails or times out, the system automatically falls back to last-cached market values or the seed baseline with a visual `stale` badge. A failure in one stock never crashes the overall dashboard.

---

### Challenge 2: Upstream Rate Limiting & High-Concurrency Polling
- **Problem:** If multiple browser tabs or clients poll 26 individual stock prices every 15 seconds, upstream servers will trigger HTTP 429 (Too Many Requests) or IP bans.
- **Solution:**
  1. **L1 Server-Side In-Memory Cache:** Implemented `MemoryCache` with a 15-second TTL and `stale-while-revalidate` semantics. Repeated client requests within the 15-second window are served directly from RAM in under **2ms** (`X-Cache-Status: HIT`).
  2. **Concurrent Request Batching:** Built batch fetchers using `Promise.allSettled`, executing concurrent queries across all 26 tickers rather than serial waterfalls.

---

### Challenge 3: Real-Time Synchronization & UI Flashing Prevention
- **Problem:** Updating 26 stock rows, sector subtotals, KPI summary cards, and 3D visualizers every 15 seconds can cause heavy UI re-renders, layout shifts, or flickering.
- **Solution:**
  1. **Controlled Client Polling with Visual Progress:** Instead of silent re-renders, the UI features an automated 15s countdown timer with a pulsating green live indicator.
  2. **Memoized Calculations & Fixed Decimals:** All financial numbers enforce `JetBrains Mono` with `font-feature-settings: "tnum" 1, "zero" 1`. Character widths remain constant when values change, preventing visual jitter.
  3. **Selective Visual Highlighting:** Live price changes trigger micro-pulsing green/red status dots without causing the entire table or DOM tree to unmount.

---

### Challenge 4: Interactive 3D Three.js Integration with Live Sector Data
- **Problem:** Integrating WebGL into a reactive Next.js environment can cause memory leaks, canvas resizing distortions, or disconnects between React state and the 3D scene.
- **Solution:**
  1. **Lifecycle Management & Clean Disposal:** The `HologramOrb` component encapsulates WebGL renderer initialization within a `useEffect` hook. On unmount, all geometries, materials, particle buffers, and event listeners are properly disposed of.
  2. **Dynamic Data Binding:** The radii, thickness, and color saturation of the 5 rotating orbital rings are dynamically calculated from the live portfolio sector weights (`portfolioWeightPercent`).
  3. **Interactive Controls:** Added smooth mouse parallax, drag-to-inspect orbital rotation, and a one-click view reset button.

---

## 3. Mathematical & Calculation Layer Integrity

The calculation engine (`lib/calculations/portfolioCalc.ts`) guarantees financial precision across all three tiers:

1. **Holding Level:**
   $$\text{Investment} = \text{Purchase Price} \times \text{Quantity}$$
   $$\text{Present Value} = \text{CMP} \times \text{Quantity}$$
   $$\text{Gain/Loss} = \text{Present Value} - \text{Investment}$$
   $$\text{Gain/Loss (\%)} = \frac{\text{Gain/Loss}}{\text{Investment}} \times 100$$
   $$\text{Portfolio Weight (\%)} = \frac{\text{Investment}}{\sum \text{Total Portfolio Investment}} \times 100$$

2. **Sector Level:**
   $$\text{Sector Investment} = \sum_{h \in \text{Sector}} \text{Investment}_h$$
   $$\text{Sector Present Value} = \sum_{h \in \text{Sector}} \text{Present Value}_h$$
   $$\text{Sector Gain/Loss} = \text{Sector Present Value} - \text{Sector Investment}$$
   $$\text{Sector Gain/Loss (\%)} = \frac{\text{Sector Gain/Loss}}{\text{Sector Investment}} \times 100$$

3. **Portfolio & Benchmark Level:**
   $$\text{Alpha vs Nifty 50} = \text{Portfolio Gain/Loss (\%)} - \text{Nifty Benchmark (\%)} \quad (\text{Benchmark} = 18.40\%)$$

---

## 4. Verification & Testing

- **Static Type Check:** Verified with TypeScript Compiler (`tsc --noEmit`).
- **Production Build:** Verified with Next.js Turbopack (`npm run build`).
- **Data Completeness:** All 26 seed holdings across 6 sectors verified with accurate calculation matching the company specification sheet.
- **Export Verification:** Validated UTF-8 BOM CSV export and landscape PDF report generation.
