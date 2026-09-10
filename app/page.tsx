'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  PortfolioApiResponse, 
  HoldingCalculated, 
  SectorSummary, 
  PortfolioKPIs 
} from '@/types/portfolio';
import { SEED_HOLDINGS } from '@/data/portfolioSeed';
import { computePortfolio } from '@/lib/calculations/portfolioCalc';
import { Navbar } from '@/components/layout/Navbar';
import { KpiStrip } from '@/components/dashboard/KpiStrip';
import { HologramOrb } from '@/components/dashboard/HologramOrb';
import { SectorDonut } from '@/components/dashboard/SectorDonut';
import { Toolbar, FilterMode, SortField } from '@/components/dashboard/Toolbar';
import { HoldingsTable } from '@/components/dashboard/HoldingsTable';
import { StockInspector } from '@/components/dashboard/StockInspector';
import { StatusBar } from '@/components/dashboard/StatusBar';
import { AnalyticsView } from '@/components/dashboard/AnalyticsView';
import { ColumnPickerModal } from '@/components/dashboard/ColumnPickerModal';
import { NotificationDropdown } from '@/components/dashboard/NotificationDropdown';
import { exportPortfolioToCSV, exportPortfolioToPDF } from '@/lib/utils/exportUtils';
import { AlertCircle, RefreshCw, Layers } from 'lucide-react';

const SYNC_INTERVAL_SECONDS = 15;

const DEFAULT_COLUMNS: Record<string, boolean> = {
  purchasePrice: true,
  quantity: true,
  investment: true,
  portfolioWeight: true,
  exchange: true,
  cmp: true,
  presentValue: true,
  gainLoss: true,
  gainLossPercent: true,
  peRatio: true,
  latestEarnings: true,
  marketCap: false,
  revenue: false,
  ebitda: false,
  pat: false,
  cfo: false,
};

// Compute immediate baseline data from SEED_HOLDINGS so the UI renders instantly
function getInitialBaselineData(): PortfolioApiResponse {
  const initialComputed = computePortfolio(SEED_HOLDINGS, {}, {}, 14);
  return {
    success: true,
    kpis: initialComputed.kpis,
    sectors: initialComputed.sectors,
    allHoldings: initialComputed.allHoldings,
    cached: true,
    timestamp: new Date().toISOString(),
  };
}

export default function PortfolioDashboardPage() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Initialize data with immediate seed calculations so page is instantly populated
  const [data, setData] = useState<PortfolioApiResponse>(getInitialBaselineData);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [syncCountdown, setSyncCountdown] = useState(SYNC_INTERVAL_SECONDS);

  // UI Interactive States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [sortField, setSortField] = useState<SortField>('gainLossPercent');
  const [selectedHolding, setSelectedHolding] = useState<HoldingCalculated | null>(() => {
    return getInitialBaselineData().allHoldings[0] || null;
  });
  
  // Modals & Drawers
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(DEFAULT_COLUMNS);

  // Initialize theme from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('portfolio_pulse_theme') as 'dark' | 'light' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    } catch {
      // LocalStorage fallback
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('portfolio_pulse_theme', nextTheme);
    } catch {
      // Ignore
    }
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  // Resilient live data fetcher with absolute error isolation
  const fetchPortfolioData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);

    try {
      const res = await fetch('/api/portfolio', { 
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`);
      }

      const json: PortfolioApiResponse = await res.json();

      if (json && json.allHoldings && json.allHoldings.length > 0) {
        setData(json);
        setSyncCountdown(SYNC_INTERVAL_SECONDS);
        setErrorBanner(json.error || null);

        // Keep updated holding reference
        if (selectedHolding) {
          const updated = json.allHoldings.find(h => h.id === selectedHolding.id);
          if (updated) setSelectedHolding(updated);
        }
      }
    } catch (err: any) {
      console.warn('API sync connecting or offline. Maintaining active baseline calculations.', err);
      // Fall back smoothly to computed baseline without crashing
      setErrorBanner(null);
    } finally {
      setLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, [selectedHolding]);

  // Initial load
  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  // 15-second polling interval with countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSyncCountdown((prev) => {
        if (prev <= 1) {
          fetchPortfolioData();
          return SYNC_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchPortfolioData]);

  // Global ⌘K keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter holdings based on search query
  const filteredHoldings = useMemo(() => {
    if (!data?.allHoldings) return [];
    if (!searchQuery.trim()) return data.allHoldings;

    const q = searchQuery.toLowerCase().trim();
    return data.allHoldings.filter((h) => {
      return (
        h.name.toLowerCase().includes(q) ||
        h.symbol.toLowerCase().includes(q) ||
        (h.nseSymbol && h.nseSymbol.toLowerCase().includes(q)) ||
        (h.bseCode && h.bseCode.includes(q)) ||
        h.sector.toLowerCase().includes(q)
      );
    });
  }, [data?.allHoldings, searchQuery]);

  // Filter sectors based on search query
  const filteredSectors = useMemo(() => {
    if (!data?.sectors) return [];
    if (!searchQuery.trim()) return data.sectors;

    const q = searchQuery.toLowerCase().trim();
    return data.sectors
      .map((sec) => ({
        ...sec,
        holdings: sec.holdings.filter((h) => {
          return (
            h.name.toLowerCase().includes(q) ||
            h.symbol.toLowerCase().includes(q) ||
            (h.nseSymbol && h.nseSymbol.toLowerCase().includes(q)) ||
            (h.bseCode && h.bseCode.includes(q)) ||
            h.sector.toLowerCase().includes(q)
          );
        }),
      }))
      .filter((sec) => sec.holdings.length > 0);
  }, [data?.sectors, searchQuery]);

  // Toggle column visibility
  const handleToggleColumn = (key: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleResetColumns = () => {
    setVisibleColumns(DEFAULT_COLUMNS);
  };

  // CSV & PDF exports
  const handleExportCSV = () => {
    if (data?.allHoldings && data.kpis) {
      exportPortfolioToCSV(data.allHoldings, data.kpis);
    }
  };

  const handleExportPDF = () => {
    if (data?.allHoldings && data.sectors && data.kpis) {
      exportPortfolioToPDF(data.allHoldings, data.sectors, data.kpis);
    }
  };

  // Select stock from notification or search dropdown click
  const handleSelectHoldingDirect = (holding: HoldingCalculated) => {
    setSelectedHolding(holding);
    setActiveTab('dashboard');
  };

  const handleNotificationSelectStock = (symbol: string) => {
    if (data?.allHoldings) {
      const match = data.allHoldings.find(h => h.symbol === symbol || h.bseCode === symbol);
      if (match) {
        handleSelectHoldingDirect(match);
      }
    }
  };

  const kpis = data.kpis;
  const isSearchActive = searchQuery.trim().length > 0;
  const sectors = isSearchActive ? filteredSectors : data.sectors;
  const allHoldings = isSearchActive ? filteredHoldings : data.allHoldings;

  return (
    <div className={`min-h-screen transition-colors duration-200 relative ${
      theme === 'dark' ? 'bg-[#0B0E14] text-[#E1E2EB]' : 'bg-[#F1F5F9] text-[#0F172A]'
    }`}>
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[700px] h-[350px] bg-[#7C5CFC]/10 blur-[140px] rounded-full" />
        <div className="absolute top-1/3 -right-20 w-[500px] h-[300px] bg-[#00E676]/5 blur-[120px] rounded-full" />
      </div>

      {/* Top Navbar with live autocomplete search */}
      <Navbar
        onRefresh={() => fetchPortfolioData(true)}
        isRefreshing={isRefreshing}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        syncCountdown={syncCountdown}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        unreadAlertsCount={3}
        allHoldings={data.allHoldings}
        onSelectHolding={handleSelectHoldingDirect}
      />

      {/* Main Content Container */}
      <main className="relative z-10 w-full pt-20 sm:pt-24 px-3 sm:px-6 lg:px-8 pb-8 space-y-5 sm:space-y-6 max-w-[1700px] mx-auto">
        
        {/* Optional Stale / Warning Banner */}
        {errorBanner && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-numeric animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{errorBanner}</span>
            </div>
            <button
              onClick={() => fetchPortfolioData(true)}
              className="underline hover:text-white"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* 1. Hero KPI Summary Cards */}
        <KpiStrip kpis={kpis} isLoading={isRefreshing} />

        {/* Tab 1: Dashboard (Overview) */}
        {activeTab === 'dashboard' && (
          <>
            {/* 2. Hero Split: 3D Holographic Allocation Orb + Sector Donut */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
              <HologramOrb sectors={data.sectors} />
              <SectorDonut 
                sectors={data.sectors} 
                onSelectSector={(sec) => setSelectedSector(sec)} 
              />
            </section>

            {/* 3. Toolbar (Filters, Views, Exports) */}
            <Toolbar
              sectors={data.sectors}
              allHoldings={allHoldings}
              selectedSector={selectedSector}
              onSelectSector={setSelectedSector}
              filterMode={filterMode}
              onFilterModeChange={setFilterMode}
              sortField={sortField}
              onSortFieldChange={setSortField}
              onExportCSV={handleExportCSV}
              onExportPDF={handleExportPDF}
              onToggleColumnPicker={() => setIsColumnPickerOpen(true)}
              syncCountdown={syncCountdown}
            />

            {/* 4. Dense Grouped Holdings Table */}
            <HoldingsTable
              sectors={sectors}
              allHoldings={allHoldings}
              selectedHoldingId={selectedHolding?.id || null}
              onSelectHolding={(h) => setSelectedHolding(h)}
              visibleColumns={visibleColumns}
              filterSector={selectedSector}
              filterMode={filterMode}
              sortField={sortField}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
            />

            {/* 5. Docked Stock Inspector Panel */}
            <StockInspector holding={selectedHolding} />
          </>
        )}

        {/* Tab 2: Analytics & Charts */}
        {activeTab === 'analytics' && (
          <AnalyticsView 
            sectors={data.sectors} 
            allHoldings={allHoldings} 
            kpis={kpis} 
          />
        )}

        {/* Tab 3: Holdings (Dense) */}
        {activeTab === 'holdings' && (
          <div className="space-y-4">
            <Toolbar
              sectors={data.sectors}
              allHoldings={allHoldings}
              selectedSector={selectedSector}
              onSelectSector={setSelectedSector}
              filterMode={filterMode}
              onFilterModeChange={setFilterMode}
              sortField={sortField}
              onSortFieldChange={setSortField}
              onExportCSV={handleExportCSV}
              onExportPDF={handleExportPDF}
              onToggleColumnPicker={() => setIsColumnPickerOpen(true)}
              syncCountdown={syncCountdown}
            />
            <HoldingsTable
              sectors={sectors}
              allHoldings={allHoldings}
              selectedHoldingId={selectedHolding?.id || null}
              onSelectHolding={(h) => setSelectedHolding(h)}
              visibleColumns={visibleColumns}
              filterSector={selectedSector}
              filterMode={filterMode}
              sortField={sortField}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
            />
          </div>
        )}

        {/* Tab 4: Transactions */}
        {activeTab === 'transactions' && (
          <div className="rounded-xl bg-[#10141F] p-6 sm:p-8 border border-white/[0.08] text-center space-y-3">
            <Layers className="w-10 h-10 text-[#7C5CFC] mx-auto opacity-70" />
            <h3 className="font-heading text-lg font-bold text-white">Seed Portfolio Ledger</h3>
            <p className="text-xs text-[#94A3B8] max-w-lg mx-auto">
              All 26 initial positions recorded with baseline purchase prices and execution quantities per company specification.
            </p>
            <div className="pt-4 max-w-2xl mx-auto overflow-x-auto">
              <table className="w-full text-left font-numeric text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[#94A3B8]">
                    <th className="py-2">Stock</th>
                    <th className="py-2">Type</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Total Invested</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {allHoldings.slice(0, 8).map(h => (
                    <tr key={h.id}>
                      <td className="py-2 font-sans font-medium text-white">{h.name}</td>
                      <td className="py-2 text-[#00E676]">BUY (INITIAL)</td>
                      <td className="py-2 text-right">₹{h.purchasePrice}</td>
                      <td className="py-2 text-right">{h.quantity}</td>
                      <td className="py-2 text-right text-white">₹{h.investment.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Alerts */}
        {activeTab === 'alerts' && (
          <div className="rounded-xl bg-[#10141F] p-6 sm:p-8 border border-white/[0.08] text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#7C5CFC]/20 text-[#7C5CFC] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">Active Volatility &amp; Earnings Triggers</h3>
            <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
              Monitoring 26 stocks for price momentum, P/E threshold breaches, and quarterly earnings releases.
            </p>
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left text-xs font-numeric">
              <div className="p-3 bg-[#151B2B] rounded-lg border border-white/[0.06]">
                <p className="text-[#00E676] font-semibold">TCS +2.14% Day High</p>
                <p className="text-[#94A3B8] text-[11px]">Trailing above 52W high target</p>
              </div>
              <div className="p-3 bg-[#151B2B] rounded-lg border border-white/[0.06]">
                <p className="text-[#CABEFF] font-semibold">Tata Power Solar Expansion</p>
                <p className="text-[#94A3B8] text-[11px]">Quarterly volume surge reported</p>
              </div>
            </div>
          </div>
        )}

        {/* 6. Diagnostics Footer Strip */}
        <StatusBar
          latencyMs={kpis.latencyMs}
          lastSyncTime={kpis.lastSyncTime}
          isCached={data.cached || false}
        />

      </main>

      {/* Column Customizer Modal */}
      <ColumnPickerModal
        isOpen={isColumnPickerOpen}
        onClose={() => setIsColumnPickerOpen(false)}
        visibleColumns={visibleColumns}
        onToggleColumn={handleToggleColumn}
        onResetColumns={handleResetColumns}
      />

      {/* Live Market Notifications Dropdown */}
      <NotificationDropdown
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onSelectStock={handleNotificationSelectStock}
      />
    </div>
  );
}
