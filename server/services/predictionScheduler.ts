import cron from 'node-cron';
import { aiPredictionService } from './aiPredictionService';
import { cachedPredictionService } from './cachedPredictionService';
import { compositeIndexService } from './compositeIndexService';

export class PredictionScheduler {
  private isScheduled = false;

  start(): void {
    if (this.isScheduled) {
      console.log('Prediction scheduler is already running');
      return;
    }

    // Schedule monthly comprehensive updates every 1st of the month at 3 AM
    cron.schedule('0 3 1 * *', async () => {
      console.log('Running monthly comprehensive AI prediction update...');
      try {
        await aiPredictionService.generateMonthlyPredictions();
        console.log('Monthly comprehensive AI prediction update completed successfully');
        
        // Calculate composite index after predictions
        console.log('Calculating AI Commodity Composite Index (ACCI)...');
        await compositeIndexService.calculateAndStoreIndex();
        console.log('Composite index calculation completed successfully');
      } catch (error) {
        console.error('Monthly comprehensive AI prediction update failed:', error);
      }
    });

    // Schedule daily composite index recalculation every day at 2 AM (no new predictions)
    cron.schedule('0 2 * * *', async () => {
      console.log('Recalculating AI Composite Index with existing predictions...');
      try {
        await compositeIndexService.calculateAndStoreIndex();
        console.log('Daily composite index recalculation completed successfully');
      } catch (error) {
        console.error('Daily composite index recalculation failed:', error);
      }
    });

    // Hourly predictions have been disabled - only monthly predictions are generated

    this.isScheduled = true;
    console.log('Prediction scheduler started with schedules:');
    console.log('- Monthly comprehensive: Every 1st of the month at 3 AM (3mo, 6mo, 9mo, 12mo predictions)');
    console.log('- Daily composite index: Every day at 2 AM (recalculates index with existing predictions)');
    console.log('- Weekly predictions have been disabled');
  }

  async runNow(): Promise<void> {
    console.log('Running monthly AI prediction update manually...');
    try {
      await aiPredictionService.generateMonthlyPredictions();
      console.log('Manual monthly AI prediction update completed successfully');
    } catch (error) {
      console.error('Manual monthly AI prediction update failed:', error);
      throw error;
    }
  }

  async runFullGeneration(): Promise<void> {
    console.log('Running full daily prediction generation manually...');
    try {
      await cachedPredictionService.generateAllCachedPredictions();
      console.log('Manual full generation completed successfully');
    } catch (error) {
      console.error('Manual full generation failed:', error);
      throw error;
    }
  }

  async runForCommodity(commodityId: string): Promise<void> {
    console.log(`Running daily predictions manually for commodity ${commodityId}...`);
    try {
      await cachedPredictionService.generateCachedPredictionsForCommodity(commodityId);
      console.log(`Manual daily prediction run completed for commodity ${commodityId}`);
    } catch (error) {
      console.error(`Manual daily prediction run failed for commodity ${commodityId}:`, error);
      throw error;
    }
  }

  stop(): void {
    // Note: node-cron doesn't provide a direct way to stop specific tasks
    // This would require tracking the task and calling destroy() on it
    this.isScheduled = false;
    console.log('Prediction scheduler stopped');
  }
}

export const predictionScheduler = new PredictionScheduler();