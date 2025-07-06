// Enhanced useAI Hook - NSE Market Intelligence Integration
// Connects to the advanced AI risk assessment and recommendation engines

import { useState, useEffect, useCallback } from 'react';
import { SimpleAIService } from '../ai';
import { Portfolio, User, MarketData } from '../types';
import { AIRiskMetrics, AIRecommendation, LocalOpportunity, AIAlert, AIInsight, AIModelPerformance } from '../ai/types';

interface AIState {
  isLoading: boolean;
  error: string | null;
  riskMetrics: AIRiskMetrics | null;
  recommendations: AIRecommendation[];
  opportunities: LocalOpportunity[];
  alerts: AIAlert[];
  insights: AIInsight[];
  modelPerformance: AIModelPerformance | null;
}

const initialState: AIState = {
  isLoading: false,
  error: null,
  riskMetrics: null,
  recommendations: [],
  opportunities: [],
  alerts: [],
  insights: [],
  modelPerformance: null,
};

export function useAI() {
  const [state, setState] = useState<AIState>(initialState);
  
  // Create a single instance of the enhanced AI service
  const [aiService] = useState(() => new SimpleAIService());

  const updateState = useCallback((updates: Partial<AIState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleError = useCallback((error: unknown, operation: string) => {
    const errorMessage = error instanceof Error ? error.message : `Failed to ${operation}`;
    console.error(`AI Service Error [${operation}]:`, error);
    updateState({ error: errorMessage, isLoading: false });
  }, [updateState]);

  // Enhanced Portfolio Risk Analysis
  const analyzePortfolio = useCallback(async (portfolio: Portfolio, marketData?: MarketData[]) => {
    try {
      updateState({ isLoading: true, error: null });
      const result = await aiService.analyzePortfolioRisk(portfolio, marketData);
      updateState({
        riskMetrics: result.riskMetrics,
        alerts: result.alerts,
        insights: result.insights,
        isLoading: false
      });
      return result;
    } catch (error) {
      handleError(error, 'analyze portfolio');
      return null;
    }
  }, [aiService, updateState, handleError]);

  // Generate Investment Recommendations
  const generateRecommendations = useCallback(async (user: User, portfolio: Portfolio) => {
    try {
      updateState({ isLoading: true, error: null });
      const result = await aiService.generateRecommendations(user, portfolio);
      updateState({
        recommendations: result.recommendations,
        opportunities: result.opportunities,
        isLoading: false
      });
      return result;
    } catch (error) {
      handleError(error, 'generate recommendations');
      return null;
    }
  }, [aiService, updateState, handleError]);

  // Monitor Risk Alerts
  const checkAlerts = useCallback(async (portfolio: Portfolio) => {
    try {
      updateState({ isLoading: true, error: null });
      const alerts = await aiService.getRiskAlerts(portfolio);
      updateState({
        alerts,
        isLoading: false
      });
      return alerts;
    } catch (error) {
      handleError(error, 'check alerts');
      return [];
    }
  }, [aiService, updateState, handleError]);

  // Get Model Performance
  const getModelPerformance = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });
      const performance = await aiService.getModelPerformance();
      updateState({
        modelPerformance: performance,
        isLoading: false
      });
      return performance;
    } catch (error) {
      handleError(error, 'get model performance');
      return null;
    }
  }, [aiService, updateState, handleError]);

  // Analyze Market Trends
  const analyzeMarketTrends = useCallback(async (marketData: MarketData[]) => {
    try {
      updateState({ isLoading: true, error: null });
      const insights = await aiService.analyzeMarketTrends(marketData);
      updateState({
        insights: [...state.insights, ...insights],
        isLoading: false
      });
      return insights;
    } catch (error) {
      handleError(error, 'analyze market trends');
      return [];
    }
  }, [aiService, updateState, handleError, state.insights]);

  // Clear Error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Refresh All AI Data
  const refreshAll = useCallback(async (user: User, portfolio: Portfolio, marketData?: MarketData[]) => {
    try {
      updateState({ isLoading: true, error: null });
      
      const [riskResult, recResult, performance, trendInsights] = await Promise.allSettled([
        aiService.analyzePortfolioRisk(portfolio, marketData),
        aiService.generateRecommendations(user, portfolio, marketData),
        aiService.getModelPerformance(),
        marketData ? aiService.analyzeMarketTrends(marketData) : Promise.resolve([])
      ]);

      const updates: Partial<AIState> = { isLoading: false };

      if (riskResult.status === 'fulfilled') {
        updates.riskMetrics = riskResult.value.riskMetrics;
        updates.alerts = riskResult.value.alerts;
        updates.insights = riskResult.value.insights;
      }

      if (recResult.status === 'fulfilled') {
        updates.recommendations = recResult.value.recommendations;
        updates.opportunities = recResult.value.opportunities;
      }

      if (performance.status === 'fulfilled') {
        updates.modelPerformance = performance.value;
      }

      if (trendInsights.status === 'fulfilled') {
        updates.insights = [...(updates.insights || []), ...trendInsights.value];
      }

      updateState(updates);

      return {
        success: true,
        errors: [riskResult, recResult, performance, trendInsights]
          .filter(r => r.status === 'rejected')
          .map(r => (r as PromiseRejectedResult).reason)
      };
    } catch (error) {
      handleError(error, 'refresh all AI data');
      return { success: false, errors: [error] };
    }
  }, [aiService, updateState, handleError]);

  // Get high-priority alerts
  const getHighPriorityAlerts = useCallback(() => {
    return state.alerts.filter(alert => 
      alert.severity === 'high' || alert.severity === 'critical'
    );
  }, [state.alerts]);

  // Get actionable insights
  const getActionableInsights = useCallback(() => {
    return state.insights.filter(insight => insight.actionable);
  }, [state.insights]);

  // Get top recommendations
  const getTopRecommendations = useCallback((count: number = 5) => {
    return state.recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, count);
  }, [state.recommendations]);

  // Auto-refresh effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    // Auto-refresh model performance every 30 minutes
    const startAutoRefresh = () => {
      intervalId = setInterval(() => {
        getModelPerformance();
      }, 30 * 60 * 1000);
    };

    startAutoRefresh();
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [getModelPerformance]);

  return {
    // State
    ...state,
    
    // Actions
    analyzePortfolio,
    generateRecommendations,
    checkAlerts,
    getModelPerformance,
    analyzeMarketTrends,
    clearError,
    refreshAll,
    
    // Computed values
    hasHighPriorityAlerts: getHighPriorityAlerts().length > 0,
    highPriorityAlerts: getHighPriorityAlerts(),
    actionableInsights: getActionableInsights(),
    topRecommendations: getTopRecommendations(),
    
    // Stats
    totalAlerts: state.alerts.length,
    totalRecommendations: state.recommendations.length,
    totalInsights: state.insights.length,
    totalOpportunities: state.opportunities.length,
    
    // Loading states for specific operations
    isAnalyzing: state.isLoading,
    hasData: !!(state.riskMetrics || state.recommendations.length > 0)
  };
}

// Export as default as well for convenience
export default useAI;
