'use client';

import React, { useState } from 'react';
import { 
  SectorSummary, 
  HoldingCalculated, 
  SectorType 
} from '@/types/portfolio';
import { 
  formatINR, 
  formatPercent, 
  formatCompactINR,
  formatNumber
} from '@/lib/utils/formatters';
import { SECTOR_COLORS } from '@/data/portfolioSeed';
import { 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  ChevronRight, 
  ExternalLink,
  Layers,
  AlertCircle,
  Sparkles,
  Info,
  ChevronUp,
  Search,
  RotateCcw
} from 'lucide-react';

interface HoldingsTableProps {
  sectors: SectorSummary[];
  allHoldings: HoldingCalculated[];
  selectedHoldingId: string | null;
  onSelectHolding: (holding: HoldingCalculated) => void;
  visibleColumns: Record<string, boolean>;
  filterSector: string | null;
  filterMode: 'all' | 'gainers' | 'losers';
  sortField: string;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({
  sectors,
  allHoldings,
  selectedHoldingId,
  onSelectHolding,
  visibleColumns,
  filterSector,
  filterMode,
  sortField,
  searchQuery,
  onClearSearch,
}) => {
  // Collapsed sectors state
  const [collapsedSectors, setCollapsedSectors] = useState<Record<string, boolean>>({});
  // Expanded row details for deep fundamentals
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleSectorCollapse = (sectorName: string) => {
    setCollapsedSectors(prev => ({
      ...prev,
      [sectorName]: !prev[sectorName],
    }));
  };

  const toggleRowExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Grand totals across all currently rendered holdings
  const totalInvestment = allHoldings.reduce((sum, h) => sum + h.investment, 0);
  const totalPresentValue = allHoldings.reduce((sum, h) => sum + h.presentValue, 0);
  const totalGainLoss = totalPresentValue - totalInvestment;
  const totalGainLossPercent = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

  // Filter sectors
  const displayedSectors = sectors.filter(s => {
    if (filterSector && s.sector !== filterSector) return false;
    return true;
  });

  return (
    <div className="w-full overflow-x-auto rounded-xl bg-[#10141F] border border-white/[0.08] shadow-2xl relative scroll-smooth">
      <table className="w-full text-left whitespace-nowrap border-collapse">
        {/* Table Header */}
        <thead>
          <tr className="bg-[#151B2B] text-[#94A3B8] font-heading text-[11px] uppercase tracking-wider select-none border-b border-white/[0.08]">
            <th className="py-3 px-3 sm:px-4 text-left sticky left-0 z-20 bg-[#151B2B] shadow-[2px_0_5px_rgba(0,0,0,0.5)]">
              Particulars
            </th>
            {visibleColumns.purchasePrice && <th className="py-3 px-2 text-right">Purchase Price</th>}
            {visibleColumns.quantity && <th className="py-3 px-2 text-right">Qty</th>}
            {visibleColumns.investment && <th className="py-3 px-2 text-right">Investment</th>}
            {visibleColumns.portfolioWeight && <th className="py-3 px-2 text-right">Portfolio (%)</th>}
            {visibleColumns.exchange && <th className="py-3 px-2 text-center">NSE/BSE</th>}
            {visibleColumns.cmp && <th className="py-3 px-2 text-right">CMP (Live)</th>}
            {visibleColumns.presentValue && <th className="py-3 px-2 text-right">Present Value</th>}
            {visibleColumns.gainLoss && <th className="py-3 px-2 text-right">Gain / Loss</th>}
            {visibleColumns.gainLossPercent && <th className="py-3 px-2 text-right">Gain / Loss (%)</th>}
            {visibleColumns.peRatio && <th className="py-3 px-2 text-right">P/E (TTM)</th>}
            {visibleColumns.latestEarnings && <th className="py-3 px-4 text-left">Latest Earnings</th>}
            
            {/* Optional extra fundamentals */}
            {visibleColumns.marketCap && <th className="py-3 px-2 text-right">Market Cap (Cr)</th>}
            {visibleColumns.revenue && <th className="py-3 px-2 text-right">Revenue (TTM)</th>}
            {visibleColumns.ebitda && <th className="py-3 px-2 text-right">EBITDA (%)</th>}
            {visibleColumns.pat && <th className="py-3 px-2 text-right">PAT (Cr)</th>}
            {visibleColumns.cfo && <th className="py-3 px-2 text-right">CFO (Cr)</th>}
            <th className="py-3 px-3 text-center">Details</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-white/[0.04]">
          {displayedSectors.length === 0 ? (
            <tr>
              <td colSpan={18} className="py-12 px-4 text-center">
                <div className="flex flex-col items-center justify-center space-y-2 text-[#94A3B8]">
                  <Search className="w-8 h-8 text-[#64748B] opacity-50" />
                  <p className="font-heading text-sm font-semibold text-white">
                    No holdings match your search &quot;{searchQuery}&quot;
                  </p>
                  <p className="text-xs text-[#64748B]">
                    Try searching by stock name (e.g. HDFC, Tata, Infosys) or ticker symbol (e.g. 500400, BAJFINANCE)
                  </p>
                  {onClearSearch && (
                    <button
                      onClick={onClearSearch}
                      className="mt-3 px-4 py-1.5 rounded-lg bg-[#7C5CFC]/20 text-[#CABEFF] hover:bg-[#7C5CFC]/30 text-xs font-heading font-semibold border border-[#7C5CFC]/30 flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Search &amp; Show All</span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            displayedSectors.map((sec) => {
              const isCollapsed = collapsedSectors[sec.sector];
              const color = SECTOR_COLORS[sec.sector]?.primary || '#7C5CFC';

              // Filter holdings inside sector
              let filteredHoldings = sec.holdings.filter(h => {
                if (filterMode === 'gainers') return h.gainLoss > 0;
                if (filterMode === 'losers') return h.gainLoss < 0;
                return true;
              });

              // Sort holdings inside sector
              filteredHoldings = [...filteredHoldings].sort((a, b) => {
                if (sortField === 'gainLossPercent') return b.gainLossPercent - a.gainLossPercent;
                if (sortField === 'presentValue') return b.presentValue - a.presentValue;
                if (sortField === 'investment') return b.investment - a.investment;
                if (sortField === 'cmp') return b.cmp - a.cmp;
                if (sortField === 'peRatio') return (b.peRatio || 0) - (a.peRatio || 0);
                return 0;
              });

              if (filteredHoldings.length === 0 && filterMode !== 'all') return null;

              return (
                <React.Fragment key={sec.sector}>
                  {/* 1. SECTOR HEADER & SUMMARY ROW */}
                  <tr 
                    onClick={() => toggleSectorCollapse(sec.sector)}
                    className="bg-[#151B2B]/90 hover:bg-[#1D2026] cursor-pointer transition-colors border-t border-b border-white/[0.08]"
                  >
                    <td colSpan={18} className="py-2.5 px-3 sm:px-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 text-white">
                        {/* Left: Sector Title, Count, Weight */}
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-1 rounded hover:bg-white/[0.1] text-[#94A3B8] transition-colors"
                            title={isCollapsed ? 'Expand sector' : 'Collapse sector'}
                          >
                            {isCollapsed ? (
                              <ChevronRight className="w-4 h-4 text-white" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-white" />
                            )}
                          </button>

                          <div 
                            className="w-2.5 h-2.5 rounded-full shrink-0" 
                            style={{ backgroundColor: color }} 
                          />

                          <span className="font-heading text-sm lg:text-base font-bold tracking-tight">
                            {sec.sector}
                          </span>

                          <span className="font-numeric text-[11px] text-[#94A3B8] bg-[#0B0E14] px-2 py-0.5 rounded-full border border-white/[0.06]">
                            {sec.holdingsCount}
                          </span>

                          <span className="font-numeric text-[11px] text-[#CABEFF] hidden sm:inline">
                            • {sec.portfolioWeightPercent.toFixed(1)}% Weight
                          </span>
                        </div>

                        {/* Right: Sector Subtotals */}
                        <div className="flex items-center gap-3 sm:gap-6 font-numeric text-xs">
                          <span className="text-[#94A3B8] hidden sm:inline">
                            Invested: <strong className="text-white font-semibold">{formatINR(sec.totalInvestment)}</strong>
                          </span>
                          <span className="text-[#94A3B8]">
                            Present: <strong className="text-white font-semibold">{formatINR(sec.totalPresentValue)}</strong>
                          </span>
                          <span className={`font-bold ${sec.totalGainLoss >= 0 ? 'text-[#00E676]' : 'text-[#FF4757]'}`}>
                            {sec.totalGainLoss >= 0 ? `+${formatINR(sec.totalGainLoss)}` : formatINR(sec.totalGainLoss)} ({formatPercent(sec.totalGainLossPercent)})
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* 2. HOLDINGS ROWS IN SECTOR */}
                  {!isCollapsed && filteredHoldings.map((h) => {
                    const isSelected = selectedHoldingId === h.id;
                    const isGain = h.gainLoss >= 0;
                    const isExpanded = expandedRows[h.id];

                    return (
                      <React.Fragment key={h.id}>
                        <tr
                          onClick={() => onSelectHolding(h)}
                          className={`transition-colors group cursor-pointer ${
                            isSelected
                              ? 'bg-[#7C5CFC]/15 border-l-4 border-l-[#7C5CFC]'
                              : 'hover:bg-[#151B2B]/60'
                          }`}
                        >
                          {/* Particulars (Sticky on Mobile) */}
                          <td className={`py-3 px-3 sm:px-4 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.5)] ${
                            isSelected ? 'bg-[#151B2B]' : 'bg-[#10141F] group-hover:bg-[#151B2B]'
                          }`}>
                            <div className="flex items-center gap-2.5 sm:gap-3">
                              <span 
                                className="w-7 h-7 rounded-full flex items-center justify-center font-heading text-xs font-bold shrink-0"
                                style={{ 
                                  backgroundColor: `${color}25`,
                                  color: color,
                                  border: `1px solid ${color}40`,
                                }}
                              >
                                {h.name.charAt(0)}
                              </span>
                              <div className="flex flex-col">
                                <span className={`font-heading text-xs sm:text-sm font-semibold transition-colors ${
                                  isSelected ? 'text-[#CABEFF]' : 'text-white group-hover:text-[#CABEFF]'
                                }`}>
                                  {h.name}
                                </span>
                                <div className="flex items-center gap-1.5 font-numeric text-[10px] sm:text-[11px] text-[#64748B]">
                                  <span>{h.symbol}</span>
                                  {h.isStale && (
                                    <span className="text-amber-400 text-[9px] flex items-center gap-0.5" title="Cached / fallback price">
                                      • <AlertCircle className="w-2.5 h-2.5" /> stale
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Purchase Price */}
                          {visibleColumns.purchasePrice && (
                            <td className="py-3 px-2 text-right font-numeric text-xs text-white">
                              {formatINR(h.purchasePrice)}
                            </td>
                          )}

                          {/* Quantity */}
                          {visibleColumns.quantity && (
                            <td className="py-3 px-2 text-right font-numeric text-xs text-[#94A3B8]">
                              {formatNumber(h.quantity, 0)}
                            </td>
                          )}

                          {/* Investment */}
                          {visibleColumns.investment && (
                            <td className="py-3 px-2 text-right font-numeric text-xs font-medium text-white">
                              {formatINR(h.investment)}
                            </td>
                          )}

                          {/* Portfolio (%) */}
                          {visibleColumns.portfolioWeight && (
                            <td className="py-3 px-2 text-right font-numeric text-xs text-[#94A3B8]">
                              {h.portfolioWeightPercent.toFixed(1)}%
                            </td>
                          )}

                          {/* NSE/BSE Badge */}
                          {visibleColumns.exchange && (
                            <td className="py-3 px-2 text-center">
                              <span className="px-2 py-0.5 rounded bg-[#1D2026] font-numeric text-[11px] text-[#94A3B8] border border-white/[0.08]">
                                {h.exchange}
                              </span>
                            </td>
                          )}

                          {/* CMP (Live) */}
                          {visibleColumns.cmp && (
                            <td className="py-3 px-2 text-right">
                              <div className="inline-flex items-center gap-1.5 font-numeric text-xs font-semibold text-white">
                                <span className={`w-1.5 h-1.5 rounded-full ${isGain ? 'bg-[#00E676]' : 'bg-[#FF4757]'} animate-pulse`} />
                                {formatINR(h.cmp)}
                              </div>
                            </td>
                          )}

                          {/* Present Value */}
                          {visibleColumns.presentValue && (
                            <td className="py-3 px-2 text-right font-numeric text-xs font-bold text-white">
                              {formatINR(h.presentValue)}
                            </td>
                          )}

                          {/* Gain / Loss Amount */}
                          {visibleColumns.gainLoss && (
                            <td className={`py-3 px-2 text-right font-numeric text-xs font-semibold ${
                              isGain ? 'text-[#00E676]' : 'text-[#FF4757]'
                            }`}>
                              {isGain ? `+${formatINR(h.gainLoss)}` : formatINR(h.gainLoss)}
                            </td>
                          )}

                          {/* Gain / Loss % Chip */}
                          {visibleColumns.gainLossPercent && (
                            <td className="py-3 px-2 text-right">
                              <span className={`px-2 py-0.5 rounded-full font-numeric text-xs font-bold inline-flex items-center gap-0.5 ${
                                isGain 
                                  ? 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/25' 
                                  : 'bg-[#FF4757]/15 text-[#FF4757] border border-[#FF4757]/25'
                              }`}>
                                {isGain ? '▲' : '▼'} {formatPercent(h.gainLossPercent)}
                              </span>
                            </td>
                          )}

                          {/* P/E Ratio (TTM) */}
                          {visibleColumns.peRatio && (
                            <td className="py-3 px-2 text-right font-numeric text-xs text-[#94A3B8]">
                              {h.peRatio !== null ? h.peRatio.toFixed(2) : '—'}
                            </td>
                          )}

                          {/* Latest Earnings */}
                          {visibleColumns.latestEarnings && (
                            <td className="py-3 px-4 text-xs text-[#94A3B8] max-w-[200px] truncate" title={h.latestEarnings}>
                              {h.latestEarnings}
                            </td>
                          )}

                          {/* Optional Extra Columns */}
                          {visibleColumns.marketCap && (
                            <td className="py-3 px-2 text-right font-numeric text-xs text-white">
                              {formatNumber(h.marketCapCr, 0)}
                            </td>
                          )}
                          {visibleColumns.revenue && (
                            <td className="py-3 px-2 text-right font-numeric text-xs text-white">
                              {formatNumber(h.revenueTtmCr, 0)}
                            </td>
                          )}
                          {visibleColumns.ebitda && (
                            <td className="py-3 px-2 text-right font-numeric text-xs text-white">
                              {h.ebitdaPercent ? `${h.ebitdaPercent}%` : '—'}
                            </td>
                          )}
                          {visibleColumns.pat && (
                            <td className="py-3 px-2 text-right font-numeric text-xs text-white">
                              {formatNumber(h.patCr, 0)}
                            </td>
                          )}
                          {visibleColumns.cfo && (
                            <td className="py-3 px-2 text-right font-numeric text-xs text-white">
                              {formatNumber(h.cfoCr, 0)}
                            </td>
                          )}

                          {/* Expandable Details Button */}
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={(e) => toggleRowExpand(e, h.id)}
                              className="p-1 rounded hover:bg-white/[0.1] text-[#94A3B8] hover:text-white transition-colors"
                              title="Toggle detailed fundamentals"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <Info className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Row Detail Panel */}
                        {isExpanded && (
                          <tr className="bg-[#0B0E14]/80 border-b border-white/[0.08]">
                            <td colSpan={18} className="p-3 sm:p-4">
                              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs font-numeric bg-[#151B2B] p-3 sm:p-4 rounded-xl border border-white/[0.08]">
                                <div className="flex flex-col">
                                  <span className="text-[#64748B] text-[10px] uppercase">Market Cap</span>
                                  <span className="text-white font-semibold">₹ {formatNumber(h.marketCapCr, 0)} Cr</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[#64748B] text-[10px] uppercase">Revenue (TTM)</span>
                                  <span className="text-white font-semibold">₹ {formatNumber(h.revenueTtmCr, 0)} Cr</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[#64748B] text-[10px] uppercase">EBITDA (TTM)</span>
                                  <span className="text-white font-semibold">₹ {formatNumber(h.ebitdaTtmCr, 0)} Cr ({h.ebitdaPercent}%)</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[#64748B] text-[10px] uppercase">PAT</span>
                                  <span className="text-white font-semibold">₹ {formatNumber(h.patCr, 0)} Cr ({h.patPercent}%)</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[#64748B] text-[10px] uppercase">CFO (Mar 24)</span>
                                  <span className="text-white font-semibold">₹ {formatNumber(h.cfoCr, 0)} Cr</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[#64748B] text-[10px] uppercase">CFO (5Y)</span>
                                  <span className="text-white font-semibold">₹ {formatNumber(h.cfo5YCr, 0)} Cr</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[#64748B] text-[10px] uppercase">3Y Rev Growth</span>
                                  <span className="text-[#00E676] font-semibold">{h.revenueGrowth3YPercent}%</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })
          )}
        </tbody>

        {/* 3. GRAND TOTAL FOOTER ROW */}
        {displayedSectors.length > 0 && (
          <tfoot>
            <tr className="bg-[#151B2B] text-white font-numeric text-xs font-bold border-t-2 border-white/[0.15]">
              <td className="py-3 px-3 sm:px-4 font-heading text-xs sm:text-sm sticky left-0 z-20 bg-[#151B2B] shadow-[2px_0_5px_rgba(0,0,0,0.5)]">
                TOTAL ({allHoldings.length})
              </td>
              {visibleColumns.purchasePrice && <td className="py-3 px-2 text-right">—</td>}
              {visibleColumns.quantity && <td className="py-3 px-2 text-right">—</td>}
              {visibleColumns.investment && (
                <td className="py-3 px-2 text-right text-[#CABEFF]">
                  {formatINR(totalInvestment)}
                </td>
              )}
              {visibleColumns.portfolioWeight && (
                <td className="py-3 px-2 text-right">100.0%</td>
              )}
              {visibleColumns.exchange && <td className="py-3 px-2 text-center">—</td>}
              {visibleColumns.cmp && <td className="py-3 px-2 text-right">—</td>}
              {visibleColumns.presentValue && (
                <td className="py-3 px-2 text-right text-white">
                  {formatINR(totalPresentValue)}
                </td>
              )}
              {visibleColumns.gainLoss && (
                <td className={`py-3 px-2 text-right ${totalGainLoss >= 0 ? 'text-[#00E676]' : 'text-[#FF4757]'}`}>
                  {totalGainLoss >= 0 ? `+${formatINR(totalGainLoss)}` : formatINR(totalGainLoss)}
                </td>
              )}
              {visibleColumns.gainLossPercent && (
                <td className="py-3 px-2 text-right">
                  <span className={`px-2.5 py-0.5 rounded-full font-numeric text-xs font-bold inline-flex items-center gap-0.5 ${
                    totalGainLoss >= 0 ? 'bg-[#00E676]/20 text-[#00E676]' : 'bg-[#FF4757]/20 text-[#FF4757]'
                  }`}>
                    {totalGainLoss >= 0 ? '▲' : '▼'} {formatPercent(totalGainLossPercent)}
                  </span>
                </td>
              )}
              {visibleColumns.peRatio && <td className="py-3 px-2 text-right">—</td>}
              {visibleColumns.latestEarnings && <td className="py-3 px-4 text-left text-[#64748B]">All Sectors Active</td>}
              {visibleColumns.marketCap && <td className="py-3 px-2 text-right">—</td>}
              {visibleColumns.revenue && <td className="py-3 px-2 text-right">—</td>}
              {visibleColumns.ebitda && <td className="py-3 px-2 text-right">—</td>}
              {visibleColumns.pat && <td className="py-3 px-2 text-right">—</td>}
              {visibleColumns.cfo && <td className="py-3 px-2 text-right">—</td>}
              <td className="py-3 px-3 text-center">—</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};
