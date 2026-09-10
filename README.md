# Portfolio Pulse — Terminal v4.2

> **Dynamic Institutional Portfolio Dashboard** built with **Next.js (App Router), React, TypeScript, Tailwind CSS, TanStack Table, Recharts, and Three.js**.
> Developed for the Octa Byte AI Pvt Ltd Full Stack Assignment.

---

## ⚡ Overview & Features

**Portfolio Pulse** provides high-velocity precision and institutional financial intelligence for active allocators. It connects 26 core Indian equity holdings across 6 sectors with real-time valuation, automated background synchronization, dynamic 3D asset visualizations, and deep fundamental analysis.

### Key Capabilities
- 📊 **Dynamic Grouped Holdings Grid:** Built with `@tanstack/react-table`, grouping 26 stocks into 6 core sectors (Financial, Tech, Consumer, Power, Pipe, Others) with collapsible headers, per-sector subtotal summaries, and an overall grand-total row.
- ⚡ **Live Pricing & Fundamentals Pipeline:**
  - **Current Market Price (CMP):** Scraped/fetched server-side from Yahoo Finance (`.NS` / `.BO` resolution) with real-time green/red delta animations.
  - **P/E Ratio & Latest Earnings:** Scraped server-side from Google Finance with resilient seed fallbacks.
- 🔄 **Automated 15-Second Refresh:** Client-side interval polling against `/api/portfolio` with a live visual countdown progress bar, stale-data indicators, and manual refresh controls.
- 🌐 **3D Holographic Allocation Orb:** Interactive Three.js orbital visualizer with real-time rotating sector rings scaled dynamically to live portfolio sector weights, mouse parallax, and drag-to-inspect rotation.
- 🍩 **Sector Exposure Radial Donut:** Recharts pie chart with dynamic sector concentration badges, concentration caps, and custom interactive legend bars.
- 🔍 **Docked Stock Inspector Panel:** Real-time stock inspection drawer showing intraday mini-sparkline, 52-week range barometer, P/E vs sector average, beta/volatility gauge, dividend yield, and analyst consensus.
- 📂 **Multi-Format Exporting:** Native 1-click **CSV** and styled **PDF Report** generation using `jspdf` and `jspdf-autotable`.
- 🎛️ **Column Customizer Modal:** Customizable table view with toggles for deep fundamentals (Market Cap, Revenue, EBITDA %, PAT, CFO, 3Y Growth).
- 📱 **Fully Responsive Layout:** Optimized 12-column grid reflowing smoothly to tablet and mobile viewports.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript (Strict Mode) |
| **Styling & Design** | Tailwind CSS (Glassmorphic dark institutional theme) |
| **Typography** | Space Grotesk (Headlines/KPIs), Inter (UI), JetBrains Mono (`tnum` tabular decimals) |
| **Holdings Grid** | TanStack Table |
| **Charts** | Recharts (Sector Exposure Donut & Analytics Bar Charts) |
| **3D Visualization** | Three.js (WebGL Holographic Orbital System) |
| **Icons** | Lucide React |
| **Exporting** | jsPDF & jsPDF-AutoTable |
| **Caching Layer** | Server-side In-Memory L1 Cache with TTL & Stale-While-Revalidate |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js:** v18.x or higher (v20+ recommended)
- **npm** or **yarn** or **pnpm**

### 2. Installation
```bash
# Clone or navigate to the project directory
cd 8byte

# Install dependencies
npm install
```

### 3. Running Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Building for Production
```bash
npm run build
npm start
```

---

## 🔒 Environment Variables & Security

Create a `.env.local` file in the root directory (optional, defaults work out-of-the-box):
```env
# Port & Environment
PORT=3000
NODE_ENV=production

# Upstream Scraper Cache TTL (seconds)
CACHE_TTL_SECONDS=15
```

> **Security Note:** All external financial scraping/fetching happens strictly **server-side** inside `/app/api/portfolio`. No API keys or scraping tokens are exposed in client-side bundles.

---

## 📊 Portfolio Holdings Seed Structure (26 Stocks across 6 Sectors)

1. **Financial Sector (5):** HDFC Bank, Bajaj Finance, ICICI Bank, Bajaj Housing, Savani Financials
2. **Technology Sector (6):** Affle India, LTI Mindtree, KPIT Tech, Tata Tech, BLS E-Services, Tanla Platforms
3. **Consumer Sector (3):** Dmart (Avenue Supermarts), Tata Consumer, Pidilite Industries
4. **Power Sector (4):** Tata Power, KPI Green Energy, Suzlon Energy, Gensol Engineering
5. **Pipe Sector (3):** Hariom Pipes, Astral Ltd, Polycab India
6. **Others (5):** Clean Science & Tech, Deepak Nitrite, Fine Organic Industries, Gravita India, SBI Life Insurance

**Total Initial Seed Investment:** `₹ 15,43,060` (Calculated dynamically)

---

## ⚠️ Known Limitations & Scraping Disclaimer

1. **Unofficial Endpoints:** Real-time CMP and P/E ratios are fetched from unofficial Yahoo Finance and Google Finance quote endpoints.
2. **Markup Changes:** If Google Finance or Yahoo Finance alters their DOM structures or rate-limits public IP ranges, the built-in resilient fallback layer automatically steps in, serving last-cached prices or baseline reference data with a clear `stale` warning indicator so the application never crashes.
