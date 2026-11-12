/**
 * Application Constants
 */

export const API_ENDPOINTS = {
  // Pathway endpoints
  PATHWAY_WEATHER: '/api/pathway-weather',
  PATHWAY_STATS: '/api/pathway-stats',
  PATHWAY_SEASONAL: '/api/pathway-seasonal',
  PATHWAY_LIVE_SEARCHES: '/api/pathway-live-searches',
  PATHWAY_TRENDING: '/api/pathway-trending-now',
  PATHWAY_TOP_WHOLESALERS: '/api/pathway-top-wholesalers',
  PATHWAY_WEATHER_INSIGHTS: '/api/pathway-weather-insights',
  
  // Auth endpoints
  AUTH_SIGNIN: '/api/auth/signin',
  AUTH_SIGNUP: '/api/auth/signup',
  AUTH_SIGNOUT: '/api/auth/signout',
  AUTH_REFRESH: '/api/auth/refresh',
  
  // Order endpoints
  ORDERS_CREATE: '/api/order/create',
  ORDERS_CAPTURE: '/api/orders/[id]/capture',
  ORDERS_REFUND: '/api/orders/[id]/refund',
  
  // Payment endpoints
  PAYMENT_CREATE: '/api/payments/create-order',
  PAYMENT_VERIFY: '/api/payments/verify',
} as const;

export const POLLING_INTERVALS = {
  WEATHER: 120000, // 2 minutes
  LIVE_SEARCHES: 5000, // 5 seconds
  TRENDING: 10000, // 10 seconds
  STATS: 5000, // 5 seconds
  SEASONAL: 10000, // 10 seconds
  WHOLESALERS: 10000, // 10 seconds
} as const;

export const PRODUCT_CATEGORIES = [
  'Grains & Cereals',
  'Pulses & Lentils',
  'Spices',
  'Oils & Ghee',
  'Dry Fruits',
  'Dairy Products',
  'Beverages',
  'Snacks',
  'Other',
] as const;

export const ORDER_STATUSES = {
  PENDING: 'pending',
  PAYMENT_PENDING: 'payment_pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
} as const;

export const INDIAN_CITIES = [
  'Delhi',
  'Mumbai',
  'Chennai',
  'Kolkata',
  'Bangalore',
  'Pune',
] as const;
