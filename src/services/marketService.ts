import axios from 'axios';
import { MarketStock, MarketData, ApiResponse } from '@/types';

const API_BASE_URL = 'http://localhost:5000/api';

export interface NSEStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  sector?: string;
  dataSource?: string;
}

export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose?: number;
}

export interface MarketSummary {
  index: string;
  value: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

class MarketService {
  // Get NSE stocks from backend only
  async getNSEStocks(): Promise<NSEStock[]> {
    try {
      console.log('🔄 Fetching NSE stocks from backend...');
      const response = await axios.get(`${API_BASE_URL}/market/nse/stocks`);
      
      // Backend returns { success: true, data: [...], timestamp, count }
      const stocks = response.data.data || [];
      console.log(`📊 Retrieved ${stocks.length} NSE stocks from backend`);
      
      // Add dataSource for dashboard compatibility
      const stocksWithSource = stocks.map((stock: NSEStock) => ({
        ...stock,
        dataSource: 'NSE Web Scraper (Live)'
      }));
      
      return stocksWithSource;
    } catch (error) {
      console.error('❌ Error fetching NSE stocks:', error);
      return [];
    }
  }

  // Get specific stock data from backend
  async getStock(symbol: string): Promise<NSEStock | null> {
    try {
      console.log(`🔄 Fetching stock data for ${symbol}...`);
      const response = await axios.get(`${API_BASE_URL}/market/stock/${symbol}`);
      // Backend returns { success: true, data: {...}, timestamp }
      return response.data.data || null;
    } catch (error) {
      console.error(`❌ Error fetching stock ${symbol}:`, error);
      return null;
    }
  }

  // Get historical data from backend
  async getHistoricalData(symbol: string, period: string = '1M'): Promise<HistoricalData[]> {
    try {
      console.log(`🔄 Fetching historical data for ${symbol} (${period})...`);
      const response = await axios.get(`${API_BASE_URL}/market/stock/${symbol}/history`, {
        params: { period }
      });
      // Backend returns { success: true, data: [...], message }
      return response.data.data || [];
    } catch (error) {
      console.error(`❌ Error fetching historical data for ${symbol}:`, error);
      return [];
    }
  }

  // Get market summary from backend
  async getMarketSummary(): Promise<MarketSummary | null> {
    try {
      console.log('🔄 Fetching market summary...');
      const response = await axios.get(`${API_BASE_URL}/market/summary`);
      // Backend returns { success: true, data: {...}, timestamp, source }
      return response.data.data || null;
    } catch (error) {
      console.error('❌ Error fetching market summary:', error);
      return null;
    }
  }

  // Get top gainers from backend
  async getTopGainers(): Promise<NSEStock[]> {
    try {
      console.log('🔄 Fetching top gainers...');
      const response = await axios.get(`${API_BASE_URL}/market/gainers`);
      // Backend returns { success: true, data: [...], timestamp, count }
      return response.data.data || [];
    } catch (error) {
      console.error('❌ Error fetching top gainers:', error);
      return [];
    }
  }

  // Get top losers from backend
  async getTopLosers(): Promise<NSEStock[]> {
    try {
      console.log('🔄 Fetching top losers...');
      const response = await axios.get(`${API_BASE_URL}/market/losers`);
      // Backend returns { success: true, data: [...], timestamp, count }
      return response.data.data || [];
    } catch (error) {
      console.error('❌ Error fetching top losers:', error);
      return [];
    }
  }

  // Get most active stocks from backend
  async getMostActive(): Promise<NSEStock[]> {
    try {
      console.log('🔄 Fetching most active stocks...');
      const response = await axios.get(`${API_BASE_URL}/market/active`);
      // Backend returns { success: true, data: [...], timestamp, count }
      return response.data.data || [];
    } catch (error) {
      console.error('❌ Error fetching most active stocks:', error);
      return [];
    }
  }

  // Search stocks from backend
  async searchStocks(query: string): Promise<NSEStock[]> {
    try {
      console.log(`🔍 Searching for stocks: ${query}...`);
      const response = await axios.get(`${API_BASE_URL}/market/search`, {
        params: { q: query }
      });
      // Backend returns { success: true, data: [...] }
      return response.data.data || [];
    } catch (error) {
      console.error(`❌ Error searching stocks for ${query}:`, error);
      return [];
    }
  }

  // Get stocks by sector from backend
  async getStocksBySector(sector: string): Promise<NSEStock[]> {
    try {
      console.log(`🔄 Fetching stocks for sector: ${sector}...`);
      const response = await axios.get(`${API_BASE_URL}/market/sector/${sector}`);
      // Backend returns { success: true, data: [...] }
      return response.data.data || [];
    } catch (error) {
      console.error(`❌ Error fetching stocks for sector ${sector}:`, error);
      return [];
    }
  }

  // Convert to MarketData format for compatibility
  convertToMarketData(nseStock: NSEStock): MarketData {
    return {
      symbol: nseStock.symbol,
      company_name: nseStock.name,
      current_price: nseStock.price,
      change_percent: nseStock.changePercent,
      volume: nseStock.volume,
      market_cap: nseStock.marketCap,
      sector: nseStock.sector || 'Unknown'
    };
  }

  // Get formatted market data for components
  async getMarketData(): Promise<MarketData[]> {
    try {
      const stocks = await this.getNSEStocks();
      return stocks.map(stock => this.convertToMarketData(stock));
    } catch (error) {
      console.error('❌ Error getting market data:', error);
      return [];
    }
  }
}

export default new MarketService();
