import { storage } from "../storage";
import type { InsertActualPrice } from "@shared/schema";

interface YahooFinanceResponse {
  chart: {
    result: Array<{
      meta: {
        symbol: string;
        regularMarketPrice: number;
        regularMarketChange?: number;
        regularMarketChangePercent?: number;
        currency: string;
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          close: number[];
          volume: number[];
        }>;
      };
    }>;
  };
}

class YahooFinanceService {
  private rateLimitDelay = 2000; // 2 seconds between requests to avoid rate limiting
  private lastRequestTime = 0;

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await this.delay(this.rateLimitDelay - timeSinceLastRequest);
    }
    
    this.lastRequestTime = Date.now();
  }

  async fetchHistoricalData(yahooSymbol: string, period = "7d", interval = "1d"): Promise<YahooFinanceResponse | null> {
    await this.enforceRateLimit();

    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=${period}&interval=${interval}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        console.error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json() as YahooFinanceResponse;
      return data;
    } catch (error) {
      console.error(`Error fetching data for ${yahooSymbol}:`, error);
      return null;
    }
  }

  async updateCommodityPrices(commodityId?: string): Promise<void> {
    try {
      const commodities = commodityId 
        ? [await storage.getCommodity(commodityId)].filter(Boolean)
        : await storage.getCommodities();

      for (const commodity of commodities) {
        if (!commodity?.yahooSymbol) continue;

        console.log(`Fetching data for ${commodity.name} (${commodity.yahooSymbol})`);
        
        const data = await this.fetchHistoricalData(commodity.yahooSymbol);
        
        if (data?.chart?.result?.[0]) {
          const result = data.chart.result[0];
          const timestamps = result.timestamp || [];
          const quotes = result.indicators?.quote?.[0];
          
          if (quotes?.close) {
            for (let i = 0; i < timestamps.length; i++) {
              const timestamp = timestamps[i];
              const price = quotes.close[i];
              const volume = quotes.volume?.[i];

              if (price && !isNaN(price)) {
                const actualPrice: InsertActualPrice = {
                  commodityId: commodity.id,
                  date: new Date(timestamp * 1000),
                  price: price.toString(),
                  volume: volume ? volume.toString() : null,
                  source: "yahoo_finance"
                };

                await storage.createActualPrice(actualPrice);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating commodity prices:', error);
      throw error;
    }
  }

  async getCurrentPrice(yahooSymbol: string): Promise<{ price: number; change?: number; changePercent?: number } | null> {
    // Fetch 5 days of data to ensure we have enough for calculating 24h change
    const data = await this.fetchHistoricalData(yahooSymbol, "5d", "1d");
    
    if (data?.chart?.result?.[0]) {
      const result = data.chart.result[0];
      const meta = result.meta;
      const currentPrice = meta.regularMarketPrice;
      
      // Try to get change from Yahoo Finance API first
      let change = meta.regularMarketChange;
      let changePercent = meta.regularMarketChangePercent;
      
      // If Yahoo doesn't provide change data, calculate it manually
      if ((change === undefined || change === 0) && result.indicators?.quote?.[0]?.close) {
        const prices = result.indicators.quote[0].close;
        const timestamps = result.timestamp || [];
        
        if (prices.length >= 2 && timestamps.length >= 2) {
          // Get the previous trading day's closing price
          const previousClose = prices[prices.length - 2];
          
          if (previousClose && !isNaN(previousClose) && currentPrice && !isNaN(currentPrice)) {
            change = currentPrice - previousClose;
            changePercent = (change / previousClose) * 100;
          }
        }
      }
      
      return {
        price: currentPrice,
        change: change || 0,
        changePercent: changePercent || 0
      };
    }
    
    return null;
  }

  async fetchDetailedHistoricalData(yahooSymbol: string, period: string): Promise<any[]> {
    await this.enforceRateLimit();

    const intervalMap: Record<string, string> = {
      "1d": "5m",
      "5d": "15m", 
      "1w": "30m",
      "1mo": "1d",
      "3mo": "1d",
      "6mo": "1d",
      "1y": "1d",
      "2y": "1wk",
      "5y": "1mo",
      "10y": "1mo",
      "max": "1mo",
    };

    const interval = intervalMap[period] || "1d";

    // Alternative symbols for commodities with better historical data
    const alternativeSymbols: Record<string, string[]> = {
      "CL=F": ["CL=F", "USO", "DBOIL"], // Crude oil alternatives
      "GC=F": ["GC=F", "GLD", "IAU"],   // Gold alternatives
      "NG=F": ["NG=F", "UNG", "BOIL"],  // Natural gas alternatives
      "HG=F": ["HG=F", "CPER"],        // Copper alternatives
      "SI=F": ["SI=F", "SLV"],         // Silver alternatives
    };

    const symbolsToTry = alternativeSymbols[yahooSymbol] || [yahooSymbol];
    
    for (const symbol of symbolsToTry) {
      try {
        console.log(`Attempting to fetch ${period} data for ${symbol}`);
        const data = await this.fetchHistoricalData(symbol, period, interval);
        
        if (data?.chart?.result?.[0]) {
          const result = data.chart.result[0];
          const timestamps = result.timestamp || [];
          const quotes = result.indicators?.quote?.[0];
          
          if (quotes?.close && timestamps.length > 0) {
            const processedData = timestamps.map((timestamp: number, i: number) => ({
              date: new Date(timestamp * 1000).toISOString(),
              price: quotes.close[i],
              volume: quotes.volume?.[i] || 0,
            })).filter(item => item.price && !isNaN(item.price));

            if (processedData.length > 0) {
              console.log(`Successfully fetched ${processedData.length} data points from ${symbol} for period ${period}`);
              return processedData;
            }
          }
        }
        
        console.log(`No data available for ${symbol}, trying next alternative...`);
        
        // Add delay between attempts to avoid rate limiting
        if (symbolsToTry.indexOf(symbol) < symbolsToTry.length - 1) {
          await this.delay(2000);
        }
        
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        
        // If it's a rate limit error, wait longer
        if ((error as Error).message?.includes('Too Many Requests') || (error as Error).message?.includes('429')) {
          console.log('Rate limit detected, waiting 5 seconds...');
          await this.delay(5000);
        }
        
        continue; // Try next symbol
      }
    }
    
    console.warn(`Failed to fetch data for all alternatives of ${yahooSymbol} for period ${period}`);
    return [];
  }
}

export const yahooFinanceService = new YahooFinanceService();
