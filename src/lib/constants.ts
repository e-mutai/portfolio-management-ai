// Application Constants
export const APP_NAME = 'Aiser';
export const APP_DESCRIPTION = 'AI-Powered Investment Advisory Platform';
export const APP_VERSION = '1.0.0';

// API Configuration
export const API_TIMEOUT = 15000; // 15 seconds
export const API_RETRY_COUNT = 3;
export const API_RETRY_DELAY = 1000; // 1 second

// Authentication
export const TOKEN_STORAGE_KEY = 'auth_token';
export const USER_STORAGE_KEY = 'user';
export const PASSWORD_MIN_LENGTH = 8;
export const SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Market Data
export const MARKET_DATA_REFRESH_INTERVAL = 30000; // 30 seconds
export const DEFAULT_MARKET_SYMBOLS = ['EQTY', 'KCB', 'SAFCOM', 'EABL', 'BAMB'];
export const MAX_PORTFOLIO_HOLDINGS = 50;

// Investment Limits
export const MIN_INVESTMENT_AMOUNT = 100;
export const MAX_INVESTMENT_AMOUNT = 10000000;
export const DEFAULT_INVESTMENT_AMOUNT = 1000;

// Risk Assessment
export const RISK_LEVELS = ['conservative', 'moderate', 'aggressive'] as const;
export const INVESTMENT_EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

// Currency
export const DEFAULT_CURRENCY = 'KES';
export const SUPPORTED_CURRENCIES = ['KES', 'USD', 'EUR', 'GBP'] as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Chart Colors
export const CHART_COLORS = [
  '#22c55e', // green-500
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#84cc16', // lime-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
] as const;

// Performance Metrics
export const PERFORMANCE_PERIODS = {
  '1D': 1,
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
  'YTD': 'ytd',
  'ALL': 'all',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  AUTHENTICATION_ERROR: 'Authentication failed. Please sign in again.',
  AUTHORIZATION_ERROR: 'You do not have permission to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SIGN_IN: 'Welcome back! You have been signed in successfully.',
  SIGN_UP: 'Account created successfully! Welcome to Aiser.',
  SIGN_OUT: 'You have been signed out successfully.',
  PROFILE_UPDATED: 'Your profile has been updated successfully.',
  INVESTMENT_ADDED: 'Investment added to your portfolio successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'aiser_auth_token',
  USER_DATA: 'aiser_user_data',
  PREFERENCES: 'aiser_preferences',
  PORTFOLIO_VIEW: 'aiser_portfolio_view',
  DASHBOARD_LAYOUT: 'aiser_dashboard_layout',
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_PORTFOLIO_SIMULATION: true,
  ENABLE_AI_RECOMMENDATIONS: true,
  ENABLE_SOCIAL_TRADING: false,
  ENABLE_CRYPTO_TRADING: false,
  ENABLE_REAL_TIME_NOTIFICATIONS: true,
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s\-()]{10,}$/,
  NAME_REGEX: /^[a-zA-Z\s'-]{2,50}$/,
  STOCK_SYMBOL_REGEX: /^[A-Z]{1,5}$/,
  PASSWORD_REQUIREMENTS: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  CHART: 'MMM dd',
  ISO: 'yyyy-MM-dd',
  TIMESTAMP: 'yyyy-MM-dd HH:mm:ss',
} as const;

// Development
export const DEV_CONFIG = {
  ENABLE_DEBUG_LOGS: process.env.NODE_ENV === 'development',
  MOCK_API_DELAY: 500, // milliseconds
  ENABLE_MOCK_DATA: process.env.NODE_ENV === 'development',
} as const;
