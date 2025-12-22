import axios, { type AxiosInstance, type AxiosError, type AxiosResponse, type AxiosRequestConfig } from 'axios';
import { RetryUtility } from '../utils/retry';
import type { RetryOptions } from '../utils/retry';

class EnhancedApiService {
  private client: AxiosInstance;
  private logger = {
    log: (message: string, data?: unknown) => {
      console.log(`[API] ${message}`, data ? data : '');
    },
    error: (message: string, error?: unknown) => {
      console.error(`[API ERROR] ${message}`, error ? error : '');
    },
    warn: (message: string, data?: unknown) => {
      console.warn(`[API WARN] ${message}`, data ? data : '');
    }
  };

  constructor() {
    // Use environment variable for API base URL, fallback to localhost for development
    const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    
    this.client = axios.create({
      baseURL: apiBaseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Automatically add token from localStorage if available
        const token = localStorage.getItem('token');
        if (token && !config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        this.logger.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`, {
          url: config.url,
          method: config.method,
          data: config.data,
          params: config.params,
          timestamp: new Date().toISOString()
        });
        return config;
      },
      (error) => {
        this.logger.error('Request interceptor error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        this.logger.log(`Response received from ${response.config.url}`, {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          timestamp: new Date().toISOString()
        });
        return response;
      },
      (error: AxiosError) => {
        this.logger.error(`Response error from ${error.config?.url}`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          timestamp: new Date().toISOString()
        });

        // Handle 401 Unauthorized - token expired or invalid
        if (error.response?.status === 401) {
          // Remove invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.removeAuthToken();
          
          // Dispatch custom event to notify AuthContext
          window.dispatchEvent(new Event('auth:logout'));
          
          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig, retryOptions?: RetryOptions): Promise<AxiosResponse<T>> {
    const operation = () => this.client.get<T>(url, config);
    
    if (retryOptions) {
      return RetryUtility.retry(operation, retryOptions);
    }
    
    return operation();
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig, retryOptions?: RetryOptions): Promise<AxiosResponse<T>> {
    const operation = () => this.client.post<T>(url, data, config);
    
    if (retryOptions) {
      return RetryUtility.retry(operation, retryOptions);
    }
    
    return operation();
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig, retryOptions?: RetryOptions): Promise<AxiosResponse<T>> {
    const operation = () => this.client.put<T>(url, data, config);
    
    if (retryOptions) {
      return RetryUtility.retry(operation, retryOptions);
    }
    
    return operation();
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig, retryOptions?: RetryOptions): Promise<AxiosResponse<T>> {
    const operation = () => this.client.patch<T>(url, data, config);
    
    if (retryOptions) {
      return RetryUtility.retry(operation, retryOptions);
    }
    
    return operation();
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig, retryOptions?: RetryOptions): Promise<AxiosResponse<T>> {
    const operation = () => this.client.delete<T>(url, config);
    
    if (retryOptions) {
      return RetryUtility.retry(operation, retryOptions);
    }
    
    return operation();
  }

  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    this.logger.log('Authorization token set');
  }

  removeAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
    this.logger.log('Authorization token removed');
  }

  getLogger() {
    return this.logger;
  }
}

export const enhancedApi = new EnhancedApiService();
export default enhancedApi;
