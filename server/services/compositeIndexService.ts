import { storage } from "../storage";
import type { InsertCompositeIndex, Prediction } from "@shared/schema";

interface IndexComponents {
  directional: number;
  confidence: number;
  accuracy: number;
  momentum: number;
}

interface CommodityPredictions {
  predictions: Prediction[];
  category: 'hard' | 'soft';
  commodity: string;
}

export class CompositeIndexService {
  
  async calculateAndStoreIndex(): Promise<void> {
    console.log("🔄 Calculating AI Commodity Composite Index (ACCI)...");
    
    try {
      const commodities = await storage.getCommodities();
      const aiModels = await storage.getAiModels();
      
      // Group predictions by commodity - use all available predictions
      const commodityPredictions: CommodityPredictions[] = [];
      let totalAvailablePredictions = 0;
      
      for (const commodity of commodities) {
        const predictions = await storage.getPredictions(commodity.id);
        totalAvailablePredictions += predictions.length;
        
        if (predictions.length > 0) {
          // Use the most recent predictions for each commodity (last 90 days or all if less)
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - 90);
          
          const recentPredictions = predictions.filter(p => 
            new Date(p.predictionDate) >= cutoffDate
          );
          
          // If no recent predictions, use the latest available ones (up to 20 per commodity)
          const finalPredictions = recentPredictions.length > 0 
            ? recentPredictions 
            : predictions.slice(-20);
          
          if (finalPredictions.length > 0) {
            commodityPredictions.push({
              predictions: finalPredictions,
              category: commodity.category as 'hard' | 'soft',
              commodity: commodity.name
            });
          }
        }
      }
      
      console.log(`📊 Found ${totalAvailablePredictions} total predictions across ${commodities.length} commodities`);
      console.log(`📊 Using ${commodityPredictions.length} commodities with prediction data`);
      
      if (commodityPredictions.length === 0) {
        console.log("⚠️ No predictions found for composite index calculation - creating fallback index");
        // Create a fallback index using default neutral values when no predictions exist
        const fallbackIndexRecord: InsertCompositeIndex = {
          date: new Date(),
          overallIndex: "50.0",
          hardCommoditiesIndex: "50.0", 
          softCommoditiesIndex: "50.0",
          directionalComponent: "50.0",
          confidenceComponent: "50.0",
          accuracyComponent: "50.0",
          momentumComponent: "50.0",
          totalPredictions: 0,
          marketSentiment: 'neutral'
        };
        
        try {
          const createdIndex = await storage.createCompositeIndex(fallbackIndexRecord);
          console.log("✅ Created fallback composite index with neutral values:", createdIndex.id);
          return;
        } catch (error) {
          console.error("❌ Failed to create fallback composite index:", error);
          throw error;
        }
      }
      
      // Calculate overall index components
      const overallComponents = await this.calculateIndexComponents(commodityPredictions);
      const overallIndex = this.combineComponents(overallComponents);
      
      // Calculate hard commodities index
      const hardCommodities = commodityPredictions.filter(cp => cp.category === 'hard');
      console.log(`📊 Hard commodities found: ${hardCommodities.length} (${hardCommodities.map(h => h.commodity).join(', ')})`);
      const hardComponents = await this.calculateIndexComponents(hardCommodities);
      const hardIndex = hardCommodities.length > 0 ? this.combineComponents(hardComponents) : 50.0;
      
      // Calculate soft commodities index
      const softCommodities = commodityPredictions.filter(cp => cp.category === 'soft');
      console.log(`📊 Soft commodities found: ${softCommodities.length} (${softCommodities.map(s => s.commodity).join(', ')})`);
      const softComponents = await this.calculateIndexComponents(softCommodities);
      const softIndex = softCommodities.length > 0 ? this.combineComponents(softComponents) : 50.0;
      
      // Determine market sentiment
      const sentiment = this.determineSentiment(overallIndex);
      
      // Count total predictions
      const totalPredictions = commodityPredictions.reduce((sum, cp) => sum + cp.predictions.length, 0);
      
      // Create index record
      const indexRecord: InsertCompositeIndex = {
        date: new Date(),
        overallIndex: overallIndex.toString(),
        hardCommoditiesIndex: hardIndex.toString(),
        softCommoditiesIndex: softIndex.toString(),
        directionalComponent: overallComponents.directional.toString(),
        confidenceComponent: overallComponents.confidence.toString(),
        accuracyComponent: overallComponents.accuracy.toString(),
        momentumComponent: overallComponents.momentum.toString(),
        totalPredictions,
        marketSentiment: sentiment
      };
      
      // Store in database
      await storage.createCompositeIndex(indexRecord);
      
      console.log(`✅ ACCI calculated: ${overallIndex.toFixed(2)} (${sentiment})`);
      console.log(`   Hard: ${hardIndex.toFixed(2)}, Soft: ${softIndex.toFixed(2)}`);
      console.log(`   Components: D:${overallComponents.directional.toFixed(1)} C:${overallComponents.confidence.toFixed(1)} A:${overallComponents.accuracy.toFixed(1)} M:${overallComponents.momentum.toFixed(1)}`);
      
    } catch (error) {
      console.error("❌ Error calculating composite index:", error);
      throw error;
    }
  }
  
  private async calculateIndexComponents(commodityPredictions: CommodityPredictions[]): Promise<IndexComponents> {
    let totalDirectional = 0;
    let totalConfidence = 0;
    let totalAccuracy = 0;
    let totalMomentum = 0;
    let count = 0;
    
    for (const commodityData of commodityPredictions) {
      const { predictions } = commodityData;
      
      if (predictions.length === 0) continue;
      
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
    
    let bullishCount = 0;
    let totalWeight = 0;
    
    // Group predictions by commodity to compare with current prices
    const commodityGroups = new Map<string, Prediction[]>();
    predictions.forEach(pred => {
      const key = pred.commodityId;
      if (!commodityGroups.has(key)) {
        commodityGroups.set(key, []);
      }
      commodityGroups.get(key)!.push(pred);
    });
    
    commodityGroups.forEach((preds, commodityId) => {
      for (const pred of preds) {
        // Get historical price at prediction date for comparison
        const predictedPrice = parseFloat(pred.predictedPrice);
        const confidence = parseFloat(pred.confidence || '0.5');
        
        // Simplified directional calculation
        // In a full implementation, you'd compare with historical prices
        // For now, use prediction confidence as a proxy
        if (confidence > 0.5) {
          bullishCount += confidence;
        }
        totalWeight += 1;
      }
    });
    
    const ratio = totalWeight > 0 ? bullishCount / totalWeight : 0.5;
    return Math.max(0, Math.min(100, ratio * 100));
  }
  
  private calculateConfidenceScore(predictions: Prediction[]): number {
    if (predictions.length === 0) return 50;
    
    const confidences = predictions
      .map(p => parseFloat(p.confidence || '0.5'))
      .filter(c => !isNaN(c));
    
    if (confidences.length === 0) return 50;
    
    const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    const variance = confidences.reduce((sum, c) => sum + Math.pow(c - avgConfidence, 2), 0) / confidences.length;
    
    // High confidence + low variance = high score
    const confidenceScore = avgConfidence * 100;
    const varianceScore = Math.max(0, 100 - (variance * 400)); // Scale variance
    
    return (confidenceScore * 0.7) + (varianceScore * 0.3);
  }
  
  private calculateAccuracyWeight(predictions: Prediction[]): number {
    // Simplified accuracy calculation
    // In production, this would use historical accuracy data
    return 60; // Default neutral accuracy
  }
  
  private calculateMomentum(predictions: Prediction[]): number {
    if (predictions.length < 2) return 50;
    
    // Sort predictions by date
    const sortedPreds = predictions.sort((a, b) => 
      new Date(a.predictionDate).getTime() - new Date(b.predictionDate).getTime()
    );
    
    let momentum = 0;
    let count = 0;
    
    for (let i = 1; i < sortedPreds.length; i++) {
      const current = parseFloat(sortedPreds[i].predictedPrice);
      const previous = parseFloat(sortedPreds[i-1].predictedPrice);
      
      if (!isNaN(current) && !isNaN(previous)) {
        const change = ((current - previous) / previous) * 100;
        momentum += change;
        count++;
      }
    }
    
    if (count === 0) return 50;
    
    const avgMomentum = momentum / count;
    // Scale momentum to 0-100 range, with 50 as neutral
    return Math.max(0, Math.min(100, 50 + (avgMomentum * 10)));
  }
  
  private combineComponents(components: IndexComponents): number {
    // Weighted combination of components (PMI-style)
    const weighted = 
      (components.directional * 0.40) +
      (components.confidence * 0.25) +
      (components.accuracy * 0.20) +
      (components.momentum * 0.15);
    
    return Math.max(0, Math.min(100, weighted));
  }
  
  private determineSentiment(index: number): 'bullish' | 'bearish' | 'neutral' {
    if (index >= 55) return 'bullish';
    if (index <= 45) return 'bearish';
    return 'neutral';
  }
  
  async getLatestIndex(): Promise<any> {
    return await storage.getLatestCompositeIndex();
  }
  
  async getIndexHistory(days: number = 30): Promise<any[]> {
    return await storage.getCompositeIndexHistory(days);
  }
}

export const compositeIndexService = new CompositeIndexService();