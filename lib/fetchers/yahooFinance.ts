import { HoldingSeed } from '@/types/portfolio';

export interface YahooQuoteResult {
  symbol: string;
  cmp: number;
  previousClose: number;
  dayChange: number;
  dayChangePercent: number;
  success: boolean;
  source: 'yahoo' | 'fallback';
}

// Fallback baseline CMP values from the assignment spreadsheet
const FALLBACK_CMP_MAP: Record<string, number> = {
  'HDFCBANK': 1742.50,
  'BAJFINANCE': 7450.00,
  '532174': 1215.30,
  '544252': 113.00,
  '511577': 15.00,
  'AFFLE': 1460.00,
  'LTIM': 4794.00,
  '542651': 1293.00,
  '544028': 662.00,
  '544107': 153.00,
  '532790': 450.00,
  'DMART': 3451.00,
  '532540': 961.00,
  '500331': 2730.00,
  '500400': 351.00,
  '542323': 402.00,
  '532667': 51.00,
  '542851': 373.00,
  '543517': 356.00,
  'ASTRAL': 1318.00,
  '542652': 5000.00,
  '543318': 1237.00,
  '506401': 1928.00,
  '541557': 3743.00,
  '533282': 1614.00,
  '540719': 1405.00,
};

/**
 * Maps holding to Yahoo Finance ticker query
 */
function getYahooTicker(holding: HoldingSeed): string {
  if (holding.nseSymbol) {
    return holding.nseSymbol;
  }
  if (holding.bseCode) {
    return `${holding.bseCode}.BO`;
  }
  return `${holding.symbol}.NS`;
}

/**
 * Fetches a single ticker quote from Yahoo Finance v8 chart API
 */
async function fetchSingleYahooQuote(holding: HoldingSeed): Promise<YahooQuoteResult> {
  const ticker = getYahooTicker(holding);
  const fallbackPrice = FALLBACK_CMP_MAP[holding.symbol] || holding.purchasePrice * 1.05;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500); // 3.5s timeout per request

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 15 },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Yahoo returned status ${response.status}`);
    }

    const data = await response.json();
    const meta = data?.chart?.result?.[0]?.meta;
    
    if (meta && typeof meta.regularMarketPrice === 'number') {
      const cmp = meta.regularMarketPrice;
      const prevClose = meta.previousClose || meta.chartPreviousClose || cmp;
      const dayChange = Number((cmp - prevClose).toFixed(2));
      const dayChangePercent = Number(((dayChange / prevClose) * 100).toFixed(2));

      return {
        symbol: holding.symbol,
        cmp,
        previousClose: prevClose,
        dayChange,
        dayChangePercent,
        success: true,
        source: 'yahoo',
      };
    }

    throw new Error('Invalid quote structure in Yahoo response');
  } catch (err) {
    // Graceful fallback with realistic spread from seed sheet
    const prevClose = fallbackPrice * 0.995;
    const dayChange = Number((fallbackPrice - prevClose).toFixed(2));
    const dayChangePercent = Number(((dayChange / prevClose) * 100).toFixed(2));

    return {
      symbol: holding.symbol,
      cmp: fallbackPrice,
      previousClose: prevClose,
      dayChange,
      dayChangePercent,
      success: false,
      source: 'fallback',
    };
  }
}

/**
 * Batch fetches all holdings concurrently using Promise.allSettled
 */
export async function fetchAllYahooQuotes(holdings: HoldingSeed[]): Promise<Record<string, YahooQuoteResult>> {
  const results: Record<string, YahooQuoteResult> = {};

  const promises = holdings.map(async (h) => {
    const quote = await fetchSingleYahooQuote(h);
    return { symbol: h.symbol, quote };
  });

  const settled = await Promise.allSettled(promises);

  for (const item of settled) {
    if (item.status === 'fulfilled') {
      results[item.value.symbol] = item.value.quote;
    }
  }

  return results;
}
