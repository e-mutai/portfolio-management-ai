// useAI Hook - Browser Compatible AI Integration
// Step 4: Proper error boundaries and state management

import { useState, useEffect, useCallback } from 'react';
import { SimpleAIService } from '../ai';
import { Portfolio, User } from '../types';
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
  
  // Create a single instance of the service
  const [aiService] = useState(() => {
    return new SimpleAIService();
  });

  const updateState = useCallback((updates: Partial<AIState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleError = useCallback((error: unknown, operation: string) => {
    const errorMessage = error instanceof Error ? error.message : `Failed to ${operation}`;
    console.error(`AI Service Error [${operation}]:`, error);
    updateState({ error: errorMessage, isLoading: false });
  }, [updateState]);

  const analyzePortfolio = useCallback(async (portfolio: Portfolio) => {
    if (!portfolio) return;
    
    try {
      updateState({ isLoading: true, error: null });
      const result = await aiService.analyzePortfolioRisk(portfolio);
      updateState({
        riskMetrics: result.riskMetrics,
        insights: result.insights,
        isLoading: false,
      });
    } catch (error) {
      console.error('useAI: Portfolio analysis failed', error);
      handleError(error, 'analyze portfolio');
    }
  }, [aiService, updateState, handleError]);

  const generateRecommendations = useCallback(async (portfolio: Portfolio, user: User) => {
    if (!portfolio || !user) return;
    
    try {
      updateState({ isLoading: true, error: null });
      const result = await aiService.generateRecommendations(user, portfolio);
      updateState({
        recommendations: result.recommendations,
        opportunities: result.opportunities,
        isLoading: false,
      });
    } catch (error) {
      handleError(error, 'generate recommendations');
    }
  }, [aiService, updateState, handleError]);

  const findOpportunities = useCallback(async (portfolio: Portfolio, user: User) => {
    // Opportunities are returned with recommendations, so we don't need a separate method
    // This will be handled by generateRecommendations
    return;
  }, []);

  const checkAlerts = useCallback(async (portfolio: Portfolio, user: User) => {
    if (!portfolio || !user) return;
    
    try {
      updateState({ isLoading: true, error: null });
      const alerts = await aiService.getRiskAlerts(portfolio);
      updateState({
        alerts,
        isLoading: false,
      });
    } catch (error) {
      handleError(error, 'check alerts');
    }
  }, [aiService, updateState, handleError]);

  const getModelPerformance = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });
      const performance = await aiService.getModelPerformance();
      updateState({
        modelPerformance: performance,
        isLoading: false,
      });
    } catch (error) {
      handleError(error, 'get model performance');
    }
  }, [aiService, updateState, handleError]);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  return {
    // State
    ...state,
    
    // Actions
    analyzePortfolio,
    generateRecommendations,
    findOpportunities,
    checkAlerts,
    getModelPerformance,
    clearError,
    
    // Utilities
    isReady: !state.isLoading && !state.error,
    hasData: Boolean(state.riskMetrics || state.recommendations.length > 0 || state.opportunities.length > 0),
  };
}
