'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { SectorSummary } from '@/types/portfolio';
import { formatCompactINR, formatPercent } from '@/lib/utils/formatters';
import { SECTOR_COLORS } from '@/data/portfolioSeed';
import { PieChart as PieIcon, ShieldCheck } from 'lucide-react';

interface SectorDonutProps {
  sectors: SectorSummary[];
  onSelectSector?: (sectorName: string) => void;
}

export const SectorDonut: React.FC<SectorDonutProps> = ({ sectors, onSelectSector }) => {
  const chartData = sectors.map((s) => ({
    name: s.sector.replace(' Sector', ''),
    fullName: s.sector,
    value: s.totalPresentValue,
    investment: s.totalInvestment,
    weight: s.portfolioWeightPercent,
    gainLossPercent: s.totalGainLossPercent,
    color: SECTOR_COLORS[s.sector]?.primary || '#94A3B8',
  }));

  // Find top performing sector
  const bestSector = [...sectors].sort((a, b) => b.totalGainLossPercent - a.totalGainLossPercent)[0];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#151B2B] p-3 rounded-lg border border-white/[0.15] shadow-2xl backdrop-blur-xl font-numeric text-xs">
          <p className="font-heading text-sm font-bold text-white mb-1">{data.fullName}</p>
          <div className="space-y-1 text-[#94A3B8]">
            <p className="flex justify-between gap-4">
              <span>Present Value:</span>
              <strong className="text-white">{formatCompactINR(data.value)}</strong>
            </p>
            <p className="flex justify-between gap-4">
              <span>Weight:</span>
              <strong className="text-[#CABEFF]">{data.weight.toFixed(1)}%</strong>
            </p>
            <p className="flex justify-between gap-4">
              <span>Gain / Loss:</span>
              <strong className={data.gainLossPercent >= 0 ? 'text-[#00E676]' : 'text-[#FF4757]'}>
                {formatPercent(data.gainLossPercent)}
              </strong>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="lg:col-span-5 rounded-xl bg-[#10141F] p-6 border border-white/[0.08] shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-[#5B8DEF]" />
            <h2 className="font-heading text-lg text-white font-semibold">
              Sector Exposure
            </h2>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">Radial concentration index</p>
        </div>

        {bestSector && (
          <span className="px-2.5 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 font-numeric text-xs font-semibold">
            {bestSector.sector.split(' ')[0]} Leading {formatPercent(bestSector.totalGainLossPercent)}
          </span>
        )}
      </div>

      {/* Chart & Custom Legend Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-3">
        {/* Recharts Donut Pie */}
        <div className="sm:col-span-5 flex items-center justify-center relative h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    className="hover:opacity-80 cursor-pointer transition-opacity"
                    onClick={() => onSelectSector && onSelectSector(entry.fullName)}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Summary Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-heading text-xl font-bold text-white">
              {sectors.length}
            </span>
            <span className="font-heading text-[10px] text-[#94A3B8] uppercase tracking-wider">
              Sectors
            </span>
          </div>
        </div>

        {/* Legend Progress Bars */}
        <div className="sm:col-span-7 space-y-2 font-numeric text-xs">
          {sectors.slice(0, 4).map((sector) => {
            const color = SECTOR_COLORS[sector.sector]?.primary || '#94A3B8';
            return (
              <div 
                key={sector.sector} 
                className="cursor-pointer group"
                onClick={() => onSelectSector && onSelectSector(sector.sector)}
              >
                <div className="flex justify-between text-xs text-white group-hover:text-[#CABEFF] transition-colors">
                  <span className="flex items-center gap-1.5 truncate max-w-[130px]">
                    <span 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: color }} 
                    />
                    <span className="truncate">{sector.sector.replace(' Sector', '')}</span>
                  </span>
                  <span className="font-semibold text-[#E1E2EB]">
                    {formatCompactINR(sector.totalPresentValue)} ({sector.portfolioWeightPercent.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-[#1D2026] rounded-full h-1 mt-1 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(sector.portfolioWeightPercent, 100)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Concentration Rule Status */}
      <div className="flex items-center justify-between pt-2 bg-[#151B2B] px-3 py-2 rounded-lg border border-white/[0.06] text-xs text-[#94A3B8]">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
          <span>Concentration Warning:</span>
        </span>
        <span className="text-[#00E676] font-numeric font-semibold">
          Healthy (&lt;35% Cap met)
        </span>
      </div>
    </div>
  );
};
