import express from 'express';
import yFinanceService from '../services/yFinanceService.js';
import nseService from '../services/nseService.js';

const router = express.Router();

// @route   GET /api/market/nse/stocks
// @desc    Get all NSE stocks
// @access  Public
router.get('/nse/stocks', async (req, res) => {
  try {
    const stocks = await nseService.getAllStocks();
    res.json({
      success: true,
      data: stocks,
    });
  } catch (error) {
    console.error('Error fetching NSE stocks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch NSE stocks',
    });
  }
});

// @route   GET /api/market/nse/stock/:symbol
// @desc    Get specific NSE stock
// @access  Public
router.get('/nse/stock/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const stock = await nseService.getStock(symbol);
    
    if (!stock) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found',
      });
    }

    res.json({
      success: true,
      data: stock,
    });
  } catch (error) {
    console.error('Error fetching NSE stock:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch NSE stock',
    });
  }
});

// @route   GET /api/market/nse/market-data
// @desc    Get NSE market data
// @access  Public
router.get('/nse/market-data', async (req, res) => {
  try {
    const marketData = await nseService.getMarketData();
    res.json({
      success: true,
      data: marketData,
    });
  } catch (error) {
    console.error('Error fetching NSE market data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch NSE market data',
    });
  }
});

// @route   GET /api/market/nse/top-gainers
// @desc    Get NSE top gainers
// @access  Public
router.get('/nse/top-gainers', async (req, res) => {
  try {
    const topGainers = await nseService.getTopGainers();
    res.json({
      success: true,
      data: topGainers,
    });
  } catch (error) {
    console.error('Error fetching NSE top gainers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch NSE top gainers',
    });
  }
});

// @route   GET /api/market/nse/top-losers
// @desc    Get NSE top losers
// @access  Public
router.get('/nse/top-losers', async (req, res) => {
  try {
    const topLosers = await nseService.getTopLosers();
    res.json({
      success: true,
      data: topLosers,
    });
  } catch (error) {
    console.error('Error fetching NSE top losers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch NSE top losers',
    });
  }
});

// @route   GET /api/market/yfinance/quote/:symbol
// @desc    Get YFinance quote
// @access  Public
router.get('/yfinance/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const quote = await yFinanceService.getQuote(symbol);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found',
      });
    }

    res.json({
      success: true,
      data: quote,
    });
  } catch (error) {
    console.error('Error fetching YFinance quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch YFinance quote',
    });
  }
});

// @route   GET /api/market/yfinance/historical/:symbol
// @desc    Get YFinance historical data
// @access  Public
router.get('/yfinance/historical/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1y' } = req.query;
    const historicalData = await yFinanceService.getHistoricalData(symbol, period as string);

    res.json({
      success: true,
      data: historicalData,
    });
  } catch (error) {
    console.error('Error fetching YFinance historical data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch YFinance historical data',
    });
  }
});

// @route   GET /api/market/yfinance/search
// @desc    Search symbols in YFinance
// @access  Public
router.get('/yfinance/search', async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required',
      });
    }

    const results = await yFinanceService.searchSymbols(query as string);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error searching YFinance symbols:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search YFinance symbols',
    });
  }
});

export default router;
