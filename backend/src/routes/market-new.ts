import express from 'express';

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
    // Return empty array since external APIs are removed
    // Backend should implement real data source here
    res.json({
      success: true,
      data: [],
      message: 'No external API data sources configured. Please implement a real data source.'
    });
  } catch (error) {
    console.error('Error fetching NSE stocks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch NSE stocks',
    });
  }
});

// @route   GET /api/market/stock/:symbol
// @desc    Get specific stock data
// @access  Public
router.get('/stock/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Return empty since external APIs are removed
    res.status(404).json({
      success: false,
      error: `Stock ${symbol} not found. No data source configured.`,
    });
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock data',
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
    // Return empty since external APIs are removed
    res.json({
      success: true,
      data: null,
      message: 'No market summary available. No data source configured.'
    });
  } catch (error) {
    console.error('Error fetching market summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market summary',
    });
  }
});

// @route   GET /api/market/gainers
// @desc    Get top gainers
// @access  Public
router.get('/gainers', async (req, res) => {
  try {
    // Return empty since external APIs are removed
    res.json({
      success: true,
      data: [],
      message: 'No gainers data available. No data source configured.'
    });
  } catch (error) {
    console.error('Error fetching top gainers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top gainers',
    });
  }
});

// @route   GET /api/market/losers
// @desc    Get top losers
// @access  Public
router.get('/losers', async (req, res) => {
  try {
    // Return empty since external APIs are removed
    res.json({
      success: true,
      data: [],
      message: 'No losers data available. No data source configured.'
    });
  } catch (error) {
    console.error('Error fetching top losers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top losers',
    });
  }
});

// @route   GET /api/market/active
// @desc    Get most active stocks
// @access  Public
router.get('/active', async (req, res) => {
  try {
    // Return empty since external APIs are removed
    res.json({
      success: true,
      data: [],
      message: 'No active stocks data available. No data source configured.'
    });
  } catch (error) {
    console.error('Error fetching most active stocks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch most active stocks',
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

    // Return empty since external APIs are removed
    res.json({
      success: true,
      data: [],
      message: `No search results for "${query}". No data source configured.`
    });
  } catch (error) {
    console.error('Error searching stocks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search stocks',
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
