export type Exchange = 'NSE' | 'BSE';

export type SectorType = 
  | 'Financial Sector' 
  | 'Technology Sector' 
  | 'Consumer Sector' 
  | 'Power Sector' 
  | 'Pipe Sector' 
  | 'Others';

export interface HoldingSeed {
  id: string;
  name: string;
  symbol: string;         // Ticker symbol without exchange suffix (e.g. HDFCBANK or 532174)
  nseSymbol?: string;     // NSE ticker if available
  bseCode?: string;       // BSE 6-digit script code if available
  exchange: Exchange;
  purchasePrice: number;
  quantity: number;
  sector: SectorType;
  
  // Fundamental seed metrics (from company data sheet)
  marketCapCr?: number;
  peRatioStatic?: number;
  latestEarningsNote?: string;
  revenueTtmCr?: number;
  ebitdaTtmCr?: number;
  ebitdaPercent?: number;
  patCr?: number;
  patPercent?: number;
  cfoCr?: number;
  cfo5YCr?: number;
  freeCashFlow5YCr?: number;
  debtToEquity?: number;
  bookValue?: number;
  revenueGrowth3YPercent?: number;
  ebitdaGrowth3YPercent?: number;
  profitGrowth3YPercent?: number;
  priceToSales?: number;
  priceToBook?: number;
  beta?: number;
  dividendYieldPercent?: number;
  consensusBuyPercent?: number;
  yearHigh?: number;
  yearLow?: number;
}

export interface LiveMarketQuote {
  symbol: string;
  cmp: number;
  previousClose?: number;
  dayChange?: number;
  dayChangePercent?: number;
  peRatio?: number;
  latestEarnings?: string;
  source: 'yahoo' | 'google' | 'cached' | 'fallback';
  lastUpdated: string;
  isStale?: boolean;
  error?: string;
}

export interface HoldingCalculated extends HoldingSeed {
  investment: number;
  portfolioWeightPercent: number; // calculated relative to total portfolio investment
  cmp: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  dayChange?: number;
  dayChangePercent?: number;
  peRatio: number | null;
  latestEarnings: string;
  isStale?: boolean;
  quoteSource: string;
  lastUpdated: string;
}

export interface SectorSummary {
  sector: SectorType;
  holdingsCount: number;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  portfolioWeightPercent: number;
  holdings: HoldingCalculated[];
}

export interface PortfolioKPIs {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  todayGainLoss: number;
  todayGainLossPercent: number;
  totalHoldings: number;
  totalSectors: number;
  alphaVsNifty: number;
  nifty50ReturnPercent: number;
  lastSyncTime: string;
  latencyMs: number;
}

export interface PortfolioApiResponse {
  success: boolean;
  kpis: PortfolioKPIs;
  sectors: SectorSummary[];
  allHoldings: HoldingCalculated[];
  cached: boolean;
  timestamp: string;
  error?: string;
}
