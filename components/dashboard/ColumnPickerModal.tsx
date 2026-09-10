'use client';

import React from 'react';
import { X, Check, Eye } from 'lucide-react';

interface ColumnPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibleColumns: Record<string, boolean>;
  onToggleColumn: (key: string) => void;
  onResetColumns: () => void;
}

export const ColumnPickerModal: React.FC<ColumnPickerModalProps> = ({
  isOpen,
  onClose,
  visibleColumns,
  onToggleColumn,
  onResetColumns,
}) => {
  if (!isOpen) return null;

  const columnGroups = [
    {
      title: 'Core Valuation & Position',
      columns: [
        { key: 'purchasePrice', label: 'Purchase Price' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'investment', label: 'Total Investment' },
        { key: 'portfolioWeight', label: 'Portfolio Weight (%)' },
        { key: 'exchange', label: 'Exchange (NSE/BSE)' },
      ],
    },
    {
      title: 'Live Market & Returns',
      columns: [
        { key: 'cmp', label: 'Live CMP (Yahoo Finance)' },
        { key: 'presentValue', label: 'Present Value' },
        { key: 'gainLoss', label: 'Gain / Loss Amount' },
        { key: 'gainLossPercent', label: 'Gain / Loss (%)' },
        { key: 'peRatio', label: 'P/E Ratio (Google Finance)' },
        { key: 'latestEarnings', label: 'Latest Earnings Note' },
      ],
    },
    {
      title: 'Extended Fundamentals & Cash Flow',
      columns: [
        { key: 'marketCap', label: 'Market Capitalization (Cr)' },
        { key: 'revenue', label: 'Revenue (TTM)' },
        { key: 'ebitda', label: 'EBITDA (%)' },
        { key: 'pat', label: 'PAT (Profit After Tax)' },
        { key: 'cfo', label: 'Cash Flow from Operations (CFO)' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-2xl bg-[#151B2B] border border-white/[0.16] shadow-2xl p-6 relative flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#7C5CFC]" />
            <h3 className="font-heading text-lg font-bold text-white">
              Customize Table Columns
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#10141F] hover:bg-[#1D2026] text-[#94A3B8] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Column List */}
        <div className="overflow-y-auto py-4 space-y-5 flex-1 pr-1">
          {columnGroups.map((group) => (
            <div key={group.title} className="space-y-2.5">
              <h4 className="font-heading text-xs uppercase font-semibold text-[#CABEFF] tracking-wider">
                {group.title}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.columns.map((col) => {
                  const isChecked = visibleColumns[col.key] !== false;
                  return (
                    <button
                      key={col.key}
                      onClick={() => onToggleColumn(col.key)}
                      className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-numeric transition-all border text-left ${
                        isChecked
                          ? 'bg-[#7C5CFC]/15 border-[#7C5CFC]/40 text-white'
                          : 'bg-[#10141F] border-white/[0.06] text-[#64748B] hover:text-[#94A3B8]'
                      }`}
                    >
                      <span className="font-sans">{col.label}</span>
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                        isChecked
                          ? 'bg-[#7C5CFC] border-[#7C5CFC] text-white'
                          : 'border-white/[0.2] bg-[#0B0E14]'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
          <button
            onClick={onResetColumns}
            className="px-3 py-1.5 rounded-lg bg-[#10141F] hover:bg-[#1D2026] text-[#94A3B8] hover:text-white text-xs transition-colors border border-white/[0.06]"
          >
            Reset to Default
          </button>

          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg bg-[#7C5CFC] hover:bg-[#6844F9] text-white font-heading text-xs font-semibold shadow-lg shadow-[#7C5CFC]/30 transition-all"
          >
            Apply &amp; Done
          </button>
        </div>

      </div>
    </div>
  );
};
