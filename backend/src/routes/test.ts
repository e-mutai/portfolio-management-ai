import express from 'express';

const router = express.Router();

// Simple test endpoint that doesn't require authentication
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Frontend-Backend connection test successful',
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// Test endpoint to get market data without authentication
router.get('/test-market', async (req, res) => {
  try {
    const response = await fetch('http://localhost:5000/api/market/summary');
    const data = await response.json();
    
    res.json({
      success: true,
      message: 'Market data test successful',
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
