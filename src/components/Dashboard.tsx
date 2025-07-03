import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRealTimeMarket } from '@/hooks/useRealTimeMarket';
import marketService from '@/services/marketService';
import portfolioService from '@/services/portfolioService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, PieChart, LogOut, Brain } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { AIInsightsPanel } from '@/components/AIInsightsPanel';
import { MarketData, Portfolio, PerformanceData, AllocationData, LoadingState } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/formatters';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  
  // Use real-time market data hook
  const {
    stocks: marketData,
    marketSummary,
    isLoading: marketLoading,
    error: marketError,
    lastUpdated,
    isRealTime,
    refresh: refreshMarket
  } = useRealTimeMarket({
    refreshInterval: 30000, // 30 seconds
    enableRealTime: true
  });

  useEffect(() => {
    const initialize = async () => {
      setLoadingState('loading');
      try {
        await fetchPortfolio();
        setLoadingState('success');
      } catch (error) {
        console.warn('Failed to load portfolio data:', error);
        setPortfolio(portfolioService.getSamplePortfolio());
        setLoadingState('success');
      }
    };
    
    initialize();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeDashboard = async () => {
    setLoadingState('loading');
    try {
      await fetchPortfolio();
      refreshMarket(); // Refresh market data using real-time hook
      setLoadingState('success');
    } catch (error) {
      setLoadingState('error');
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchPortfolio = async () => {
    try {
      const portfolios = await portfolioService.getUserPortfolios();
      if (portfolios.length > 0) {
        setPortfolio(portfolios[0]); // Use the first portfolio for now
      } else {
        // If no portfolios exist, use sample data for demo
        setPortfolio(portfolioService.getSamplePortfolio());
      }
    } catch (error) {
      console.warn('Error fetching portfolio:', error);
      // Fallback to sample data
      setPortfolio(portfolioService.getSamplePortfolio());
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Sample data for charts with proper typing
  const performanceData: PerformanceData[] = [
    { month: 'Jan', value: 10000 },
    { month: 'Feb', value: 12000 },
    { month: 'Mar', value: 11500 },
    { month: 'Apr', value: 13000 },
    { month: 'May', value: 14500 },
    { month: 'Jun', value: 16000 },
  ];

  const allocationData: AllocationData[] = [
    { name: 'Stocks', value: 45, percentage: 45, color: '#22c55e' },
    { name: 'Bonds', value: 25, percentage: 25, color: '#3b82f6' },
    { name: 'SACCOs', value: 20, percentage: 20, color: '#f59e0b' },
    { name: 'Cash', value: 10, percentage: 10, color: '#6b7280' },
  ];

  // Use real market data or fallback values
  const nseIndex = marketSummary?.value || 2847.5;
  const nseChange = marketSummary?.changePercent || 1.2;

  if (loadingState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load dashboard data</p>
          <Button onClick={initializeDashboard}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">Aiser</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <Button variant="outline" onClick={handleSignOut} size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(portfolio?.total_value || 0, 'KES')}</div>
              <p className="text-xs text-muted-foreground">
                {portfolio?.gain_percentage && portfolio.gain_percentage > 0 ? '+' : ''}
                {formatPercentage(portfolio?.gain_percentage || 0)} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(portfolio?.total_gain || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(portfolio?.total_gain || 0, 'KES')}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(portfolio?.gain_percentage || 0)} overall return
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                NSE Index
                {isRealTime && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600">LIVE</span>
                  </div>
                )}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nseIndex.toLocaleString()}</div>
              <p className={`text-xs flex items-center justify-between ${nseChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="flex items-center">
                  {nseChange >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {nseChange >= 0 ? '+' : ''}{formatPercentage(nseChange)} today
                </span>
                {lastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(portfolio?.cash_balance || 0, 'KES')}</div>
              <p className="text-xs text-muted-foreground">Available for investment</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
            <TabsTrigger value="market">Market Data</TabsTrigger>
            <TabsTrigger value="ai-insights" className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700">
              <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold">🤖 AI Insights</span>
              <Badge variant="secondary" className="ml-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                NEW
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Portfolio Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                  <CardDescription>Your investment growth over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value), 'KES'), 'Value']} />
                      <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Asset Allocation */}
              <Card>
                <CardHeader>
                  <CardTitle>Asset Allocation</CardTitle>
                  <CardDescription>Your current investment distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Risk Assessment</CardTitle>
                  <CardDescription>Complete your investment risk profile</CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <PieChart className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Get Recommendations</CardTitle>
                  <CardDescription>AI-powered investment suggestions</CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Market Analysis</CardTitle>
                  <CardDescription>Detailed market insights and trends</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="market" className="space-y-6 mt-6">
            {/* Top Gainers & Losers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Gainers */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    📈 Top Gainers
                    {isRealTime && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600">LIVE</span>
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Best performing stocks on the NSE today
                    {!isRealTime && (
                      <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-700">
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-center gap-1">
                          <span>⚠️</span>
                          <span>Showing simulated market data for demo purposes</span>
                        </p>
                      </div>
                    )}
                    {lastUpdated && (
                      <span className="block text-xs text-muted-foreground mt-1">
                        Last updated: {new Date(lastUpdated).toLocaleString()}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {marketLoading && marketData.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading market data...</p>
                    </div>
                  ) : marketError && marketData.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-red-600 mb-2">Failed to load market data</p>
                      <Button variant="outline" size="sm" onClick={refreshMarket}>
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(marketData || [])
                        .filter(stock => (stock.changePercent || stock.change_percent || 0) > 0)
                        .sort((a, b) => (b.changePercent || b.change_percent || 0) - (a.changePercent || a.change_percent || 0))
                        .slice(0, 5)
                        .map((stock, index) => (
                        <div key={stock.symbol} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium">{stock.symbol}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{stock.name || stock.company_name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(stock.price || stock.current_price || 0, 'KES')}</p>
                            <p className="text-sm flex items-center text-green-600 dark:text-green-400">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              +{formatPercentage(stock.changePercent || stock.change_percent || 0)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Losers */}
              <Card className="border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    � Top Losers
                    {isRealTime && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600">LIVE</span>
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Worst performing stocks on the NSE today
                    {!isRealTime && (
                      <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-700">
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-center gap-1">
                          <span>⚠️</span>
                          <span>Showing simulated market data for demo purposes</span>
                        </p>
                      </div>
                    )}
                    {lastUpdated && (
                      <span className="block text-xs text-muted-foreground mt-1">
                        Last updated: {new Date(lastUpdated).toLocaleString()}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {marketLoading && marketData.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading market data...</p>
                    </div>
                  ) : marketError && marketData.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-red-600 mb-2">Failed to load market data</p>
                      <Button variant="outline" size="sm" onClick={refreshMarket}>
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(marketData || [])
                        .filter(stock => (stock.changePercent || stock.change_percent || 0) < 0)
                        .sort((a, b) => (a.changePercent || a.change_percent || 0) - (b.changePercent || b.change_percent || 0))
                        .slice(0, 5)
                        .map((stock, index) => (
                        <div key={stock.symbol} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium">{stock.symbol}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{stock.name || stock.company_name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(stock.price || stock.current_price || 0, 'KES')}</p>
                            <p className="text-sm flex items-center text-red-600 dark:text-red-400">
                              <TrendingDown className="w-4 h-4 mr-1" />
                              {formatPercentage(stock.changePercent || stock.change_percent || 0)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Market Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    📊 Market Summary
                    {isRealTime ? (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600">LIVE</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs text-yellow-600">DEMO</span>
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Overall market performance and index data
                    {!isRealTime && (
                      <span className="block text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        📊 Using simulated data for demonstration
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshMarket}
                  disabled={marketLoading}
                  className="ml-2"
                >
                  {marketLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      🔄 Refresh Data
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {marketSummary && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {marketSummary.value.toFixed(2)}
                      </div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {marketSummary.index}
                      </div>
                      <div className={`text-sm flex items-center justify-center mt-1 ${marketSummary.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {marketSummary.changePercent >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {marketSummary.changePercent >= 0 ? '+' : ''}{formatPercentage(marketSummary.changePercent)}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(marketSummary.change, 'KES')}
                      </div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Change
                      </div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {(marketSummary.volume / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Volume
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-insights" className="mt-6">
            {user && <AIInsightsPanel user={user} portfolio={portfolio || undefined} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
