// ============================================ 
// Main Application Types
// ============================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ============================================
// Market Data Types
// ============================================

export interface MarketStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  sector?: string;
  timestamp?: string;
}

export interface MarketData {
  symbol: string;
  company_name: string;
  current_price: number;
  change_percent: number;
  volume?: number;
  market_cap?: number;
  sector?: string;
  timestamp?: string;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose?: number;
}

export interface MarketSummary {
  index: string;
  value: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

// ============================================
// Portfolio Types
// ============================================

export interface PortfolioHolding {
  symbol: string;
  shares: number;
  avg_price: number;
  current_value: number;
  gain_percentage?: number;
}

export interface Portfolio {
  id: string;
  user_id: string;
  total_value: number;
  total_investment: number;
  total_gain: number;
  gain_percentage: number;
  cash_balance: number;
  holdings: PortfolioHolding[];
}

export interface PerformanceData {
  date?: string;
  month?: string;
  value: number;
  benchmark?: number;
}

export interface AllocationData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

// ============================================
// User & Auth Types
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified?: boolean;
  profilePicture?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  investmentExperience?: 'beginner' | 'intermediate' | 'advanced';
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals?: string[];
  monthlyIncome?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================
// Chart & UI Types
// ============================================

export interface ChartDataPoint {
  date: string;
  value: number;
  [key: string]: any;
}

export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

// ============================================
// Analytics Types
// ============================================

export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  beta: number;
  alpha: number;
}

export interface RiskMetrics {
  valueAtRisk: number;
  conditionalVaR: number;
  standardDeviation: number;
  downside_deviation: number;
  trackingError: number;
}

// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// ============================================
// Settings Types
// ============================================

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    priceAlerts: boolean;
    marketNews: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    shareAnalytics: boolean;
  };
}

// ============================================
// Search Types
// ============================================

export interface SearchResult {
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'fund' | 'index';
  exchange: string;
  currency: string;
}

// ============================================
// News Types
// ============================================

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  symbols?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  relevanceScore?: number;
}

// ============================================
// Utility Types
// ============================================

export type SortDirection = 'asc' | 'desc';
export type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX';
export type MarketStatus = 'open' | 'closed' | 'pre-market' | 'after-hours';

// ============================================
// Export all from ai types
// ============================================
// AI types are now stable and can be exported
export * from './ai/types';
