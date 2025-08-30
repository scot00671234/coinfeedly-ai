import yahooFinance from 'yahoo-finance2';
import { storage } from "../storage";
import type { InsertActualPrice } from "@shared/schema";

export class YahooFinanceIntegration {
  private rateLimitDelay = 1000; // 1 second between requests
  private lastRequestTime = 0;

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  async fetchRealTimePrices(yahooSymbol: string): Promise<any> {
    await this.enforceRateLimit();

    try {
      const quote = await yahooFinance.quote(yahooSymbol);
      return {
        symbol: quote.symbol,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        volume: quote.regularMarketVolume,
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`Error fetching real-time price for ${yahooSymbol}:`, error);
      return null;
    }
  }

  async fetchHistoricalData(yahooSymbol: string, period1: Date, period2?: Date): Promise<any[]> {
    await this.enforceRateLimit();

    try {
      const result = await yahooFinance.historical(yahooSymbol, {
        period1: period1.toISOString().split('T')[0],
        period2: period2?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        interval: '1d'
      });

      return result.map(item => ({
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume
      }));
    } catch (error) {
      console.error(`Error fetching historical data for ${yahooSymbol}:`, error);
      return [];
    }
  }

  async updateAllCommodityPrices(): Promise<void> {
    console.log("Starting Yahoo Finance price update for all commodities...");
    
    try {
      const commodities = await storage.getCommodities();
      
      for (const commodity of commodities) {
        if (!commodity.yahooSymbol) {
          console.log(`Skipping ${commodity.name} - no Yahoo symbol configured`);
          continue;
        }

        console.log(`Updating prices for ${commodity.name} (${commodity.yahooSymbol})`);
        
        try {
          // Fetch last 30 days of historical data
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const historicalData = await this.fetchHistoricalData(
            commodity.yahooSymbol, 
            thirtyDaysAgo
          );

          // Store historical prices
          for (const dataPoint of historicalData) {
            const actualPrice: InsertActualPrice = {
              commodityId: commodity.id,
              date: new Date(dataPoint.date),
              price: dataPoint.close.toString(),
              volume: dataPoint.volume ? dataPoint.volume.toString() : null,
              source: "yahoo_finance"
            };

            await storage.createActualPrice(actualPrice);
          }

          console.log(`Updated ${historicalData.length} price points for ${commodity.name}`);
          
        } catch (error) {
          console.error(`Failed to update prices for ${commodity.name}:`, error);
        }
      }
      
      console.log("Yahoo Finance price update completed");
    } catch (error) {
      console.error("Error in updateAllCommodityPrices:", error);
    }
  }

  async updateSingleCommodityPrices(commodityId: string): Promise<void> {
    try {
      const commodity = await storage.getCommodity(commodityId);
      
      if (!commodity || !commodity.yahooSymbol) {
        console.log(`Cannot update prices for commodity ${commodityId} - not found or no Yahoo symbol`);
        return;
      }

      console.log(`Updating prices for ${commodity.name} (${commodity.yahooSymbol})`);
      
      // Fetch real-time price
      const realtimeData = await this.fetchRealTimePrices(commodity.yahooSymbol);
      
      if (realtimeData) {
        const actualPrice: InsertActualPrice = {
          commodityId: commodity.id,
          date: new Date(),
          price: realtimeData.price.toString(),
          volume: realtimeData.volume ? realtimeData.volume.toString() : null,
          source: "yahoo_finance"
        };

        await storage.createActualPrice(actualPrice);
        console.log(`Updated real-time price for ${commodity.name}: $${realtimeData.price}`);
      }
      
    } catch (error) {
      console.error(`Error updating single commodity prices for ${commodityId}:`, error);
    }
  }

  async getCurrentPrice(yahooSymbol: string): Promise<number | null> {
    try {
      const data = await this.fetchRealTimePrices(yahooSymbol);
      return data?.price || null;
    } catch (error) {
      console.error(`Error getting current price for ${yahooSymbol}:`, error);
      return null;
    }
  }
}

export const yahooFinanceIntegration = new YahooFinanceIntegration();