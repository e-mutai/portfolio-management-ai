import { useState, useEffect, useCallback, useRef } from 'react';
import marketService from '@/services/marketService';

interface MarketDataState {
  stocks: any[];
  marketSummary: any;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isRealTime: boolean;
}

interface UseRealTimeMarketOptions {
  refreshInterval?: number; // in milliseconds
  enableRealTime?: boolean;
  maxRetries?: number;
}

export const useRealTimeMarket = (options: UseRealTimeMarketOptions = {}) => {
  const {
    refreshInterval = 30000, // 30 seconds default
    enableRealTime = true,
    maxRetries = 3
  } = options;

  const [state, setState] = useState<MarketDataState>({
    stocks: [],
    marketSummary: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
    isRealTime: false
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const isActiveRef = useRef(true);

  const updateState = useCallback((updates: Partial<MarketDataState>) => {
    if (!isActiveRef.current) return;
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const fetchMarketData = useCallback(async (showLoading = false) => {
    if (!isActiveRef.current) return;

    if (showLoading) {
      updateState({ isLoading: true, error: null });
    }

    try {
      const [stocks, marketSummary] = await Promise.all([
        marketService.getNSEStocks(),
        marketService.getMarketSummary()
      ]);

      if (!isActiveRef.current) return;

      updateState({
        stocks,
        marketSummary,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
        isRealTime: true // Always true since we're getting live data
      });

      retryCountRef.current = 0; // Reset retry count on success
    } catch (error) {
      if (!isActiveRef.current) return;

      console.error('Market data fetch failed:', error);
      
      retryCountRef.current += 1;
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch market data';
      
      updateState({
        isLoading: false,
        error: retryCountRef.current >= maxRetries 
          ? `${errorMessage} (Max retries reached)`
          : errorMessage
      });

      // Auto retry with exponential backoff
      if (retryCountRef.current < maxRetries) {
        const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
        setTimeout(() => {
          if (isActiveRef.current) {
            fetchMarketData(false);
          }
        }, retryDelay);
      }
    }
  }, [updateState, maxRetries]);

  const startRealTimeUpdates = useCallback(() => {
    if (!enableRealTime || intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      fetchMarketData(false);
    }, refreshInterval);
  }, [enableRealTime, refreshInterval, fetchMarketData]);

  const stopRealTimeUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refresh = useCallback(() => {
    retryCountRef.current = 0;
    fetchMarketData(true);
  }, [fetchMarketData]);

  const getStockBySymbol = useCallback((symbol: string) => {
    return state.stocks.find(stock => stock.symbol === symbol);
  }, [state.stocks]);

  const getTopGainers = useCallback(() => {
    return state.stocks
      .filter(stock => stock.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 5);
  }, [state.stocks]);

  const getTopLosers = useCallback(() => {
    return state.stocks
      .filter(stock => stock.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 5);
  }, [state.stocks]);

  // Initialize and manage lifecycle
  useEffect(() => {
    isActiveRef.current = true;
    fetchMarketData(true);

    if (enableRealTime) {
      startRealTimeUpdates();
    }

    return () => {
      isActiveRef.current = false;
      stopRealTimeUpdates();
    };
  }, [fetchMarketData, startRealTimeUpdates, stopRealTimeUpdates, enableRealTime]);

  // Handle visibility change to pause/resume updates when tab is not active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopRealTimeUpdates();
      } else if (enableRealTime && isActiveRef.current) {
        startRealTimeUpdates();
        // Refresh data when tab becomes active again
        fetchMarketData(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enableRealTime, startRealTimeUpdates, stopRealTimeUpdates, fetchMarketData]);

  return {
    ...state,
    refresh,
    getStockBySymbol,
    getTopGainers,
    getTopLosers,
    startRealTime: startRealTimeUpdates,
    stopRealTime: stopRealTimeUpdates
  };
}

// Utility hook for individual stock tracking
export function useStockData(symbol: string, refreshInterval: number = 30000) {
  const [stock, setStock] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStock = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const stockData = await marketService.getStock(symbol);
      setStock(stockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchStock();
    const interval = setInterval(fetchStock, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchStock, refreshInterval]);

  return { stock, isLoading, error, refresh: fetchStock };
}
