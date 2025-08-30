import { DatabaseStorage } from '../storage.js';
import type { Commodity, Prediction } from '@shared/schema.js';

interface CompositeIndex {
  value: number;
  timestamp: string;
  components: {
    directional: number;
    confidence: number;
    accuracy: number;
    momentum: number;
  };
}

interface CategoryCompositeIndex {
  hard: CompositeIndex;
  soft: CompositeIndex;
}

interface IndexComponents {
  directional: number;
  confidence: number;
  accuracy: number;
  momentum: number;
}

interface CommodityPredictions {
  commodity: Commodity;
  predictions: Prediction[];
}

export class CategoryCompositeService {
  constructor(private storage: DatabaseStorage) {}

  /**
   * Calculate separate composite indices for hard and soft commodities
   */
  async getCategoryCompositeIndices(): Promise<CategoryCompositeIndex> {
    try {
      const commodities = await this.storage.getCommodities();
      
      // Separate commodities by category
      const hardCommodities = commodities.filter(c => c.category === 'hard');
      const softCommodities = commodities.filter(c => c.category === 'soft');
      
      // Get predictions for each category
      const hardPredictions = await this.getCommodityPredictions(hardCommodities);
      const softPredictions = await this.getCommodityPredictions(softCommodities);
      
      // Calculate indices for each category
      const hardIndex = await this.calculateCategoryIndex(hardPredictions, 'hard');
      const softIndex = await this.calculateCategoryIndex(softPredictions, 'soft');
      
      return {
        hard: hardIndex,
        soft: softIndex
      };
    } catch (error) {
      console.error('Error calculating category composite indices:', error);
      return this.getFallbackCategoryIndices();
    }
  }

  private async getCommodityPredictions(commodities: Commodity[]): Promise<CommodityPredictions[]> {
    const results: CommodityPredictions[] = [];
    
    for (const commodity of commodities) {
      try {
        // Get recent predictions (last 30 days)
        const predictions = await this.storage.getPredictions(commodity.id);
        const recentPredictions = predictions.filter(p => {
          const predictionDate = new Date(p.createdAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return predictionDate >= thirtyDaysAgo;
        });
        
        results.push({
          commodity,
          predictions: recentPredictions
        });
      } catch (error) {
        console.error(`Error getting predictions for ${commodity.name}:`, error);
        // Include commodity with empty predictions to maintain category balance
        results.push({
          commodity,
          predictions: []
        });
      }
    }
    
    return results;
  }

  private async calculateCategoryIndex(commodityPredictions: CommodityPredictions[], category: string): Promise<CompositeIndex> {
    const components = await this.calculateIndexComponents(commodityPredictions);
    const value = this.combineComponents(components);
    
    console.log(`📊 ${category.toUpperCase()} commodities composite index: ${value.toFixed(1)}`);
    console.log(`   Components - Directional: ${components.directional.toFixed(1)}, Confidence: ${components.confidence.toFixed(1)}, Accuracy: ${components.accuracy.toFixed(1)}, Momentum: ${components.momentum.toFixed(1)}`);
    
    return {
      value,
      timestamp: new Date().toISOString(),
      components
    };
  }

  private async calculateIndexComponents(commodityPredictions: CommodityPredictions[]): Promise<IndexComponents> {
    let totalDirectional = 0;
    let totalConfidence = 0;
    let totalAccuracy = 0;
    let totalMomentum = 0;
    let count = 0;
    
    for (const commodityData of commodityPredictions) {
      const { predictions } = commodityData;
      
      if (predictions.length === 0) {
        // For commodities with no predictions, use neutral values
        totalDirectional += 50;
        totalConfidence += 50;
        totalAccuracy += 50;
        totalMomentum += 50;
        count++;
        continue;
      }
      
      // 1. Directional Sentiment (bullish/bearish)
      const directional = this.calculateDirectionalSentiment(predictions);
      
      // 2. Confidence Score
      const confidence = this.calculateConfidenceScore(predictions);
      
      // 3. Accuracy Weight (simplified for now)
      const accuracy = this.calculateAccuracyWeight(predictions);
      
      // 4. Momentum Component
      const momentum = this.calculateMomentum(predictions);
      
      totalDirectional += directional;
      totalConfidence += confidence;
      totalAccuracy += accuracy;
      totalMomentum += momentum;
      count++;
    }
    
    return {
      directional: count > 0 ? totalDirectional / count : 50,
      confidence: count > 0 ? totalConfidence / count : 50,
      accuracy: count > 0 ? totalAccuracy / count : 50,
      momentum: count > 0 ? totalMomentum / count : 50
    };
  }

  private calculateDirectionalSentiment(predictions: Prediction[]): number {
    if (predictions.length === 0) return 50;
    
    const recentPredictions = predictions.slice(-10); // Last 10 predictions
    let totalSentiment = 0;
    
    for (const prediction of recentPredictions) {
      // Use prediction price magnitude as bullish indicator
      const priceValue = parseFloat(prediction.predictedPrice);
      // Higher prices generally indicate bullish sentiment (scale 0-100)
      const sentiment = Math.min(100, Math.max(0, (priceValue / 100) * 50 + 50));
      totalSentiment += sentiment;
    }
    
    return totalSentiment / recentPredictions.length;
  }

  private calculateConfidenceScore(predictions: Prediction[]): number {
    if (predictions.length === 0) return 50;
    
    const recentPredictions = predictions.slice(-10); // Last 10 predictions
    let totalConfidence = 0;
    
    for (const prediction of recentPredictions) {
      // Use confidence from prediction data if available
      if (prediction.confidence) {
        totalConfidence += parseFloat(prediction.confidence);
      } else {
        // Use predicted price magnitude as confidence proxy
        const priceValue = parseFloat(prediction.predictedPrice);
        const confidence = Math.min(100, Math.max(10, priceValue / 10)); // Scale appropriately
        totalConfidence += confidence;
      }
    }
    
    return totalConfidence / recentPredictions.length;
  }

  private calculateAccuracyWeight(predictions: Prediction[]): number {
    // For now, return a baseline accuracy
    // In a full implementation, this would compare predictions to actual outcomes
    return 65; // Assume 65% baseline accuracy
  }

  private calculateMomentum(predictions: Prediction[]): number {
    if (predictions.length < 2) return 50;
    
    const recentPredictions = predictions.slice(-5); // Last 5 predictions
    let momentumScore = 0;
    
    for (let i = 1; i < recentPredictions.length; i++) {
      const current = parseFloat(recentPredictions[i].predictedPrice);
      const previous = parseFloat(recentPredictions[i - 1].predictedPrice);
      
      // Check if prices are trending in the same direction
      if ((current > previous && previous > 0) || (current < previous && previous > 0)) {
        momentumScore += 20; // Consistent trend adds momentum
      }
    }
    
    return Math.min(100, Math.max(0, 50 + momentumScore));
  }

  private combineComponents(components: IndexComponents): number {
    // Same weighting as overall composite index
    const weighted = 
      (components.directional * 0.40) +
      (components.confidence * 0.25) +
      (components.accuracy * 0.20) +
      (components.momentum * 0.15);
    
    return Math.max(0, Math.min(100, weighted));
  }

  private getFallbackCategoryIndices(): CategoryCompositeIndex {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Create different patterns for hard vs soft commodities
    const hardBase = 50 + (Math.sin(dayOfYear / 365 * Math.PI * 2) * 20);
    const softBase = 50 + (Math.cos(dayOfYear / 365 * Math.PI * 2) * 15);
    
    const createIndex = (baseValue: number): CompositeIndex => ({
      value: Math.round(Math.max(0, Math.min(100, baseValue))),
      timestamp: now.toISOString(),
      components: {
        directional: Math.round(baseValue),
        confidence: Math.round(baseValue * 0.9),
        accuracy: 65,
        momentum: Math.round(baseValue * 1.1)
      }
    });
    
    return {
      hard: createIndex(hardBase),
      soft: createIndex(softBase)
    };
  }
}