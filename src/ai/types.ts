// AI Module Types - Minimal Browser Compatible Version
// Designed to work with existing types without conflicts

import { RiskMetrics } from '../types';

export interface AIRiskMetrics extends RiskMetrics {
  overallRiskScore: number;
  diversificationScore: number;
  riskAdjustedReturn: number;
  correlationMatrix?: number[][];
  timestamp: string;
  
  // Advanced risk metrics
  maxDrawdown?: number;
  sharpeRatio?: number;
  sectorConcentration?: number;
  currencyRisk?: number;
  liquidityRisk?: number;
  inflationRisk?: number;
  politicalRisk?: number;
  economicRisk?: number;
}

export interface AIRecommendation {
  id: string;
  type: 'BUY' | 'SELL' | 'HOLD';
  symbol: string;
  confidence: number;
  rationale: string;
  expectedReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeHorizon: 'short' | 'medium' | 'long';
  price: number;
  targetPrice: number;
  stopLoss: number;
  reasoning: {
    technical: string[];
    fundamental: string[];
    sentiment: string[];
    risk: string[];
  };
  timestamp: string;
}

export interface LocalOpportunity {
  symbol: string;
  name: string;
  sector: string;
  opportunity: string;
  potentialReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: string;
  reasoning: string[];
  localAdvantage: string;
  marketCap: string;
  timestamp: string;
}

export interface AIAlert {
  id: string;
  type: 'risk' | 'opportunity' | 'rebalance' | 'market';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionRequired: boolean;
  suggestedActions: string[];
  affectedSymbols: string[];
  timestamp: string;
}

export interface AIInsight {
  id: string;
  type: 'market_summary' | 'portfolio_analysis' | 'risk_alert' | 'opportunity';
  title: string;
  content: string;
  confidence: number;
  importance: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  timestamp: string;
}

export interface AIModelPerformance {
  riskModelAccuracy: number;
  recommendationSuccess: number;
  predictionConfidence: number;
  lastUpdated: string;
}
