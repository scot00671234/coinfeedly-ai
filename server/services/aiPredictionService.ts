import { storage } from "../storage";
import { claudeService } from "./claudeService";
import { deepseekService } from "./deepseekService";
import { historicalDataService } from "./historicalDataService";
import { OpenAI } from "openai";
import type { InsertPrediction } from "@shared/schema";

let openai: OpenAI | null = null;

// Initialize OpenAI only if API key is available
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

interface CryptocurrencyData {
  name: string;
  symbol: string;
  currentPrice: number;
  historicalPrices: Array<{ date: string; price: number }>;
  category: string;
  unit: string;
}

export class AIPredictionService {
  
  isOpenAIConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY && !!openai;
  }
  
  async generateOpenAIPrediction(cryptocurrencyData: CryptocurrencyData): Promise<{
    predictedPrice: number;
    confidence: number;
    reasoning: string;
  }> {
    const prompt = `You are an expert cryptocurrency trader with decades of experience analyzing ${cryptocurrencyData.category} cryptocurrency markets. Analyze ${cryptocurrencyData.name} (${cryptocurrencyData.symbol}).

Current Market Context:
- Current Price: $${cryptocurrencyData.currentPrice} per ${cryptocurrencyData.unit}
- Cryptocurrency Type: ${cryptocurrencyData.category} cryptocurrency
- Recent Price History: ${this.formatHistoricalData(cryptocurrencyData.historicalPrices)}

Provide a sophisticated 7-day price forecast considering:
- Technical analysis indicators (moving averages, RSI, MACD)
- Market fundamentals (supply/demand dynamics)
- Macroeconomic factors (inflation, currency fluctuations)
- Geopolitical events affecting commodity markets
- Seasonal patterns and cyclical trends

Respond in JSON format:
{
  "predictedPrice": <number>,
  "confidence": <decimal between 0 and 1>,
  "reasoning": "<detailed analysis explaining your prediction methodology>"
}`;

    if (!openai) {
      throw new Error('OpenAI not configured - missing API key');
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(response);
      return {
        predictedPrice: Number(result.predictedPrice),
        confidence: Number(result.confidence),
        reasoning: result.reasoning
      };
    } catch (error) {
      console.error('OpenAI prediction error:', error);
      throw error;
    }
  }

  private formatHistoricalData(prices: Array<{ date: string; price: number }>): string {
    const recent = prices.slice(-7); // Last 7 days
    return recent.map(p => `${p.date}: $${p.price.toFixed(2)}`).join(', ');
  }



  async generateMonthlyPredictions(): Promise<void> {
    console.log("🚀 Starting monthly AI prediction generation for all cryptocurrencies...");
    console.log("📅 Generating predictions for timeframes: 3mo, 6mo, 9mo, 12mo");
    
    try {
      const cryptocurrencies = await storage.getCryptocurrencies();
      const timeframes = [3, 6, 9, 12]; // months
      
      for (const cryptocurrency of cryptocurrencies) {
        console.log(`📊 Processing ${cryptocurrency.name} for all timeframes...`);
        
        for (const monthsAhead of timeframes) {
          await this.generatePredictionsForCryptocurrencyWithTimeframe(cryptocurrency.id, monthsAhead);
          
          // Add small delay between predictions to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log(`✅ Completed all timeframe predictions for ${cryptocurrency.name}`);
      }
      
      console.log("✅ Completed monthly AI prediction generation for all cryptocurrencies");
    } catch (error) {
      console.error("❌ Error in generateMonthlyPredictions:", error);
      throw error;
    }
  }

  async generatePredictionsForCryptocurrencyWithTimeframe(cryptocurrencyId: string, monthsAhead: number): Promise<void> {
    console.log(`Generating ${monthsAhead}-month AI predictions for cryptocurrency ${cryptocurrencyId}...`);
    
    try {
      const cryptocurrency = await storage.getCryptocurrency(cryptocurrencyId);
      if (!cryptocurrency) {
        console.error(`Cryptocurrency ${cryptocurrencyId} not found`);
        return;
      }

      // Get historical prices for context
      let historicalPrices = await storage.getActualPrices(cryptocurrencyId, 30);
      if (historicalPrices.length === 0) {
        console.log(`No historical data for ${cryptocurrency.name}, fetching from CoinGecko...`);
        try {
          await historicalDataService.populateForCryptocurrency(cryptocurrencyId);
          historicalPrices = await storage.getActualPrices(cryptocurrencyId, 30);
        } catch (error) {
          console.error(`Failed to fetch historical data for ${cryptocurrency.name}:`, error);
        }
        
        if (historicalPrices.length === 0) {
          console.error(`Still no historical data for ${cryptocurrency.name}, skipping predictions`);
          return;
        }
      }

      const latestPrice = await storage.getLatestPrice(cryptocurrencyId);
      if (!latestPrice) {
        console.error(`No current price available for ${cryptocurrency.name}`);
        return;
      }

      const cryptocurrencyData: CryptocurrencyData = {
        name: cryptocurrency.name,
        symbol: cryptocurrency.symbol,
        currentPrice: Number(latestPrice.price),
        historicalPrices: historicalPrices.map(p => ({
          date: p.date.toISOString(),
          price: Number(p.price)
        })),
        category: cryptocurrency.category,
        unit: cryptocurrency.unit || "USD"
      };

      // Calculate target date (months ahead)
      const predictionDate = new Date();
      const targetDate = new Date(predictionDate);
      targetDate.setMonth(targetDate.getMonth() + monthsAhead);

      const timeframeSuffix = `${monthsAhead}mo`;
      
      const models = await storage.getAiModels();
      
      for (const model of models) {
        try {
          let prediction: { predictedPrice: number; confidence: number; reasoning: string } | null = null;

          // Generate prediction using the appropriate service
          if (model.name === 'ChatGPT' && this.isOpenAIConfigured()) {
            prediction = await this.generateOpenAIPredictionWithTimeframe(cryptocurrencyData, monthsAhead);
          } else if (model.name === 'Claude' && claudeService.isConfigured()) {
            prediction = await claudeService.generatePredictionWithTimeframe(cryptocurrencyData, monthsAhead);
          } else if (model.name === 'Deepseek' && deepseekService.isConfigured()) {
            prediction = await deepseekService.generatePredictionWithTimeframe(cryptocurrencyData, monthsAhead);
          }

          if (prediction) {
            const insertPrediction: InsertPrediction = {
              aiModelId: model.id,
              cryptocurrencyId: cryptocurrency.id,
              predictionDate,
              targetDate,
              predictedPrice: prediction.predictedPrice.toString(),
              confidence: prediction.confidence.toString(),
              timeframe: timeframeSuffix,
              metadata: {
                reasoning: prediction.reasoning,
                inputData: {
                  currentPrice: cryptocurrencyData.currentPrice,
                  historicalDataPoints: cryptocurrencyData.historicalPrices.length,
                  timeframe: timeframeSuffix
                }
              }
            };

            await storage.createPrediction(insertPrediction);
            console.log(`Generated ${model.name} ${monthsAhead}-month prediction for ${cryptocurrency.name}: $${prediction.predictedPrice} (confidence: ${prediction.confidence})`);
          } else {
            console.log(`Skipped ${model.name} ${monthsAhead}-month prediction for ${cryptocurrency.name} - service not configured`);
          }
        } catch (error) {
          console.error(`Error generating ${model.name} ${monthsAhead}-month prediction for ${cryptocurrency.name}:`, error);
        }
      }
      
      console.log(`Completed ${monthsAhead}-month AI predictions for ${cryptocurrency.name}`);
    } catch (error) {
      console.error(`Error in generatePredictionsForCryptocurrencyWithTimeframe for ${cryptocurrencyId} (${monthsAhead}mo):`, error);
    }
  }

  async generateOpenAIPredictionWithTimeframe(cryptocurrencyData: CryptocurrencyData, monthsAhead: number): Promise<{
    predictedPrice: number;
    confidence: number;
    reasoning: string;
  }> {
    const prompt = `You are an expert cryptocurrency trader with decades of experience analyzing ${cryptocurrencyData.category} cryptocurrency markets. Analyze ${cryptocurrencyData.name} (${cryptocurrencyData.symbol}).

Current Market Context:
- Current Price: $${cryptocurrencyData.currentPrice} per ${cryptocurrencyData.unit}
- Cryptocurrency Type: ${cryptocurrencyData.category} cryptocurrency
- Recent Price History: ${this.formatHistoricalData(cryptocurrencyData.historicalPrices)}

Provide a sophisticated ${monthsAhead}-month price forecast considering:
- Technical analysis indicators (moving averages, RSI, MACD)
- Market fundamentals (supply/demand dynamics)
- Macroeconomic factors (inflation, currency fluctuations)
- Geopolitical events affecting commodity markets
- Seasonal patterns and cyclical trends
- Long-term structural market changes
- Economic cycles and their impact on commodity demand

For a ${monthsAhead}-month horizon, focus on:
${monthsAhead <= 3 ? '- Near-term supply disruptions and inventory levels' : ''}
${monthsAhead <= 6 ? '- Seasonal demand patterns and weather impacts' : ''}
${monthsAhead >= 6 ? '- Economic growth trends and industrial demand' : ''}
${monthsAhead >= 9 ? '- Policy changes and regulatory impacts' : ''}
${monthsAhead >= 12 ? '- Long-term structural shifts in supply and demand' : ''}

Respond in JSON format:
{
  "predictedPrice": <number>,
  "confidence": <decimal between 0 and 1>,
  "reasoning": "<detailed analysis explaining your ${monthsAhead}-month prediction methodology>"
}`;

    if (!openai) {
      throw new Error('OpenAI not configured - missing API key');
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(response);
      return {
        predictedPrice: Number(result.predictedPrice),
        confidence: Number(result.confidence),
        reasoning: result.reasoning
      };
    } catch (error) {
      console.error(`OpenAI ${monthsAhead}-month prediction error:`, error);
      throw error;
    }
  }



  async getWorkingServices(): Promise<string[]> {
    const workingServices: string[] = [];
    
    // Check OpenAI
    if (this.isOpenAIConfigured()) {
      workingServices.push('OpenAI');
    }
    
    // Check Claude
    if (claudeService.isConfigured()) {
      workingServices.push('Claude');
    }
    
    // Check DeepSeek
    if (deepseekService.isConfigured()) {
      workingServices.push('DeepSeek');
    }
    
    return workingServices;
  }

  async isAnyServiceConfigured(): Promise<boolean> {
    return !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.DEEPSEEK_API_KEY);
  }


  async getServiceStatus(): Promise<{ openai: boolean; claude: boolean; deepseek: boolean }> {
    return {
      openai: !!process.env.OPENAI_API_KEY,
      claude: claudeService.isConfigured(),
      deepseek: deepseekService.isConfigured()
    };
  }
}

export const aiPredictionService = new AIPredictionService();