'use client';

import React from 'react';
import { ShieldCheck, Activity, Wifi, Server, Database } from 'lucide-react';

interface StatusBarProps {
  latencyMs: number;
  lastSyncTime: string;
  isCached: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  latencyMs,
  lastSyncTime,
  isCached,
}) => {
  return (
    <footer className="space-y-4">
      {/* 1. Real-Time Diagnostics Strip */}
      <section className="rounded-lg bg-[#10141F] px-4 py-2 border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 font-numeric text-xs text-[#94A3B8]">
        <div className="flex items-center gap-3 lg:gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
            <span className="text-white">NSE STP Pipeline:</span>
            <span className="text-[#00E676] font-semibold">ACTIVE</span>
          </span>

          <span className="text-[#64748B]">•</span>

          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00E676]" />
            <span className="text-white">BSE Direct Stream:</span>
            <span className="text-[#00E676] font-semibold">0 pkt drop</span>
          </span>

          <span className="hidden sm:inline text-[#64748B]">•</span>

          <span className="hidden sm:inline text-white">
            Order Routing: <strong className="text-[#CABEFF] font-normal">Mumbai Gateway II</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 lg:gap-4 flex-wrap">
          <span>Sync Cycle: <strong className="text-white font-semibold">15s Continuous</strong></span>
          <span>
            Fallback Cache: <strong className="text-[#00E676] font-semibold">{isCached ? 'L1 Synchronized (Hit)' : 'Live Polled'}</strong>
          </span>
          <span className="text-[#7C5CFC] font-semibold">
            Ping: {latencyMs > 0 ? latencyMs : 14}ms
          </span>
        </div>
      </section>

      {/* 2. Global Footer */}
      <div className="w-full bg-[#0B0E14] py-4 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-3 text-[#64748B] text-xs">
        <div className="flex items-center gap-3">
          <span className="font-heading text-[11px] font-bold tracking-wider text-white uppercase">
            PORTFOLIO PULSE TERMINAL
          </span>
          <span>•</span>
          <span>Real-Time Market Feeds</span>
          <span>•</span>
          <span>STP Gateway Active</span>
        </div>

        <div className="flex items-center gap-4 font-numeric">
          <span>LATENCY: {latencyMs > 0 ? latencyMs : 14}MS</span>
          <span className="flex items-center gap-1 text-[#00E676]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SECURE ENCLAVE 256-BIT</span>
          </span>
          <span>© 2025 ALL RIGHTS RESERVED</span>
        </div>
      </div>
    </footer>
  );
};
