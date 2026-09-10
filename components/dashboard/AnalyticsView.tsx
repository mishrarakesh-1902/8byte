'use client';

import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  CartesianGrid,
  Legend
} from 'recharts';
import { SectorSummary, HoldingCalculated, PortfolioKPIs } from '@/types/portfolio';
import { formatCompactINR, formatPercent, formatINR } from '@/lib/utils/formatters';
import { SECTOR_COLORS } from '@/data/portfolioSeed';
import { BarChart3, TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';

interface AnalyticsViewProps {
  sectors: SectorSummary[];
  allHoldings: HoldingCalculated[];
  kpis: PortfolioKPIs;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  sectors,
  allHoldings,
  kpis,
}) => {
  // Sector performance data
  const sectorPerformanceData = sectors.map((s) => ({
    name: s.sector.replace(' Sector', ''),
    gainPercent: s.totalGainLossPercent,
    invested: s.totalInvestment,
    present: s.totalPresentValue,
    color: SECTOR_COLORS[s.sector]?.primary || '#7C5CFC',
  }));

  // Top 5 Gainers & Top 5 Losers
  const topGainers = [...allHoldings].sort((a, b) => b.gainLossPercent - a.gainLossPercent).slice(0, 5);
  const topLosers = [...allHoldings].sort((a, b) => a.gainLossPercent - b.gainLossPercent).slice(0, 5);

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#151B2B] p-3 rounded-lg border border-white/[0.15] shadow-2xl backdrop-blur-xl font-numeric text-xs">
          <p className="font-heading text-sm font-bold text-white mb-1">{data.name}</p>
          <div className="space-y-1 text-[#94A3B8]">
            <p className="flex justify-between gap-4">
              <span>Return (%):</span>
              <strong className={data.gainPercent >= 0 ? 'text-[#00E676]' : 'text-[#FF4757]'}>
                {formatPercent(data.gainPercent)}
              </strong>
            </p>
            <p className="flex justify-between gap-4">
              <span>Invested:</span>
              <strong className="text-white">{formatCompactINR(data.invested)}</strong>
            </p>
            <p className="flex justify-between gap-4">
              <span>Present Value:</span>
              <strong className="text-white">{formatCompactINR(data.present)}</strong>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Sector Return Breakdown */}
      <div className="rounded-xl bg-[#10141F] p-6 border border-white/[0.08] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#7C5CFC]" />
            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                Sector-Wise Return &amp; Capital Efficiency
              </h3>
              <p className="text-xs text-[#94A3B8]">Comparative percentage gain/loss across portfolio sectors</p>
            </div>
          </div>
          <span className="font-numeric text-xs text-[#CABEFF] bg-[#7C5CFC]/10 px-3 py-1 rounded-full border border-[#7C5CFC]/20">
            6 Active Sectors
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectorPerformanceData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="gainPercent" radius={[6, 6, 0, 0]}>
                {sectorPerformanceData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.gainPercent >= 0 ? '#00E676' : '#FF4757'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Top Gainers & Top Losers Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Gainers */}
        <div className="rounded-xl bg-[#10141F] p-5 border border-white/[0.08] shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00E676]" />
              <h4 className="font-heading text-sm font-bold text-white">Top 5 Outperformers</h4>
            </div>
            <span className="text-xs text-[#00E676] font-numeric font-bold">Max Gainers</span>
          </div>

          <div className="space-y-2 font-numeric text-xs">
            {topGainers.map((h, i) => (
              <div key={h.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#151B2B] border border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#00E676]/20 text-[#00E676] flex items-center justify-center font-bold text-[11px]">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-sans text-xs font-semibold text-white">{h.name}</p>
                    <p className="text-[10px] text-[#64748B]">{h.sector.replace(' Sector', '')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#00E676]">+{h.gainLossPercent.toFixed(2)}%</p>
                  <p className="text-[11px] text-[#94A3B8]">+{formatINR(h.gainLoss)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Losers / Drawdowns */}
        <div className="rounded-xl bg-[#10141F] p-5 border border-white/[0.08] shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-[#FF4757]" />
              <h4 className="font-heading text-sm font-bold text-white">Top 5 Underperformers</h4>
            </div>
            <span className="text-xs text-[#FF4757] font-numeric font-bold">Drawdown</span>
          </div>

          <div className="space-y-2 font-numeric text-xs">
            {topLosers.map((h, i) => (
              <div key={h.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#151B2B] border border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FF4757]/20 text-[#FF4757] flex items-center justify-center font-bold text-[11px]">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-sans text-xs font-semibold text-white">{h.name}</p>
                    <p className="text-[10px] text-[#64748B]">{h.sector.replace(' Sector', '')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${h.gainLossPercent >= 0 ? 'text-[#00E676]' : 'text-[#FF4757]'}`}>
                    {h.gainLossPercent >= 0 ? '+' : ''}{h.gainLossPercent.toFixed(2)}%
                  </p>
                  <p className="text-[11px] text-[#94A3B8]">{formatINR(h.gainLoss)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
