// AI-Powered Risk Assessment Engine for Kenya Wealth AI
// Specializes in NSE market analysis and Kenyan market conditions

import { AIUtils } from './utils';
import { Portfolio, MarketData } from '../types';
import { AIRiskMetrics, AIAlert, AIInsight } from './types';

export class NSERiskEngine {
  private static readonly KENYAN_RISK_FREE_RATE = 0.085; // 8.5% T-bills
  private static readonly NSE_MARKET_VOLATILITY = 0.25; // Average NSE volatility
  private static readonly CURRENCY_RISK_FACTOR = 0.15; // KES volatility factor

  /**
   * Comprehensive Portfolio Risk Assessment for NSE holdings
   */
  static async assessPortfolioRisk(
    portfolio: Portfolio,
    marketData: MarketData[],
    nseIndex: { value: number; change: number; changePercent: number }
  ): Promise<{
    riskMetrics: AIRiskMetrics;
    alerts: AIAlert[];
    insights: AIInsight[];
  }> {
    const holdings = portfolio.holdings || [];
    const totalValue = portfolio.total_value || 0;

    // Calculate price data for holdings
    const priceData = this.extractPriceData(holdings, marketData);
    
    // Advanced risk calculations
    const returns = this.calculatePortfolioReturns(priceData);
    const volatility = AIUtils.calculateRollingVolatility(returns)[0] || this.NSE_MARKET_VOLATILITY;
    const sharpeRatio = AIUtils.calculateSharpeRatio(returns, this.KENYAN_RISK_FREE_RATE);
    const maxDrawdown = this.calculateMaxDrawdown(priceData);
    const var95 = AIUtils.calculateVaR(returns, 0.05);
    const var99 = AIUtils.calculateVaR(returns, 0.01);

    // NSE-specific risk factors
    const sectorConcentration = this.calculateSectorConcentration(holdings);
    const currencyRisk = this.assessCurrencyRisk(holdings);
    const liquidityRisk = this.assessLiquidityRisk(holdings, marketData);
    const correlationRisk = this.assessCorrelationRisk(holdings, marketData);

    // Kenyan market specific adjustments
    const inflationRisk = this.assessInflationRisk();
    const politicalRisk = this.assessPoliticalRisk();
    const economicRisk = this.assessEconomicRisk(nseIndex);

    // Overall risk score calculation
    const baseRiskScore = (volatility * 100 + sectorConcentration + currencyRisk + liquidityRisk) / 4;
    const adjustedRiskScore = Math.min(100, baseRiskScore * (1 + politicalRisk + economicRisk));

    const riskMetrics: AIRiskMetrics = {
      // Base risk metrics
      valueAtRisk: totalValue * var95,
      conditionalVaR: totalValue * var99,
      standardDeviation: volatility,
      downside_deviation: volatility * 0.7,
      trackingError: Math.abs(sharpeRatio - 1.0) * volatility,

      // AI-enhanced metrics
      overallRiskScore: Math.round(adjustedRiskScore),
      diversificationScore: Math.round(100 - sectorConcentration),
      riskAdjustedReturn: sharpeRatio,
      correlationMatrix: this.buildCorrelationMatrix(holdings, marketData),
      timestamp: new Date().toISOString(),

      // NSE-specific metrics
      maxDrawdown,
      sharpeRatio,
      sectorConcentration,
      currencyRisk,
      liquidityRisk,
      inflationRisk,
      politicalRisk,
      economicRisk
    };

    // Generate risk alerts
    const alerts = this.generateRiskAlerts(riskMetrics, holdings, nseIndex);
    
    // Generate insights
    const insights = this.generateRiskInsights(riskMetrics, portfolio, nseIndex);

    return { riskMetrics, alerts, insights };
  }

  /**
   * Real-time NSE Market Volatility Monitoring
   */
  static monitorMarketVolatility(marketData: MarketData[], timeWindow: number = 20): {
    currentVolatility: number;
    volatilityTrend: 'increasing' | 'decreasing' | 'stable';
    marketStress: 'low' | 'medium' | 'high' | 'extreme';
    volatileStocks: string[];
  } {
    const prices = marketData.map(stock => stock.current_price);
    const changes = marketData.map(stock => stock.change_percent / 100);
    
    const currentVolatility = AIUtils.calculateRollingVolatility(changes, Math.min(timeWindow, changes.length))[0] || 0;
    
    // Determine volatility trend
    const recentVolatility = currentVolatility;
    const historicalAvg = this.NSE_MARKET_VOLATILITY;
    let volatilityTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    
    if (recentVolatility > historicalAvg * 1.2) {
      volatilityTrend = 'increasing';
    } else if (recentVolatility < historicalAvg * 0.8) {
      volatilityTrend = 'decreasing';
    }

    // Assess market stress
    let marketStress: 'low' | 'medium' | 'high' | 'extreme' = 'low';
    if (currentVolatility > 0.4) marketStress = 'extreme';
    else if (currentVolatility > 0.3) marketStress = 'high';
    else if (currentVolatility > 0.2) marketStress = 'medium';

    // Identify highly volatile stocks
    const volatileStocks = marketData
      .filter(stock => Math.abs(stock.change_percent) > 5)
      .map(stock => stock.symbol)
      .slice(0, 10);

    return { currentVolatility, volatilityTrend, marketStress, volatileStocks };
  }

  /**
   * Predictive Risk Modeling using Monte Carlo simulation
   */
  static predictiveRiskModeling(
    currentPrice: number,
    expectedReturn: number,
    volatility: number,
    timeHorizon: number = 252, // 1 year
    simulations: number = 10000
  ): {
    predictions: number[];
    confidenceIntervals: { p5: number; p25: number; p50: number; p75: number; p95: number };
    probabilityOfLoss: number;
    expectedValue: number;
  } {
    const predictions = AIUtils.monteCarloSimulation(
      currentPrice,
      expectedReturn,
      volatility,
      timeHorizon,
      simulations
    );

    predictions.sort((a, b) => a - b);

    const confidenceIntervals = {
      p5: predictions[Math.floor(simulations * 0.05)],
      p25: predictions[Math.floor(simulations * 0.25)],
      p50: predictions[Math.floor(simulations * 0.50)],
      p75: predictions[Math.floor(simulations * 0.75)],
      p95: predictions[Math.floor(simulations * 0.95)]
    };

    const probabilityOfLoss = predictions.filter(p => p < currentPrice).length / simulations;
    const expectedValue = predictions.reduce((sum, p) => sum + p, 0) / simulations;

    return { predictions, confidenceIntervals, probabilityOfLoss, expectedValue };
  }

  // Private helper methods

  private static extractPriceData(holdings: any[], marketData: MarketData[]): number[] {
    return holdings.map(holding => {
      const stock = marketData.find(s => s.symbol === holding.symbol);
      return stock ? stock.current_price : holding.current_price || 0;
    });
  }

  private static calculatePortfolioReturns(prices: number[]): number[] {
    if (prices.length < 2) return [0];
    return AIUtils.calculateReturns(prices);
  }

  private static calculateMaxDrawdown(prices: number[]): number {
    return AIUtils.calculateMaxDrawdown(prices);
  }

  private static calculateSectorConcentration(holdings: any[]): number {
    const sectorWeights: { [key: string]: number } = {};
    const totalValue = holdings.reduce((sum, h) => sum + (h.value || 0), 0);

    holdings.forEach(holding => {
      const sector = holding.sector || 'Other';
      const weight = (holding.value || 0) / totalValue;
      sectorWeights[sector] = (sectorWeights[sector] || 0) + weight;
    });

    // Calculate Herfindahl index (concentration measure)
    const herfindahl = Object.values(sectorWeights).reduce((sum, weight) => sum + weight * weight, 0);
    return Math.round(herfindahl * 100);
  }

  private static assessCurrencyRisk(holdings: any[]): number {
    // For NSE stocks, currency risk is minimal but exists for cross-listed stocks
    const foreignExposure = holdings.filter(h => h.symbol?.includes('USD') || h.symbol?.includes('GBP')).length;
    return Math.min(20, foreignExposure * 5);
  }

  private static assessLiquidityRisk(holdings: any[], marketData: MarketData[]): number {
    let illiquidCount = 0;
    holdings.forEach(holding => {
      const stock = marketData.find(s => s.symbol === holding.symbol);
      if (stock && (stock.volume || 0) < 10000) {
        illiquidCount++;
      }
    });
    return Math.round((illiquidCount / Math.max(holdings.length, 1)) * 100);
  }

  private static assessCorrelationRisk(holdings: any[], marketData: MarketData[]): number {
    // Simplified correlation assessment based on sector similarity
    const sectors = holdings.map(h => h.sector || 'Other');
    const uniqueSectors = new Set(sectors).size;
    return Math.max(0, 100 - (uniqueSectors * 20));
  }

  private static assessInflationRisk(): number {
    // Kenya's inflation rate consideration (simplified)
    const currentInflation = 0.05; // 5% assumption
    const targetInflation = 0.025; // 2.5% target
    return Math.round(Math.abs(currentInflation - targetInflation) * 1000);
  }

  private static assessPoliticalRisk(): number {
    // Simplified political risk assessment for Kenya
    return 0.1; // 10% political risk factor
  }

  private static assessEconomicRisk(nseIndex: { value: number; change: number; changePercent: number }): number {
    const volatility = Math.abs(nseIndex.changePercent) / 100;
    return Math.min(0.2, volatility * 2); // Cap at 20%
  }

  private static buildCorrelationMatrix(holdings: any[], marketData: MarketData[]): number[][] {
    const n = holdings.length;
    if (n === 0) return [];

    // Simplified correlation matrix (in real implementation, use historical price data)
    const matrix: number[][] = [];
    for (let i = 0; i < n; i++) {
      matrix[i] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1.0;
        } else {
          // Simplified correlation based on sector similarity
          const holding1 = holdings[i];
          const holding2 = holdings[j];
          const sameSector = holding1.sector === holding2.sector;
          matrix[i][j] = sameSector ? 0.7 + Math.random() * 0.2 : Math.random() * 0.4;
        }
      }
    }
    return matrix;
  }

  private static generateRiskAlerts(
    riskMetrics: AIRiskMetrics,
    holdings: any[],
    nseIndex: { value: number; change: number; changePercent: number }
  ): AIAlert[] {
    const alerts: AIAlert[] = [];

    // High risk score alert
    if (riskMetrics.overallRiskScore > 70) {
      alerts.push({
        id: `risk_alert_${Date.now()}`,
        type: 'risk',
        severity: riskMetrics.overallRiskScore > 85 ? 'critical' : 'high',
        title: 'High Portfolio Risk Detected',
        message: `Your portfolio has a risk score of ${riskMetrics.overallRiskScore}/100. Consider diversification.`,
        actionRequired: true,
        suggestedActions: [
          'Diversify across more sectors',
          'Reduce position sizes in volatile stocks',
          'Consider adding defensive stocks'
        ],
        affectedSymbols: holdings.map(h => h.symbol),
        timestamp: new Date().toISOString()
      });
    }

    // Low diversification alert
    if (riskMetrics.diversificationScore < 30) {
      alerts.push({
        id: `diversification_alert_${Date.now()}`,
        type: 'risk',
        severity: 'medium',
        title: 'Poor Portfolio Diversification',
        message: `Your diversification score is ${riskMetrics.diversificationScore}/100. Spread investments across sectors.`,
        actionRequired: true,
        suggestedActions: [
          'Add stocks from different sectors',
          'Consider NSE-listed REITs or ETFs',
          'Include defensive and growth stocks'
        ],
        affectedSymbols: [],
        timestamp: new Date().toISOString()
      });
    }

    // Market volatility alert
    if (Math.abs(nseIndex.changePercent) > 3) {
      alerts.push({
        id: `market_alert_${Date.now()}`,
        type: 'market',
        severity: 'medium',
        title: 'High Market Volatility',
        message: `NSE index moved ${nseIndex.changePercent.toFixed(2)}% today. Monitor positions closely.`,
        actionRequired: false,
        suggestedActions: [
          'Review stop-loss orders',
          'Consider taking profits on gains',
          'Avoid new positions until volatility subsides'
        ],
        affectedSymbols: [],
        timestamp: new Date().toISOString()
      });
    }

    return alerts;
  }

  private static generateRiskInsights(
    riskMetrics: AIRiskMetrics,
    portfolio: Portfolio,
    nseIndex: { value: number; change: number; changePercent: number }
  ): AIInsight[] {
    const insights: AIInsight[] = [];

    // Portfolio risk assessment insight
    insights.push({
      id: `risk_insight_${Date.now()}`,
      type: 'portfolio_analysis',
      title: 'Portfolio Risk Assessment',
      content: `Your portfolio has a risk score of ${riskMetrics.overallRiskScore}/100 with ${riskMetrics.diversificationScore}% diversification. The Sharpe ratio of ${riskMetrics.sharpeRatio?.toFixed(2) || 'N/A'} indicates ${riskMetrics.sharpeRatio > 1 ? 'good' : 'poor'} risk-adjusted returns.`,
      confidence: 0.85,
      importance: riskMetrics.overallRiskScore > 70 ? 'high' : 'medium',
      actionable: true,
      timestamp: new Date().toISOString()
    });

    // Market condition insight
    const marketTrend = nseIndex.changePercent > 0 ? 'positive' : 'negative';
    insights.push({
      id: `market_insight_${Date.now()}`,
      type: 'market_summary',
      title: 'NSE Market Conditions',
      content: `The NSE index is showing ${marketTrend} momentum with a ${Math.abs(nseIndex.changePercent).toFixed(2)}% ${nseIndex.changePercent > 0 ? 'gain' : 'decline'}. ${nseIndex.changePercent > 2 ? 'Strong upward movement suggests bullish sentiment.' : nseIndex.changePercent < -2 ? 'Significant decline indicates market stress.' : 'Moderate movement suggests stable market conditions.'}`,
      confidence: 0.9,
      importance: Math.abs(nseIndex.changePercent) > 2 ? 'high' : 'medium',
      actionable: Math.abs(nseIndex.changePercent) > 3,
      timestamp: new Date().toISOString()
    });

    return insights;
  }
}
