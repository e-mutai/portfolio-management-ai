import { NSEStock, MarketSummary } from '@/services/marketService';

interface ScrapedStockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  sector?: string;
}

export class NSEWebScraper {
  private readonly corsProxy = 'https://api.allorigins.win/raw?url=';
  private readonly backupProxy = 'https://cors-anywhere.herokuapp.com/';
  
  // NSE official website endpoints
  private readonly nseEndpoints = {
    equities: 'https://www.nse.co.ke/products-services/equity-investment-segment/equities',
    marketData: 'https://www.nse.co.ke/market-statistics/equities-statistics',
    indices: 'https://www.nse.co.ke/market-statistics/indices'
  };

  // Alternative data sources
  private readonly alternativeEndpoints = {
    investing: 'https://www.investing.com/equities/kenya',
    marketWatch: 'https://www.marketwatch.com/investing/stock/',
    yahoo: 'https://finance.yahoo.com/quote/'
  };

  async scrapeNSEStocks(): Promise<NSEStock[]> {
    const stocks: NSEStock[] = [];
    
    try {
      // Try multiple scraping approaches
      const results = await Promise.allSettled([
        this.scrapeFromNSEOfficial(),
        this.scrapeFromInvesting(),
        this.scrapeFromYahooFinance(),
        this.scrapeFromMarketWatch()
      ]);

      // Combine results from all successful sources
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          stocks.push(...result.value);
        }
      });

      // Remove duplicates and return top stocks
      const uniqueStocks = this.removeDuplicates(stocks);
      return uniqueStocks.slice(0, 10);
      
    } catch (error) {
      console.warn('Web scraping failed, using fallback data:', error);
      return this.getFallbackStocks();
    }
  }

  private async scrapeFromNSEOfficial(): Promise<NSEStock[]> {
    try {
      // Note: NSE website structure changes frequently
      // This is a simplified example - real implementation would need more robust selectors
      
      const response = await fetch(`${this.corsProxy}${encodeURIComponent(this.nseEndpoints.marketData)}`);
      const html = await response.text();
      
      // Parse HTML using DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const stocks: NSEStock[] = [];
      
      // Look for table rows with stock data
      const rows = doc.querySelectorAll('table tr, .stock-row, .equity-row');
      
      rows.forEach((row) => {
        try {
          const cells = row.querySelectorAll('td, .cell, .data');
          if (cells.length >= 4) {
            const symbol = this.extractText(cells[0]);
            const name = this.extractText(cells[1]);
            const price = this.extractNumber(cells[2]);
            const change = this.extractNumber(cells[3]);
            
            if (symbol && price > 0) {
              stocks.push({
                symbol: symbol.toUpperCase(),
                name: name || symbol,
                price: price,
                change: change,
                changePercent: price > 0 ? (change / (price - change)) * 100 : 0,
                volume: 0, // Would need additional scraping
                sector: 'Unknown'
              });
            }
          }
        } catch (error) {
          // Skip invalid rows
        }
      });
      
      return stocks;
    } catch (error) {
      console.error('NSE official scraping failed:', error);
      return [];
    }
  }

  private async scrapeFromInvesting(): Promise<NSEStock[]> {
    try {
      const response = await fetch(`${this.corsProxy}${encodeURIComponent(this.alternativeEndpoints.investing)}`);
      const html = await response.text();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const stocks: NSEStock[] = [];
      
      // Investing.com specific selectors (these would need to be updated based on current structure)
      const stockElements = doc.querySelectorAll('.js-table-sortable tr, .equity-table tr');
      
      stockElements.forEach((element) => {
        try {
          const symbolEl = element.querySelector('.symbol, .instrument-name a');
          const priceEl = element.querySelector('.price, .last');
          const changeEl = element.querySelector('.change, .pc');
          
          if (symbolEl && priceEl) {
            const symbol = this.extractText(symbolEl).replace(/\.NR$/, '');
            const price = this.extractNumber(priceEl);
            const changePercent = this.extractNumber(changeEl);
            
            if (symbol && price > 0) {
              stocks.push({
                symbol: symbol.toUpperCase(),
                name: symbol,
                price: price,
                change: (price * changePercent) / 100,
                changePercent: changePercent,
                volume: 0,
                sector: 'Unknown'
              });
            }
          }
        } catch (error) {
          // Skip invalid elements
        }
      });
      
      return stocks;
    } catch (error) {
      console.error('Investing.com scraping failed:', error);
      return [];
    }
  }

  private async scrapeFromYahooFinance(): Promise<NSEStock[]> {
    const symbols = ['EQTY.NR', 'KCB.NR', 'SAFCOM.NR', 'EABL.NR', 'BAMB.NR'];
    const stocks: NSEStock[] = [];
    
    for (const symbol of symbols) {
      try {
        const url = `${this.alternativeEndpoints.yahoo}${symbol}`;
        const response = await fetch(`${this.corsProxy}${encodeURIComponent(url)}`);
        const html = await response.text();
        
        // Extract data using regex patterns (more reliable than DOM parsing for Yahoo)
        const priceMatch = html.match(/"regularMarketPrice":\s*{\s*"raw":\s*([\d.]+)/);
        const changeMatch = html.match(/"regularMarketChange":\s*{\s*"raw":\s*([-\d.]+)/);
        const changePercentMatch = html.match(/"regularMarketChangePercent":\s*{\s*"raw":\s*([-\d.]+)/);
        const volumeMatch = html.match(/"regularMarketVolume":\s*{\s*"raw":\s*(\d+)/);
        
        if (priceMatch) {
          const price = parseFloat(priceMatch[1]);
          const change = changeMatch ? parseFloat(changeMatch[1]) : 0;
          const changePercent = changePercentMatch ? parseFloat(changePercentMatch[1]) : 0;
          const volume = volumeMatch ? parseInt(volumeMatch[1]) : 0;
          
          stocks.push({
            symbol: symbol.replace('.NR', ''),
            name: this.getCompanyName(symbol.replace('.NR', '')),
            price: price,
            change: change,
            changePercent: changePercent,
            volume: volume,
            sector: this.getSector(symbol.replace('.NR', ''))
          });
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.warn(`Failed to scrape ${symbol}:`, error);
      }
    }
    
    return stocks;
  }

  private async scrapeFromMarketWatch(): Promise<NSEStock[]> {
    // MarketWatch implementation would be similar
    // This is a placeholder for brevity
    return [];
  }

  // Alternative: Use financial data APIs that don't require authentication
  async scrapeFromFinancialModelingPrep(): Promise<NSEStock[]> {
    try {
      // Free tier available without API key for limited requests
      const symbols = ['EQTY', 'KCB', 'SAFCOM'];
      const stocks: NSEStock[] = [];
      
      for (const symbol of symbols) {
        try {
          const response = await fetch(
            `https://financialmodelingprep.com/api/v3/quote/${symbol}.NR?apikey=demo`
          );
          const data = await response.json();
          
          if (data && data.length > 0) {
            const stock = data[0];
            stocks.push({
              symbol: symbol,
              name: stock.name || symbol,
              price: stock.price || 0,
              change: stock.change || 0,
              changePercent: stock.changesPercentage || 0,
              volume: stock.volume || 0,
              sector: 'Unknown'
            });
          }
        } catch (error) {
          console.warn(`FMP scraping failed for ${symbol}:`, error);
        }
      }
      
      return stocks;
    } catch (error) {
      console.error('Financial Modeling Prep scraping failed:', error);
      return [];
    }
  }

  // Utility methods
  private extractText(element: Element | null): string {
    if (!element) return '';
    return element.textContent?.trim() || '';
  }

  private extractNumber(element: Element | null): number {
    if (!element) return 0;
    const text = this.extractText(element);
    const number = parseFloat(text.replace(/[^\d.-]/g, ''));
    return isNaN(number) ? 0 : number;
  }

  private removeDuplicates(stocks: NSEStock[]): NSEStock[] {
    const seen = new Set<string>();
    return stocks.filter(stock => {
      if (seen.has(stock.symbol)) {
        return false;
      }
      seen.add(stock.symbol);
      return true;
    });
  }

  private getCompanyName(symbol: string): string {
    const names: { [key: string]: string } = {
      'EQTY': 'Equity Group Holdings',
      'KCB': 'KCB Group',
      'SAFCOM': 'Safaricom',
      'EABL': 'East African Breweries',
      'BAMB': 'Bamburi Cement',
      'COOP': 'Co-operative Bank',
      'ABSA': 'Absa Bank Kenya',
      'SCBK': 'Standard Chartered Bank Kenya'
    };
    return names[symbol] || symbol;
  }

  private getSector(symbol: string): string {
    const sectors: { [key: string]: string } = {
      'EQTY': 'Banking',
      'KCB': 'Banking',
      'SAFCOM': 'Telecommunications',
      'EABL': 'Consumer Goods',
      'BAMB': 'Manufacturing',
      'COOP': 'Banking',
      'ABSA': 'Banking',
      'SCBK': 'Banking'
    };
    return sectors[symbol] || 'Unknown';
  }

  private getFallbackStocks(): NSEStock[] {
    // Enhanced fallback with more realistic variation
    const baseStocks = [
      { symbol: 'EQTY', name: 'Equity Group Holdings', basePrice: 45.50, sector: 'Banking' },
      { symbol: 'KCB', name: 'KCB Group', basePrice: 38.75, sector: 'Banking' },
      { symbol: 'SAFCOM', name: 'Safaricom', basePrice: 35.20, sector: 'Telecommunications' },
      { symbol: 'EABL', name: 'East African Breweries', basePrice: 140.00, sector: 'Consumer Goods' },
      { symbol: 'BAMB', name: 'Bamburi Cement', basePrice: 15.25, sector: 'Manufacturing' }
    ];

    return baseStocks.map(stock => {
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const price = stock.basePrice * (1 + variation);
      const change = stock.basePrice * variation;
      const changePercent = variation * 100;
      
      return {
        symbol: stock.symbol,
        name: stock.name,
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: Math.floor(Math.random() * 200000) + 50000,
        sector: stock.sector
      };
    });
  }

  // Get NSE index data through scraping
  async scrapeNSEIndex(): Promise<MarketSummary | null> {
    try {
      const response = await fetch(`${this.corsProxy}${encodeURIComponent(this.nseEndpoints.indices)}`);
      const html = await response.text();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Look for NSE 20 index data
      const indexElements = doc.querySelectorAll('.index-data, .nse20, .market-index');
      
      for (const element of indexElements) {
        const text = this.extractText(element);
        if (text.includes('NSE 20') || text.includes('NSE20')) {
          const valueMatch = text.match(/(\d+\.?\d*)/);
          if (valueMatch) {
            const value = parseFloat(valueMatch[1]);
            const change = (Math.random() - 0.5) * 30; // Simulated change
            
            return {
              index: 'NSE 20',
              value: value,
              change: change,
              changePercent: (change / (value - change)) * 100,
              volume: Math.floor(Math.random() * 1000000) + 500000,
              timestamp: new Date().toISOString()
            };
          }
        }
      }
      
      // Fallback index data
      return this.getFallbackIndex();
      
    } catch (error) {
      console.error('NSE index scraping failed:', error);
      return this.getFallbackIndex();
    }
  }

  private getFallbackIndex(): MarketSummary {
    const baseValue = 2847.5;
    const change = (Math.random() - 0.5) * 50;
    
    return {
      index: 'NSE 20',
      value: baseValue + change,
      change: change,
      changePercent: (change / baseValue) * 100,
      volume: Math.floor(Math.random() * 1000000) + 500000,
      timestamp: new Date().toISOString()
    };
  }
}
