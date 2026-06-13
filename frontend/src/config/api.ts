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
    signup: '/api/auth/signup',
    verifyEmail: '/api/auth/verify-email',
    requestPasswordReset: '/api/auth/request-password-reset',
    resetPassword: '/api/auth/reset-password',
    changePassword: '/api/auth/change-password',
  },
  profile: {
    get: '/api/profile/get-profile',
    complete: '/api/profile/complete',
    update: '/api/profile/update-profile',
  },
  donations: {
    createClaim: (listingId: string) => `/api/donations/${listingId}/create-claim`,
    detail: (id: string) => `/api/donations/${id}`,
    authorizePickup: (id: string) => `/api/donations/${id}/authorize-pickup`,
    completeDelivery: (id: string) => `/api/donations/${id}/complete-delivery`,
    reportFailure: (id: string) => `/api/donations/${id}/report-failure`,
    cancel: (id: string) => `/api/donations/${id}/cancel`,
    myClaims: '/api/donations/my/claims',
    myOffers: '/api/donations/my/offers',
    myDeliveries: '/api/donations/my/deliveries',
    stats: '/api/donations/my/stats',
  },
  orders: {
    create: (listingId: string) => `/api/orders/${listingId}/create-order`,
    detail: (id: string) => `/api/orders/${id}`,
    authorizePickup: (id: string) => `/api/orders/${id}/authorize-pickup`,
    completeDelivery: (id: string) => `/api/orders/${id}/complete-delivery`,
    reportFailure: (id: string) => `/api/orders/${id}/report-failure`,
    cancel: (id: string) => `/api/orders/${id}/cancel`,
    purchases: '/api/orders/my/purchases',
    sales: '/api/orders/my/sales',
    deliveries: '/api/orders/my/deliveries',
    stats: '/api/orders/my/stats',
  },
  foodListings: {
    list: '/api/food-listings',
    search: '/api/food-listings/search',
    create: '/api/food-listings/upload',
    detail: (id: string) => `/api/food-listings/${id}`,
    update: (id: string) => `/api/food-listings/${id}/update`,
    remove: (id: string) => `/api/food-listings/${id}`,
    negotiate: (id: string) => `/api/food-listings/${id}/negotiate`,
    status: (id: string) => `/api/food-listings/${id}/status`,
    myListings: '/api/food-listings/my/listings',
    stats: '/api/food-listings/my/stats',
  },
  notifications: {
    list: '/api/notifications/get-notifications',
    markRead: (id: string | number) => `/api/notifications/${id}/read`,
    markAllRead: '/api/notifications/read-all',
  },
  feedback: {
    createComplaint: '/api/feedback/complaints',
    createRating: '/api/feedback/ratings',
    myComplaints: '/api/feedback/complaints/my',
  },
  chat: {
    searchUsers: '/api/chat/users/search',
    conversations: '/api/chat/conversations',
    conversationWithUser: (userId: string | number) => `/api/chat/conversations/${userId}`,
    messages: (conversationId: string | number) => `/api/chat/conversations/${conversationId}/messages`,
    sendMessage: '/api/chat/messages',
  },
} as const;

export default config;
