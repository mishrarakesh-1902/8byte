import { NextResponse } from 'next/server';
import { SEED_HOLDINGS } from '@/data/portfolioSeed';
import { fetchAllYahooQuotes } from '@/lib/fetchers/yahooFinance';
import { fetchAllGoogleFinance } from '@/lib/fetchers/googleFinance';
import { computePortfolio, CalculatedPortfolioResult } from '@/lib/calculations/portfolioCalc';
import { cache } from '@/lib/cache/memoryCache';
import { PortfolioApiResponse } from '@/types/portfolio';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CACHE_KEY = 'portfolio_live_data';
const CACHE_TTL_SECONDS = 15;

export async function GET() {
  const startTime = Date.now();

  try {
    // Check in-memory cache first
    const cached = cache.get<CalculatedPortfolioResult>(CACHE_KEY);
    if (cached.data && !cached.isStale) {
      const responsePayload: PortfolioApiResponse = {
        success: true,
        kpis: {
          ...cached.data.kpis,
          latencyMs: Date.now() - startTime,
        },
        sectors: cached.data.sectors,
        allHoldings: cached.data.allHoldings,
        cached: true,
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(responsePayload, {
        headers: {
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
          'X-Cache-Status': 'HIT',
        },
      });
    }

    // Fetch Yahoo Quotes and Google Finance data concurrently
    const [yahooQuotes, googleData] = await Promise.all([
      fetchAllYahooQuotes(SEED_HOLDINGS),
      fetchAllGoogleFinance(SEED_HOLDINGS),
    ]);

    const latencyMs = Date.now() - startTime;
    const computed = computePortfolio(SEED_HOLDINGS, yahooQuotes, googleData, latencyMs);

    // Save to memory cache
    cache.set(CACHE_KEY, computed, CACHE_TTL_SECONDS);

    const responsePayload: PortfolioApiResponse = {
      success: true,
      kpis: computed.kpis,
      sectors: computed.sectors,
      allHoldings: computed.allHoldings,
      cached: false,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responsePayload, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
        'X-Cache-Status': 'MISS',
      },
    });
  } catch (error: any) {
    console.error('Error in /api/portfolio:', error);

    // If cache has stale data, fall back to it
    const staleEntry = cache.get<CalculatedPortfolioResult>(CACHE_KEY);
    if (staleEntry.data) {
      return NextResponse.json<PortfolioApiResponse>({
        success: true,
        kpis: {
          ...staleEntry.data.kpis,
          latencyMs: Date.now() - startTime,
        },
        sectors: staleEntry.data.sectors,
        allHoldings: staleEntry.data.allHoldings,
        cached: true,
        timestamp: new Date().toISOString(),
        error: 'Upstream network slow, serving stale cache',
      });
    }

    // Otherwise compute from static seed
    const fallbackComputed = computePortfolio(SEED_HOLDINGS, {}, {}, Date.now() - startTime);
    return NextResponse.json<PortfolioApiResponse>({
      success: true,
      kpis: fallbackComputed.kpis,
      sectors: fallbackComputed.sectors,
      allHoldings: fallbackComputed.allHoldings,
      cached: false,
      timestamp: new Date().toISOString(),
      error: error?.message || 'Upstream fetch failed, loaded baseline data',
    });
  }
}
