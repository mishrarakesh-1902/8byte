import { 
  HoldingSeed, 
  HoldingCalculated, 
  SectorSummary, 
  PortfolioKPIs, 
  SectorType 
} from '@/types/portfolio';
import { YahooQuoteResult } from '@/lib/fetchers/yahooFinance';
import { GoogleFinanceResult } from '@/lib/fetchers/googleFinance';
import { SECTOR_ORDER } from '@/data/portfolioSeed';

export const NIFTY_BENCHMARK_RETURN = 18.40; // Nifty 50 benchmark baseline return (%)

export interface CalculatedPortfolioResult {
  allHoldings: HoldingCalculated[];
  sectors: SectorSummary[];
  kpis: PortfolioKPIs;
}

export function computePortfolio(
  seedHoldings: HoldingSeed[],
  yahooQuotes: Record<string, YahooQuoteResult>,
  googleData: Record<string, GoogleFinanceResult>,
  latencyMs: number = 14
): CalculatedPortfolioResult {
  // Step 1: Calculate total initial portfolio investment
  const totalPortfolioInvestment = seedHoldings.reduce(
    (acc, h) => acc + h.purchasePrice * h.quantity,
    0
  );

  // Step 2: Compute individual holding metrics
  const allHoldings: HoldingCalculated[] = seedHoldings.map((h) => {
    const quote = yahooQuotes[h.symbol];
    const google = googleData[h.symbol];

    const cmp = quote?.cmp ?? h.purchasePrice;
    const investment = h.purchasePrice * h.quantity;
    const presentValue = Number((cmp * h.quantity).toFixed(2));
    const gainLoss = Number((presentValue - investment).toFixed(2));
    const gainLossPercent = Number(((gainLoss / investment) * 100).toFixed(2));
    const portfolioWeightPercent = Number(((investment / totalPortfolioInvestment) * 100).toFixed(2));

    const dayChange = quote?.dayChange ?? 0;
    const dayChangePercent = quote?.dayChangePercent ?? 0;
    const isStale = quote ? !quote.success : false;
    const quoteSource = quote?.source || 'fallback';

    return {
      ...h,
      investment,
      portfolioWeightPercent,
      cmp,
      presentValue,
      gainLoss,
      gainLossPercent,
      dayChange,
      dayChangePercent,
      peRatio: google?.peRatio ?? h.peRatioStatic ?? null,
      latestEarnings: google?.latestEarnings || h.latestEarningsNote || 'Q3 FY25 Inline',
      isStale,
      quoteSource,
      lastUpdated: new Date().toISOString(),
    };
  });

  // Step 3: Group by sector and compute sector-level summaries
  const sectorMap = new Map<SectorType, HoldingCalculated[]>();
  for (const s of SECTOR_ORDER) {
    sectorMap.set(s, []);
  }

  for (const h of allHoldings) {
    const list = sectorMap.get(h.sector) || [];
    list.push(h);
    sectorMap.set(h.sector, list);
  }

  const sectors: SectorSummary[] = [];

  for (const sectorName of SECTOR_ORDER) {
    const holdings = sectorMap.get(sectorName) || [];
    if (holdings.length === 0) continue;

    const sectorInvestment = holdings.reduce((sum, h) => sum + h.investment, 0);
    const sectorPresentValue = Number(holdings.reduce((sum, h) => sum + h.presentValue, 0).toFixed(2));
    const sectorGainLoss = Number((sectorPresentValue - sectorInvestment).toFixed(2));
    const sectorGainLossPercent = sectorInvestment > 0 
      ? Number(((sectorGainLoss / sectorInvestment) * 100).toFixed(2))
      : 0;
    const sectorWeightPercent = Number(((sectorInvestment / totalPortfolioInvestment) * 100).toFixed(2));

    sectors.push({
      sector: sectorName,
      holdingsCount: holdings.length,
      totalInvestment: sectorInvestment,
      totalPresentValue: sectorPresentValue,
      totalGainLoss: sectorGainLoss,
      totalGainLossPercent: sectorGainLossPercent,
      portfolioWeightPercent: sectorWeightPercent,
      holdings,
    });
  }

  // Step 4: Compute Portfolio KPIs
  const totalPresentValue = Number(allHoldings.reduce((sum, h) => sum + h.presentValue, 0).toFixed(2));
  const totalGainLoss = Number((totalPresentValue - totalPortfolioInvestment).toFixed(2));
  const totalGainLossPercent = Number(((totalGainLoss / totalPortfolioInvestment) * 100).toFixed(2));

  // Today's estimated day P&L
  const todayGainLoss = Number(
    allHoldings.reduce((sum, h) => sum + (h.dayChange || 0) * h.quantity, 0).toFixed(2)
  );
  const baselineDayValue = totalPresentValue - todayGainLoss;
  const todayGainLossPercent = baselineDayValue > 0
    ? Number(((todayGainLoss / baselineDayValue) * 100).toFixed(2))
    : 0;

  const alphaVsNifty = Number((totalGainLossPercent - NIFTY_BENCHMARK_RETURN).toFixed(2));

  const kpis: PortfolioKPIs = {
    totalInvestment: totalPortfolioInvestment,
    totalPresentValue,
    totalGainLoss,
    totalGainLossPercent,
    todayGainLoss,
    todayGainLossPercent,
    totalHoldings: allHoldings.length,
    totalSectors: sectors.length,
    alphaVsNifty,
    nifty50ReturnPercent: NIFTY_BENCHMARK_RETURN,
    lastSyncTime: new Date().toLocaleTimeString('en-IN', { hour12: false }),
    latencyMs,
  };

  return {
    allHoldings,
    sectors,
    kpis,
  };
}
