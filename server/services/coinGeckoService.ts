// CoinGecko Service for cryptocurrency price data

interface CoinGeckoResponse {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

interface CoinGeckoCurrentPrice {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
    usd_24h_vol: number;
    usd_market_cap: number;
  };
}

interface CryptoDataPoint {
  date: string;
  price: number;
  volume: number;
}

export class CoinGeckoService {
  private baseUrl = "https://api.coingecko.com/api/v3";
  private lastRequestTime = 0;
  private minDelay = 2000; // 2 seconds between requests for free tier (30 calls/min)

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minDelay) {
      const delayNeeded = this.minDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delayNeeded));
    }
    
    this.lastRequestTime = Date.now();
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getCurrentPrices(cryptoIds: string[]): Promise<CoinGeckoCurrentPrice | null> {
    await this.enforceRateLimit();

    try {
      const ids = cryptoIds.join(',');
      const url = `${this.baseUrl}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AIForecast-Hub/1.0'
        }
      });

      if (!response.ok) {
        console.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json() as CoinGeckoCurrentPrice;
      return data;
    } catch (error) {
      console.error('Error fetching current prices from CoinGecko:', error);
      return null;
    }
  }

  async getCurrentPrice(cryptoId: string): Promise<{ price: number; change?: number; changePercent?: number } | null> {
    const data = await this.getCurrentPrices([cryptoId]);
    
    if (data && data[cryptoId]) {
      const coinData = data[cryptoId];
      return {
        price: coinData.usd,
        change: coinData.usd_24h_change || 0,
        changePercent: coinData.usd_24h_change || 0
      };
    }
    
    return null;
  }

  async fetchHistoricalData(cryptoId: string, days: number = 7): Promise<CryptoDataPoint[]> {
    await this.enforceRateLimit();

    try {
      const url = `${this.baseUrl}/coins/${cryptoId}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AIForecast-Hub/1.0'
        }
      });

      if (!response.ok) {
        console.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json() as CoinGeckoResponse;
      
      if (data.prices && data.prices.length > 0) {
        return data.prices.map(([timestamp, price]) => ({
          date: new Date(timestamp).toISOString(),
          price: price,
          volume: data.total_volumes.find(([t]) => t === timestamp)?.[1] || 0,
        }));
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching historical data for ${cryptoId}:`, error);
      return [];
    }
  }

  async fetchDetailedHistoricalData(cryptoId: string, period: string): Promise<CryptoDataPoint[]> {
    // Map periods to days for CoinGecko API
    const periodMap: Record<string, number> = {
      "1d": 1,
      "5d": 5,
      "1w": 7,
      "1mo": 30,
      "3mo": 90,
      "6mo": 180,
      "1y": 365,
      "2y": 730,
      "5y": 1825,
      "max": 2000 // CoinGecko free tier max
    };

    const days = periodMap[period] || 30;

    try {
      console.log(`Fetching ${days} days of data for ${cryptoId}`);
      const data = await this.fetchHistoricalData(cryptoId, days);
      
      if (data.length > 0) {
        console.log(`Successfully fetched ${data.length} data points from ${cryptoId} for period ${period}`);
        return data;
      }
      
      console.log(`No data available for ${cryptoId}`);
      return [];
      
    } catch (error) {
      console.error(`Error fetching detailed data for ${cryptoId}:`, error);
      return [];
    }
  }

  async updateCryptoPrices(commodityId: string): Promise<void> {
    console.log(`Updating crypto prices for commodity ${commodityId}`);
    // This method will be implemented later with database integration
    // For now just log the attempt
  }
}

export const coinGeckoService = new CoinGeckoService();