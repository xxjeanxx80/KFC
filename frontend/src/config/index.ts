/**
 * File cấu hình chung cho ứng dụng frontend
 * Chứa các hằng số, URL API, và các thiết lập quan trọng khác
 */

// URL API backend - lấy từ biến môi trường hoặc sử dụng giá trị mặc định
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Thời gian timeout cho các request API (milliseconds)
export const API_TIMEOUT = 30000;

// Các endpoint API chính
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },
  USERS: '/users',
  ROLES: '/roles',
  STORES: '/stores',
  SUPPLIERS: '/suppliers',
  ITEMS: '/items',
  PROCUREMENT: '/procurement',
  GOODS_RECEIPTS: '/goods-receipts',
  SALES: '/sales',
  STOCK_REQUESTS: '/stock-requests',
  INVENTORY: '/inventory-batches',
  INVENTORY_TRANSACTIONS: '/inventory-transactions',
  REPORTS: '/reports',
  NOTIFICATIONS: '/notifications',
} as const;

// Cấu hình retry cho các request API
export const RETRY_CONFIG = {
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000, // milliseconds
} as const;

// Tên key trong localStorage
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
} as const;

// Cấu hình phân trang mặc định
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

