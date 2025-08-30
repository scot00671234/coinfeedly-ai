import { storage } from "../storage";
import { yahooFinanceService } from "./yahooFinance";
import type { InsertActualPrice, Commodity } from "@shared/schema";

/**
 * Service for fetching and storing extensive historical data
 * This service handles bulk historical data operations with proper rate limiting
 */
class HistoricalDataService {
  private isRunning = false;
  private readonly BATCH_DELAY = 3000; // 3 seconds between batches to avoid rate limiting

  /**
   * Fetch and store historical data for all commodities
   * This will populate the database with years of historical data
   */
  async populateHistoricalData(): Promise<void> {
    if (this.isRunning) {
      console.log('Historical data population already in progress');
      return;
    }

    this.isRunning = true;
    console.log('🔄 Starting comprehensive historical data population...');

    try {
      const commodities = await storage.getCommodities();
      const periods = ['5y', '10y', 'max']; // Focus on long-term periods

      for (const commodity of commodities) {
        if (!commodity.yahooSymbol) {
          console.log(`Skipping ${commodity.name} - no Yahoo symbol`);
          continue;
        }

        console.log(`📊 Processing historical data for ${commodity.name} (${commodity.yahooSymbol})`);
        
        // Check if we already have substantial historical data
        const existingData = await storage.getActualPrices(commodity.id, 1000);
        if (existingData.length > 500) {
          console.log(`${commodity.name} already has ${existingData.length} data points, skipping...`);
          continue;
        }

        // Try different periods to get maximum historical coverage
        for (const period of periods) {
          try {
            console.log(`  📅 Fetching ${period} data for ${commodity.name}`);
            const historicalData = await yahooFinanceService.fetchDetailedHistoricalData(commodity.yahooSymbol, period);
            
            if (historicalData.length > 0) {
              console.log(`  ✅ Got ${historicalData.length} data points for ${period}`);
              
              // Store the data in batches to avoid overwhelming the database
              await this.storeHistoricalDataBatch(commodity, historicalData);
              
              // If we got a good amount of data, we can break
              if (historicalData.length > 1000) {
                console.log(`  🎯 Sufficient data obtained for ${commodity.name}`);
                break;
              }
            } else {
              console.log(`  ⚠️ No data returned for ${period}`);
            }

            // Rate limiting between periods
            await this.delay(this.BATCH_DELAY);

          } catch (error) {
            console.error(`  ❌ Error fetching ${period} data for ${commodity.name}:`, error);
            continue;
          }
        }

        // Rate limiting between commodities
        console.log(`  ⏳ Waiting before next commodity...`);
        await this.delay(this.BATCH_DELAY);
      }

      console.log('✅ Historical data population completed');
      
    } catch (error) {
      console.error('❌ Error during historical data population:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Store historical data in the database, avoiding duplicates
   */
  private async storeHistoricalDataBatch(commodity: Commodity, historicalData: any[]): Promise<void> {
    let stored = 0;
    let skipped = 0;

    for (const dataPoint of historicalData) {
      try {
        const actualPrice: InsertActualPrice = {
          commodityId: commodity.id,
          date: new Date(dataPoint.date),
          price: dataPoint.price.toString(),
          volume: dataPoint.volume ? dataPoint.volume.toString() : null,
          source: "yahoo_finance_historical"
        };

        // Check if this data point already exists (simple date-based check)
        const existingPrice = await storage.getActualPrices(commodity.id, 1)
          .then(prices => prices.find(p => 
            p.date.toDateString() === actualPrice.date.toDateString()
          ));

        if (existingPrice) {
          skipped++;
          continue;
        }

        await storage.createActualPrice(actualPrice);
        stored++;

        // Small delay every 50 records to avoid overwhelming the database
        if (stored % 50 === 0) {
          await this.delay(100);
        }

      } catch (error) {
        // Skip duplicate or invalid data points
        if (!(error as Error).message?.includes('duplicate') && !(error as Error).message?.includes('unique')) {
          console.error(`Error storing data point for ${commodity.name}:`, error);
        }
        skipped++;
      }
    }

    console.log(`  📝 Stored: ${stored}, Skipped: ${skipped} data points for ${commodity.name}`);
  }

  /**
   * Get summary of available historical data coverage
   */
  async getDataCoverageSummary(): Promise<{ commodity: string; earliestDate: string; latestDate: string; totalPoints: number }[]> {
    const commodities = await storage.getCommodities();
    const summary = [];

    for (const commodity of commodities) {
      const prices = await storage.getActualPrices(commodity.id, 10000); // Get lots of data
      
      if (prices.length > 0) {
        const sortedPrices = prices.sort((a, b) => a.date.getTime() - b.date.getTime());
        summary.push({
          commodity: commodity.name,
          earliestDate: sortedPrices[0].date.toISOString().split('T')[0],
          latestDate: sortedPrices[sortedPrices.length - 1].date.toISOString().split('T')[0],
          totalPoints: prices.length
        });
      }
    }

    return summary;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Manual trigger for specific commodity
   */
  async populateForCommodity(commodityId: string): Promise<void> {
    const commodity = await storage.getCommodity(commodityId);
    if (!commodity?.yahooSymbol) {
      throw new Error('Commodity not found or missing Yahoo symbol');
    }

    console.log(`🔄 Fetching extensive historical data for ${commodity.name}`);
    
    const periods = ['max', '10y', '5y']; // Try maximum first
    
    for (const period of periods) {
      try {
        const data = await yahooFinanceService.fetchDetailedHistoricalData(commodity.yahooSymbol, period);
        if (data.length > 0) {
          await this.storeHistoricalDataBatch(commodity, data);
          console.log(`✅ Successfully stored ${data.length} data points for ${commodity.name} (${period})`);
          return;
        }
      } catch (error) {
        console.error(`Error fetching ${period} data:`, error);
        continue;
      }
    }
    
    throw new Error(`Failed to fetch historical data for ${commodity.name}`);
  }
}

export const historicalDataService = new HistoricalDataService();