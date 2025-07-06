import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Plus, Minus, Edit, Trash2 } from 'lucide-react';
import { Portfolio, PortfolioHolding } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/formatters';

interface PortfolioHoldingsProps {
  portfolio: Portfolio | null;
  onAddHolding?: () => void;
  onEditHolding?: (holding: PortfolioHolding) => void;
  onRemoveHolding?: (symbol: string) => void;
}

export const PortfolioHoldings: React.FC<PortfolioHoldingsProps> = ({
  portfolio,
  onAddHolding,
  onEditHolding,
  onRemoveHolding
}) => {
  if (!portfolio || !portfolio.holdings?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Portfolio Holdings
            <Button size="sm" onClick={onAddHolding}>
              <Plus className="h-4 w-4 mr-2" />
              Add Holding
            </Button>
          </CardTitle>
          <CardDescription>Your current investment positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <Plus className="h-12 w-12 mx-auto mb-2" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Holdings Yet</h3>
            <p className="text-gray-500 mb-4">Start building your portfolio by adding your first stock.</p>
            <Button onClick={onAddHolding}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Holding
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Portfolio Holdings
          <Button size="sm" onClick={onAddHolding}>
            <Plus className="h-4 w-4 mr-2" />
            Add Holding
          </Button>
        </CardTitle>
        <CardDescription>Your current investment positions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Shares</TableHead>
                <TableHead>Avg Price</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Gain/Loss</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolio.holdings.map((holding) => {
                const gainLoss = holding.current_value - (holding.shares * holding.avg_price);
                const gainPercentage = holding.gain_percentage || 
                  ((holding.current_value - (holding.shares * holding.avg_price)) / (holding.shares * holding.avg_price)) * 100;

                return (
                  <TableRow key={holding.symbol}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{holding.symbol}</div>
                        <div className="text-sm text-gray-500">NSE Listed</div>
                      </div>
                    </TableCell>
                    <TableCell>{holding.shares.toLocaleString()}</TableCell>
                    <TableCell>{formatCurrency(holding.avg_price, 'KES')}</TableCell>
                    <TableCell>{formatCurrency(holding.current_value, 'KES')}</TableCell>
                    <TableCell>
                      <div className={`font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(gainLoss, 'KES')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={gainPercentage >= 0 ? "default" : "destructive"}
                          className={`flex items-center space-x-1 ${
                            gainPercentage >= 0 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {gainPercentage >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span>{formatPercentage(gainPercentage)}</span>
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditHolding?.(holding)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRemoveHolding?.(holding.symbol)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Portfolio Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{portfolio.holdings.length}</div>
            <div className="text-sm text-gray-500">Total Holdings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(portfolio.total_investment, 'KES')}
            </div>
            <div className="text-sm text-gray-500">Total Investment</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${portfolio.total_gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(portfolio.total_gain, 'KES')}
            </div>
            <div className="text-sm text-gray-500">
              {portfolio.total_gain >= 0 ? 'Total Gain' : 'Total Loss'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioHoldings;
