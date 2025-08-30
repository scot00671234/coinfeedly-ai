import { storage } from "../storage";
import { aiPredictionService } from "./aiPredictionService";
import { yahooFinanceIntegration } from "./yahooFinanceIntegration";
import type { InsertPrediction } from "@shared/schema";

export class CachedPredictionService {
  private cache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private setCacheValue(key: string, value: any): void {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  async generateCachedPredictionsForCommodity(commodityId: string): Promise<void> {
    console.log(`Weekly predictions have been disabled for commodity ${commodityId}`);
    // Weekly predictions have been removed from the system
  }

  async generateAllCachedPredictions(): Promise<void> {
    console.log("Weekly predictions have been disabled for all commodities");
    // Weekly predictions have been removed from the system
  }

  async getFuturePredictions(commodityId: string, days: number = 7): Promise<any[]> {
    const cacheKey = `future_predictions_${commodityId}_${days}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey) || [];
    }

    try {
      const commodity = await storage.getCommodity(commodityId);
      if (!commodity) return [];

      const aiModels = await storage.getAiModels();
      const futurePredictions = [];

      // Get predictions for next 'days' days
      for (let i = 1; i <= days; i++) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + i);
        
        const dayPredictions: any = {
          date: targetDate.toISOString().split('T')[0],
          predictions: {}
        };

        for (const model of aiModels) {
          const predictions = await storage.getPredictions(commodityId, model.id);
          
          // Find prediction for this target date
          const matchingPrediction = predictions.find(p => 
            p.targetDate.toISOString().split('T')[0] === targetDate.toISOString().split('T')[0]
          );

          if (matchingPrediction) {
            dayPredictions.predictions[model.name.toLowerCase()] = {
              price: parseFloat(matchingPrediction.predictedPrice),
              confidence: matchingPrediction.confidence ? parseFloat(matchingPrediction.confidence) : 0.5
            };
          }
        }

        futurePredictions.push(dayPredictions);
      }

      this.setCacheValue(cacheKey, futurePredictions);
      return futurePredictions;
    } catch (error) {
      console.error(`Error getting future predictions for ${commodityId}:`, error);
      return [];
    }
  }

  async getModelAccuracies(): Promise<any[]> {
    const cacheKey = 'model_accuracies';
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey) || [];
    }

    try {
      const aiModels = await storage.getAiModels();
      const commodities = await storage.getCommodities();
      const accuracies = [];

      for (const model of aiModels) {
        let totalAccuracy = 0;
        let totalPredictions = 0;
        let validPredictions = 0;

        for (const commodity of commodities) {
          const predictions = await storage.getPredictions(commodity.id, model.id);
          const actualPrices = await storage.getActualPrices(commodity.id, 30);

          for (const prediction of predictions) {
            const matchingPrice = actualPrices.find(price => 
              price.date.toISOString().split('T')[0] === prediction.targetDate.toISOString().split('T')[0]
            );

            if (matchingPrice) {
              const predicted = parseFloat(prediction.predictedPrice);
              const actual = parseFloat(matchingPrice.price);
              const accuracy = 100 - Math.abs((actual - predicted) / actual) * 100;
              
              totalAccuracy += Math.max(0, accuracy);
              validPredictions++;
            }
            totalPredictions++;
          }
        }

        accuracies.push({
          modelName: model.name,
          accuracy: validPredictions > 0 ? totalAccuracy / validPredictions : 0,
          totalPredictions,
          validPredictions
        });
      }

      this.setCacheValue(cacheKey, accuracies);
      return accuracies;
    } catch (error) {
      console.error("Error calculating model accuracies:", error);
      return [];
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
    console.log("Prediction cache cleared");
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const cachedPredictionService = new CachedPredictionService();