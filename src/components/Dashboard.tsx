import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, PieChart, LogOut } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

interface MarketData {
  symbol: string;
  company_name: string;
  current_price: number;
  change_percent: number;
  sector: string;
}

interface Portfolio {
  id: string;
  total_value: number;
  cash_balance: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
    fetchPortfolio();
  }, []);

  const fetchMarketData = async () => {
    try {
      const { data, error } = await supabase
        .from('market_data')
        .select('symbol, company_name, current_price, change_percent, sector')
        .order('market_cap', { ascending: false })
        .limit(10);

      if (error) throw error;
      setMarketData(data || []);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setPortfolio(data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Sample data for charts
  const performanceData = [
    { month: 'Jan', value: 10000 },
    { month: 'Feb', value: 12000 },
    { month: 'Mar', value: 11500 },
    { month: 'Apr', value: 13000 },
    { month: 'May', value: 14500 },
    { month: 'Jun', value: 16000 },
  ];

  const allocationData = [
    { name: 'Stocks', value: 45, color: '#22c55e' },
    { name: 'Bonds', value: 25, color: '#3b82f6' },
    { name: 'SACCOs', value: 20, color: '#f59e0b' },
    { name: 'Cash', value: 10, color: '#6b7280' },
  ];

  const nseIndex = 2847.5;
  const nseChange = 1.2;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">Kenya Wealth AI</h1>
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
              <div className="text-2xl font-bold">KSh {portfolio?.total_value.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">
                +8.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NSE 20 Index</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nseIndex.toLocaleString()}</div>
              <p className={`text-xs ${nseChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {nseChange >= 0 ? '+' : ''}{nseChange}% today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KSh {portfolio?.cash_balance.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">
                Available for investment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Moderate</div>
              <Progress value={65} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
                  <Tooltip formatter={(value) => [`KSh ${Number(value).toLocaleString()}`, 'Value']} />
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

        {/* NSE Market Leaders */}
        <Card>
          <CardHeader>
            <CardTitle>NSE Market Leaders</CardTitle>
            <CardDescription>Top performing stocks on the Nairobi Securities Exchange</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketData.map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h4 className="font-medium">{stock.symbol}</h4>
                      <p className="text-sm text-gray-600">{stock.company_name}</p>
                    </div>
                    <Badge variant="secondary">{stock.sector}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">KSh {stock.current_price.toFixed(2)}</p>
                    <p className={`text-sm flex items-center ${stock.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.change_percent >= 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
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
      </div>
    </div>
  );
};

export default Dashboard;
