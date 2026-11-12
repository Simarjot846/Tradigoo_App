/**
 * Dashboard Types
 * Centralized type definitions for dashboard components
 */

export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  demandMultiplier: number;
}

export interface SearchEvent {
  id: string;
  product: string;
  city: string;
  timestamp: string;
  isNew?: boolean;
}

export interface TrendingProduct {
  product: string;
  count: number;
  rank: number;
  change: 'up' | 'down' | 'same';
}

export interface LiveSearchData {
  searches: SearchEvent[];
  lastUpdate: string;
  searchesPerMinute: number;
}

export interface TrendingData {
  trending: TrendingProduct[];
  lastUpdate: string;
}

export interface MarketData {
  product: string;
  price: number;
  change: number;
  volume: string;
}

export interface LiveStats {
  total_carbon_saved: number;
  active_orders: number;
  green_score: number;
  timestamp: string;
}

export interface SeasonalTrend {
  product: string;
  demand: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface WholesalerRanking {
  id: string;
  name: string;
  product: string;
  purchases: number;
  rating: number;
  greenScore: number;
}
