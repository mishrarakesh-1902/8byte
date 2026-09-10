import { HoldingSeed } from '@/types/portfolio';

export interface GoogleFinanceResult {
  symbol: string;
  peRatio: number | null;
  latestEarnings: string;
  success: boolean;
  source: 'google' | 'fallback';
}

/**
 * Maps holding to Google Finance exchange notation
 */
function getGoogleFinanceQuery(holding: HoldingSeed): { ticker: string; exchange: string } {
  if (holding.exchange === 'NSE' && holding.nseSymbol) {
    const raw = holding.nseSymbol.replace('.NS', '');
    return { ticker: raw, exchange: 'NSE' };
  }
  if (holding.bseCode) {
    return { ticker: holding.bseCode, exchange: 'BOM' };
  }
  return { ticker: holding.symbol, exchange: 'NSE' };
}

/**
 * Fetches and extracts P/E Ratio and Latest Earnings from Google Finance
 */
async function fetchSingleGoogleFinance(holding: HoldingSeed): Promise<GoogleFinanceResult> {
  const { ticker, exchange } = getGoogleFinanceQuery(holding);
  const fallbackPe = holding.peRatioStatic ?? null;
  const fallbackEarnings = holding.latestEarningsNote || 'Q3 FY25 Inline';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const url = `https://www.google.com/finance/quote/${encodeURIComponent(ticker)}:${encodeURIComponent(exchange)}`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 30 },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Google Finance returned status ${response.status}`);
    }

    const html = await response.text();

    // Regex scrape for P/E ratio in Google Finance HTML markup
    let scrapedPe: number | null = null;
    const peMatch = html.match(/P\/E ratio[\s\S]*?<div class="P6K39c">([0-9.,]+)<\/div>/i) ||
                    html.match(/>P\/E ratio<[\s\S]*?>([0-9.,]+)</i);

    if (peMatch && peMatch[1]) {
      const parsed = parseFloat(peMatch[1].replace(/,/g, ''));
      if (!isNaN(parsed) && parsed > 0) {
        scrapedPe = Number(parsed.toFixed(2));
      }
    }

    // Scrape or construct earnings context
    let scrapedEarnings = fallbackEarnings;
    const revMatch = html.match(/Revenue[\s\S]*?<div class="QNmIk">([^<]+)<\/div>/i);
    if (revMatch && revMatch[1]) {
      scrapedEarnings = `Rev: ${revMatch[1]}`;
    }

    return {
      symbol: holding.symbol,
      peRatio: scrapedPe !== null ? scrapedPe : fallbackPe,
      latestEarnings: scrapedEarnings,
      success: scrapedPe !== null,
      source: scrapedPe !== null ? 'google' : 'fallback',
    };
  } catch (err) {
    return {
      symbol: holding.symbol,
      peRatio: fallbackPe,
      latestEarnings: fallbackEarnings,
      success: false,
      source: 'fallback',
    };
  }
}

/**
 * Batch fetches P/E and Earnings from Google Finance
 */
export async function fetchAllGoogleFinance(holdings: HoldingSeed[]): Promise<Record<string, GoogleFinanceResult>> {
  const results: Record<string, GoogleFinanceResult> = {};

  const promises = holdings.map(async (h) => {
    const data = await fetchSingleGoogleFinance(h);
    return { symbol: h.symbol, data };
  });

  const settled = await Promise.allSettled(promises);

  for (const item of settled) {
    if (item.status === 'fulfilled') {
      results[item.value.symbol] = item.value.data;
    }
  }

  return results;
}
