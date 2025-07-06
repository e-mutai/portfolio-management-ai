import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRealTimeMarket } from '@/hooks/useRealTimeMarket';
import { AIInsightsPanel } from '@/components/AIInsightsPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, PieChart, LogOut, Brain, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { formatCurrency, formatPercentage } from '@/lib/formatters';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  // Add real-time market data
  const {
    stocks: marketData,
    marketSummary,
    isLoading: marketLoading,
    error: marketError,
    lastUpdated,
    refresh: refreshMarket
  } = useRealTimeMarket({
    refreshInterval: 30000, // 30 seconds
    enableRealTime: true
  });

  // Calculate market statistics
  const gainers = marketData.filter((stock: any) => (stock.changePercent || 0) > 0)
    .sort((a: any, b: any) => (b.changePercent || 0) - (a.changePercent || 0))
    .slice(0, 10);
  
  const losers = marketData.filter((stock: any) => (stock.changePercent || 0) < 0)
    .sort((a: any, b: any) => (a.changePercent || 0) - (b.changePercent || 0))
    .slice(0, 10);

  console.log('SimpleWorkingDashboard rendering...', { 
    marketDataCount: marketData.length, 
    marketLoading,
    gainersCount: gainers.length,
    losersCount: losers.length
  });

  // Generate portfolio performance data
  const performanceData = [
    { month: 'Jan', value: 30000 },
    { month: 'Feb', value: 32000 },
    { month: 'Mar', value: 31500 },
    { month: 'Apr', value: 35000 },
    { month: 'May', value: 38000 },
    { month: 'Jun', value: 42000 },
    { month: 'Jul', value: 45231 }
  ];

  // Generate portfolio holdings allocation data
  const allocationData = [
    { name: 'Safaricom (SCOM)', value: 12500, percentage: 35, color: 'hsl(var(--primary))' },
    { name: 'Equity Bank (EQTY)', value: 8900, percentage: 25, color: 'hsl(var(--accent))' },
    { name: 'KCB Group (KCB)', value: 6400, percentage: 18, color: 'hsl(var(--warning))' },
    { name: 'EABL', value: 4200, percentage: 12, color: 'hsl(var(--destructive))' },
    { name: 'Others', value: 3500, percentage: 10, color: 'hsl(var(--muted))' }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      // Navigate to force logout page to ensure complete cleanup
      navigate('/logout', { replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
      // Fallback: force logout anyway
      navigate('/logout', { replace: true });
    }
  };

  // Show loading state for initial load
  if (marketLoading && marketData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state if needed
  if (marketError && marketData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Unable to Load Market Data</h3>
          <p className="text-muted-foreground mb-4">{marketError}</p>
          <Button onClick={refreshMarket}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Aiser</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Market Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${marketLoading ? 'bg-warning' : 'bg-success'}`}></div>
                <span className="text-xs text-muted-foreground">
                  {marketLoading ? 'Loading...' : `${marketData.length} stocks`}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={refreshMarket}
                  disabled={marketLoading}
                >
                  <RefreshCw className={`w-3 h-3 ${marketLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">Welcome, {user?.email}</span>
              <Button variant="outline" onClick={handleSignOut} size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Data Status Banner */}
        {marketError && (
          <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <RefreshCw className="h-5 w-5 text-warning mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-warning-foreground">Data Issue</h4>
                  <p className="text-sm text-warning-foreground/80">{marketError}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={refreshMarket}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {lastUpdated && (
          <div className="mb-6 p-3 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center justify-center text-sm text-success-foreground">
              <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></div>
              Live NSE data • Last updated {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES 45,231.89</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">+KES 12,234</div>
              <p className="text-xs text-muted-foreground">+8.5% portfolio return</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NSE Index</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {marketLoading ? (
                  <div className="animate-pulse bg-muted h-8 w-20 rounded"></div>
                ) : marketSummary ? (
                  marketSummary.value.toFixed(2)
                ) : (
                  '160.13'
                )}
              </div>
              <p className={`text-xs ${
                marketSummary && marketSummary.changePercent >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {marketLoading ? (
                  <div className="animate-pulse bg-muted h-4 w-16 rounded"></div>
                ) : marketSummary ? (
                  `${marketSummary.changePercent >= 0 ? '+' : ''}${formatPercentage(marketSummary.changePercent)} today`
                ) : (
                  '+1.44% today'
                )}
              </p>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(lastUpdated).toLocaleTimeString()}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES 15,000</div>
              <p className="text-xs text-muted-foreground">Available for investment</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="ai-insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-accent" />
              <span>AI Insights</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                NEW
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
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
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Portfolio Holdings Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Holdings</CardTitle>
                  <CardDescription>Your current stock allocations by value (KES)</CardDescription>
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
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(Number(value), 'KES'), 'Value']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="text-center">
                  <Target className="h-8 w-8 mx-auto text-primary mb-2" />
                  <CardTitle className="text-lg">Risk Assessment</CardTitle>
                  <CardDescription>Analyze your portfolio risk profile</CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="text-center">
                  <Brain className="h-8 w-8 mx-auto text-accent mb-2" />
                  <CardTitle className="text-lg">AI Recommendations</CardTitle>
                  <CardDescription>Get personalized investment advice</CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="text-center">
                  <BarChart3 className="h-8 w-8 mx-auto text-success mb-2" />
                  <CardTitle className="text-lg">Market Analysis</CardTitle>
                  <CardDescription>Explore market trends and insights</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="holdings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Portfolio Holdings
                  <Button size="sm">
                    <Target className="h-4 w-4 mr-2" />
                    Add Holding
                  </Button>
                </CardTitle>
                <CardDescription>Your current investment positions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-4">
                    <Target className="h-12 w-12 mx-auto mb-2" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No Holdings Yet</h3>
                  <p className="text-muted-foreground mb-4">Start building your portfolio by adding your first stock from the {marketData.length} available NSE stocks.</p>
                  <Button>
                    <Target className="h-4 w-4 mr-2" />
                    Add Your First Holding
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="market" className="mt-6">
            <div className="space-y-6">
              {/* Market Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Stocks</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{marketData.length}</div>
                    <p className="text-xs text-muted-foreground">NSE listed companies</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Top Gainers</CardTitle>
                    <TrendingUp className="h-4 w-4 text-success" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-success">{gainers.length}</div>
                    <p className="text-xs text-muted-foreground">Stocks moving up</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Top Losers</CardTitle>
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">{losers.length}</div>
                    <p className="text-xs text-muted-foreground">Stocks moving down</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {marketSummary?.marketCap || 'KES 2.5T'}
                    </div>
                    <p className="text-xs text-muted-foreground">Total market value</p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Gainers and Losers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Gainers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-success">
                      <TrendingUp className="h-5 w-5" />
                      Top Gainers
                    </CardTitle>
                    <CardDescription>Best performing stocks today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {gainers.slice(0, 8).map((stock: any, index: number) => (
                        <div key={stock.symbol} className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center text-success font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium">{stock.symbol}</h4>
                              <p className="text-sm text-muted-foreground">{formatCurrency(stock.price, 'KES')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="w-3 h-3 text-success" />
                              <span className="text-sm font-medium text-success">
                                +{formatPercentage(stock.changePercent)}
                              </span>
                            </div>
                            {stock.volume && (
                              <p className="text-xs text-muted-foreground">Vol: {stock.volume.toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Losers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <TrendingDown className="h-5 w-5" />
                      Top Losers
                    </CardTitle>
                    <CardDescription>Worst performing stocks today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {losers.slice(0, 8).map((stock: any, index: number) => (
                        <div key={stock.symbol} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center text-destructive font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium">{stock.symbol}</h4>
                              <p className="text-sm text-muted-foreground">{formatCurrency(stock.price, 'KES')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <TrendingDown className="w-3 h-3 text-destructive" />
                              <span className="text-sm font-medium text-destructive">
                                {formatPercentage(stock.changePercent)}
                              </span>
                            </div>
                            {stock.volume && (
                              <p className="text-xs text-muted-foreground">Vol: {stock.volume.toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* All Stocks List */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>All NSE Stocks</CardTitle>
                    <CardDescription>Complete list of {marketData.length} NSE-listed stocks with live prices</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshMarket}
                    disabled={marketLoading}
                  >
                    {marketLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent>
                  {marketData.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {marketData.map((stock: any) => (
                        <div key={stock.symbol} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-semibold text-sm">{stock.symbol.substring(0, 2)}</span>
                            </div>
                            <div>
                              <h4 className="font-medium">{stock.symbol}</h4>
                              <p className="text-sm text-muted-foreground">{stock.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(stock.price, 'KES')}</p>
                            <div className="flex items-center space-x-1">
                              {(stock.changePercent || 0) >= 0 ? (
                                <TrendingUp className="w-3 h-3 text-success" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-destructive" />
                              )}
                              <span className={`text-sm ${(stock.changePercent || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                                {(stock.changePercent || 0) >= 0 ? '+' : ''}{formatPercentage(stock.changePercent || 0)}
                              </span>
                            </div>
                            {stock.volume && (
                              <p className="text-xs text-muted-foreground">Vol: {stock.volume.toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      {marketLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Loading market data...</p>
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-foreground mb-2">No Market Data</h3>
                          <p className="text-muted-foreground mb-4">Unable to load NSE market data.</p>
                          <Button onClick={refreshMarket}>Try Again</Button>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-insights" className="mt-6">
            <AIInsightsPanel user={user} portfolio={undefined} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
