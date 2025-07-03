import axios from 'axios';

interface YFinanceQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  eps?: number;
}

interface YFinanceHistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

class YFinanceService {
  private baseURL: string;
  private apiKey: string;
  private host: string;

  constructor() {
    this.baseURL = process.env.YFINANCE_API_URL || 'https://yahoo-finance15.p.rapidapi.com';
    this.apiKey = process.env.RAPIDAPI_KEY || '';
    this.host = process.env.YFINANCE_API_HOST || 'yahoo-finance15.p.rapidapi.com';
  }

  private getHeaders() {
    return {
      'X-RapidAPI-Key': this.apiKey,
      'X-RapidAPI-Host': this.host,
    };
  }

  async getQuote(symbol: string): Promise<YFinanceQuote | null> {
    try {
      const response = await axios.get(`${this.baseURL}/api/yahoo/qu/quote/${symbol}`, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  async getMultipleQuotes(symbols: string[]): Promise<YFinanceQuote[]> {
    try {
      const promises = symbols.map(symbol => this.getQuote(symbol));
      const results = await Promise.allSettled(promises);
      
      return results
        .filter((result): result is PromiseFulfilledResult<YFinanceQuote> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);
    } catch (error) {
      console.error('Error fetching multiple quotes:', error);
      return [];
    }
  }

  async getHistoricalData(
    symbol: string, 
    period: string = '1y'
  ): Promise<YFinanceHistoricalData[]> {
    try {
      const response = await axios.get(`${this.baseURL}/api/yahoo/hi/history`, {
        headers: this.getHeaders(),
        params: {
          symbol,
          period,
        },
      });

      return response.data.prices || [];
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return [];
    }
  }

  async searchSymbols(query: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/api/yahoo/se/search`, {
        headers: this.getHeaders(),
        params: {
          q: query,
        },
      });

      return response.data.quotes || [];
    } catch (error) {
      console.error(`Error searching symbols for ${query}:`, error);
      return [];
    }
  }

  async getMarketSummary(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/api/yahoo/ma/summary`, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching market summary:', error);
      return null;
    }
  }
}

export default new YFinanceService();
