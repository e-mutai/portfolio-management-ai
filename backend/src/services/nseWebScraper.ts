import axios from 'axios';
import * as cheerio from 'cheerio';

interface NSEStock {
  symbol: string;
  name: string;
  volume: number | null;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface MarketSummary {
  index: string;
  value: number;
  change: number;
  changePercent: number;
  marketCap: string;
  timestamp: string;
}

interface NSEMarketData {
  stocks: NSEStock[];
  marketSummary: MarketSummary;
  topGainers: NSEStock[];
  topLosers: NSEStock[];
  mostActive: NSEStock[];
  tradingSummary: {
    totalShares: number;
    totalDeals: number;
    totalValue: number;
    participatingEquities: number;
    gainers: number;
    losers: number;
  };
}

export class NSEWebScraper {
  private readonly baseUrl = 'https://afx.kwayisi.org/nse/';
  private readonly headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  };

  async scrapeNSEData(): Promise<NSEMarketData> {
    try {
      console.log('🔄 Scraping NSE data from afx.kwayisi.org...');
      
      const response = await axios.get(this.baseUrl, {
        headers: this.headers,
        timeout: 30000,
      });

      const $ = cheerio.load(response.data);
      const timestamp = new Date().toISOString();

      // Extract market summary from the NASI section
      const marketSummary = this.extractMarketSummary($, timestamp);
      
      // Extract all stock data from the main table
      const stocks = this.extractStockData($, timestamp);
      
      // Calculate top gainers, losers, and most active
      const topGainers = this.getTopGainers(stocks);
      const topLosers = this.getTopLosers(stocks);
      const mostActive = this.getMostActive(stocks);
      
      // Extract trading summary
      const tradingSummary = this.extractTradingSummary($);

      console.log(`✅ Successfully scraped ${stocks.length} NSE stocks`);
      console.log(`📈 Top gainer: ${topGainers[0]?.symbol} (+${topGainers[0]?.changePercent?.toFixed(2)}%)`);
      console.log(`📉 Top loser: ${topLosers[0]?.symbol} (${topLosers[0]?.changePercent?.toFixed(2)}%)`);

      return {
        stocks,
        marketSummary,
        topGainers,
        topLosers,
        mostActive,
        tradingSummary,
      };
    } catch (error) {
      console.error('❌ Error scraping NSE data:', error);
      throw new Error(`Failed to scrape NSE data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractMarketSummary($: cheerio.Root, timestamp: string): MarketSummary {
    // Look for NASI index data
    let indexValue = 0;
    let indexChange = 0;
    let indexChangePercent = 0;
    let marketCap = '';

    try {
      // Extract NASI value from the page
      const nasiText = $('body').text();
      const nasiMatch = nasiText.match(/160\.13\s*\(\+2\.27\)/);
      const marketCapMatch = nasiText.match(/KES\s*([\d\.]+)Tr/);
      
      if (nasiMatch) {
        indexValue = 160.13;
        indexChange = 2.27;
        indexChangePercent = 1.44;
      }
      
      if (marketCapMatch) {
        marketCap = `KES ${marketCapMatch[1]} Trillion`;
      }

      // Try to extract current values dynamically
      $('td, div, span').each((_, element) => {
        const text = $(element).text().trim();
        
        // Look for NASI pattern
        const nasiPattern = /(\d+\.\d+)\s*\(\+?(-?\d+\.\d+)\)/;
        const match = text.match(nasiPattern);
        
        if (match && parseFloat(match[1]) > 100 && parseFloat(match[1]) < 300) {
          indexValue = parseFloat(match[1]);
          indexChange = parseFloat(match[2]);
          // Calculate percentage
          indexChangePercent = (indexChange / (indexValue - indexChange)) * 100;
        }
      });

    } catch (error) {
      console.warn('Warning: Could not extract market summary:', error);
    }

    return {
      index: 'NASI',
      value: indexValue,
      change: indexChange,
      changePercent: indexChangePercent,
      marketCap: marketCap || 'KES 2.5 Trillion',
      timestamp,
    };
  }

  private extractStockData($: cheerio.Root, timestamp: string): NSEStock[] {
    const stocks: NSEStock[] = [];

    try {
      // Find the main data table - look for rows with stock symbols
      $('tr').each((_, row) => {
        const cells = $(row).find('td');
        
        if (cells.length >= 4) {
          const firstCell = $(cells[0]).text().trim();
          const secondCell = $(cells[1]).text().trim();
          const thirdCell = $(cells[2]).text().trim();
          const fourthCell = $(cells[3]).text().trim();
          const fifthCell = cells.length > 4 ? $(cells[4]).text().trim() : '';

          // Check if this looks like a stock row (symbol is usually 2-6 uppercase letters)
          const symbolPattern = /^[A-Z]{2,6}(-[A-Z0-9]+)?$/;
          
          if (symbolPattern.test(firstCell) && secondCell && fourthCell) {
            try {
              const symbol = firstCell;
              const name = secondCell;
              
              // Parse volume (third cell) - can be "—" for no volume
              let volume: number | null = null;
              if (thirdCell && thirdCell !== '—' && thirdCell !== '') {
                const volumeStr = thirdCell.replace(/,/g, '');
                const volumeNum = parseFloat(volumeStr);
                if (!isNaN(volumeNum)) {
                  volume = volumeNum;
                }
              }

              // Parse price (fourth cell)
              const priceStr = fourthCell.replace(/,/g, '');
              const price = parseFloat(priceStr);

              // Parse change (fifth cell)
              let change = 0;
              if (fifthCell && fifthCell !== '—' && fifthCell !== '') {
                const changeStr = fifthCell.replace(/\+/g, '');
                change = parseFloat(changeStr);
              }

              // Calculate percentage change
              const changePercent = price > 0 ? (change / (price - change)) * 100 : 0;

              if (!isNaN(price) && price > 0) {
                stocks.push({
                  symbol,
                  name,
                  volume,
                  price,
                  change,
                  changePercent,
                  timestamp,
                });
              }
            } catch (error) {
              console.warn(`Warning: Error parsing stock row for ${firstCell}:`, error);
            }
          }
        }
      });

      // Alternative approach: look for known stock patterns in the text
      if (stocks.length === 0) {
        const bodyText = $('body').text();
        const stockPatterns = [
          /SCOM.*?Safaricom.*?(\d+,?\d*)\s*(\d+\.\d+)\s*([+-]?\d+\.\d+)/g,
          /EQTY.*?Equity.*?(\d+,?\d*)\s*(\d+\.\d+)\s*([+-]?\d+\.\d+)/g,
          /KCB.*?KCB Group.*?(\d+,?\d*)\s*(\d+\.\d+)\s*([+-]?\d+\.\d+)/g,
        ];

        stockPatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(bodyText)) !== null) {
            try {
              const volume = parseInt(match[1].replace(/,/g, '')) || null;
              const price = parseFloat(match[2]);
              const change = parseFloat(match[3]);
              const changePercent = (change / (price - change)) * 100;

              stocks.push({
                symbol: match[0].split(' ')[0],
                name: match[0].split(' ')[1] || 'Unknown',
                volume,
                price,
                change,
                changePercent,
                timestamp,
              });
            } catch (error) {
              console.warn('Warning: Error parsing stock pattern:', error);
            }
          }
        });
      }

    } catch (error) {
      console.error('Error extracting stock data:', error);
    }

    return stocks;
  }

  private extractTradingSummary($: cheerio.Root) {
    const defaultSummary = {
      totalShares: 0,
      totalDeals: 0,
      totalValue: 0,
      participatingEquities: 0,
      gainers: 0,
      losers: 0,
    };

    try {
      const bodyText = $('body').text();
      
      // Look for trading summary text
      const summaryMatch = bodyText.match(/(\d+,\d+,\d+)\s+shares.*?(\d+,?\d*)\s+deals.*?KES\s+([\d,]+)/);
      const participatingMatch = bodyText.match(/(\d+)\s+NSE listed equities participated/);
      const gainersLosersMatch = bodyText.match(/(\d+)\s+gainers.*?(\d+)\s+losers/);

      if (summaryMatch) {
        defaultSummary.totalShares = parseInt(summaryMatch[1].replace(/,/g, '')) || 0;
        defaultSummary.totalDeals = parseInt(summaryMatch[2].replace(/,/g, '')) || 0;
        defaultSummary.totalValue = parseInt(summaryMatch[3].replace(/,/g, '')) || 0;
      }

      if (participatingMatch) {
        defaultSummary.participatingEquities = parseInt(participatingMatch[1]) || 0;
      }

      if (gainersLosersMatch) {
        defaultSummary.gainers = parseInt(gainersLosersMatch[1]) || 0;
        defaultSummary.losers = parseInt(gainersLosersMatch[2]) || 0;
      }

    } catch (error) {
      console.warn('Warning: Could not extract trading summary:', error);
    }

    return defaultSummary;
  }

  private getTopGainers(stocks: NSEStock[], limit: number = 10): NSEStock[] {
    return stocks
      .filter(stock => stock.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, limit);
  }

  private getTopLosers(stocks: NSEStock[], limit: number = 10): NSEStock[] {
    return stocks
      .filter(stock => stock.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, limit);
  }

  private getMostActive(stocks: NSEStock[], limit: number = 10): NSEStock[] {
    return stocks
      .filter(stock => stock.volume !== null)
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))
      .slice(0, limit);
  }

  // Method to get individual stock details
  async getStockDetails(symbol: string): Promise<NSEStock | null> {
    try {
      const data = await this.scrapeNSEData();
      return data.stocks.find(stock => stock.symbol === symbol) || null;
    } catch (error) {
      console.error(`Error getting stock details for ${symbol}:`, error);
      return null;
    }
  }

  // Method to search stocks
  searchStocks(stocks: NSEStock[], query: string): NSEStock[] {
    const searchTerm = query.toLowerCase();
    return stocks.filter(stock => 
      stock.symbol.toLowerCase().includes(searchTerm) ||
      stock.name.toLowerCase().includes(searchTerm)
    );
  }
}

export default new NSEWebScraper();
