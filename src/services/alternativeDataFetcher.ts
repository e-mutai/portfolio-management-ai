// Alternative to web scraping: Using publicly available financial APIs without authentication

export class AlternativeDataFetcher {
  // Free financial APIs that don't require authentication
  private readonly freeAPIs = {
    // Alpha Vantage demo key (limited requests)
    alphaVantage: 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=',
    
    // Financial Modeling Prep free tier
    fmp: 'https://financialmodelingprep.com/api/v3/quote/',
    
    // IEX Cloud free tier
    iex: 'https://cloud.iexapis.com/stable/stock/',
    
    // Twelve Data free tier
    twelveData: 'https://api.twelvedata.com/quote?symbol=',
    
    // Yahoo Finance unofficial (no auth needed)
    yahooQuery: 'https://query1.finance.yahoo.com/v8/finance/chart/',
  };

  async fetchNSEStocksAlternative(): Promise<any[]> {
    const nseSymbols = ['EQTY.NR', 'KCB.NR', 'SAFCOM.NR', 'EABL.NR', 'BAMB.NR'];
    const stocks: any[] = [];

    // Try Yahoo Finance Query API (most reliable, no auth needed)
    for (const symbol of nseSymbols) {
      try {
        const response = await fetch(`${this.freeAPIs.yahooQuery}${symbol}`);
        const data = await response.json();
        
        if (data.chart?.result?.[0]) {
          const result = data.chart.result[0];
          const meta = result.meta;
          const quote = result.indicators?.quote?.[0];
          
          if (meta && quote) {
            stocks.push({
              symbol: symbol.replace('.NR', ''),
              name: meta.longName || symbol,
              price: meta.regularMarketPrice || 0,
              change: (meta.regularMarketPrice || 0) - (meta.previousClose || 0),
              changePercent: ((meta.regularMarketPrice || 0) - (meta.previousClose || 0)) / (meta.previousClose || 1) * 100,
              volume: meta.regularMarketVolume || 0,
              sector: this.getSectorForSymbol(symbol.replace('.NR', ''))
            });
          }
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.warn(`Failed to fetch ${symbol} from Yahoo:`, error);
      }
    }

    return stocks;
  }

  // Try Financial Modeling Prep (free tier, no auth for some endpoints)
  async fetchFromFMP(): Promise<any[]> {
    const symbols = ['EQTY', 'KCB', 'SAFCOM'];
    const stocks: any[] = [];

    try {
      // Some FMP endpoints work without API key (limited)
      const response = await fetch(`${this.freeAPIs.fmp}${symbols.join(',')}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        data.forEach(stock => {
          if (stock.symbol && stock.price) {
            stocks.push({
              symbol: stock.symbol,
              name: stock.name || stock.symbol,
              price: stock.price,
              change: stock.change || 0,
              changePercent: stock.changesPercentage || 0,
              volume: stock.volume || 0,
              sector: this.getSectorForSymbol(stock.symbol)
            });
          }
        });
      }
    } catch (error) {
      console.warn('FMP API failed:', error);
    }

    return stocks;
  }

  // Alternative: Create synthetic realistic data based on market patterns
  generateRealisticMarketData(): any[] {
    const baseStocks = [
      { symbol: 'EQTY', name: 'Equity Group Holdings', basePrice: 45.50, volatility: 0.03, sector: 'Banking' },
      { symbol: 'KCB', name: 'KCB Group', basePrice: 38.75, volatility: 0.025, sector: 'Banking' },
      { symbol: 'SAFCOM', name: 'Safaricom', basePrice: 35.20, volatility: 0.02, sector: 'Telecommunications' },
      { symbol: 'EABL', name: 'East African Breweries', basePrice: 140.00, volatility: 0.015, sector: 'Consumer Goods' },
      { symbol: 'BAMB', name: 'Bamburi Cement', basePrice: 15.25, volatility: 0.04, sector: 'Manufacturing' },
      { symbol: 'COOP', name: 'Co-operative Bank', basePrice: 12.80, volatility: 0.03, sector: 'Banking' },
      { symbol: 'ABSA', name: 'Absa Bank Kenya', basePrice: 8.45, volatility: 0.035, sector: 'Banking' },
      { symbol: 'SCBK', name: 'Standard Chartered Bank', basePrice: 152.00, volatility: 0.025, sector: 'Banking' }
    ];

    const isMarketHours = this.isMarketOpen();
    const marketTrend = this.getMarketTrend();

    return baseStocks.map(stock => {
      // More sophisticated price simulation
      const trendFactor = marketTrend * 0.5; // Market trend influence
      const randomFactor = (Math.random() - 0.5) * 2; // Random movement
      const volatilityFactor = isMarketHours ? 1 : 0.3; // Less volatility after hours
      
      const totalMovement = (trendFactor + randomFactor) * stock.volatility * volatilityFactor;
      const newPrice = stock.basePrice * (1 + totalMovement);
      const change = newPrice - stock.basePrice;
      const changePercent = (change / stock.basePrice) * 100;
      
      return {
        symbol: stock.symbol,
        name: stock.name,
        price: parseFloat(newPrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: this.generateRealisticVolume(stock.symbol, isMarketHours),
        marketCap: this.calculateMarketCap(stock.symbol, newPrice),
        sector: stock.sector,
        high: parseFloat((newPrice * (1 + Math.random() * 0.02)).toFixed(2)),
        low: parseFloat((newPrice * (1 - Math.random() * 0.02)).toFixed(2)),
        timestamp: new Date().toISOString()
      };
    });
  }

  private isMarketOpen(): boolean {
    const now = new Date();
    const nairobiTime = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Nairobi"}));
    const hour = nairobiTime.getHours();
    const day = nairobiTime.getDay();
    
    return day >= 1 && day <= 5 && hour >= 9 && hour < 15;
  }

  private getMarketTrend(): number {
    // Simulate overall market trend (-1 to 1)
    const hour = new Date().getHours();
    const trends = {
      morning: 0.3,   // Positive bias in morning
      midday: 0,      // Neutral around noon
      afternoon: -0.1 // Slight negative bias in afternoon
    };
    
    if (hour >= 9 && hour < 12) return trends.morning + (Math.random() - 0.5) * 0.4;
    if (hour >= 12 && hour < 14) return trends.midday + (Math.random() - 0.5) * 0.6;
    return trends.afternoon + (Math.random() - 0.5) * 0.4;
  }

  private generateRealisticVolume(symbol: string, isMarketHours: boolean): number {
    const baseVolumes: { [key: string]: number } = {
      'EQTY': 125000,
      'KCB': 89000,
      'SAFCOM': 245000,
      'EABL': 15000,
      'BAMB': 67000,
      'COOP': 95000,
      'ABSA': 45000,
      'SCBK': 32000
    };
    
    const baseVolume = baseVolumes[symbol] || 50000;
    const hourlyFactor = isMarketHours ? (0.5 + Math.random()) : (0.1 + Math.random() * 0.3);
    
    return Math.floor(baseVolume * hourlyFactor);
  }

  private calculateMarketCap(symbol: string, price: number): number {
    // Estimated shares outstanding (in millions)
    const sharesOutstanding: { [key: string]: number } = {
      'EQTY': 3800,    // 3.8B shares
      'KCB': 3600,     // 3.6B shares  
      'SAFCOM': 40000, // 40B shares
      'EABL': 900,     // 900M shares
      'BAMB': 1500,    // 1.5B shares
      'COOP': 4200,    // 4.2B shares
      'ABSA': 2100,    // 2.1B shares
      'SCBK': 800      // 800M shares
    };
    
    const shares = sharesOutstanding[symbol] || 1000;
    return Math.floor(price * shares * 1000000); // Convert to actual market cap
  }

  private getSectorForSymbol(symbol: string): string {
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

  // Generate realistic NSE 20 index
  generateNSEIndex(): any {
    const baseIndex = 2847.5;
    const isMarketHours = this.isMarketOpen();
    const marketTrend = this.getMarketTrend();
    
    const indexMovement = marketTrend * 0.02 + (Math.random() - 0.5) * 0.015;
    const volatilityFactor = isMarketHours ? 1 : 0.4;
    const totalMovement = indexMovement * volatilityFactor;
    
    const newValue = baseIndex * (1 + totalMovement);
    const change = newValue - baseIndex;
    
    return {
      index: 'NSE 20',
      value: parseFloat(newValue.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(((change / baseIndex) * 100).toFixed(2)),
      volume: this.generateIndexVolume(isMarketHours),
      timestamp: new Date().toISOString(),
      status: isMarketHours ? 'OPEN' : 'CLOSED'
    };
  }

  private generateIndexVolume(isMarketHours: boolean): number {
    const baseVolume = 1200000;
    const factor = isMarketHours ? (0.7 + Math.random() * 0.6) : (0.1 + Math.random() * 0.3);
    return Math.floor(baseVolume * factor);
  }
}
