// Environment configuration
const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Food Waste Redistribution',
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// API configuration
export const API_CONFIG = {
  baseURL: config.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    profile: '/api/auth/profile',
  },
  donations: {
    list: '/api/donations',
    create: '/api/donations',
    detail: (id: string) => `/api/donations/${id}`,
  },
  orders: {
    list: '/api/orders',
    create: '/api/orders',
    detail: (id: string) => `/api/orders/${id}`,
  },
  foodListings: {
    list: '/api/food-listings',
    create: '/api/food-listings',
    detail: (id: string) => `/api/food-listings/${id}`,
  },
} as const;

export default config;
