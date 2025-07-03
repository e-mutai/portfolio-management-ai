// Simple AI Service - Browser Compatible
// Step 4 & 5: Simple implementation with error boundaries

import { AIRiskMetrics, AIRecommendation, LocalOpportunity, AIAlert, AIInsight, AIModelPerformance } from './types';
import { Portfolio, User, MarketData } from '../types';

class SimpleAIService {
  
  constructor() {
    // AI Service initialized
  }
  
  // Risk Analysis
  async analyzePortfolioRisk(portfolio: Portfolio): Promise<{
    riskMetrics: AIRiskMetrics;
    insights: AIInsight[];
  }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const holdings = portfolio.holdings || [];
      const totalValue = portfolio.total_value || 0;
      
      // Calculate basic risk metrics
      const diversificationScore = Math.min(holdings.length * 15, 100);
      const volatility = holdings.length > 0 ? 0.15 + (Math.random() * 0.1) : 0.2;
      const overallRiskScore = Math.max(20, Math.min(80, 100 - diversificationScore + (volatility * 100)));
      
      const riskMetrics: AIRiskMetrics = {
        // Base RiskMetrics
        valueAtRisk: totalValue * 0.05,
        conditionalVaR: totalValue * 0.08,
        standardDeviation: volatility,
        downside_deviation: volatility * 0.7,
        trackingError: volatility * 0.3,
        
        // AI Extensions
        overallRiskScore,
        diversificationScore,
        riskAdjustedReturn: portfolio.gain_percentage || 8.5,
        correlationMatrix: this.generateCorrelationMatrix(holdings.length),
        timestamp: new Date().toISOString()
      };

      const insights: AIInsight[] = [
        {
          id: `insight_${Date.now()}`,
          type: 'portfolio_analysis',
          title: 'Portfolio Risk Assessment',
          content: `Your portfolio has a risk score of ${overallRiskScore.toFixed(1)}. ${
            overallRiskScore > 70 ? 'Consider diversifying to reduce risk.' : 
            overallRiskScore < 30 ? 'Your portfolio is well-diversified.' :
            'Your risk level appears balanced.'
          }`,
          confidence: 0.85,
          importance: overallRiskScore > 70 ? 'high' : 'medium',
          actionable: overallRiskScore > 70,
          timestamp: new Date().toISOString()
        }
      ];

      return { riskMetrics, insights };
    } catch (error) {
      console.error('Risk analysis failed:', error);
      throw new Error('Failed to analyze portfolio risk');
    }
  }

  // Generate Recommendations
  async generateRecommendations(user: User, portfolio: Portfolio): Promise<{
    recommendations: AIRecommendation[];
    opportunities: LocalOpportunity[];
  }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const recommendations: AIRecommendation[] = [
        {
          id: `rec_${Date.now()}`,
          type: 'BUY',
          symbol: 'SAFCOM',
          confidence: 0.75,
          rationale: 'Strong market position in telecommunications with consistent growth',
          expectedReturn: 12.5,
          riskLevel: 'medium',
          timeHorizon: 'medium',
          price: 35.20,
          targetPrice: 38.50,
          stopLoss: 32.00,
          reasoning: {
            technical: ['Strong support at KSh 32', 'Bullish momentum'],
            fundamental: ['Market leadership', 'Growing subscriber base'],
            sentiment: ['Positive analyst coverage', 'Institutional interest'],
            risk: ['Market volatility', 'Regulatory changes']
          },
          timestamp: new Date().toISOString()
        }
      ];

      const opportunities: LocalOpportunity[] = [
        {
          symbol: 'EQTY',
          name: 'Equity Group Holdings',
          sector: 'Banking',
          opportunity: 'Expansion into new African markets showing strong growth potential',
          potentialReturn: 18.5,
          riskLevel: 'medium',
          timeframe: '6-12 months',
          reasoning: ['Regional expansion strategy', 'Strong local presence', 'Digital banking growth'],
          localAdvantage: 'Deep understanding of East African banking regulations and customer preferences',
          marketCap: 'Large Cap',
          timestamp: new Date().toISOString()
        }
      ];

      return { recommendations, opportunities };
    } catch (error) {
      console.error('Recommendations generation failed:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  // Risk Alerts
  async getRiskAlerts(portfolio: Portfolio): Promise<AIAlert[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const alerts: AIAlert[] = [];
      const totalValue = portfolio.total_value || 0;
      const holdings = portfolio.holdings || [];
      
      // Check for concentration risk
      const largePositions = holdings.filter(h => (h.current_value / totalValue) > 0.3);
      if (largePositions.length > 0) {
        alerts.push({
          id: `alert_concentration_${Date.now()}`,
          type: 'risk',
          severity: 'medium',
          title: 'Portfolio Concentration Risk',
          message: `You have ${largePositions.length} position(s) representing more than 30% of your portfolio.`,
          actionRequired: false,
          suggestedActions: [
            'Consider reducing position sizes',
            'Diversify across different sectors',
            'Review portfolio allocation strategy'
          ],
          affectedSymbols: largePositions.map(p => p.symbol),
          timestamp: new Date().toISOString()
        });
      }

      return alerts;
    } catch (error) {
      console.error('Risk alerts failed:', error);
      return []; // Return empty array on error instead of throwing
    }
  }

  // Model Performance
  async getModelPerformance(): Promise<AIModelPerformance> {
    const performance = {
      riskModelAccuracy: 0.82 + Math.random() * 0.1,
      recommendationSuccess: 0.75 + Math.random() * 0.15,
      predictionConfidence: 0.78 + Math.random() * 0.12,
      lastUpdated: new Date().toISOString()
    };
    return performance;
  }

  // Helper methods
  private generateCorrelationMatrix(size: number): number[][] {
    const matrix: number[][] = [];
    for (let i = 0; i < Math.min(size, 5); i++) {
      matrix[i] = [];
      for (let j = 0; j < Math.min(size, 5); j++) {
        if (i === j) {
          matrix[i][j] = 1;
        } else {
          matrix[i][j] = Math.random() * 0.6 - 0.3;
        }
      }
    }
    return matrix;
  }
}

export const aiService = new SimpleAIService();
export { SimpleAIService };
export default aiService;
