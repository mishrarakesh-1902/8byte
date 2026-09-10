'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Sparkles, 
  AlertCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { formatINR } from '@/lib/utils/formatters';

export interface MarketNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'gain' | 'loss' | 'earnings' | 'system';
  read: boolean;
  stockSymbol?: string;
}

const INITIAL_NOTIFICATIONS: MarketNotification[] = [
  {
    id: 'n1',
    title: 'Tata Power (+71.67% Gain)',
    description: 'Solar EV grid expansion orders boosted valuation past ₹6,18,000.',
    timestamp: '2 mins ago',
    type: 'gain',
    read: false,
    stockSymbol: '500400',
  },
  {
    id: 'n2',
    title: 'HDFC Bank Earnings Beat',
    description: 'Q3 Net Profit surged +33% YoY with NIM expanding to 3.65%.',
    timestamp: '14 mins ago',
    type: 'earnings',
    read: false,
    stockSymbol: 'HDFCBANK',
  },
  {
    id: 'n3',
    title: 'KPIT Tech (+92.43% All-Time Gain)',
    description: 'Automotive SDV pipeline contract secured with European OEM.',
    timestamp: '32 mins ago',
    type: 'gain',
    read: false,
    stockSymbol: '542651',
  },
  {
    id: 'n4',
    title: 'Gensol Engineering Alert',
    description: 'Position down -62.67%. Trailing below 52W baseline support.',
    timestamp: '1 hour ago',
    type: 'loss',
    read: true,
    stockSymbol: '542851',
  },
  {
    id: 'n5',
    title: 'NSE & BSE Feeds Synchronized',
    description: 'Live 15s STP data pipeline synchronized with 0 packet drops.',
    timestamp: '2 hours ago',
    type: 'system',
    read: true,
  },
];

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStock?: (symbol: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  onSelectStock,
}) => {
  const [notifications, setNotifications] = useState<MarketNotification[]>(INITIAL_NOTIFICATIONS);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const getIcon = (type: MarketNotification['type']) => {
    switch (type) {
      case 'gain':
        return <TrendingUp className="w-4 h-4 text-[#00E676]" />;
      case 'loss':
        return <TrendingDown className="w-4 h-4 text-[#FF4757]" />;
      case 'earnings':
        return <Sparkles className="w-4 h-4 text-[#CABEFF]" />;
      case 'system':
      default:
        return <Zap className="w-4 h-4 text-[#5B8DEF]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md rounded-2xl bg-[#151B2B] border border-white/[0.16] shadow-2xl overflow-hidden mt-16 sm:mt-14 flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#10141F]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#7C5CFC]/20 text-[#CABEFF]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                Market Notifications
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#FF4757] text-white font-numeric text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-[#94A3B8]">Real-time triggers &amp; volatility alerts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#151B2B] hover:bg-[#1D2026] text-[#94A3B8] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 bg-[#0B0E14] border-b border-white/[0.06] flex items-center justify-between text-xs font-numeric text-[#94A3B8]">
            <button
              onClick={markAllAsRead}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={clearAll}
              className="hover:text-[#FF4757] transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="overflow-y-auto p-3 space-y-2 flex-1 divide-y divide-white/[0.04]">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-[#94A3B8] space-y-2">
              <Bell className="w-8 h-8 mx-auto text-[#64748B] opacity-50" />
              <p className="font-heading text-xs">No active notifications</p>
              <p className="text-[11px] text-[#64748B]">All portfolio alerts are cleared</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  toggleRead(item.id);
                  if (item.stockSymbol && onSelectStock) {
                    onSelectStock(item.stockSymbol);
                    onClose();
                  }
                }}
                className={`p-3 rounded-xl transition-all cursor-pointer border ${
                  item.read
                    ? 'bg-[#10141F]/60 border-transparent hover:border-white/[0.08]'
                    : 'bg-[#1D2026] border-[#7C5CFC]/30 shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#151B2B] shrink-0 mt-0.5 border border-white/[0.06]">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-semibold truncate ${item.read ? 'text-white/80' : 'text-white'}`}>
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-[#7C5CFC] shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-[#94A3B8] mt-0.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-1 font-numeric text-[10px] text-[#64748B] mt-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{item.timestamp}</span>
                      {item.stockSymbol && (
                        <span className="text-[#CABEFF] ml-2 font-medium">Click to inspect</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#10141F] border-t border-white/[0.08] text-center">
          <button
            onClick={onClose}
            className="w-full py-1.5 rounded-lg bg-[#151B2B] hover:bg-[#1D2026] text-white font-heading text-xs font-medium border border-white/[0.08] transition-colors"
          >
            Close Alerts
          </button>
        </div>

      </div>
    </div>
  );
};
