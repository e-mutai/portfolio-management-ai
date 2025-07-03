import api from './api';
import { Portfolio, PortfolioHolding, ApiResponse } from '@/types';

export interface CreatePortfolioRequest {
  name: string;
  description?: string;
  risk_tolerance: 'low' | 'medium' | 'high';
}

export interface AddHoldingRequest {
  symbol: string;
  shares: number;
  avg_price: number;
}

export interface UpdateHoldingRequest {
  shares: number;
  avg_price: number;
}

class PortfolioService {
  // Get user's portfolios
  async getUserPortfolios(): Promise<Portfolio[]> {
    try {
      const response = await api.get<ApiResponse<Portfolio[]>>('/portfolios');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch portfolios:', error);
      // Return sample data for demo if API fails
      return this.getSamplePortfolios();
    }
  }

  // Get specific portfolio by ID
  async getPortfolio(portfolioId: string): Promise<Portfolio | null> {
    try {
      const response = await api.get<ApiResponse<Portfolio>>(`/portfolios/${portfolioId}`);
      return response.data.data || null;
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      return this.getSamplePortfolio();
    }
  }

  // Create new portfolio
  async createPortfolio(data: CreatePortfolioRequest): Promise<Portfolio> {
    try {
      const response = await api.post<ApiResponse<Portfolio>>('/portfolios', data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create portfolio:', error);
      throw new Error('Failed to create portfolio');
    }
  }

  // Add holding to portfolio
  async addHolding(portfolioId: string, data: AddHoldingRequest): Promise<PortfolioHolding> {
    try {
      const response = await api.post<ApiResponse<PortfolioHolding>>(
        `/portfolios/${portfolioId}/holdings`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to add holding:', error);
      throw new Error('Failed to add holding');
    }
  }

  // Update holding in portfolio
  async updateHolding(
    portfolioId: string,
    holdingId: string,
    data: UpdateHoldingRequest
  ): Promise<PortfolioHolding> {
    try {
      const response = await api.put<ApiResponse<PortfolioHolding>>(
        `/portfolios/${portfolioId}/holdings/${holdingId}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to update holding:', error);
      throw new Error('Failed to update holding');
    }
  }

  // Remove holding from portfolio
  async removeHolding(portfolioId: string, holdingId: string): Promise<void> {
    try {
      await api.delete(`/portfolios/${portfolioId}/holdings/${holdingId}`);
    } catch (error) {
      console.error('Failed to remove holding:', error);
      throw new Error('Failed to remove holding');
    }
  }

  // Calculate portfolio metrics
  async getPortfolioMetrics(portfolioId: string): Promise<{
    totalValue: number;
    totalGain: number;
    gainPercentage: number;
    diversificationScore: number;
  }> {
    try {
      const response = await api.get<ApiResponse<any>>(`/portfolios/${portfolioId}/metrics`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch portfolio metrics:', error);
      throw new Error('Failed to fetch portfolio metrics');
    }
  }

  // Fallback sample data for demo purposes
  getSamplePortfolios(): Portfolio[] {
    return [this.getSamplePortfolio()];
  }

  getSamplePortfolio(): Portfolio {
    return {
      id: 'sample-portfolio-1',
      user_id: 'demo-user',
      total_value: 25000,
      total_investment: 20000,
      total_gain: 5000,
      gain_percentage: 25,
      cash_balance: 5000,
      holdings: [
        { 
          symbol: 'EQTY', 
          shares: 100, 
          avg_price: 40.00, 
          current_value: 4550
        },
        { 
          symbol: 'KCB', 
          shares: 50, 
          avg_price: 35.00, 
          current_value: 1937.50
        },
        { 
          symbol: 'SAFCOM', 
          shares: 200, 
          avg_price: 30.00, 
          current_value: 7040
        },
      ]
    };
  }
}

const portfolioService = new PortfolioService();
export default portfolioService;
