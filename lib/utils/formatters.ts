/**
 * Utility functions for Indian Rupee & numeric financial formatting
 */

export function formatINR(val: number | null | undefined, includeSymbol = true): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  
  const formatted = val.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  return includeSymbol ? `₹ ${formatted}` : formatted;
}

export function formatCompactINR(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}₹ ${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹ ${(abs / 100000).toFixed(2)} L`;
  }
  if (abs >= 1000) {
    return `${sign}₹ ${(abs / 1000).toFixed(1)}k`;
  }
  return `${sign}₹ ${abs.toFixed(2)}`;
}

export function formatPercent(val: number | null | undefined, includeSign = true): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const prefix = includeSign && val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(2)}%`;
}

export function formatNumber(val: number | null | undefined, decimals = 2): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return val.toLocaleString('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
}
