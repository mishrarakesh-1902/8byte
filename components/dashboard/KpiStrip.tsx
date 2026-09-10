'use client';

import React from 'react';
import { PortfolioKPIs } from '@/types/portfolio';
import { formatINR, formatPercent } from '@/lib/utils/formatters';
import { TrendingUp, TrendingDown, Zap, Activity, Layers } from 'lucide-react';

interface KpiStripProps {
  kpis: PortfolioKPIs;
  isLoading?: boolean;
}

export const KpiStrip: React.FC<KpiStripProps> = ({ kpis, isLoading }) => {
  const isOverallGain = kpis.totalGainLoss >= 0;
  const isTodayGain = kpis.todayGainLoss >= 0;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Investment */}
      <div className="relative overflow-hidden rounded-xl bg-[#10141F] p-5 border border-white/[0.08] shadow-md flex flex-col justify-between hover:border-white/[0.14] transition-all">
        <div className="flex items-center justify-between">
          <span className="font-heading text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
            Total Investment
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#151B2B] font-numeric text-xs text-[#62FF96] border border-white/[0.06]">
            +14.2% YoY
          </span>
        </div>

        <div className="my-3">
          <div className="font-numeric text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {formatINR(kpis.totalInvestment)}
          </div>
          <div className="text-xs text-[#64748B] mt-0.5">
            Historical baseline capital
          </div>
        </div>

        {/* Investment Baseline SVG Sparkline */}
        <div className="h-7 w-full flex items-end">
          <svg className="w-full h-6 text-[#7C5CFC] overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 25">
            <path 
              d="M0,20 Q20,18 40,12 T70,10 T100,2" 
              fill="none" 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeWidth="2.5" 
            />
            <path 
              className="opacity-10" 
              d="M0,20 Q20,18 40,12 T70,10 T100,2 L100,25 L0,25 Z" 
              fill="currentColor" 
            />
          </svg>
        </div>
      </div>

      {/* 2. Total Present Value */}
      <div className="relative overflow-hidden rounded-xl bg-[#10141F] p-5 border border-white/[0.08] shadow-md flex flex-col justify-between hover:border-white/[0.14] transition-all">
        <div className="flex items-center justify-between">
          <span className="font-heading text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
            Total Present Value
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-numeric text-xs ${
            isOverallGain 
              ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20' 
              : 'bg-[#FF4757]/10 text-[#FF4757] border border-[#FF4757]/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOverallGain ? 'bg-[#00E676]' : 'bg-[#FF4757]'} animate-pulse`} />
            {formatPercent(kpis.totalGainLossPercent)}
          </span>
        </div>

        <div className="my-3">
          <div className="font-numeric text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-baseline gap-1.5">
            <span>{formatINR(kpis.totalPresentValue)}</span>
            <span className="font-numeric text-xs text-[#00E676] animate-pulse font-normal">
              ▲ LIVE
            </span>
          </div>
          <div className="text-xs text-[#64748B] mt-0.5">
            Real-time valuation (NSE/BSE)
          </div>
        </div>

        {/* Real-time Dynamic Sparkline */}
        <div className="h-7 w-full flex items-end">
          <svg className="w-full h-6 text-[#00E676] overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 25">
            <path 
              d="M0,24 Q25,20 45,15 T75,8 T100,1" 
              fill="none" 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeWidth="2.5" 
            />
            <path 
              className="opacity-15" 
              d="M0,24 Q25,20 45,15 T75,8 T100,1 L100,25 L0,25 Z" 
              fill="currentColor" 
            />
          </svg>
        </div>
      </div>

      {/* 3. Net Unrealized Gain */}
      <div className="relative overflow-hidden rounded-xl bg-[#10141F] p-5 border border-white/[0.08] shadow-md flex flex-col justify-between hover:border-white/[0.14] transition-all">
        <div className="flex items-center justify-between">
          <span className="font-heading text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
            Net Unrealized Gain
          </span>
          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-numeric text-xs font-bold ${
            isOverallGain ? 'bg-[#00E676]/15 text-[#00E676]' : 'bg-[#FF4757]/15 text-[#FF4757]'
          }`}>
            {isOverallGain ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {formatPercent(kpis.totalGainLossPercent)}
          </span>
        </div>

        <div className="my-3">
          <div className={`font-numeric text-2xl lg:text-3xl font-bold tracking-tight ${
            isOverallGain ? 'text-[#00E676]' : 'text-[#FF4757]'
          }`}>
            {isOverallGain ? `+ ${formatINR(kpis.totalGainLoss)}` : formatINR(kpis.totalGainLoss)}
          </div>
          <div className="text-xs text-[#64748B] mt-0.5">
            Absolute overall return
          </div>
        </div>

        {/* Return meter */}
        <div className="w-full bg-[#1D2026] rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${isOverallGain ? 'bg-[#00E676]' : 'bg-[#FF4757]'}`}
            style={{ width: `${Math.min(Math.max(Math.abs(kpis.totalGainLossPercent) * 2, 10), 100)}%` }}
          />
        </div>
      </div>

      {/* 4. Today's P&L */}
      <div className="relative overflow-hidden rounded-xl bg-[#10141F] p-5 border border-white/[0.08] shadow-md flex flex-col justify-between hover:border-white/[0.14] transition-all">
        <div className="flex items-center justify-between">
          <span className="font-heading text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
            Today&apos;s P&amp;L
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00E676]/10 font-numeric text-xs text-[#00E676]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-ping" />
            Day High
          </span>
        </div>

        <div className="my-3">
          <div className={`font-numeric text-2xl lg:text-3xl font-bold tracking-tight ${
            isTodayGain ? 'text-[#00E676]' : 'text-[#FF4757]'
          }`}>
            {isTodayGain ? `+ ${formatINR(kpis.todayGainLoss)}` : formatINR(kpis.todayGainLoss)}
          </div>
          <div className="flex items-center gap-1 font-numeric text-xs">
            <span className={isTodayGain ? 'text-[#00E676]' : 'text-[#FF4757]'}>
              {isTodayGain ? '▲' : '▼'} {formatPercent(kpis.todayGainLossPercent)}
            </span>
            <span className="text-[#64748B] font-normal">vs Prev Close</span>
          </div>
        </div>

        {/* Multi-segment momentum meter */}
        <div className="flex items-center gap-1">
          <span className="h-1.5 flex-1 rounded bg-[#00E676]" />
          <span className="h-1.5 flex-1 rounded bg-[#00E676]" />
          <span className="h-1.5 flex-1 rounded bg-[#00E676]" />
          <span className="h-1.5 flex-1 rounded bg-[#00E676]/40" />
          <span className="h-1.5 flex-1 rounded bg-[#1D2026]" />
        </div>
      </div>

      {/* 5. Active Holdings & Depth */}
      <div className="relative overflow-hidden rounded-xl bg-[#10141F] p-5 border border-white/[0.08] shadow-md flex flex-col justify-between hover:border-white/[0.14] transition-all">
        <div className="flex items-center justify-between">
          <span className="font-heading text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
            Holdings Depth
          </span>
          <span className="font-numeric text-xs text-[#CABEFF] bg-[#7C5CFC]/10 px-2 py-0.5 rounded-full border border-[#7C5CFC]/20">
            NIFTY 50 +{kpis.nifty50ReturnPercent}%
          </span>
        </div>

        <div className="my-3">
          <div className="font-heading text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {kpis.totalHoldings} Stocks
          </div>
          <div className="text-xs text-[#64748B] mt-0.5">
            Across {kpis.totalSectors} Core Sectors
          </div>
        </div>

        <div className="flex items-center justify-between font-numeric text-xs text-[#94A3B8]">
          <span>Alpha vs Nifty:</span>
          <span className="font-bold text-[#7C5CFC]">
            {formatPercent(kpis.alphaVsNifty)}
          </span>
        </div>
      </div>
    </section>
  );
};
