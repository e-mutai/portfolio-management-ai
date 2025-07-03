// AI Insights Panel - Browser Compatible with Market Data
// Step 4: Proper AI insights component with error boundaries and real market data

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  Shield, 
  Activity,
  Brain,
  Zap,
  Loader2
} from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import marketService, { NSEStock } from '@/services/marketService';
import { Portfolio, User } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/formatters';

interface AIInsightsPanelProps {
  user: User;
  portfolio?: Portfolio;
}

export function AIInsightsPanel({ user, portfolio }: AIInsightsPanelProps) {
  const [topGainers, setTopGainers] = useState<NSEStock[]>([]);
  const [topLosers, setTopLosers] = useState<NSEStock[]>([]);
  const [marketDataLoading, setMarketDataLoading] = useState(false);
  
  const { 
    isLoading,
    error,
    riskMetrics,
    recommendations,
    opportunities,
    alerts,
    insights,
    modelPerformance,
    analyzePortfolio,
    generateRecommendations,
    checkAlerts,
    getModelPerformance,
    clearError
  } = useAI();

  // Fetch top gainers and losers
  const fetchMarketData = async () => {
    setMarketDataLoading(true);
    try {
      const [gainersData, losersData] = await Promise.all([
        marketService.getNSETopGainers(),
        marketService.getNSETopLosers()
      ]);
      setTopGainers(gainersData.slice(0, 5)); // Top 5 gainers
      setTopLosers(losersData.slice(0, 5)); // Top 5 losers
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    } finally {
      setMarketDataLoading(false);
    }
  };

  // Initialize AI analysis when component mounts
  useEffect(() => {
    if (portfolio && user) {
      Promise.all([
        analyzePortfolio(portfolio),
        generateRecommendations(portfolio, user),
        checkAlerts(portfolio),
        getModelPerformance(),
        fetchMarketData()
      ]).catch(error => {
        console.error('Failed to initialize AI analysis:', error);
      });
    } else {
      // Still fetch market data even without portfolio
      fetchMarketData();
    }
  }, [portfolio, user]);

  // Error boundary
  if (error) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>AI Service Error</AlertTitle>
        <AlertDescription>
          {error}
          <button 
            onClick={clearError}
            className="ml-2 underline hover:no-underline"
          >
            Try Again
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          🤖 AI Investment Insights
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Advanced AI-powered analysis and recommendations for your portfolio and the Kenyan market
        </p>
      </div>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="opportunities">Market Opportunities</TabsTrigger>
          <TabsTrigger value="alerts">Risk Alerts</TabsTrigger>
          <TabsTrigger value="performance">Model Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                📊 Portfolio Risk Analysis
              </CardTitle>
              <CardDescription>
                AI-powered risk analysis based on market volatility and portfolio composition
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex items-center gap-2 justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <span className="text-lg">Analyzing portfolio risk...</span>
                </div>
              ) : riskMetrics ? (
                <div className="space-y-6">
                  {/* Overall Risk Score */}
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2" style={{ 
                      color: riskMetrics.overallRisk < 30 ? '#10b981' : 
                             riskMetrics.overallRisk < 70 ? '#f59e0b' : '#ef4444' 
                    }}>
                      {riskMetrics.overallRisk}/100
                    </div>
                    <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      Overall Risk Score
                    </div>
                    <Progress 
                      value={riskMetrics.overallRisk} 
                      className="w-full max-w-xs mx-auto mt-4"
                    />
                  </div>

                  {/* Risk Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {formatPercentage(riskMetrics.volatility)}
                        </div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                          Volatility
                        </div>
                        <Progress 
                          value={riskMetrics.volatility} 
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {riskMetrics.beta.toFixed(2)}
                        </div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                          Beta (Market Risk)
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {riskMetrics.beta > 1 ? 'Higher than market' : 'Lower than market'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {formatPercentage(riskMetrics.concentrationRisk)}
                        </div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                          Concentration Risk
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Portfolio diversification
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      🎯 AI Risk Assessment
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {riskMetrics.assessment}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Risk Analysis Available</h3>
                  <p className="text-sm">Risk analysis data will appear here once portfolio analysis is complete</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                🎯 AI Investment Recommendations
              </CardTitle>
              <CardDescription>
                Personalized investment suggestions based on your portfolio and market analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex items-center gap-2 justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                  <span className="text-lg">Generating AI recommendations...</span>
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="border-2 border-green-200 dark:border-green-700 rounded-lg p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
                            {rec.action}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="bg-white dark:bg-gray-800">
                              🎯 {rec.category}
                            </Badge>
                            <Badge variant="outline" className="bg-white dark:bg-gray-800">
                              💼 {rec.asset}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {Math.round(rec.confidence)}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recommendation Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                          <div className="text-2xl mb-1">💰</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Expected Return</div>
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            +{formatPercentage(rec.expectedReturn)}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                          <div className="text-2xl mb-1">⏰</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Time Horizon</div>
                          <div className="text-lg font-semibold">{rec.timeframe}</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                          <div className="text-2xl mb-1">🎯</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Priority</div>
                          <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'outline'}>
                            {rec.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                          📋 Recommendation Details
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{rec.reasoning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Recommendations Available</h3>
                  <p className="text-sm">AI recommendations will appear here once portfolio analysis is complete</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                🇰🇪 Kenya Market Opportunities
              </CardTitle>
              <CardDescription>
                Exclusive investment opportunities in the Kenyan market identified by AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Market Data Section - Top Gainers & Losers */}
              <Card className="mb-6 border-l-4 border-l-teal-500">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-teal-500" />
                    📈 Today's Market Leaders
                  </CardTitle>
                  <CardDescription>
                    Real-time top performers and underperformers on the NSE
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {marketDataLoading ? (
                    <div className="flex items-center gap-2 justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                      <span className="text-lg">Loading market data...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Top Gainers */}
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          📈 Top Gainers
                        </h3>
                        <div className="space-y-3">
                          {topGainers.length > 0 ? topGainers.map((stock, index) => (
                            <div key={stock.symbol} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-sm">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 dark:text-white">
                                    {stock.symbol}
                                  </div>
                                  <div className="text-xs text-gray-500">{stock.name}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  KES {stock.price.toFixed(2)}
                                </div>
                                <div className="text-green-600 dark:text-green-400 text-sm font-medium">
                                  +{formatPercentage(stock.changePercent)}
                                </div>
                              </div>
                            </div>
                          )) : (
                            <div className="text-center py-4 text-gray-500">
                              No gainer data available
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Top Losers */}
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4 flex items-center gap-2">
                          <TrendingDown className="h-5 w-5" />
                          📉 Top Losers
                        </h3>
                        <div className="space-y-3">
                          {topLosers.length > 0 ? topLosers.map((stock, index) => (
                            <div key={stock.symbol} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 font-semibold text-sm">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 dark:text-white">
                                    {stock.symbol}
                                  </div>
                                  <div className="text-xs text-gray-500">{stock.name}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  KES {stock.price.toFixed(2)}
                                </div>
                                <div className="text-red-600 dark:text-red-400 text-sm font-medium">
                                  {formatPercentage(stock.changePercent)}
                                </div>
                              </div>
                            </div>
                          )) : (
                            <div className="text-center py-4 text-gray-500">
                              No loser data available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Opportunities */}
              {isLoading ? (
                <div className="flex items-center gap-2 justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                  <span className="text-lg">Discovering local market opportunities...</span>
                </div>
              ) : opportunities.length > 0 ? (
                <div className="space-y-6">
                  {opportunities.map((opp, index) => (
                    <div key={index} className="border-2 border-purple-200 dark:border-purple-700 rounded-lg p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
                      {/* Opportunity Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-purple-800 dark:text-purple-200">
                            {opp.name} ({opp.symbol})
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="bg-white dark:bg-gray-800">
                              🏢 {opp.sector}
                            </Badge>
                            <Badge variant="outline" className="bg-white dark:bg-gray-800">
                              📊 {opp.marketCap}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Potential Return</div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            +{formatPercentage(opp.potentialReturn)}
                          </div>
                          <div className="text-xs text-gray-500">in {opp.timeframe}</div>
                        </div>
                      </div>

                      {/* Opportunity Description */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                          🎯 Investment Opportunity
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{opp.opportunity}</p>
                        
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                          <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-1">
                            🌍 Local Market Advantage
                          </h5>
                          <p className="text-xs text-purple-700 dark:text-purple-300">{opp.localAdvantage}</p>
                        </div>
                      </div>

                      {/* Key Reasons */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {opp.reasoning.map((reason, reasonIndex) => (
                          <div key={reasonIndex} className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                            <div className="text-2xl mb-1">
                              {reasonIndex === 0 ? '📈' : reasonIndex === 1 ? '🏦' : '🚀'}
                            </div>
                            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {reason}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Risk Level Indicator */}
                      <div className="mt-4 flex items-center justify-between">
                        <Badge 
                          variant={opp.riskLevel === 'low' ? 'default' : opp.riskLevel === 'medium' ? 'secondary' : 'destructive'}
                          className="flex items-center gap-1"
                        >
                          <Shield className="h-3 w-3" />
                          {opp.riskLevel.charAt(0).toUpperCase() + opp.riskLevel.slice(1)} Risk
                        </Badge>
                        <div className="text-xs text-gray-500">
                          Last updated: {new Date(opp.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Zap className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Opportunities Found</h3>
                  <p className="text-sm">Kenya market opportunities will appear here once AI analysis is complete</p>
                  <div className="mt-4 text-xs text-gray-500">
                    🇰🇪 Focusing on NSE-listed companies and local market dynamics
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                ⚠️ Portfolio Risk Alerts
              </CardTitle>
              <CardDescription>
                AI-powered alerts for portfolio concentration and risk warnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center gap-2 justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                  <span className="text-lg">Scanning for risk alerts...</span>
                </div>
              ) : alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <Alert key={index} variant={alert.severity === 'high' ? 'destructive' : 'default'} className="border-l-4 border-l-red-500">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="flex items-center gap-2">
                        {alert.severity === 'high' ? '🚨' : alert.severity === 'medium' ? '⚠️' : 'ℹ️'}
                        {alert.title}
                        <Badge variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'secondary' : 'outline'}>
                          {alert.severity}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription className="mt-2">
                        <p className="mb-3">{alert.message}</p>
                        {alert.recommendation && (
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-sm font-medium">💡 Recommended Action:</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{alert.recommendation}</p>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          Alert generated on {new Date(alert.timestamp).toLocaleDateString()}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-16 w-16 mx-auto mb-4 opacity-50 text-green-500" />
                  <h3 className="text-lg font-semibold mb-2 text-green-600">No Active Alerts</h3>
                  <p className="text-sm">Your portfolio looks healthy! Risk alerts will appear here if any issues are detected.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Model Performance Section */}
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-500" />
                📈 AI Model Performance Tracking
              </CardTitle>
              <CardDescription>
                Real-time monitoring of AI model accuracy and prediction success rates
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex items-center gap-2 justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                  <span className="text-lg">Loading model performance data...</span>
                </div>
              ) : modelPerformance ? (
                <div className="space-y-6">
                  {/* Performance Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                      <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                        {formatPercentage(modelPerformance.accuracy)}
                      </div>
                      <div className="font-semibold text-gray-700 dark:text-gray-300">
                        Overall Accuracy
                      </div>
                      <Progress value={modelPerformance.accuracy} className="mt-3" />
                    </div>

                    <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {formatPercentage(modelPerformance.predictionSuccess)}
                      </div>
                      <div className="font-semibold text-gray-700 dark:text-gray-300">
                        Prediction Success
                      </div>
                      <Progress value={modelPerformance.predictionSuccess} className="mt-3" />
                    </div>

                    <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                        {formatPercentage(modelPerformance.confidence)}
                      </div>
                      <div className="font-semibold text-gray-700 dark:text-gray-300">
                        Model Confidence
                      </div>
                      <Progress value={modelPerformance.confidence} className="mt-3" />
                    </div>
                  </div>

                  {/* Detailed Performance Metrics */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      🔍 Detailed Performance Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Recommendation Accuracy:</span>
                        <span className="ml-2 text-green-600 dark:text-green-400">
                          {formatPercentage(modelPerformance.recommendationAccuracy)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Risk Assessment Accuracy:</span>
                        <span className="ml-2 text-blue-600 dark:text-blue-400">
                          {formatPercentage(modelPerformance.riskAccuracy)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Market Prediction Accuracy:</span>
                        <span className="ml-2 text-purple-600 dark:text-purple-400">
                          {formatPercentage(modelPerformance.marketPredictionAccuracy)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Last Model Update:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {new Date(modelPerformance.lastUpdate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Insights */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2">
                      🧠 AI Model Insights
                    </h4>
                    <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                      {modelPerformance.insights}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Performance Data Available</h3>
                  <p className="text-sm">AI model performance metrics will appear here once analysis is complete</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
