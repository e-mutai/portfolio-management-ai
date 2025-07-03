// User related types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified: boolean;
  profilePicture?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  investmentExperience: 'beginner' | 'intermediate' | 'advanced';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals: string[];
  monthlyIncome?: number;
  createdAt: string;
  updatedAt: string;
}

// Authentication types
export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: User;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Market data types
export interface MarketStock {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  sector?: string;
  marketCap?: number;
  volume?: number;
  high52Week?: number;
  low52Week?: number;
}

export interface MarketData {
  symbol: string;
  company_name: string;
  current_price: number;
  change_percent: number;
  sector: string;
  volume?: number;
  market_cap?: number;
}

// Portfolio types
export interface PortfolioHolding {
  id?: string;
  portfolio_id?: string;
  symbol: string;
  shares: number;
  avg_price: number;
  current_value: number;
  current_price?: number;
  total_gain?: number;
  gain_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  name?: string;
  total_value: number;
  total_investment: number;
  total_gain: number;
  gain_percentage: number;
  cash_balance: number;
  risk_tolerance?: 'low' | 'medium' | 'high';
  holdings: PortfolioHolding[];
  created_at?: string;
  updated_at?: string;
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PerformanceData {
  month: string;
  value: number;
}

export interface AllocationData {
  name: string;
  value: number;
  color: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

// Investment recommendation types
export interface InvestmentRecommendation {
  id: string;
  symbol: string;
  company_name: string;
  recommendation_type: 'buy' | 'sell' | 'hold';
  target_price: number;
  current_price: number;
  confidence_score: number;
  reasoning: string;
  risk_level: 'low' | 'medium' | 'high';
  time_horizon: 'short' | 'medium' | 'long';
  created_at: string;
}

// Risk assessment types
export interface RiskAssessment {
  id: string;
  user_id: string;
  score: number;
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  investment_horizon: number;
  financial_goals: string[];
  monthly_income?: number;
  emergency_fund_months?: number;
  debt_to_income_ratio?: number;
  assessment_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// News and analysis types
export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  published_at: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  relevance_score?: number;
}

// Market analysis types
export interface MarketAnalysis {
  id: string;
  market: string;
  analysis_type: 'technical' | 'fundamental' | 'sentiment';
  summary: string;
  indicators: Record<string, any>;
  recommendation: 'bullish' | 'bearish' | 'neutral';
  confidence_level: number;
  created_at: string;
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  isSubmitting: boolean;
  errors: ValidationError[];
  success: boolean;
}
