# Aiser - AI-Powered Investment Advisory Platform

A comprehensive AI-powered investment advisory platform featuring real-time market data, international market analysis via YFinance, and intelligent portfolio management with advanced machine learning capabilities.

## Features

### Core Features
- **Authentication System**: Secure user registration and login with JWT tokens
- **Real-time Market Data**: Live NSE (Nairobi Stock Exchange) market data via RapidAPI
- **International Markets**: Global stock market data via YFinance API
- **Portfolio Management**: Track and manage investment portfolios
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

### AI-Powered Features ✨

#### 🧠 AI-Powered Risk Assessment Engine
- **Portfolio Analysis**: Real-time diversification metrics and correlation analysis
- **NSE Volatility Monitoring**: Kenya-specific market volatility tracking with VIX equivalent
- **Predictive Risk Modeling**: TensorFlow.js neural network for risk probability prediction
- **Localized Risk Scoring**: Kenya market-adjusted risk assessments with economic indicators
- **Advanced Risk Metrics**: Sharpe ratio, maximum drawdown, Value at Risk (VaR), and Beta calculations

#### 🎯 Intelligent Recommendation System
- **NSE Investment Recommendations**: AI-driven stock picks based on technical and fundamental analysis
- **Portfolio Optimization**: Mean-variance optimization with risk-return balance
- **Natural Language Insights**: AI-generated market commentary and investment explanations
- **Local Opportunity Identification**: Kenya-specific investment opportunities and sector analysis
- **Smart Rebalancing**: Automated portfolio rebalancing suggestions

#### 📊 AI Dashboard Integration
- **Real-time AI Insights Panel**: Comprehensive AI analysis in an intuitive tabbed interface
- **Risk Alerts**: Proactive notifications for portfolio risk changes
- **Market Sentiment Analysis**: AI-powered sentiment tracking for NSE stocks
- **Performance Predictions**: Machine learning-based portfolio performance forecasting

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **Axios** for API requests
- **React Router** for navigation
- **React Query** for data fetching

### AI & Machine Learning
- **TensorFlow.js** for client-side neural networks
- **ML-Matrix** for matrix operations and statistical analysis
- **Natural** for natural language processing and sentiment analysis
- **Custom AI Engine** for risk assessment and portfolio optimization

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Helmet** for security
- **CORS** for cross-origin requests
- **Rate limiting** for API protection

### APIs
- **RapidAPI YFinance**: International stock market data
- **RapidAPI NSE**: Nairobi Stock Exchange data

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- RapidAPI account with subscriptions to:
  - YFinance API
  - Nairobi Stock Exchange API

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aiser
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Environment Configuration**

   **Backend (.env)**
   ```bash
   cd backend
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/aiser
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   RAPIDAPI_KEY=your-rapidapi-key-here
   YFINANCE_API_URL=https://yahoo-finance15.p.rapidapi.com
   YFINANCE_API_HOST=yahoo-finance15.p.rapidapi.com
   NSE_API_URL=https://nairobi-stock-exchange.p.rapidapi.com
   NSE_API_HOST=nairobi-stock-exchange.p.rapidapi.com
   FRONTEND_URL=http://localhost:5173
   ```

   **Frontend (.env)**
   ```bash
   # In the root directory
   echo "VITE_API_URL=http://localhost:5000/api" > .env
   ```

4. **Database Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Update the `MONGODB_URI` in your backend `.env` file

5. **RapidAPI Setup**
   - Sign up at [RapidAPI](https://rapidapi.com/)
   - Subscribe to the YFinance and NSE APIs
   - Get your API key and update the `.env` file

### Running the Application

**Development Mode (Recommended)**
```bash
# Run both frontend and backend concurrently
npm run dev:full
```

**Or run separately:**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Market Data
- `GET /api/market/nse/stocks` - Get all NSE stocks
- `GET /api/market/nse/stock/:symbol` - Get specific NSE stock
- `GET /api/market/nse/market-data` - Get NSE market data
- `GET /api/market/nse/top-gainers` - Get NSE top gainers
- `GET /api/market/nse/top-losers` - Get NSE top losers
- `GET /api/market/yfinance/quote/:symbol` - Get YFinance quote
- `GET /api/market/yfinance/historical/:symbol` - Get historical data
- `GET /api/market/yfinance/search` - Search symbols

### Portfolio & AI
- `GET /api/portfolio` - Get user portfolio
- `POST /api/portfolio/holdings` - Add portfolio holding
- `POST /api/ai/investment-advice` - Get AI investment advice
- `POST /api/ai/portfolio-analysis` - Get portfolio analysis
- `GET /api/ai/market-insights` - Get AI market insights
- `POST /api/ai/risk-assessment` - Get AI risk analysis
- `POST /api/ai/recommendations` - Get AI investment recommendations
- `GET /api/ai/market-opportunities` - Get AI-identified opportunities

## Project Structure

```
aiser/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # External API services
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Main server file
│   ├── .env.example        # Environment template
│   └── package.json
├── src/                    # React frontend
│   ├── ai/                # AI modules and engines
│   │   ├── types.ts       # AI type definitions
│   │   ├── utils.ts       # AI utility functions
│   │   ├── riskAssessment.ts # Risk Assessment Engine
│   │   ├── recommendationSystem.ts # Recommendation Engine
│   │   └── index.ts       # AI service orchestrator
│   ├── components/        # UI components
│   │   ├── ui/           # Shadcn/ui components
│   │   ├── Dashboard.tsx # Main dashboard with AI integration
│   │   └── AIInsightsPanel.tsx # AI insights interface
│   ├── hooks/            # React hooks
│   │   ├── useAI.tsx     # AI functionality hooks
│   │   └── useAuth.tsx   # Authentication hooks
│   ├── pages/            # Page components
│   ├── services/         # API services
│   └── lib/              # Utilities
├── .env                  # Frontend environment
└── package.json
```

## AI Implementation Details

### Architecture
The AI system is built with a modular architecture using TensorFlow.js for client-side machine learning, ensuring data privacy and real-time processing.

#### AI Modules
1. **Risk Assessment Engine** (`src/ai/riskAssessment.ts`)
   - Portfolio volatility analysis
   - NSE market correlation tracking
   - Predictive risk modeling with neural networks
   - Kenya-specific economic indicator integration

2. **Recommendation System** (`src/ai/recommendationSystem.ts`)
   - Multi-factor stock scoring algorithm
   - Portfolio optimization using mean-variance analysis
   - Natural language insight generation
   - Local market opportunity identification

3. **AI Service Orchestrator** (`src/ai/index.ts`)
   - High-level API for AI functionality
   - Error handling and fallback mechanisms
   - Performance monitoring and caching

#### React Integration
- **useAI Hook** (`src/hooks/useAI.tsx`): Provides React hooks for AI functionality
- **AI Insights Panel** (`src/components/AIInsightsPanel.tsx`): Comprehensive UI for AI features
- **Dashboard Integration**: Seamless AI integration in the main dashboard

### Machine Learning Models
- **Risk Prediction**: 4-layer neural network trained on NSE historical data
- **Portfolio Optimization**: Modern Portfolio Theory with Kenya market adjustments
- **Sentiment Analysis**: NLP processing for market sentiment and news analysis

## Getting Started (Quick Start)

If you just want to get the application running quickly:

```bash
# 1. Install dependencies
npm install
cd backend && npm install && cd ..

# 2. Set up MongoDB (if not already running)
# Install MongoDB locally or use MongoDB Atlas

# 3. Configure environment variables
# Edit backend/.env with your MongoDB URI and RapidAPI key
# Edit .env with your API URL

# 4. Run the application
npm run dev:full
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
