import { yahooFinanceService } from "./yahooFinance";
import { storage } from "../storage";

interface CachedPriceData {
  price: number;
  change?: number;
  changePercent?: number;
  timestamp: Date;
  yahooSymbol: string;
}

interface CachedChartData {
  data: any[];
  timestamp: Date;
  yahooSymbol: string;
  period: string;
}

class YahooFinanceCacheService {
  private priceCache = new Map<string, CachedPriceData>();
  private chartCache = new Map<string, CachedChartData>();
  
  // Cache durations in milliseconds
  private readonly PRICE_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for real-time prices
  private readonly CHART_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes for chart data
  private readonly BACKGROUND_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes background refresh
  
  private refreshTimer?: NodeJS.Timeout;

  constructor() {
    this.startBackgroundRefresh();
  }

  /**
   * Get current price with server-side caching
   * Returns cached data if available and fresh, otherwise fetches from Yahoo Finance
   */
  async getCachedCurrentPrice(yahooSymbol: string): Promise<CachedPriceData | null> {
    const cacheKey = `price:${yahooSymbol}`;
    const cached = this.priceCache.get(cacheKey);
    
    // Return cached data if it's fresh (within cache duration)
    if (cached && this.isCacheDataFresh(cached.timestamp, this.PRICE_CACHE_DURATION)) {
      console.log(`📦 Cache HIT for ${yahooSymbol} price (age: ${Math.round((Date.now() - cached.timestamp.getTime()) / 1000)}s)`);
      return cached;
    }

    console.log(`🔄 Cache MISS for ${yahooSymbol} price - fetching fresh data`);
    
    try {
      // Fetch fresh data from Yahoo Finance
      const priceData = await yahooFinanceService.getCurrentPrice(yahooSymbol);
      
      if (priceData) {
        const cachedData: CachedPriceData = {
          price: priceData.price,
          change: priceData.change,
          changePercent: priceData.changePercent,
          timestamp: new Date(),
          yahooSymbol
        };
        
        // Store in cache
        this.priceCache.set(cacheKey, cachedData);
        console.log(`💾 Cached price for ${yahooSymbol}: $${priceData.price}`);
        
        return cachedData;
      }
    } catch (error) {
      console.error(`❌ Failed to fetch price for ${yahooSymbol}:`, error);
      
      // Return stale cache data if available (graceful fallback)
      if (cached) {
        console.log(`⚠️ Returning stale cache data for ${yahooSymbol} due to API failure`);
        return cached;
      }
    }
    
    return null;
  }

  /**
   * Get chart data with server-side caching
   */
  async getCachedChartData(yahooSymbol: string, period: string): Promise<any[] | null> {
    const cacheKey = `chart:${yahooSymbol}:${period}`;
    const cached = this.chartCache.get(cacheKey);
    
    // Return cached data if it's fresh
    if (cached && this.isCacheDataFresh(cached.timestamp, this.CHART_CACHE_DURATION)) {
      console.log(`📦 Cache HIT for ${yahooSymbol} chart data (${period}) (age: ${Math.round((Date.now() - cached.timestamp.getTime()) / 1000)}s)`);
      return cached.data;
    }

    console.log(`🔄 Cache MISS for ${yahooSymbol} chart data (${period}) - fetching fresh data`);
    
    try {
      // Fetch fresh chart data from Yahoo Finance
      const chartData = await yahooFinanceService.fetchDetailedHistoricalData(yahooSymbol, period);
      
      if (chartData && chartData.length > 0) {
        const cachedData: CachedChartData = {
          data: chartData,
          timestamp: new Date(),
          yahooSymbol,
          period
        };
        
        // Store in cache
        this.chartCache.set(cacheKey, cachedData);
        console.log(`💾 Cached chart data for ${yahooSymbol} (${period}): ${chartData.length} data points`);
        
        return chartData;
      }
    } catch (error) {
      console.error(`❌ Failed to fetch chart data for ${yahooSymbol} (${period}):`, error);
      
      // Return stale cache data if available (graceful fallback)
      if (cached) {
        console.log(`⚠️ Returning stale chart data for ${yahooSymbol} due to API failure`);
        return cached.data;
      }
    }
    
    return null;
  }

  /**
   * Background refresh of all cached commodity prices
   * This eliminates the need for real-time API calls from user requests
   */
  private async refreshAllCommodityPrices(): Promise<void> {
    try {
      console.log(`🔄 Starting background price refresh for all commodities...`);
      const commodities = await storage.getCommodities();
      
      let refreshedCount = 0;
      let errorCount = 0;
      
      for (const commodity of commodities) {
        if (!commodity.yahooSymbol) continue;
        
        try {
          // This will fetch fresh data and update the cache
          await this.getCachedCurrentPrice(commodity.yahooSymbol);
          refreshedCount++;
          
          // Add small delay between requests to respect Yahoo Finance rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error refreshing price for ${commodity.name}:`, error);
          errorCount++;
        }
      }
      
      console.log(`✅ Background refresh complete: ${refreshedCount} prices updated, ${errorCount} errors`);
    } catch (error) {
      console.error('❌ Background price refresh failed:', error);
    }
  }

  /**
   * Start background refresh timer
   */
  private startBackgroundRefresh(): void {
    console.log(`🚀 Starting background price refresh every ${this.BACKGROUND_REFRESH_INTERVAL / 1000} seconds`);
    
    // Do initial refresh after 30 seconds (let app start up first)
    setTimeout(() => {
      this.refreshAllCommodityPrices();
    }, 30000);
    
    // Set up recurring refresh
    this.refreshTimer = setInterval(() => {
      this.refreshAllCommodityPrices();
    }, this.BACKGROUND_REFRESH_INTERVAL);
  }

  /**
   * Stop background refresh (for cleanup)
   */
  public stopBackgroundRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
      console.log('🛑 Background price refresh stopped');
    }
  }

  /**
   * Check if cached data is still fresh
   */
  private isCacheDataFresh(timestamp: Date, maxAge: number): boolean {
    return (Date.now() - timestamp.getTime()) < maxAge;
  }

  /**
   * Get cache statistics for monitoring
   */
  public getCacheStats(): { priceCache: number; chartCache: number } {
    return {
      priceCache: this.priceCache.size,
      chartCache: this.chartCache.size
    };
  }

  /**
   * Clear expired cache entries (optional cleanup)
   */
  public cleanupExpiredCache(): void {
    const now = Date.now();
    
    // Clean price cache
    for (const [key, data] of Array.from(this.priceCache.entries())) {
      if (!this.isCacheDataFresh(data.timestamp, this.PRICE_CACHE_DURATION * 2)) { // Keep for 2x duration
        this.priceCache.delete(key);
      }
    }
    
    // Clean chart cache
    for (const [key, data] of Array.from(this.chartCache.entries())) {
      if (!this.isCacheDataFresh(data.timestamp, this.CHART_CACHE_DURATION * 2)) { // Keep for 2x duration
        this.chartCache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const yahooFinanceCacheService = new YahooFinanceCacheService();