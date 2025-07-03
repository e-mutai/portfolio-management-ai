import axios from 'axios';

interface NSEStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  sector?: string;
}

interface NSEMarketData {
  totalListed: number;
  totalVolume: number;
  totalValue: number;
  indices: {
    nse20: {
      value: number;
      change: number;
      changePercent: number;
    };
    nse25: {
      value: number;
      change: number;
      changePercent: number;
    };
    nseasi: {
      value: number;
      change: number;
      changePercent: number;
    };
  };
}

class NSEService {
  private baseURL: string;
  private apiKey: string;
  private host: string;

  constructor() {
    this.baseURL = process.env.NSE_API_URL || 'https://nairobi-stock-exchange.p.rapidapi.com';
    this.apiKey = process.env.RAPIDAPI_KEY || '';
    this.host = process.env.NSE_API_HOST || 'nairobi-stock-exchange.p.rapidapi.com';
  }

  private getHeaders() {
    return {
      'X-RapidAPI-Key': this.apiKey,
      'X-RapidAPI-Host': this.host,
    };
  }

  async getAllStocks(): Promise<NSEStock[]> {
    try {
      const response = await axios.get(`${this.baseURL}/stocks`, {
        headers: this.getHeaders(),
      });

      return response.data || [];
    } catch (error) {
      console.error('Error fetching NSE stocks:', error);
      return [];
    }
  }

  async getStock(symbol: string): Promise<NSEStock | null> {
    try {
      const response = await axios.get(`${this.baseURL}/stock/${symbol}`, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching NSE stock ${symbol}:`, error);
      return null;
    }
  }

  async getMarketData(): Promise<NSEMarketData | null> {
    try {
      const response = await axios.get(`${this.baseURL}/market-data`, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching NSE market data:', error);
      return null;
    }
  }

  async getIndices(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/indices`, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching NSE indices:', error);
      return null;
    }
  }

  async getTopGainers(): Promise<NSEStock[]> {
    try {
      const response = await axios.get(`${this.baseURL}/top-gainers`, {
        headers: this.getHeaders(),
      });

      return response.data || [];
    } catch (error) {
      console.error('Error fetching NSE top gainers:', error);
      return [];
    }
  }

  async getTopLosers(): Promise<NSEStock[]> {
    try {
      const response = await axios.get(`${this.baseURL}/top-losers`, {
        headers: this.getHeaders(),
      });

      return response.data || [];
    } catch (error) {
      console.error('Error fetching NSE top losers:', error);
      return [];
    }
  }

  async getMostActive(): Promise<NSEStock[]> {
    try {
      const response = await axios.get(`${this.baseURL}/most-active`, {
        headers: this.getHeaders(),
      });

      return response.data || [];
    } catch (error) {
      console.error('Error fetching NSE most active stocks:', error);
      return [];
    }
  }

  async getStocksBySector(sector: string): Promise<NSEStock[]> {
    try {
      const response = await axios.get(`${this.baseURL}/sector/${sector}`, {
        headers: this.getHeaders(),
      });

      return response.data || [];
    } catch (error) {
      console.error(`Error fetching NSE stocks for sector ${sector}:`, error);
      return [];
    }
  }
}

export default new NSEService();
