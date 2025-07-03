import * as tf from '@tensorflow/tfjs';
import { Matrix } from 'ml-matrix';

export class AIUtils {
  /**
   * Calculate returns from price array
   */
  static calculateReturns(prices: number[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    return returns;
  }

  /**
   * Calculate rolling volatility
   */
  static calculateRollingVolatility(returns: number[], window: number = 20): number[] {
    const volatilities: number[] = [];
    
    for (let i = window - 1; i < returns.length; i++) {
      const windowReturns = returns.slice(i - window + 1, i + 1);
      const mean = windowReturns.reduce((sum, ret) => sum + ret, 0) / window;
      const variance = windowReturns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / (window - 1);
      volatilities.push(Math.sqrt(variance * 252)); // Annualized
    }
    
    return volatilities;
  }

  /**
   * Calculate Sharpe ratio
   */
  static calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const annualizedReturn = meanReturn * 252;
    
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / (returns.length - 1);
    const volatility = Math.sqrt(variance * 252);
    
    return (annualizedReturn - riskFreeRate) / volatility;
  }

  /**
   * Calculate maximum drawdown
   */
  static calculateMaxDrawdown(prices: number[]): number {
    let maxDrawdown = 0;
    let peak = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      if (prices[i] > peak) {
        peak = prices[i];
      }
      
      const drawdown = (peak - prices[i]) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return maxDrawdown;
  }

  /**
   * Calculate Value at Risk (VaR)
   */
  static calculateVaR(returns: number[], confidence: number = 0.05): number {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor(confidence * sortedReturns.length);
    return -sortedReturns[index]; // Negative for loss
  }

  /**
   * Calculate correlation matrix
   */
  static calculateCorrelationMatrix(returnsMatrix: number[][]): number[][] {
    const n = returnsMatrix.length;
    const m = returnsMatrix[0].length;
    const correlationMatrix: number[][] = [];

    for (let i = 0; i < n; i++) {
      correlationMatrix[i] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) {
          correlationMatrix[i][j] = 1;
        } else {
          correlationMatrix[i][j] = this.calculateCorrelation(returnsMatrix[i], returnsMatrix[j]);
        }
      }
    }

    return correlationMatrix;
  }

  /**
   * Calculate correlation between two arrays
   */
  static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length) {
      throw new Error('Arrays must have the same length');
    }

    const n = x.length;
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let sumXSquared = 0;
    let sumYSquared = 0;

    for (let i = 0; i < n; i++) {
      const deltaX = x[i] - meanX;
      const deltaY = y[i] - meanY;
      
      numerator += deltaX * deltaY;
      sumXSquared += deltaX * deltaX;
      sumYSquared += deltaY * deltaY;
    }

    const denominator = Math.sqrt(sumXSquared * sumYSquared);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Calculate beta relative to market
   */
  static calculateBeta(assetReturns: number[], marketReturns: number[]): number {
    if (assetReturns.length !== marketReturns.length) {
      throw new Error('Asset and market returns must have the same length');
    }

    const assetMean = assetReturns.reduce((sum, ret) => sum + ret, 0) / assetReturns.length;
    const marketMean = marketReturns.reduce((sum, ret) => sum + ret, 0) / marketReturns.length;

    let covariance = 0;
    let marketVariance = 0;

    for (let i = 0; i < assetReturns.length; i++) {
      covariance += (assetReturns[i] - assetMean) * (marketReturns[i] - marketMean);
      marketVariance += Math.pow(marketReturns[i] - marketMean, 2);
    }

    covariance /= (assetReturns.length - 1);
    marketVariance /= (assetReturns.length - 1);

    return covariance / marketVariance;
  }

  /**
   * Normalize data for ML models
   */
  static normalizeData(data: number[]): { normalized: number[], min: number, max: number } {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    const normalized = data.map(value => (value - min) / range);
    
    return { normalized, min, max };
  }

  /**
   * Denormalize data
   */
  static denormalizeData(normalized: number[], min: number, max: number): number[] {
    const range = max - min;
    return normalized.map(value => value * range + min);
  }

  /**
   * Create TensorFlow tensor from data
   */
  static createTensor(data: number[][], shape?: number[]): tf.Tensor {
    return tf.tensor(data, shape);
  }

  /**
   * Calculate technical indicators
   */
  static calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = [];
    
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((sum, price) => sum + price, 0);
      sma.push(sum / period);
    }
    
    return sma;
  }

  static calculateEMA(prices: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    // Start with SMA for first value
    let sum = 0;
    for (let i = 0; i < period && i < prices.length; i++) {
      sum += prices[i];
    }
    ema.push(sum / Math.min(period, prices.length));
    
    // Calculate EMA for remaining values
    for (let i = period; i < prices.length; i++) {
      ema.push((prices[i] * multiplier) + (ema[ema.length - 1] * (1 - multiplier)));
    }
    
    return ema;
  }

  static calculateRSI(prices: number[], period: number = 14): number[] {
    const changes = this.calculateReturns(prices);
    const gains: number[] = [];
    const losses: number[] = [];

    // Separate gains and losses
    changes.forEach(change => {
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    });

    const rsi: number[] = [];
    
    // Calculate initial RS
    let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;
    
    let rs = avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));

    // Calculate remaining RSI values
    for (let i = period; i < gains.length; i++) {
      avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
      avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
      
      rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }

    return rsi;
  }

  /**
   * Calculate portfolio diversification score
   */
  static calculateDiversificationScore(weights: number[], correlationMatrix: number[][]): number {
    let totalCorrelation = 0;
    let count = 0;

    for (let i = 0; i < weights.length; i++) {
      for (let j = i + 1; j < weights.length; j++) {
        totalCorrelation += Math.abs(correlationMatrix[i][j]) * weights[i] * weights[j];
        count++;
      }
    }

    const avgCorrelation = count === 0 ? 0 : totalCorrelation / count;
    return Math.max(0, 1 - avgCorrelation); // Higher score = better diversification
  }

  /**
   * Generate random numbers with normal distribution
   */
  static normalRandom(mean: number = 0, stdDev: number = 1): number {
    const u = Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return z * stdDev + mean;
  }

  /**
   * Monte Carlo simulation for risk assessment
   */
  static monteCarloSimulation(
    initialPrice: number,
    expectedReturn: number,
    volatility: number,
    timeHorizon: number,
    simulations: number = 1000
  ): number[] {
    const results: number[] = [];
    
    for (let i = 0; i < simulations; i++) {
      let price = initialPrice;
      
      for (let t = 0; t < timeHorizon; t++) {
        const randomShock = this.normalRandom(0, 1);
        const dailyReturn = (expectedReturn / 252) + (volatility / Math.sqrt(252)) * randomShock;
        price *= (1 + dailyReturn);
      }
      
      results.push(price);
    }
    
    return results;
  }
}
