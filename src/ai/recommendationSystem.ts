// Intelligent Recommendation System for NSE and Kenyan Market
// Generates AI-driven investment recommendations specific to Kenyan securities

import { AIUtils } from './utils';
import { MarketData } from '../types';
import { AIRecommendation, LocalOpportunity, AIInsight } from './types';

export class NSERecommendationEngine {
  private static readonly NSE_SECTORS = [
    'Banking', 'Telecommunications', 'Insurance', 'Manufacturing',
    'Agriculture', 'Energy', 'Real Estate', 'Investment', 'Commercial'
  ];

  private static readonly KENYAN_ECONOMIC_INDICATORS = {
    gdpGrowth: 0.055, // 5.5% estimated
    inflationRate: 0.05, // 5%
    interestRate: 0.085, // 8.5%
    currencyStability: 0.85 // KES stability index
  };

  /**
   * Generate NSE Investment Recommendations
   */
  static async generateNSERecommendations(
    marketData: MarketData[],
    userRiskProfile: 'conservative' | 'moderate' | 'aggressive',
    investmentAmount: number = 100000, // Default KES 100,000
    timeHorizon: 'short' | 'medium' | 'long' = 'medium'
  ): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];

    // Analyze each stock for recommendation potential
    for (const stock of marketData.slice(0, 20)) { // Focus on top 20 liquid stocks
      const analysis = await this.analyzeStockForRecommendation(stock, userRiskProfile, timeHorizon);
      if (analysis.shouldRecommend) {
        recommendations.push(analysis.recommendation);
      }
    }

    // Sort by confidence and expected return
    recommendations.sort((a, b) => {
      const scoreA = a.confidence * a.expectedReturn;
      const scoreB = b.confidence * b.expectedReturn;
      return scoreB - scoreA;
    });

    // Return top 10 recommendations
    return recommendations.slice(0, 10);
  }

  /**
   * Portfolio Optimization Recommendations
   */
  static optimizePortfolio(
    currentHoldings: any[],
    marketData: MarketData[],
    targetRiskLevel: number = 50,
    rebalanceThreshold: number = 0.1
  ): {
    rebalanceRecommendations: AIRecommendation[];
    optimizationInsights: AIInsight[];
    targetAllocation: { [symbol: string]: number };
  } {
    const rebalanceRecommendations: AIRecommendation[] = [];
    const optimizationInsights: AIInsight[] = [];

    // Calculate current portfolio weights
    const totalValue = currentHoldings.reduce((sum, h) => sum + (h.value || 0), 0);
    const currentWeights: { [symbol: string]: number } = {};
    
    currentHoldings.forEach(holding => {
      currentWeights[holding.symbol] = (holding.value || 0) / totalValue;
    });

    // Calculate optimal allocation based on risk-return profile
    const targetAllocation = this.calculateOptimalAllocation(
      currentHoldings,
      marketData,
      targetRiskLevel
    );

    // Generate rebalancing recommendations
    Object.entries(targetAllocation).forEach(([symbol, targetWeight]) => {
      const currentWeight = currentWeights[symbol] || 0;
      const drift = Math.abs(targetWeight - currentWeight);

      if (drift > rebalanceThreshold) {
        const stock = marketData.find(s => s.symbol === symbol);
        if (stock) {
          const action = targetWeight > currentWeight ? 'BUY' : 'SELL';
          const amount = Math.abs(targetWeight - currentWeight) * totalValue;

          rebalanceRecommendations.push({
            id: `rebalance_${symbol}_${Date.now()}`,
            type: action,
            symbol,
            confidence: 0.8,
            rationale: `Rebalance ${symbol} to maintain optimal portfolio allocation`,
            expectedReturn: this.estimateExpectedReturn(stock),
            riskLevel: this.assessStockRiskLevel(stock),
            timeHorizon: 'medium',
            price: stock.current_price,
            targetPrice: stock.current_price * (action === 'BUY' ? 1.1 : 0.9),
            stopLoss: stock.current_price * (action === 'BUY' ? 0.95 : 1.05),
            reasoning: {
              technical: [`Current weight: ${(currentWeight * 100).toFixed(1)}%`, `Target weight: ${(targetWeight * 100).toFixed(1)}%`],
              fundamental: ['Portfolio optimization based on risk-return profile'],
              sentiment: ['Maintains diversification benefits'],
              risk: [`Amount to ${action.toLowerCase()}: KES ${amount.toLocaleString()}`]
            },
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    // Generate optimization insights
    optimizationInsights.push({
      id: `optimization_${Date.now()}`,
      type: 'portfolio_analysis',
      title: 'Portfolio Optimization Analysis',
      content: `Portfolio analysis suggests ${rebalanceRecommendations.length} rebalancing actions to optimize risk-return profile. Current allocation drift requires attention in ${Object.keys(targetAllocation).length} positions.`,
      confidence: 0.85,
      importance: rebalanceRecommendations.length > 3 ? 'high' : 'medium',
      actionable: rebalanceRecommendations.length > 0,
      timestamp: new Date().toISOString()
    });

    return { rebalanceRecommendations, optimizationInsights, targetAllocation };
  }

  /**
   * Identify Local Market Opportunities
   */
  static identifyKenyanMarketOpportunities(
    marketData: MarketData[],
    economicIndicators?: any
  ): LocalOpportunity[] {
    const opportunities: LocalOpportunity[] = [];

    // Sector-specific opportunities based on Kenyan economic trends
    const sectorOpportunities = this.identifySectorOpportunities(marketData);
    opportunities.push(...sectorOpportunities);

    // Value opportunities (undervalued stocks)
    const valueOpportunities = this.identifyValueOpportunities(marketData);
    opportunities.push(...valueOpportunities);

    // Growth opportunities
    const growthOpportunities = this.identifyGrowthOpportunities(marketData);
    opportunities.push(...growthOpportunities);

    // ESG and sustainability opportunities
    const esgOpportunities = this.identifyESGOpportunities(marketData);
    opportunities.push(...esgOpportunities);

    return opportunities.slice(0, 15); // Top 15 opportunities
  }

  /**
   * Natural Language Insights Generation
   */
  static generateNaturalLanguageInsights(
    marketData: MarketData[],
    portfolioPerformance: number,
    marketSentiment: 'bullish' | 'bearish' | 'neutral'
  ): AIInsight[] {
    const insights: AIInsight[] = [];

    // Market overview in natural language
    const marketMovers = this.getTopMovers(marketData);
    const marketInsight = this.generateMarketOverviewInsight(marketMovers, marketSentiment);
    insights.push(marketInsight);

    // Portfolio performance insight
    const performanceInsight = this.generatePerformanceInsight(portfolioPerformance, marketData);
    insights.push(performanceInsight);

    // Sector analysis insight
    const sectorInsight = this.generateSectorAnalysisInsight(marketData);
    insights.push(sectorInsight);

    // Economic environment insight
    const economicInsight = this.generateEconomicInsight();
    insights.push(economicInsight);

    return insights;
  }

  // Private helper methods

  private static async analyzeStockForRecommendation(
    stock: MarketData,
    riskProfile: 'conservative' | 'moderate' | 'aggressive',
    timeHorizon: 'short' | 'medium' | 'long'
  ): Promise<{ shouldRecommend: boolean; recommendation: AIRecommendation }> {
    // Technical analysis
    const technicalScore = this.calculateTechnicalScore(stock);
    
    // Fundamental analysis (simplified)
    const fundamentalScore = this.calculateFundamentalScore(stock);
    
    // Risk assessment
    const riskLevel = this.assessStockRiskLevel(stock);
    
    // Market sentiment
    const sentimentScore = this.calculateSentimentScore(stock);

    // Overall confidence calculation
    const confidence = (technicalScore + fundamentalScore + sentimentScore) / 3;
    
    // Risk-profile matching
    const riskMatch = this.matchesRiskProfile(riskLevel, riskProfile);
    
    const shouldRecommend = confidence > 0.6 && riskMatch;

    const expectedReturn = this.estimateExpectedReturn(stock);
    const targetPrice = stock.current_price * (1 + expectedReturn);
    const stopLoss = stock.current_price * 0.92; // 8% stop loss

    const recommendation: AIRecommendation = {
      id: `rec_${stock.symbol}_${Date.now()}`,
      type: expectedReturn > 0.05 ? 'BUY' : 'HOLD',
      symbol: stock.symbol,
      confidence: Math.round(confidence * 100) / 100,
      rationale: this.generateRationale(stock, technicalScore, fundamentalScore, sentimentScore),
      expectedReturn,
      riskLevel,
      timeHorizon,
      price: stock.current_price,
      targetPrice,
      stopLoss,
      reasoning: {
        technical: this.getTechnicalReasons(stock, technicalScore),
        fundamental: this.getFundamentalReasons(stock, fundamentalScore),
        sentiment: this.getSentimentReasons(stock, sentimentScore),
        risk: this.getRiskReasons(stock, riskLevel)
      },
      timestamp: new Date().toISOString()
    };

    return { shouldRecommend, recommendation };
  }

  private static calculateOptimalAllocation(
    holdings: any[],
    marketData: MarketData[],
    targetRiskLevel: number
  ): { [symbol: string]: number } {
    // Simplified Modern Portfolio Theory implementation
    const allocation: { [symbol: string]: number } = {};
    
    // Equal weight as starting point, then adjust based on risk-return
    const baseWeight = 1 / Math.min(holdings.length, 10); // Max 10 positions
    
    holdings.forEach(holding => {
      const stock = marketData.find(s => s.symbol === holding.symbol);
      if (stock) {
        const riskAdjustment = this.calculateRiskAdjustment(stock, targetRiskLevel);
        allocation[holding.symbol] = baseWeight * riskAdjustment;
      }
    });

    // Normalize to sum to 1
    const totalWeight = Object.values(allocation).reduce((sum, weight) => sum + weight, 0);
    Object.keys(allocation).forEach(symbol => {
      allocation[symbol] /= totalWeight;
    });

    return allocation;
  }

  private static identifySectorOpportunities(marketData: MarketData[]): LocalOpportunity[] {
    const opportunities: LocalOpportunity[] = [];

    // Banking sector opportunity (Kenya's growing financial inclusion)
    const bankingStocks = marketData.filter(s => 
      ['KCB', 'EQTY', 'COOP', 'ABSA', 'NCBA', 'SBIC', 'SCBK'].includes(s.symbol)
    );
    if (bankingStocks.length > 0) {
      const topBankingStock = bankingStocks.sort((a, b) => b.change_percent - a.change_percent)[0];
      opportunities.push({
        symbol: topBankingStock.symbol,
        name: topBankingStock.company_name,
        sector: 'Banking',
        opportunity: 'Financial Inclusion Growth',
        potentialReturn: 15,
        riskLevel: 'medium',
        timeframe: '12-18 months',
        reasoning: [
          'Kenya\'s digital banking penetration increasing',
          'Mobile money integration driving growth',
          'Regional expansion opportunities'
        ],
        localAdvantage: 'Strong regulatory environment and fintech innovation in Kenya',
        marketCap: this.formatMarketCap(topBankingStock.market_cap),
        timestamp: new Date().toISOString()
      });
    }

    // Telecommunications (Safaricom focus)
    const telecomStocks = marketData.filter(s => s.symbol === 'SCOM');
    if (telecomStocks.length > 0) {
      opportunities.push({
        symbol: 'SCOM',
        name: 'Safaricom Plc',
        sector: 'Telecommunications',
        opportunity: '5G and Digital Services Expansion',
        potentialReturn: 20,
        riskLevel: 'low',
        timeframe: '6-12 months',
        reasoning: [
          '5G network rollout in major cities',
          'M-Pesa expansion to new markets',
          'Strong dividend yield and market dominance'
        ],
        localAdvantage: 'Market leader with government support for digital transformation',
        marketCap: this.formatMarketCap(telecomStocks[0].market_cap),
        timestamp: new Date().toISOString()
      });
    }

    return opportunities;
  }

  private static identifyValueOpportunities(marketData: MarketData[]): LocalOpportunity[] {
    // Identify potentially undervalued stocks based on price movements
    return marketData
      .filter(stock => stock.change_percent < -2 && stock.current_price > 10) // Declined but not penny stocks
      .slice(0, 3)
      .map(stock => ({
        symbol: stock.symbol,
        name: stock.company_name,
        sector: stock.sector || 'Mixed',
        opportunity: 'Value Investment',
        potentialReturn: 12,
        riskLevel: 'medium' as const,
        timeframe: '6-18 months',
        reasoning: [
          `Recent decline of ${Math.abs(stock.change_percent).toFixed(1)}% may be oversold`,
          'Strong fundamentals despite temporary weakness',
          'Attractive entry point for long-term investors'
        ],
        localAdvantage: 'Established NSE company with local market knowledge',
        marketCap: this.formatMarketCap(stock.market_cap),
        timestamp: new Date().toISOString()
      }));
  }

  private static identifyGrowthOpportunities(marketData: MarketData[]): LocalOpportunity[] {
    // Identify growth stocks based on positive momentum
    return marketData
      .filter(stock => stock.change_percent > 3 && stock.volume > 50000) // Strong growth with volume
      .slice(0, 3)
      .map(stock => ({
        symbol: stock.symbol,
        name: stock.company_name,
        sector: stock.sector || 'Mixed',
        opportunity: 'Growth Investment',
        potentialReturn: 18,
        riskLevel: 'high' as const,
        timeframe: '3-12 months',
        reasoning: [
          `Strong momentum with ${stock.change_percent.toFixed(1)}% gain`,
          'High trading volume indicates institutional interest',
          'Growth trajectory supported by market dynamics'
        ],
        localAdvantage: 'Benefiting from Kenya\'s economic growth and market expansion',
        marketCap: this.formatMarketCap(stock.market_cap),
        timestamp: new Date().toISOString()
      }));
  }

  private static identifyESGOpportunities(marketData: MarketData[]): LocalOpportunity[] {
    // ESG-focused opportunities in Kenya
    const esgStocks = ['KEGN', 'SCOM', 'EABL', 'BAT']; // Green energy, telecom, responsible companies
    
    return marketData
      .filter(stock => esgStocks.includes(stock.symbol))
      .slice(0, 2)
      .map(stock => ({
        symbol: stock.symbol,
        name: stock.company_name,
        sector: stock.sector || 'ESG',
        opportunity: 'ESG Investment',
        potentialReturn: 14,
        riskLevel: 'low' as const,
        timeframe: '12-24 months',
        reasoning: [
          'Strong ESG credentials and sustainability focus',
          'Aligned with global responsible investment trends',
          'Government support for green initiatives'
        ],
        localAdvantage: 'Kenya\'s leadership in renewable energy and sustainability in Africa',
        marketCap: this.formatMarketCap(stock.market_cap),
        timestamp: new Date().toISOString()
      }));
  }

  // Additional helper methods for analysis

  private static calculateTechnicalScore(stock: MarketData): number {
    // Simplified technical analysis
    let score = 0.5; // Base score
    
    // Price momentum
    if (stock.change_percent > 2) score += 0.2;
    else if (stock.change_percent < -2) score -= 0.2;
    
    // Volume analysis
    if (stock.volume && stock.volume > 100000) score += 0.1;
    
    return Math.max(0, Math.min(1, score));
  }

  private static calculateFundamentalScore(stock: MarketData): number {
    // Simplified fundamental analysis
    let score = 0.6; // Base score for NSE listed companies
    
    // Market cap consideration
    if (stock.market_cap && stock.market_cap > 10000000000) score += 0.1; // Large cap bonus
    
    // Sector leadership (simplified)
    if (['SCOM', 'EQTY', 'KCB', 'EABL'].includes(stock.symbol)) score += 0.2;
    
    return Math.max(0, Math.min(1, score));
  }

  private static calculateSentimentScore(stock: MarketData): number {
    // Simplified sentiment based on recent performance
    let score = 0.5;
    
    if (stock.change_percent > 1) score += 0.3;
    else if (stock.change_percent < -1) score -= 0.3;
    
    return Math.max(0, Math.min(1, score));
  }

  private static assessStockRiskLevel(stock: MarketData): 'low' | 'medium' | 'high' {
    const volatility = Math.abs(stock.change_percent);
    
    if (volatility < 1) return 'low';
    if (volatility < 3) return 'medium';
    return 'high';
  }

  private static matchesRiskProfile(stockRisk: 'low' | 'medium' | 'high', userProfile: 'conservative' | 'moderate' | 'aggressive'): boolean {
    const riskMatrix = {
      conservative: ['low'],
      moderate: ['low', 'medium'],
      aggressive: ['low', 'medium', 'high']
    };
    
    return riskMatrix[userProfile].includes(stockRisk);
  }

  private static estimateExpectedReturn(stock: MarketData): number {
    // Simplified expected return calculation
    const momentum = stock.change_percent / 100;
    const baseReturn = 0.08; // 8% base expectation
    
    return baseReturn + (momentum * 0.5); // Adjust based on momentum
  }

  private static generateRationale(stock: MarketData, technical: number, fundamental: number, sentiment: number): string {
    const scores = { technical, fundamental, sentiment };
    const highest = Object.entries(scores).sort(([,a], [,b]) => b - a)[0][0];
    
    const rationales = {
      technical: `Strong technical indicators suggest upward momentum for ${stock.symbol}`,
      fundamental: `Solid fundamentals and market position support ${stock.symbol}'s growth potential`,
      sentiment: `Positive market sentiment and recent performance favor ${stock.symbol}`
    };
    
    return rationales[highest as keyof typeof rationales];
  }

  private static getTechnicalReasons(stock: MarketData, score: number): string[] {
    const reasons = [];
    if (stock.change_percent > 0) reasons.push(`Positive momentum: +${stock.change_percent.toFixed(2)}%`);
    if (stock.volume && stock.volume > 50000) reasons.push('Strong trading volume');
    if (score > 0.7) reasons.push('Technical indicators are bullish');
    return reasons.length > 0 ? reasons : ['Technical analysis neutral'];
  }

  private static getFundamentalReasons(stock: MarketData, score: number): string[] {
    const reasons = [];
    if (['SCOM', 'EQTY', 'KCB'].includes(stock.symbol)) reasons.push('Market leader in sector');
    if (stock.market_cap && stock.market_cap > 5000000000) reasons.push('Large-cap stability');
    reasons.push('Listed on NSE with regulatory oversight');
    return reasons;
  }

  private static getSentimentReasons(stock: MarketData, score: number): string[] {
    const reasons = [];
    if (stock.change_percent > 1) reasons.push('Positive recent performance');
    if (score > 0.7) reasons.push('Market sentiment is favorable');
    reasons.push('Part of Kenya\'s economic growth story');
    return reasons;
  }

  private static getRiskReasons(stock: MarketData, risk: 'low' | 'medium' | 'high'): string[] {
    const riskReasons = {
      low: ['Low volatility stock', 'Established market position'],
      medium: ['Moderate risk-reward profile', 'Consider position sizing'],
      high: ['High growth potential', 'Use stop-loss orders', 'Higher volatility expected']
    };
    return riskReasons[risk];
  }

  private static calculateRiskAdjustment(stock: MarketData, targetRisk: number): number {
    const stockVolatility = Math.abs(stock.change_percent);
    const riskScore = Math.min(100, stockVolatility * 10);
    
    // Adjust weight based on how close stock risk is to target
    const riskDifference = Math.abs(riskScore - targetRisk);
    return Math.max(0.5, 1 - (riskDifference / 100));
  }

  private static getTopMovers(marketData: MarketData[]): { gainers: MarketData[]; losers: MarketData[] } {
    const sorted = [...marketData].sort((a, b) => b.change_percent - a.change_percent);
    return {
      gainers: sorted.slice(0, 3),
      losers: sorted.slice(-3)
    };
  }

  private static generateMarketOverviewInsight(
    movers: { gainers: MarketData[]; losers: MarketData[] },
    sentiment: 'bullish' | 'bearish' | 'neutral'
  ): AIInsight {
    const topGainer = movers.gainers[0];
    const topLoser = movers.losers[0];
    
    return {
      id: `market_overview_${Date.now()}`,
      type: 'market_summary',
      title: 'NSE Market Overview',
      content: `Today's NSE session shows ${sentiment} sentiment. Top performer is ${topGainer?.symbol} (+${topGainer?.change_percent.toFixed(2)}%), while ${topLoser?.symbol} declined ${topLoser?.change_percent.toFixed(2)}%. ${sentiment === 'bullish' ? 'Broad market strength suggests positive investor confidence.' : sentiment === 'bearish' ? 'Market weakness indicates cautious investor sentiment.' : 'Mixed signals suggest a consolidation phase.'}`,
      confidence: 0.85,
      importance: 'medium',
      actionable: false,
      timestamp: new Date().toISOString()
    };
  }

  private static generatePerformanceInsight(performance: number, marketData: MarketData[]): AIInsight {
    const marketAverage = marketData.reduce((sum, stock) => sum + stock.change_percent, 0) / marketData.length;
    const relative = performance - marketAverage;
    
    return {
      id: `performance_${Date.now()}`,
      type: 'portfolio_analysis',
      title: 'Portfolio Performance Analysis',
      content: `Your portfolio is ${relative > 0 ? 'outperforming' : 'underperforming'} the NSE market by ${Math.abs(relative).toFixed(2)} percentage points. ${relative > 1 ? 'Excellent stock selection is driving superior returns.' : relative < -1 ? 'Consider reviewing your holdings for optimization opportunities.' : 'Performance is closely tracking the market benchmark.'}`,
      confidence: 0.9,
      importance: Math.abs(relative) > 1 ? 'high' : 'medium',
      actionable: relative < -1,
      timestamp: new Date().toISOString()
    };
  }

  private static generateSectorAnalysisInsight(marketData: MarketData[]): AIInsight {
    // Simple sector performance analysis
    const sectors: { [key: string]: { count: number; avgChange: number } } = {};
    
    marketData.forEach(stock => {
      const sector = stock.sector || 'Other';
      if (!sectors[sector]) sectors[sector] = { count: 0, avgChange: 0 };
      sectors[sector].count++;
      sectors[sector].avgChange += stock.change_percent;
    });

    Object.keys(sectors).forEach(sector => {
      sectors[sector].avgChange /= sectors[sector].count;
    });

    const bestSector = Object.entries(sectors)
      .sort(([,a], [,b]) => b.avgChange - a.avgChange)[0];

    return {
      id: `sector_analysis_${Date.now()}`,
      type: 'market_summary',
      title: 'Sector Performance Analysis',
      content: `${bestSector[0]} sector is leading today's market with an average gain of ${bestSector[1].avgChange.toFixed(2)}%. This sector strength may present opportunities for strategic positioning in upcoming sessions.`,
      confidence: 0.8,
      importance: 'medium',
      actionable: true,
      timestamp: new Date().toISOString()
    };
  }

  private static generateEconomicInsight(): AIInsight {
    return {
      id: `economic_${Date.now()}`,
      type: 'market_summary',
      title: 'Kenya Economic Environment',
      content: `Kenya's economic fundamentals remain supportive for equity investments. GDP growth of ~5.5%, stable currency, and improving business environment create a favorable backdrop for NSE-listed companies. Monitor inflation trends and central bank policy for market direction.`,
      confidence: 0.85,
      importance: 'medium',
      actionable: false,
      timestamp: new Date().toISOString()
    };
  }

  private static formatMarketCap(marketCap?: number): string {
    if (!marketCap) return 'N/A';
    if (marketCap > 1e12) return `KES ${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap > 1e9) return `KES ${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap > 1e6) return `KES ${(marketCap / 1e6).toFixed(1)}M`;
    return `KES ${marketCap.toLocaleString()}`;
  }
}
