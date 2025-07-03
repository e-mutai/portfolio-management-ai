import api from './api';
import { MarketStock, MarketData, ApiResponse } from '@/types';
import { NSEWebScraper } from './webScraper';
import { AlternativeDataFetcher } from './alternativeDataFetcher';

export interface NSEStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  sector?: string;
}

export interface YFinanceQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  eps?: number;
  high52Week?: number;
  low52Week?: number;
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
  private readonly webScraper = new NSEWebScraper();
  private readonly NSE_API_BASE = 'https://afx-nse-data.p.rapidapi.com';
  private readonly ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';
  private readonly YAHOO_FINANCE_BASE = 'https://yahoo-finance15.p.rapidapi.com/api/yahoo';
  private cachedSampleData: NSEStock[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  // Primary method: Web scraping for real NSE data
  async getNSEStocks(): Promise<NSEStock[]> {
    console.log('🔄 Fetching NSE stocks data...');
    
    try {
      // Try web scraping first (most reliable for NSE)
      console.log('🌐 Attempting web scraping...');
      const scrapedData = await this.webScraper.scrapeNSEStocks();
      if (scrapedData && scrapedData.length > 0) {
        console.log(`✅ Web scraping successful: ${scrapedData.length} stocks retrieved`);
        return scrapedData;
      }
      console.log('⚠️ Web scraping returned no data');
    } catch (error) {
      console.warn('🚫 Web scraping failed, trying API fallbacks:', error);
    }

    try {
      // Fallback 1: Try RapidAPI if available
      if (import.meta.env.VITE_RAPIDAPI_KEY && import.meta.env.VITE_RAPIDAPI_KEY !== 'your_rapidapi_key_here') {
        console.log('🔑 Attempting RapidAPI fallback...');
        const rapidApiData = await this.fetchRealNSEData();
        if (rapidApiData && rapidApiData.length > 0) {
          console.log(`✅ RapidAPI fallback successful: ${rapidApiData.length} stocks retrieved`);
          return rapidApiData;
        }
        console.log('⚠️ RapidAPI returned no data');
      } else {
        console.log('🔑 No RapidAPI key configured, skipping API fallback');
      }
    } catch (error) {
      console.warn('🚫 RapidAPI fallback failed:', error);
    }

    try {
      // Fallback 2: Financial Modeling Prep (free tier)
      console.log('💼 Attempting Financial Modeling Prep...');
      const fmpData = await this.webScraper.scrapeFromFinancialModelingPrep();
      if (fmpData && fmpData.length > 0) {
        console.log(`✅ Financial Modeling Prep successful: ${fmpData.length} stocks retrieved`);
        return fmpData;
      }
      console.log('⚠️ Financial Modeling Prep returned no data');
    } catch (error) {
      console.warn('🚫 Financial Modeling Prep failed:', error);
    }

    // Final fallback: Enhanced sample data
    console.log('🎭 All real data sources failed, using enhanced sample data');
    const sampleData = this.getSampleNSEStocks();
    console.log(`✅ Sample data generated: ${sampleData.length} stocks`);
    return sampleData;
  }

  // Fetch real NSE data from RapidAPI
  private async fetchRealNSEData(): Promise<NSEStock[]> {
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'afx-nse-data.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(`${this.NSE_API_BASE}/v1/stocks/live`, options);
      if (!response.ok) throw new Error(`NSE API Error: ${response.status}`);
      
      const data = await response.json();
      return this.transformNSEData(data);
    } catch (error) {
      console.error('NSE RapidAPI fetch failed:', error);
      throw error;
    }
  }

  // Fetch NSE stocks from Yahoo Finance as backup
  private async fetchNSEFromYahoo(): Promise<NSEStock[]> {
    const nseSymbols = ['EQTY.NR', 'KCB.NR', 'SAFCOM.NR', 'EABL.NR', 'BAMB.NR', 'COOP.NR', 'ABSA.NR', 'SCBK.NR'];
    const stocks: NSEStock[] = [];

    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
      }
    };

    try {
      for (const symbol of nseSymbols.slice(0, 5)) { // Limit to 5 to avoid rate limits
        try {
          const response = await fetch(
            `${this.YAHOO_FINANCE_BASE}/qu/quote/${symbol}/financial-data`,
            options
          );
          
          if (response.ok) {
            const data = await response.json();
            const stock = this.transformYahooData(data, symbol);
            if (stock) stocks.push(stock);
          }
          
          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.warn(`Failed to fetch ${symbol}:`, error);
        }
      }
      
      return stocks;
    } catch (error) {
      console.error('Yahoo Finance batch fetch failed:', error);
      throw error;
    }
  }

  // Transform NSE API data to our format
  private transformNSEData(data: any): NSEStock[] {
    try {
      if (!data || !Array.isArray(data.stocks)) return [];
      
      return data.stocks.map((stock: any) => ({
        symbol: stock.symbol || stock.code,
        name: stock.name || stock.company_name,
        price: parseFloat(stock.price || stock.last_price || 0),
        change: parseFloat(stock.change || 0),
        changePercent: parseFloat(stock.change_percent || stock.changePercent || 0),
        volume: parseInt(stock.volume || stock.traded_volume || 0),
        marketCap: parseFloat(stock.market_cap || 0),
        sector: stock.sector || 'Unknown'
      })).filter(stock => stock.price > 0);
    } catch (error) {
      console.error('Error transforming NSE data:', error);
      return [];
    }
  }

  // Transform Yahoo Finance data to our format
  private transformYahooData(data: any, symbol: string): NSEStock | null {
    try {
      if (!data) return null;
      
      const price = parseFloat(data.currentPrice || data.regularMarketPrice || 0);
      const previousClose = parseFloat(data.previousClose || data.regularMarketPreviousClose || price);
      const change = price - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
      
      return {
        symbol: symbol.replace('.NR', ''),
        name: data.longName || data.shortName || symbol,
        price: price,
        change: change,
        changePercent: changePercent,
        volume: parseInt(data.volume || data.regularMarketVolume || 0),
        marketCap: parseFloat(data.marketCap || 0),
        sector: data.sector || 'Unknown'
      };
    } catch (error) {
      console.error('Error transforming Yahoo data:', error);
      return null;
    }
  }

  // Get real-time NSE index data via web scraping
  async getNSEMarketData(): Promise<MarketSummary | null> {
    try {
      // Scraping NSE index data...
      
      // Try web scraping first
      const scrapedIndex = await this.webScraper.scrapeNSEIndex();
      if (scrapedIndex) {
        // NSE index data scraped successfully
        return scrapedIndex;
      }
    } catch (error) {
      console.warn('🚫 NSE index scraping failed:', error);
    }

    try {
      // Fallback to RapidAPI if available
      if (import.meta.env.VITE_RAPIDAPI_KEY && import.meta.env.VITE_RAPIDAPI_KEY !== 'your_rapidapi_key_here') {
        const options = {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY || '',
            'X-RapidAPI-Host': 'afx-nse-data.p.rapidapi.com'
          }
        };

        const response = await fetch(`${this.NSE_API_BASE}/v1/indices`, options);
        if (response.ok) {
          const data = await response.json();
          
          return {
            index: 'NSE 20',
            value: parseFloat(data.nse20?.value || 2850),
            change: parseFloat(data.nse20?.change || 15.5),
            changePercent: parseFloat(data.nse20?.changePercent || 0.55),
            volume: parseInt(data.totalVolume || 1500000),
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (error) {
      console.warn('🚫 NSE index API fallback failed:', error);
    }

    // Enhanced fallback with realistic market simulation
    // Using simulated NSE index data
    const baseValue = 2847.5;
    const marketHours = this.isMarketHours();
    const volatility = marketHours ? 0.02 : 0.005; // Higher volatility during market hours
    const change = (Math.random() - 0.5) * baseValue * volatility;
    
    return {
      index: 'NSE 20',
      value: parseFloat((baseValue + change).toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(((change / baseValue) * 100).toFixed(2)),
      volume: Math.floor(Math.random() * 500000) + 1000000,
      timestamp: new Date().toISOString()
    };
  }

  private isMarketHours(): boolean {
    const now = new Date();
    const nairobiTime = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Nairobi"}));
    const hour = nairobiTime.getHours();
    const day = nairobiTime.getDay();
    
    // NSE trading hours: Monday-Friday, 9:00 AM - 3:00 PM EAT
    return day >= 1 && day <= 5 && hour >= 9 && hour < 15;
  }

  // Enhanced sample data with realistic market simulation for demo purposes
  getSampleNSEStocks(): NSEStock[] {
    // Use cached data if still fresh (within cache duration)
    const now = Date.now();
    if (this.cachedSampleData && (now - this.cacheTimestamp < this.CACHE_DURATION)) {
      return this.cachedSampleData;
    }

    // Expanded list of real NSE-listed companies for more realistic variety
    const baseStocks = [
      // Banking Sector
      { symbol: 'EQTY', name: 'Equity Group Holdings', basePrice: 45.50, sector: 'Banking' },
      { symbol: 'KCB', name: 'KCB Group', basePrice: 38.75, sector: 'Banking' },
      { symbol: 'COOP', name: 'Co-operative Bank', basePrice: 12.80, sector: 'Banking' },
      { symbol: 'ABSA', name: 'Absa Bank Kenya', basePrice: 11.50, sector: 'Banking' },
      { symbol: 'SCBK', name: 'Standard Chartered Bank', basePrice: 158.00, sector: 'Banking' },
      { symbol: 'DTBK', name: 'Diamond Trust Bank', basePrice: 75.00, sector: 'Banking' },
      { symbol: 'HFCK', name: 'HF Group', basePrice: 3.85, sector: 'Banking' },
      { symbol: 'I&M', name: 'I&M Holdings', basePrice: 24.50, sector: 'Banking' },
      
      // Telecommunications & Technology
      { symbol: 'SCOM', name: 'Safaricom PLC', basePrice: 35.20, sector: 'Telecommunications' },
      
      // Consumer Goods & Beverages
      { symbol: 'EABL', name: 'East African Breweries', basePrice: 140.00, sector: 'Consumer Goods' },
      { symbol: 'BAT', name: 'British American Tobacco', basePrice: 520.00, sector: 'Consumer Goods' },
      { symbol: 'UNGA', name: 'Unga Group', basePrice: 18.75, sector: 'Consumer Goods' },
      { symbol: 'KWAL', name: 'Kenya Wine Agencies', basePrice: 22.30, sector: 'Consumer Goods' },
      
      // Manufacturing & Construction
      { symbol: 'BAMB', name: 'Bamburi Cement', basePrice: 15.25, sector: 'Manufacturing' },
      { symbol: 'ARMB', name: 'ARM Cement', basePrice: 2.10, sector: 'Manufacturing' },
      { symbol: 'CRWN', name: 'Crown Paints', basePrice: 13.40, sector: 'Manufacturing' },
      
      // Energy & Utilities
      { symbol: 'KENO', name: 'KenolKobil', basePrice: 14.80, sector: 'Energy' },
      { symbol: 'TOTAL', name: 'Total Kenya', basePrice: 18.90, sector: 'Energy' },
      { symbol: 'UMEME', name: 'Umeme Limited', basePrice: 6.75, sector: 'Utilities' },
      { symbol: 'KEGN', name: 'Kenya Electricity Generating', basePrice: 2.65, sector: 'Utilities' },
      
      // Investment & Financial Services
      { symbol: 'CTUM', name: 'Centum Investment Company', basePrice: 22.75, sector: 'Investment' },
      { symbol: 'NSE', name: 'Nairobi Securities Exchange', basePrice: 9.40, sector: 'Financial Services' },
      { symbol: 'BRITAM', name: 'Britam Holdings', basePrice: 8.90, sector: 'Insurance' },
      { symbol: 'JUB', name: 'Jubilee Holdings', basePrice: 295.00, sector: 'Insurance' },
      
      // Agriculture & Food
      { symbol: 'KAKUZI', name: 'Kakuzi Limited', basePrice: 385.00, sector: 'Agriculture' },
      { symbol: 'FLAME', name: 'Flame Tree Group', basePrice: 4.75, sector: 'Agriculture' },
      
      // Real Estate & Construction
      { symbol: 'HF', name: 'Home Afrika Limited', basePrice: 1.95, sector: 'Real Estate' },
      
      // Transport & Logistics
      { symbol: 'KQAIR', name: 'Kenya Airways', basePrice: 4.12, sector: 'Transport' },
      
      // Retail & Commercial
      { symbol: 'TPS', name: 'TPS Eastern Africa', basePrice: 1.48, sector: 'Commercial' },
      { symbol: 'SCAN', name: 'Scangroup', basePrice: 8.25, sector: 'Commercial' },
    ];

    // Shuffle the stocks to ensure different companies appear as top gainers/losers each time
    const shuffledStocks = [...baseStocks].sort(() => Math.random() - 0.5);

    // Generate realistic market movements ensuring clear gainers and losers
    const sampleData = shuffledStocks.map((stock, index) => {
      let changePercent: number;
      
      // Ensure we have a good distribution of gainers and losers
      if (index < 8) {
        // Top gainers: 3-8% positive change
        changePercent = Math.random() * 5 + 3; // 3% to 8%
      } else if (index < 16) {
        // Top losers: 2-7% negative change
        changePercent = -(Math.random() * 5 + 2); // -2% to -7%
      } else if (index < 22) {
        // Moderate gainers: 0.5-3% positive
        changePercent = Math.random() * 2.5 + 0.5; // 0.5% to 3%
      } else if (index < 26) {
        // Moderate losers: 0.5-2% negative
        changePercent = -(Math.random() * 1.5 + 0.5); // -0.5% to -2%
      } else {
        // Small movements: -1% to +1%
        changePercent = (Math.random() * 2 - 1); // -1% to +1%
      }
      
      const change = (stock.basePrice * changePercent) / 100;
      const currentPrice = Math.max(0.1, stock.basePrice + change); // Prevent negative prices
      
      // Generate realistic volume (varies by stock size and sector)
      let baseVolume: number;
      if (stock.sector === 'Banking' || stock.symbol === 'SCOM') {
        baseVolume = 150000; // High volume for major stocks
      } else if (stock.basePrice > 100) {
        baseVolume = 25000; // Lower volume for expensive stocks
      } else {
        baseVolume = 75000; // Standard volume
      }
      
      const volumeVariation = Math.random() * 0.6 + 0.7; // 70-130% of base volume
      const volume = Math.floor(baseVolume * volumeVariation);

      return {
        symbol: stock.symbol,
        name: stock.name,
        price: Number(currentPrice.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        volume,
        sector: stock.sector,
        marketCap: Math.floor(currentPrice * volume * (Math.random() * 40 + 20)) // Estimated market cap
      };
    });

    // Sort by change percent to ensure top gainers and losers are properly identified
    sampleData.sort((a, b) => b.changePercent - a.changePercent);

    // Cache the generated data
    this.cachedSampleData = sampleData;
    this.cacheTimestamp = now;
    
    console.log(`📊 Generated sample NSE data with ${sampleData.filter(s => s.changePercent > 0).length} gainers and ${sampleData.filter(s => s.changePercent < 0).length} losers`);
    
    return sampleData;
  }

  // Clear cached sample data (useful for testing)
  clearCache(): void {
    this.cachedSampleData = null;
    this.cacheTimestamp = 0;
    console.log('🗑️ Market data cache cleared');
  }

  // Force refresh sample data
  refreshSampleData(): NSEStock[] {
    this.clearCache();
    return this.getSampleNSEStocks();
  }

  // Get specific NSE stock with real-time data
  async getNSEStock(symbol: string): Promise<NSEStock | null> {
    try {
      // Try Yahoo Finance for individual stock
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY || '',
          'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
        }
      };

      const response = await fetch(
        `${this.YAHOO_FINANCE_BASE}/qu/quote/${symbol}.NR/financial-data`,
        options
      );
      
      if (response.ok) {
        const data = await response.json();
        return this.transformYahooData(data, symbol);
      }
    } catch (error) {
      console.error(`Error fetching NSE stock ${symbol}:`, error);
    }
    
    // Fallback to sample data for the requested symbol
    const sampleStocks = this.getSampleNSEStocks();
    return sampleStocks.find(stock => stock.symbol === symbol) || null;
  }

  // Get real-time top gainers
  async getNSETopGainers(): Promise<NSEStock[]> {
    try {
      const allStocks = await this.getNSEStocks();
      const gainers = allStocks
        .filter(stock => stock.changePercent > 0)
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 10);
      
      console.log(`📈 Top Gainers (${gainers.length} found):`, 
        gainers.slice(0, 5).map(s => `${s.symbol}: +${s.changePercent}%`).join(', ')
      );
      
      return gainers;
    } catch (error) {
      console.error('Error fetching top gainers:', error);
      const fallbackGainers = this.getSampleNSEStocks().filter(stock => stock.changePercent > 0);
      console.log('📈 Using fallback gainers:', fallbackGainers.slice(0, 5).map(s => `${s.symbol}: +${s.changePercent}%`).join(', '));
      return fallbackGainers;
    }
  }

  // Get real-time top losers
  async getNSETopLosers(): Promise<NSEStock[]> {
    try {
      const allStocks = await this.getNSEStocks();
      const losers = allStocks
        .filter(stock => stock.changePercent < 0)
        .sort((a, b) => a.changePercent - b.changePercent)
        .slice(0, 10);
      
      console.log(`📉 Top Losers (${losers.length} found):`, 
        losers.slice(0, 5).map(s => `${s.symbol}: ${s.changePercent}%`).join(', ')
      );
      
      return losers;
    } catch (error) {
      console.error('Error fetching top losers:', error);
      const fallbackLosers = this.getSampleNSEStocks().filter(stock => stock.changePercent < 0);
      console.log('📉 Using fallback losers:', fallbackLosers.slice(0, 5).map(s => `${s.symbol}: ${s.changePercent}%`).join(', '));
      return fallbackLosers;
    }
  }

  // YFinance API methods with real data
  async getYFinanceQuote(symbol: string): Promise<YFinanceQuote | null> {
    try {
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY || '',
          'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
        }
      };

      const response = await fetch(
        `${this.YAHOO_FINANCE_BASE}/qu/quote/${symbol}`,
        options
      );

      if (!response.ok) throw new Error(`Yahoo Finance API Error: ${response.status}`);
      
      const data = await response.json();
      
      return {
        symbol: symbol,
        price: parseFloat(data.regularMarketPrice || data.currentPrice || 0),
        change: parseFloat(data.regularMarketChange || 0),
        changePercent: parseFloat(data.regularMarketChangePercent || 0),
        volume: parseInt(data.regularMarketVolume || data.volume || 0),
        marketCap: parseFloat(data.marketCap || 0),
        pe: parseFloat(data.trailingPE || 0),
        eps: parseFloat(data.trailingEps || 0),
        high52Week: parseFloat(data.fiftyTwoWeekHigh || 0),
        low52Week: parseFloat(data.fiftyTwoWeekLow || 0)
      };
    } catch (error) {
      console.error(`Error fetching Yahoo Finance quote for ${symbol}:`, error);
      return null;
    }
  }

  async getHistoricalData(symbol: string, period: string = '1y'): Promise<HistoricalData[]> {
    try {
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY || '',
          'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
        }
      };

      const response = await fetch(
        `${this.YAHOO_FINANCE_BASE}/qu/chart/${symbol}?interval=1d&range=${period}`,
        options
      );

      if (!response.ok) throw new Error(`Historical data API Error: ${response.status}`);
      
      const data = await response.json();
      
      if (!data.chart?.result?.[0]?.timestamp) return [];
      
      const timestamps = data.chart.result[0].timestamp;
      const quotes = data.chart.result[0].indicators.quote[0];
      
      return timestamps.map((timestamp: number, index: number) => ({
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        open: parseFloat(quotes.open[index] || 0),
        high: parseFloat(quotes.high[index] || 0),
        low: parseFloat(quotes.low[index] || 0),
        close: parseFloat(quotes.close[index] || 0),
        volume: parseInt(quotes.volume[index] || 0),
        adjustedClose: parseFloat(data.chart.result[0].indicators.adjclose?.[0]?.adjclose?.[index] || quotes.close[index] || 0)
      })).filter(item => item.close > 0);
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return [];
    }
  }

  async searchSymbols(query: string): Promise<any[]> {
    try {
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY || '',
          'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
        }
      };

      const response = await fetch(
        `${this.YAHOO_FINANCE_BASE}/se/search?q=${encodeURIComponent(query)}`,
        options
      );

      if (!response.ok) throw new Error(`Search API Error: ${response.status}`);
      
      const data = await response.json();
      return data.quotes || [];
    } catch (error) {
      console.error(`Error searching symbols for ${query}:`, error);
      return [];
    }
  }

  // Real-time market status
  async getMarketStatus(): Promise<{
    isOpen: boolean;
    nextOpenTime?: string;
    nextCloseTime?: string;
    timezone: string;
  }> {
    const now = new Date();
    const nairobiTime = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Nairobi"}));
    const hour = nairobiTime.getHours();
    const day = nairobiTime.getDay();
    
    // NSE trading hours: Monday-Friday, 9:00 AM - 3:00 PM EAT
    const isWeekday = day >= 1 && day <= 5;
    const isTradeHours = hour >= 9 && hour < 15;
    const isOpen = isWeekday && isTradeHours;
    
    return {
      isOpen,
      timezone: 'Africa/Nairobi',
      nextOpenTime: isOpen ? undefined : this.getNextOpenTime(nairobiTime),
      nextCloseTime: isOpen ? this.getNextCloseTime(nairobiTime) : undefined
    };
  }

  private getNextOpenTime(now: Date): string {
    const nextOpen = new Date(now);
    if (now.getDay() === 6) { // Saturday
      nextOpen.setDate(now.getDate() + 2); // Monday
    } else if (now.getDay() === 0) { // Sunday
      nextOpen.setDate(now.getDate() + 1); // Monday
    } else if (now.getHours() >= 15) { // After market close
      nextOpen.setDate(now.getDate() + 1); // Next day
    }
    nextOpen.setHours(9, 0, 0, 0);
    return nextOpen.toISOString();
  }

  private getNextCloseTime(now: Date): string {
    const nextClose = new Date(now);
    nextClose.setHours(15, 0, 0, 0);
    return nextClose.toISOString();
  }
}

export default new MarketService();
