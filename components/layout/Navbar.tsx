'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  Bell, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { HoldingCalculated } from '@/types/portfolio';
import { formatINR, formatPercent } from '@/lib/utils/formatters';

interface NavbarProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  syncCountdown: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenNotifications: () => void;
  unreadAlertsCount: number;
  allHoldings: HoldingCalculated[];
  onSelectHolding: (holding: HoldingCalculated) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefresh,
  isRefreshing,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  syncCountdown,
  theme,
  onToggleTheme,
  onOpenNotifications,
  unreadAlertsCount,
  allHoldings,
  onSelectHolding,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard (Overview)' },
    { id: 'analytics', label: 'Analytics & Charts' },
    { id: 'holdings', label: 'Holdings (Dense)' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'alerts', label: 'Alerts' },
  ];

  // Quick matching results for search suggestion dropdown
  const matchingSuggestions = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allHoldings.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.symbol.toLowerCase().includes(q) ||
        (h.nseSymbol && h.nseSymbol.toLowerCase().includes(q)) ||
        (h.bseCode && h.bseCode.includes(q)) ||
        h.sector.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [allHoldings, searchQuery]);

  // Click outside listener to close search suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (holding: HoldingCalculated) => {
    onSelectHolding(holding);
    setShowSuggestions(false);
    setSearchOpen(false);
    onTabChange('dashboard');
  };

  return (
    <header className="fixed top-0 w-full z-40 bg-[#0B0E14]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="h-16 lg:h-20 w-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 lg:gap-4">
        
        {/* Left: Logo & Wordmark + Live Pill */}
        <div className="flex items-center gap-3 lg:gap-5 shrink-0">
          <div 
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            {/* Custom Squircle SVG Logo */}
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-[#5B8DEF] p-0.5 flex items-center justify-center shadow-[0_0_16px_rgba(124,92,252,0.4)] group-hover:shadow-[0_0_22px_rgba(124,92,252,0.6)] transition-all">
              <svg viewBox="0 0 36 36" className="w-full h-full" fill="none">
                <path 
                  d="M10 23L15 15L20 21L26 12" 
                  stroke="#FFFFFF" 
                  strokeWidth="2.8" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <circle cx="26" cy="12" r="3" fill="#00E676" />
              </svg>
            </div>
            
            <div className="flex flex-col">
              <span className="font-heading text-base lg:text-lg font-bold tracking-tight text-white flex items-center">
                Portfolio&nbsp;<span className="text-[#7C5CFC]">Pulse</span>
              </span>
              <span className="font-heading text-[9px] lg:text-[10px] font-semibold text-[#CABEFF] tracking-widest uppercase">
                TERMINAL v4.2
              </span>
            </div>
          </div>

          {/* Live Market Heartbeat Pill */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#151B2B] border border-white/[0.08]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E676]"></span>
            </span>
            <span className="font-heading text-[10px] lg:text-[11px] font-semibold text-[#00E676] tracking-wider uppercase whitespace-nowrap">
              NSE/BSE LIVE
            </span>
            <span className="font-numeric text-[10px] lg:text-[11px] text-[#94A3B8] whitespace-nowrap">
              • Refreshes in {syncCountdown}s
            </span>
          </div>
        </div>

        {/* Center: Search Box & Navigation Tabs */}
        <div className="hidden lg:flex items-center gap-3 flex-1 max-w-2xl justify-center">
          {/* Search bar with ⌘K & Autocomplete dropdown */}
          <div ref={searchContainerRef} className="relative w-56 xl:w-72 flex items-center">
            <Search className="absolute left-3 text-[#64748B] pointer-events-none w-3.5 h-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search stock, symbol..."
              className="w-full pl-9 pr-8 py-1.5 bg-[#10141F] text-white placeholder:text-[#64748B] text-xs rounded-lg border border-white/[0.08] focus:outline-none focus:border-[#7C5CFC] focus:bg-[#151B2B] transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => {
                  onSearchChange('');
                  setShowSuggestions(false);
                }}
                className="absolute right-2 text-[#64748B] hover:text-white"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="absolute right-2.5 flex items-center px-1 py-0.5 bg-[#1D2026] text-[#94A3B8] font-numeric text-[10px] rounded border border-white/[0.06]">
                ⌘K
              </kbd>
            )}

            {/* Live Autocomplete Suggestions Dropdown */}
            {showSuggestions && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-[#151B2B] border border-white/[0.15] shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
                <div className="p-2 border-b border-white/[0.06] text-[10px] uppercase font-heading text-[#94A3B8] font-semibold flex justify-between">
                  <span>Quick Results ({matchingSuggestions.length})</span>
                  <span>Press Esc to close</span>
                </div>
                {matchingSuggestions.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#94A3B8]">
                    No holdings match &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto divide-y divide-white/[0.04]">
                    {matchingSuggestions.map((h) => {
                      const isGain = h.gainLoss >= 0;
                      return (
                        <div
                          key={h.id}
                          onClick={() => handleSelectSuggestion(h)}
                          className="p-2.5 hover:bg-[#1D2026] cursor-pointer flex items-center justify-between gap-2 transition-colors group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-[#7C5CFC]/20 text-[#CABEFF] flex items-center justify-center text-[10px] font-bold shrink-0">
                              {h.name.charAt(0)}
                            </span>
                            <div className="truncate">
                              <p className="font-heading text-xs font-semibold text-white group-hover:text-[#CABEFF] truncate">
                                {h.name}
                              </p>
                              <p className="text-[10px] text-[#64748B] font-numeric">
                                {h.exchange}: {h.symbol} • {h.sector.replace(' Sector', '')}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0 font-numeric text-xs">
                            <p className="font-bold text-white">{formatINR(h.cmp)}</p>
                            <p className={`text-[10px] ${isGain ? 'text-[#00E676]' : 'text-[#FF4757]'}`}>
                              {isGain ? '▲' : '▼'} {formatPercent(h.gainLossPercent)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#1D2026] text-white shadow-[0_0_12px_rgba(202,190,255,0.15)] border border-white/[0.12]'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#151B2B]/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Utility & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="lg:hidden p-2 text-[#94A3B8] hover:text-white hover:bg-[#151B2B] rounded-lg transition-all"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick Refresh */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-[#94A3B8] hover:text-white hover:bg-[#151B2B] rounded-lg transition-all border border-transparent hover:border-white/[0.08] disabled:opacity-50"
            title="Force Live Market Sync"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#7C5CFC]' : ''}`} />
          </button>

          {/* Notifications / Alerts Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-[#94A3B8] hover:text-white hover:bg-[#151B2B] rounded-lg transition-all border border-transparent hover:border-white/[0.08]"
            title="Market Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4757] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4757]"></span>
              </span>
            )}
          </button>

          {/* Dark / Light Mode Switcher */}
          <button
            onClick={onToggleTheme}
            className="flex items-center bg-[#151B2B] hover:bg-[#1D2026] p-0.5 rounded-full border border-white/[0.08] transition-all cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            <div className="px-2.5 py-1 flex items-center gap-1.5 rounded-full bg-[#1D2026] text-white font-numeric text-[11px]">
              {theme === 'dark' ? (
                <>
                  <Moon className="w-3 h-3 text-[#CABEFF]" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>Light</span>
                </>
              )}
            </div>
          </button>

          {/* Profile Headshot & Details */}
          <div className="flex items-center gap-2 sm:gap-2.5 pl-1 sm:pl-2 border-l border-white/[0.08]">
            <img
              src="/manager_headshot.png"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
              alt="Rakesh Kumar"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#7C5CFC]/40 shrink-0"
            />
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-medium text-white leading-tight">
                Rakesh Kumar
              </span>
              <span className="font-heading text-[9px] text-[#7C5CFC] tracking-wider uppercase font-semibold">
                Fund Pro
              </span>
            </div>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#94A3B8] hover:text-white hover:bg-[#151B2B] rounded-lg transition-all"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Search Expandable Bar with Live Results */}
      {searchOpen && (
        <div className="lg:hidden px-4 pb-3 pt-1 border-b border-white/[0.08] bg-[#0B0E14] animate-in slide-in-from-top-2">
          <div className="relative w-full flex items-center">
            <Search className="absolute left-3 text-[#64748B] w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search stock, symbol..."
              autoFocus
              className="w-full pl-9 pr-8 py-2 bg-[#10141F] text-white placeholder:text-[#64748B] text-xs rounded-lg border border-white/[0.08] focus:outline-none focus:border-[#7C5CFC]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 text-[#64748B] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Live Suggestions */}
          {searchQuery.trim().length > 0 && (
            <div className="mt-2 rounded-xl bg-[#151B2B] border border-white/[0.12] overflow-hidden max-h-52 overflow-y-auto divide-y divide-white/[0.04]">
              {matchingSuggestions.map((h) => (
                <div
                  key={h.id}
                  onClick={() => handleSelectSuggestion(h)}
                  className="p-2.5 hover:bg-[#1D2026] flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-white">{h.name}</p>
                    <p className="text-[10px] text-[#64748B]">{h.exchange}: {h.symbol}</p>
                  </div>
                  <span className="text-xs font-numeric text-[#00E676] font-bold">{formatINR(h.cmp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#10141F] border-b border-white/[0.08] px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
          {/* Mobile Live Status Badge */}
          <div className="flex md:hidden items-center justify-between p-2 rounded-lg bg-[#151B2B] border border-white/[0.06] text-xs font-numeric">
            <span className="flex items-center gap-1.5 text-[#00E676] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
              NSE/BSE LIVE
            </span>
            <span className="text-[#94A3B8]">Auto-sync in {syncCountdown}s</span>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${
                    isActive
                      ? 'bg-[#7C5CFC]/20 text-[#CABEFF] font-semibold border border-[#7C5CFC]/30'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#151B2B]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
