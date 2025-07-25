import express from 'express';
import nseWebScraper from '../services/nseWebScraper.js';

const router = express.Router();

// Mock stock data structure
interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  sector?: string;
}

// @route   GET /api/market/nse/stocks
// @desc    Get all NSE stocks
// @access  Public
router.get('/nse/stocks', async (req, res) => {
  try {
    console.log('🔄 Fetching live NSE stock data...');
    const nseData = await nseWebScraper.scrapeNSEData();
    
    res.json({
      success: true,
      data: nseData.stocks,
      timestamp: new Date().toISOString(),
      source: 'NSE Web Scraper',
      count: nseData.stocks.length
    });
  } catch (error) {
    console.error('Error fetching NSE stocks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch NSE stocks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @route   GET /api/market/stock/:symbol
// @desc    Get specific stock data
// @access  Public
router.get('/stock/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log(`🔍 Fetching data for stock: ${symbol}`);
    
    const stock = await nseWebScraper.getStockDetails(symbol.toUpperCase());
    
    if (!stock) {
      return res.status(404).json({
        success: false,
        error: `Stock ${symbol} not found`,
      });
    }

    res.json({
      success: true,
      data: stock,
      timestamp: new Date().toISOString(),
      source: 'NSE Web Scraper'
    });
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @route   GET /api/market/stock/:symbol/history
// @desc    Get historical data for a stock
// @access  Public
router.get('/stock/:symbol/history', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1M' } = req.query;
    
    // Return empty since external APIs are removed
    res.json({
      success: true,
      data: [],
      message: `No historical data available for ${symbol}. No data source configured.`
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch historical data',
    });
  }
});

// @route   GET /api/market/summary
// @desc    Get market summary
// @access  Public
router.get('/summary', async (req, res) => {
  try {
    console.log('📊 Fetching NSE market summary...');
    const nseData = await nseWebScraper.scrapeNSEData();
    
    res.json({
      success: true,
      data: {
        ...nseData.marketSummary,
        tradingSummary: nseData.tradingSummary
      },
      timestamp: new Date().toISOString(),
      source: 'NSE Web Scraper'
    });
  } catch (error) {
    console.error('Error fetching market summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @route   GET /api/market/gainers
// @desc    Get top gainers
// @access  Public
router.get('/gainers', async (req, res) => {
  try {
    console.log('📈 Fetching top gainers...');
    const nseData = await nseWebScraper.scrapeNSEData();
    
    res.json({
      success: true,
      data: nseData.topGainers,
      timestamp: new Date().toISOString(),
      source: 'NSE Web Scraper',
      count: nseData.topGainers.length
    });
  } catch (error) {
    console.error('Error fetching top gainers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top gainers',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @route   GET /api/market/losers
// @desc    Get top losers
// @access  Public
router.get('/losers', async (req, res) => {
  try {
    console.log('📉 Fetching top losers...');
    const nseData = await nseWebScraper.scrapeNSEData();
    
    res.json({
      success: true,
      data: nseData.topLosers,
      timestamp: new Date().toISOString(),
      source: 'NSE Web Scraper',
      count: nseData.topLosers.length
    });
  } catch (error) {
    console.error('Error fetching top losers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top losers',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @route   GET /api/market/active
// @desc    Get most active stocks
// @access  Public
router.get('/active', async (req, res) => {
  try {
    console.log('🔥 Fetching most active stocks...');
    const nseData = await nseWebScraper.scrapeNSEData();
    
    res.json({
      success: true,
      data: nseData.mostActive,
      timestamp: new Date().toISOString(),
      source: 'NSE Web Scraper',
      count: nseData.mostActive.length
    });
  } catch (error) {
    console.error('Error fetching most active stocks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch most active stocks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @route   GET /api/market/search
// @desc    Search stocks
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    console.log(`🔍 Searching stocks for: ${query}`);
    const nseData = await nseWebScraper.scrapeNSEData();
    const searchResults = nseWebScraper.searchStocks(nseData.stocks, query as string);
    
    res.json({
      success: true,
      data: searchResults,
      query: query,
      timestamp: new Date().toISOString(),
      source: 'NSE Web Scraper',
      count: searchResults.length
    });
  } catch (error) {
    console.error('Error searching stocks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search stocks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @route   GET /api/market/sector/:sector
// @desc    Get stocks by sector
// @access  Public
router.get('/sector/:sector', async (req, res) => {
  try {
    const { sector } = req.params;
    
    // Return empty since external APIs are removed
    res.json({
      success: true,
      data: [],
      message: `No stocks available for sector "${sector}". No data source configured.`
    });
  } catch (error) {
    console.error('Error fetching stocks by sector:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stocks by sector',
    });
  }
});

export default router;
