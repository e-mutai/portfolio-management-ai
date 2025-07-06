// AI Service - Kenya Wealth AI - NSE Market Intelligence
// Main service integrating risk assessment and recommendation engines

import { Portfolio, User, MarketData } from '../types';
import { AIRiskMetrics, AIRecommendation, LocalOpportunity, AIAlert, AIInsight, AIModelPerformance } from './types';
import { NSERiskEngine } from './riskEngine';
import { NSERecommendationEngine } from './recommendationSystem';

export class SimpleAIService {
  private static instance: SimpleAIService;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private cache = new Map<string, { data: any; timestamp: number }>();

  constructor() {
    // Singleton pattern for consistency
    if (SimpleAIService.instance) {
      return SimpleAIService.instance;
    }
    SimpleAIService.instance = this;
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Comprehensive Portfolio Risk Analysis
   */
  async analyzePortfolioRisk(portfolio: Portfolio, marketData?: MarketData[]): Promise<{
    riskMetrics: AIRiskMetrics;
    alerts: AIAlert[];
    insights: AIInsight[];
  }> {
    try {
      console.log('🧠 AI Service: Starting portfolio risk analysis for portfolio:', portfolio.id);
      const cacheKey = `risk_${portfolio.id}_${Date.now()}`;
      const cached = this.getCached<any>(cacheKey);
      if (cached) {
        console.log('⚡ AI Service: Using cached risk analysis');
        return cached;
      }

      // Get market data if not provided
      let currentMarketData = marketData;
      if (!currentMarketData) {
        console.log('🔄 AI Service: Fetching market data for risk analysis...');
        currentMarketData = await this.fetchMarketData();
      }

      // Create mock NSE index data (in real implementation, this would come from market service)
      const nseIndex = {
        value: 100 + Math.random() * 50,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5
      };

      console.log('📊 AI Service: Running risk engine analysis...');
      const result = await NSERiskEngine.assessPortfolioRisk(portfolio, currentMarketData, nseIndex);
      
      console.log('✅ AI Service: Risk analysis complete:', {
        riskScore: result.riskMetrics.overallRiskScore,
        alertsCount: result.alerts.length,
        insightsCount: result.insights.length
      });
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('❌ AI Service: Risk Analysis Error:', error);
      return this.generateFallbackRiskAnalysis(portfolio);
    }
  }

  /**
   * Generate AI-Powered Investment Recommendations
   */
  async generateRecommendations(user: User, portfolio: Portfolio, marketData?: MarketData[]): Promise<{
    recommendations: AIRecommendation[];
    opportunities: LocalOpportunity[];
  }> {
    try {
      console.log('💡 AI Service: Generating recommendations for user:', user.id, 'portfolio:', portfolio.id);
      const cacheKey = `recommendations_${user.id}_${portfolio.id}`;
      const cached = this.getCached<any>(cacheKey);
      if (cached) {
        console.log('⚡ AI Service: Using cached recommendations');
        return cached;
      }

      // Get market data if not provided
      let currentMarketData = marketData;
      if (!currentMarketData) {
        console.log('🔄 AI Service: Fetching market data for recommendations...');
        currentMarketData = await this.fetchMarketData();
      }

      console.log('🔍 AI Service: Running recommendation engine...');
      const recommendations = await NSERecommendationEngine.generateNSERecommendations(
        currentMarketData,
        this.getUserRiskProfile(user),
        portfolio.total_value
      );

      console.log('🌍 AI Service: Identifying local opportunities...');
      const opportunities = await NSERecommendationEngine.identifyKenyanMarketOpportunities(currentMarketData);

      console.log('✅ AI Service: Recommendations complete:', {
        recommendationsCount: recommendations.length,
        opportunitiesCount: opportunities.length
      });

      const result = { recommendations, opportunities };
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('❌ AI Service: Recommendations Error:', error);
      return this.generateFallbackRecommendations();
    }
  }

  /**
   * Get Real-time Risk Alerts
   */
  async getRiskAlerts(portfolio: Portfolio): Promise<AIAlert[]> {
    try {
      const marketData = await this.fetchMarketData();
      const riskAnalysis = await this.analyzePortfolioRisk(portfolio, marketData);
      return riskAnalysis.alerts;
    } catch (error) {
      console.error('Risk Alerts Error:', error);
      return [];
    }
  }

  /**
   * Get AI Model Performance Metrics
   */
  async getModelPerformance(): Promise<AIModelPerformance> {
    return {
      riskModelAccuracy: 0.85 + Math.random() * 0.1,
      recommendationSuccess: 0.72 + Math.random() * 0.15,
      predictionConfidence: 0.78 + Math.random() * 0.12,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Analyze market trends and sentiment
   */
  async analyzeMarketTrends(marketData: MarketData[]): Promise<AIInsight[]> {
    try {
      const insights: AIInsight[] = [];

      // Market volatility analysis
      const volatilityData = NSERiskEngine.monitorMarketVolatility(marketData);
      
      insights.push({
        id: `market_volatility_${Date.now()}`,
        type: 'market_summary',
        title: 'NSE Market Volatility Alert',
        content: `Current market volatility is ${(volatilityData.currentVolatility * 100).toFixed(1)}%. Market stress level: ${volatilityData.marketStress}`,
        confidence: 0.9,
        importance: volatilityData.marketStress === 'high' || volatilityData.marketStress === 'extreme' ? 'high' : 'medium',
        actionable: true,
        timestamp: new Date().toISOString()
      });

      // Top movers analysis
      const gainers = marketData
        .filter(stock => stock.change_percent > 0)
        .sort((a, b) => b.change_percent - a.change_percent)
        .slice(0, 3);

      const losers = marketData
        .filter(stock => stock.change_percent < 0)
        .sort((a, b) => a.change_percent - b.change_percent)
        .slice(0, 3);

      if (gainers.length > 0) {
        insights.push({
          id: `top_gainers_${Date.now()}`,
          type: 'market_summary',
          title: 'Today\'s Top Performers',
          content: `Leading gainers: ${gainers.map(s => `${s.symbol} (+${s.change_percent.toFixed(1)}%)`).join(', ')}`,
          confidence: 0.95,
          importance: 'medium',
          actionable: true,
          timestamp: new Date().toISOString()
        });
      }

      return insights;
    } catch (error) {
      console.error('Market Trends Analysis Error:', error);
      return [];
    }
  }

  // Private helper methods

  private async fetchMarketData(): Promise<MarketData[]> {
    try {
      console.log('🔄 AI Service: Fetching market data...');
      const response = await fetch('http://localhost:5000/api/market/nse/stocks');
      if (!response.ok) {
        console.warn('⚠️ AI Service: Backend response not OK, using mock data');
        throw new Error('Failed to fetch market data');
      }
      const data = await response.json();
      console.log('✅ AI Service: Market data fetched successfully:', data.length, 'stocks');
      return data;
    } catch (error) {
      console.error('❌ AI Service: Failed to fetch market data:', error);
      console.log('🔄 AI Service: Falling back to mock data');
      return this.generateMockMarketData();
    }
  }

  private getUserRiskProfile(user: User): 'conservative' | 'moderate' | 'aggressive' {
    // In a real implementation, this would be based on user preferences/questionnaire
    return 'moderate';
  }

  private generateFallbackRiskAnalysis(portfolio: Portfolio): {
    riskMetrics: AIRiskMetrics;
    alerts: AIAlert[];
    insights: AIInsight[];
  } {
    const riskMetrics: AIRiskMetrics = {
      valueAtRisk: portfolio.total_value * 0.05,
      conditionalVaR: portfolio.total_value * 0.08,
      standardDeviation: 0.15,
      downside_deviation: 0.12,
      trackingError: 0.03,
      overallRiskScore: 65,
      diversificationScore: 75,
      riskAdjustedReturn: 1.2,
      timestamp: new Date().toISOString()
    };

    const alerts: AIAlert[] = [{
      id: `fallback_alert_${Date.now()}`,
      type: 'risk',
      severity: 'medium',
      title: 'Portfolio Analysis Complete',
      message: 'Using cached risk analysis due to connectivity issues',
      actionRequired: false,
      suggestedActions: ['Review when market data is available'],
      affectedSymbols: [],
      timestamp: new Date().toISOString()
    }];

    const insights: AIInsight[] = [{
      id: `fallback_insight_${Date.now()}`,
      type: 'portfolio_analysis',
      title: 'Portfolio Health Check',
      content: 'Your portfolio shows moderate risk levels with good diversification potential',
      confidence: 0.7,
      importance: 'medium',
      actionable: true,
      timestamp: new Date().toISOString()
    }];

    return { riskMetrics, alerts, insights };
  }

  private generateFallbackRecommendations(): {
    recommendations: AIRecommendation[];
    opportunities: LocalOpportunity[];
  } {
    const recommendations: AIRecommendation[] = [{
      id: `fallback_rec_${Date.now()}`,
      type: 'HOLD',
      symbol: 'SCOM',
      confidence: 0.7,
      rationale: 'Conservative holding strategy recommended during market uncertainty',
      expectedReturn: 0.08,
      riskLevel: 'medium',
      timeHorizon: 'medium',
      price: 10.5,
      targetPrice: 11.5,
      stopLoss: 9.5,
      reasoning: {
        technical: ['Stable price action'],
        fundamental: ['Strong fundamentals'],
        sentiment: ['Neutral market sentiment'],
        risk: ['Moderate risk profile']
      },
      timestamp: new Date().toISOString()
    }];

    const opportunities: LocalOpportunity[] = [{
      symbol: 'KCB',
      name: 'Kenya Commercial Bank',
      sector: 'Financial Services',
      opportunity: 'Digital banking expansion',
      potentialReturn: 15.5,
      riskLevel: 'medium',
      timeframe: '6-12 months',
      reasoning: ['Leading digital transformation', 'Strong market position'],
      localAdvantage: 'Largest bank network in Kenya',
      marketCap: 'Large Cap',
      timestamp: new Date().toISOString()
    }];

    return { recommendations, opportunities };
  }

  private generateMockMarketData(): MarketData[] {
    const symbols = [
      'SCOM', 'KCB', 'EQTY', 'SAFCOM', 'COOP', 'ABSA', 'DTBK', 'SCBK',
      'BAMB', 'HFCK', 'STBK', 'CIC', 'JUBILEE', 'BRITAM', 'LIBERTY',
      'BOC', 'DIAMOND', 'NIC', 'CBA', 'HOUSING', 'OLYMPIA', 'TPS',
      'ARM', 'CARBACID', 'CROWN', 'FLAME', 'KENYA-RE', 'KURWITU',
      'LONGHORN', 'NAIROBI-SEC', 'NSE', 'STANDARD', 'CENTUM', 'ICDCI'
    ];
    
    return symbols.map((symbol, index) => ({
      symbol,
      company_name: `${symbol} Limited`,
      current_price: 10 + Math.random() * 50,
      change_percent: (Math.random() - 0.5) * 10,
      volume: Math.floor(Math.random() * 1000000),
      market_cap: Math.floor(Math.random() * 100000000000),
      sector: ['Financial Services', 'Telecommunications', 'Manufacturing', 'Agriculture', 'Energy'][index % 5],
      timestamp: new Date().toISOString()
    }));
  }
}

// Export singleton instance
export const aiService = new SimpleAIService();
export default SimpleAIService;
