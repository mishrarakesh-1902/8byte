import { HoldingCalculated, SectorSummary, PortfolioKPIs } from '@/types/portfolio';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export portfolio data as CSV file
 */
export function exportPortfolioToCSV(holdings: HoldingCalculated[], kpis: PortfolioKPIs): void {
  const headers = [
    'Particulars',
    'Symbol',
    'Sector',
    'Exchange',
    'Purchase Price (INR)',
    'Quantity',
    'Investment (INR)',
    'Portfolio (%)',
    'Live CMP (INR)',
    'Present Value (INR)',
    'Gain / Loss (INR)',
    'Gain / Loss (%)',
    'P/E Ratio',
    'Latest Earnings',
    'Market Cap (Cr)',
    'Revenue (Cr)',
    'EBITDA (%)',
    'PAT (Cr)',
    'CFO (Cr)'
  ];

  const rows = holdings.map((h) => [
    `"${h.name.replace(/"/g, '""')}"`,
    `"${h.symbol}"`,
    `"${h.sector}"`,
    `"${h.exchange}"`,
    h.purchasePrice,
    h.quantity,
    h.investment,
    h.portfolioWeightPercent,
    h.cmp,
    h.presentValue,
    h.gainLoss,
    h.gainLossPercent,
    h.peRatio ?? 'N/A',
    `"${(h.latestEarnings || '').replace(/"/g, '""')}"`,
    h.marketCapCr ?? 'N/A',
    h.revenueTtmCr ?? 'N/A',
    h.ebitdaPercent ?? 'N/A',
    h.patCr ?? 'N/A',
    h.cfoCr ?? 'N/A',
  ]);

  const summaryRows = [
    [],
    ['--- PORTFOLIO SUMMARY ---'],
    ['Total Investment (INR)', kpis.totalInvestment],
    ['Total Present Value (INR)', kpis.totalPresentValue],
    ['Total Unrealized Gain (INR)', kpis.totalGainLoss],
    ['Total Unrealized Gain (%)', `${kpis.totalGainLossPercent}%`],
    ['Total Holdings', kpis.totalHoldings],
    ['Alpha vs Nifty 50', `${kpis.alphaVsNifty}%`],
  ];

  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
    ...summaryRows.map((r) => r.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Portfolio_Pulse_Holdings_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export portfolio data as PDF report
 */
export function exportPortfolioToPDF(
  holdings: HoldingCalculated[],
  sectors: SectorSummary[],
  kpis: PortfolioKPIs
): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header Title & Branding
  doc.setFillColor(11, 14, 20); // #0B0E14
  doc.rect(0, 0, 297, 210, 'F');

  doc.setTextColor(202, 190, 255); // #CABEFF
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PORTFOLIO PULSE TERMINAL v4.2', 14, 16);

  doc.setTextColor(148, 163, 184); // #94A3B8
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleString('en-IN')} | Octa Byte AI Assignment`, 14, 22);

  // KPI Summary Bar
  doc.setFillColor(21, 27, 43); // #151B2B
  doc.roundedRect(14, 26, 269, 18, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('TOTAL INVESTMENT', 20, 32);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`INR ${kpis.totalInvestment.toLocaleString('en-IN')}`, 20, 39);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('PRESENT VALUE', 90, 32);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`INR ${kpis.totalPresentValue.toLocaleString('en-IN')}`, 90, 39);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('NET UNREALIZED GAIN', 160, 32);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(kpis.totalGainLoss >= 0 ? 0 : 255, kpis.totalGainLoss >= 0 ? 230 : 71, kpis.totalGainLoss >= 0 ? 118 : 87);
  doc.text(`${kpis.totalGainLoss >= 0 ? '+' : ''}INR ${kpis.totalGainLoss.toLocaleString('en-IN')} (${kpis.totalGainLossPercent}%)`, 160, 39);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('HOLDINGS & ALPHA', 230, 32);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(202, 190, 255);
  doc.text(`${kpis.totalHoldings} Stocks (Alpha: +${kpis.alphaVsNifty}%)`, 230, 39);

  // Table Data Preparation
  const tableHeaders = [
    'Particulars',
    'Sector',
    'Exch',
    'Buy Price',
    'Qty',
    'Invested',
    'Weight',
    'CMP',
    'Present Val',
    'Gain/Loss',
    'P/E'
  ];

  const tableData = holdings.map((h) => [
    h.name,
    h.sector.replace(' Sector', ''),
    h.exchange,
    `Rs. ${h.purchasePrice.toLocaleString('en-IN')}`,
    h.quantity,
    `Rs. ${h.investment.toLocaleString('en-IN')}`,
    `${h.portfolioWeightPercent.toFixed(1)}%`,
    `Rs. ${h.cmp.toLocaleString('en-IN')}`,
    `Rs. ${h.presentValue.toLocaleString('en-IN')}`,
    `${h.gainLoss >= 0 ? '+' : ''}${h.gainLossPercent.toFixed(1)}%`,
    h.peRatio ? h.peRatio.toFixed(1) : '—',
  ]);

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: 48,
    theme: 'grid',
    headStyles: {
      fillColor: [33, 41, 64],
      textColor: [202, 190, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fillColor: [16, 20, 31],
      textColor: [225, 226, 235],
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: [21, 27, 43],
    },
    styles: {
      cellPadding: 2,
      lineColor: [45, 55, 75],
      lineWidth: 0.1,
    },
  });

  doc.save(`Portfolio_Pulse_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
