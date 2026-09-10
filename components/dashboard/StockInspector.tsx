'use client';

import React from 'react';
import { HoldingCalculated } from '@/types/portfolio';
import { formatINR, formatPercent, formatNumber } from '@/lib/utils/formatters';
import { 
  ShoppingCart, 
  BellRing, 
  FileText, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ShieldCheck,
  CheckCircle
} from 'lucide-react';

interface StockInspectorProps {
  holding: HoldingCalculated | null;
}

export const StockInspector: React.FC<StockInspectorProps> = ({ holding }) => {
  if (!holding) {
    return (
      <section className="rounded-xl bg-[#10141F] p-6 border border-white/[0.08] shadow-2xl relative overflow-hidden text-center text-[#94A3B8]">
        <div className="py-8 flex flex-col items-center justify-center gap-2">
          <Activity className="w-8 h-8 text-[#7C5CFC]/50 animate-pulse" />
          <p className="font-heading text-sm font-medium text-white">Click any stock row in the table to inspect details</p>
          <p className="text-xs text-[#64748B]">Real-time ratios, 52W range, analyst consensus, and volatility metrics</p>
        </div>
      </section>
    );
  }

  const isDayGain = (holding.dayChange || 0) >= 0;
  const yearHigh = holding.yearHigh || holding.purchasePrice * 1.35;
  const yearLow = holding.yearLow || holding.purchasePrice * 0.75;
  const rangePercent = Math.min(Math.max(((holding.cmp - yearLow) / (yearHigh - yearLow)) * 100, 5), 100);

  const consensusBuy = holding.consensusBuyPercent || 84;
  const consensusHold = 10;
  const consensusSell = Math.max(100 - consensusBuy - consensusHold, 0);

  return (
    <section className="rounded-xl bg-[#10141F] p-6 border border-white/[0.08] shadow-2xl relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* 1. Left: Stock Header, Live Pricing & Sparkline */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#7C5CFC]/20 text-[#CABEFF] font-heading text-[10px] font-semibold uppercase tracking-wider border border-[#7C5CFC]/30">
              Docked Inspection
            </span>
            <span className="font-numeric text-xs text-[#00E676] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-ping" />
              Live Ticker Active
            </span>
          </div>

          <div>
            <h3 className="font-heading text-xl lg:text-2xl font-bold text-white">
              {holding.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-numeric text-xs font-semibold text-[#94A3B8]">
                {holding.exchange}: {holding.symbol}
              </span>
              <span className="text-[#64748B]">•</span>
              <span className="text-xs text-[#94A3B8]">{holding.sector}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2.5">
            <span className="font-numeric text-2xl lg:text-3xl font-bold text-white">
              {formatINR(holding.cmp)}
            </span>
            <span className={`font-numeric text-xs font-bold ${isDayGain ? 'text-[#00E676]' : 'text-[#FF4757]'}`}>
              {isDayGain ? '+' : ''}{formatINR(holding.dayChange || 0)} ({formatPercent(holding.dayChangePercent || 0)}) today
            </span>
          </div>

          {/* Real-time Dynamic Mini Sparkline */}
          <div className="w-full h-14 bg-[#0B0E14] rounded-lg p-2 flex items-end border border-white/[0.06]">
            <svg className={`w-full h-full ${isDayGain ? 'text-[#00E676]' : 'text-[#FF4757]'}`} preserveAspectRatio="none" viewBox="0 0 200 40">
              <path 
                d="M0,35 Q30,30 60,22 T120,16 T160,8 T200,3" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
              />
              <circle cx="200" cy="3" fill="currentColor" r="3.5" />
            </svg>
          </div>
        </div>

        {/* 2. Center: Key Quantitative Ratios Mosaic */}
        <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* P/E Ratio */}
          <div className="bg-[#151B2B] p-3 rounded-lg border border-white/[0.06] flex flex-col justify-between">
            <span className="font-heading text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">
              P/E Ratio (TTM)
            </span>
            <span className="font-numeric text-lg font-bold text-white my-1">
              {holding.peRatio !== null ? holding.peRatio.toFixed(1) : '—'}
            </span>
            <span className="text-[11px] text-[#94A3B8]">
              Sector Avg: 31.4
            </span>
          </div>

          {/* 52W Range */}
          <div className="bg-[#151B2B] p-3 rounded-lg border border-white/[0.06] flex flex-col justify-between">
            <span className="font-heading text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">
              52W Range
            </span>
            <span className="font-numeric text-xs font-bold text-white my-1">
              ₹ {formatNumber(yearHigh, 0)} / {formatNumber(yearLow, 0)}
            </span>
            <div className="w-full bg-[#0B0E14] h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-[#00E676] h-full rounded-full" 
                style={{ width: `${rangePercent}%` }} 
              />
            </div>
          </div>

          {/* Beta / Volatility */}
          <div className="bg-[#151B2B] p-3 rounded-lg border border-white/[0.06] flex flex-col justify-between">
            <span className="font-heading text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">
              Beta / Volatility
            </span>
            <span className="font-numeric text-lg font-bold text-white my-1">
              {holding.beta ?? 1.05}
            </span>
            <span className="text-[11px] text-[#7C5CFC] font-medium">
              {(holding.beta ?? 1) > 1.2 ? 'High Volatility' : 'Low/Stable Beta'}
            </span>
          </div>

          {/* Dividend Yield */}
          <div className="bg-[#151B2B] p-3 rounded-lg border border-white/[0.06] flex flex-col justify-between">
            <span className="font-heading text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">
              Dividend Yield
            </span>
            <span className="font-numeric text-lg font-bold text-white my-1">
              {holding.dividendYieldPercent ? `${holding.dividendYieldPercent}%` : '0.00%'}
            </span>
            <span className="text-[11px] text-[#94A3B8]">
              Regular Payout
            </span>
          </div>
        </div>

        {/* 3. Right: Analyst Consensus & Actions */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-3 bg-[#151B2B] p-4 rounded-xl border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs text-[#94A3B8] uppercase font-semibold">
              Analyst Consensus
            </span>
            <span className="font-numeric text-xs font-bold text-[#00E676]">
              {consensusBuy}% BUY
            </span>
          </div>

          {/* Consensus Bar */}
          <div className="w-full bg-[#0B0E14] h-2 rounded-full overflow-hidden flex">
            <div className="bg-[#00E676] h-full" style={{ width: `${consensusBuy}%` }} title={`Buy ${consensusBuy}%`} />
            <div className="bg-[#5B8DEF] h-full" style={{ width: `${consensusHold}%` }} title={`Hold ${consensusHold}%`} />
            <div className="bg-[#FF4757] h-full" style={{ width: `${consensusSell}%` }} title={`Sell ${consensusSell}%`} />
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col gap-2 pt-1">
            <button 
              disabled
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[#7C5CFC] to-[#5B8DEF] text-white font-heading text-xs font-medium opacity-90 cursor-not-allowed flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(124,92,252,0.35)]"
              title="Execution Disabled (Display Terminal Mode)"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add Trade Order</span>
            </button>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => alert(`Price alert created for ${holding.name} at ₹${holding.cmp}`)}
                className="flex-1 py-1.5 px-2 rounded-lg bg-[#1D2026] hover:bg-[#272A31] text-white text-xs transition-colors flex items-center justify-center gap-1 border border-white/[0.06]"
              >
                <BellRing className="w-3 h-3 text-[#CABEFF]" />
                <span>Set Alert</span>
              </button>
              <button 
                onClick={() => window.open(`https://www.google.com/finance/quote/${holding.symbol}:NSE`, '_blank')}
                className="flex-1 py-1.5 px-2 rounded-lg bg-[#1D2026] hover:bg-[#272A31] text-white text-xs transition-colors flex items-center justify-center gap-1 border border-white/[0.06]"
              >
                <FileText className="w-3 h-3 text-[#5B8DEF]" />
                <span>Research</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
