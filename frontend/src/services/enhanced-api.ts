import axios, { type AxiosInstance, type AxiosError, type AxiosResponse, type AxiosRequestConfig } from 'axios';
import { RetryUtility } from '../utils/retry';
import type { RetryOptions } from '../utils/retry';
import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS } from '../config';

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
    // Sử dụng API_BASE_URL từ file config
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: API_TIMEOUT,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Tự động thêm token từ localStorage nếu có
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        
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

        // Xử lý lỗi 401 Unauthorized - token hết hạn hoặc không hợp lệ
        if (error.response?.status === 401) {
          // Xóa token không hợp lệ
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          this.removeAuthToken();
          
          // Gửi event để thông báo cho AuthContext
          window.dispatchEvent(new Event('auth:logout'));
          
          // Chuyển hướng đến trang login nếu chưa ở đó
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
