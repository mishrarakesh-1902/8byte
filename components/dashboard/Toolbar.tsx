'use client';

import React from 'react';
import { SectorSummary, HoldingCalculated } from '@/types/portfolio';
import { 
  Download, 
  FileText, 
  SlidersHorizontal, 
  ChevronDown, 
  Radio, 
  TrendingUp, 
  TrendingDown,
  Sparkles
} from 'lucide-react';

export type FilterMode = 'all' | 'gainers' | 'losers';
export type SortField = 'gainLossPercent' | 'presentValue' | 'investment' | 'cmp' | 'peRatio';

interface ToolbarProps {
  sectors: SectorSummary[];
  allHoldings: HoldingCalculated[];
  selectedSector: string | null;
  onSelectSector: (sector: string | null) => void;
  filterMode: FilterMode;
  onFilterModeChange: (mode: FilterMode) => void;
  sortField: SortField;
  onSortFieldChange: (field: SortField) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onToggleColumnPicker: () => void;
  syncCountdown: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  sectors,
  allHoldings,
  selectedSector,
  onSelectSector,
  filterMode,
  onFilterModeChange,
  sortField,
  onSortFieldChange,
  onExportCSV,
  onExportPDF,
  onToggleColumnPicker,
  syncCountdown,
}) => {
  const gainersCount = allHoldings.filter(h => h.gainLoss > 0).length;
  const losersCount = allHoldings.filter(h => h.gainLoss < 0).length;

  return (
    <div className="rounded-xl bg-[#10141F] p-4 border border-white/[0.08] shadow-md space-y-3">
      {/* Top Row: Sector Filter Pills & Live Sync Meter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Sector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => onSelectSector(null)}
            className={`px-3 py-1 rounded-full font-numeric text-xs font-semibold transition-all ${
              selectedSector === null
                ? 'bg-[#7C5CFC] text-white shadow-[0_0_12px_rgba(124,92,252,0.4)]'
                : 'bg-[#151B2B] text-[#94A3B8] hover:text-white hover:bg-[#1D2026] border border-white/[0.06]'
            }`}
          >
            All Sectors ({allHoldings.length})
          </button>

          {sectors.map((s) => {
            const isSelected = selectedSector === s.sector;
            const shortName = s.sector.replace(' Sector', '');
            return (
              <button
                key={s.sector}
                onClick={() => onSelectSector(isSelected ? null : s.sector)}
                className={`px-3 py-1 rounded-full font-numeric text-xs transition-all ${
                  isSelected
                    ? 'bg-[#7C5CFC] text-white shadow-[0_0_12px_rgba(124,92,252,0.4)] font-semibold'
                    : 'bg-[#151B2B] text-[#94A3B8] hover:text-white hover:bg-[#1D2026] border border-white/[0.06]'
                }`}
              >
                {shortName} ({s.holdingsCount})
              </button>
            );
          })}
        </div>

        {/* Live Auto-sync Bar */}
        <div className="flex items-center gap-2 bg-[#0B0E14] px-3 py-1.5 rounded-lg border border-white/[0.08] shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E676]"></span>
          </span>
          <span className="font-heading text-xs font-semibold text-[#00E676]">Live Feed</span>
          <span className="text-[#94A3B8] font-numeric text-xs">
            • Auto-syncing in {syncCountdown}s
          </span>
          <div className="w-12 bg-[#1D2026] rounded-full h-1 ml-1 overflow-hidden">
            <div 
              className="bg-[#00E676] h-full rounded-full transition-all duration-1000"
              style={{ width: `${(syncCountdown / 15) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: View Mode Toggles, Sorter & Export CTAs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/[0.06]">
        {/* Quick Toggles */}
        <div className="flex items-center bg-[#0B0E14] p-1 rounded-lg border border-white/[0.08]">
          <button
            onClick={() => onFilterModeChange('all')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              filterMode === 'all'
                ? 'bg-[#1D2026] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            All Stocks ({allHoldings.length})
          </button>
          <button
            onClick={() => onFilterModeChange('gainers')}
            className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 transition-all ${
              filterMode === 'gainers'
                ? 'bg-[#00E676]/15 text-[#00E676] font-semibold'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-[#00E676]" />
            <span>Top Gainers ({gainersCount})</span>
          </button>
          <button
            onClick={() => onFilterModeChange('losers')}
            className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 transition-all ${
              filterMode === 'losers'
                ? 'bg-[#FF4757]/15 text-[#FF4757] font-semibold'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <TrendingDown className="w-3 h-3 text-[#FF4757]" />
            <span>Top Losers ({losersCount})</span>
          </button>
        </div>

        {/* Sorting & Export Actions */}
        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortField}
              onChange={(e) => onSortFieldChange(e.target.value as SortField)}
              className="bg-[#151B2B] appearance-none pl-3 pr-8 py-1.5 rounded-lg text-white font-numeric text-xs border border-white/[0.08] focus:outline-none focus:border-[#7C5CFC] cursor-pointer"
            >
              <option value="gainLossPercent">Sort by: Gain / Loss (%)</option>
              <option value="presentValue">Sort by: Present Value</option>
              <option value="investment">Sort by: Total Investment</option>
              <option value="cmp">Sort by: CMP</option>
              <option value="peRatio">Sort by: P/E Ratio</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151B2B] hover:bg-[#1D2026] text-white text-xs border border-white/[0.08] hover:border-white/[0.16] transition-all font-medium"
            title="Export Portfolio to CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#7C5CFC]" />
            <span>CSV</span>
          </button>

          {/* Export PDF */}
          <button
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151B2B] hover:bg-[#1D2026] text-white text-xs border border-white/[0.08] hover:border-white/[0.16] transition-all font-medium"
            title="Export Portfolio Report to PDF"
          >
            <FileText className="w-3.5 h-3.5 text-[#5B8DEF]" />
            <span>PDF</span>
          </button>

          {/* Column Customizer Toggle */}
          <button
            onClick={onToggleColumnPicker}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151B2B] hover:bg-[#1D2026] text-white text-xs border border-white/[0.08] hover:border-white/[0.16] transition-all font-medium"
            title="Toggle visible columns"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#CABEFF]" />
            <span>Columns</span>
          </button>
        </div>
      </div>
    </div>
  );
};
