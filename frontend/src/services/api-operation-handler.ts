import { enhancedApi } from './enhanced-api';
import type { RetryOptions } from '../utils/retry';
import { RetryUtility } from '../utils/retry';

export interface ApiOperationOptions {
  showSuccessMessage?: boolean;
  showErrorMessage?: boolean;
  retryOptions?: RetryOptions;
  operationName?: string;
}

export class ApiOperationHandler {
  private logger = enhancedApi.getLogger();

  async handleOperation<T>(
    operation: () => Promise<T>,
    options: ApiOperationOptions = {}
  ): Promise<{ success: boolean; data?: T; error?: unknown }> {
    const {
      showSuccessMessage = true,
      showErrorMessage = true,
      retryOptions,
      operationName = 'API Operation'
    } = options;

    try {
      this.logger.log(`Starting ${operationName}`);
      
      let result: T;
      
      if (retryOptions) {
        result = await RetryUtility.retry(operation, {
          ...retryOptions,
          onRetry: (error, attempt) => {
            this.logger.warn(`Retry attempt ${attempt} for ${operationName}`, error);
            if (showErrorMessage) {
              alert(`Retry attempt ${attempt}... Please wait.`);
            }
          }
        });
      } else {
        result = await operation();
      }

      this.logger.log(`${operationName} completed successfully`);
      
      if (showSuccessMessage) {
        alert(`${operationName} completed successfully!`);
      }

      return { success: true, data: result };
    } catch (error: unknown) {
      this.logger.error(`${operationName} failed`, error);
      
      let errorMessage = 'An unexpected error occurred';
      
      const hasResponse = typeof error === 'object' && error !== null && 'response' in (error as object);
      if (hasResponse) {
        const resp = (error as { response?: { data?: { message?: string }, status?: number } }).response;
        const msg = resp?.data?.message;
        if (typeof msg === 'string') {
          errorMessage = msg;
        } else if (typeof (error as { message?: string }).message === 'string') {
          errorMessage = (error as { message?: string }).message as string;
        }
      } else if (typeof (error as { message?: string }).message === 'string') {
        errorMessage = (error as { message?: string }).message as string;
      }

      // Handle specific error types
      if (hasResponse && ((error as { response?: { status?: number } }).response?.status === 401)) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (hasResponse && ((error as { response?: { status?: number } }).response?.status === 403)) {
        errorMessage = 'Access denied. You do not have permission to perform this action.';
      } else if (hasResponse && ((error as { response?: { status?: number } }).response?.status === 404)) {
        errorMessage = 'The requested resource was not found.';
      } else if (hasResponse && (((error as { response?: { status?: number } }).response?.status ?? 0) >= 500)) {
        errorMessage = 'Server error. Please try again later or contact support.';
      }

      if (showErrorMessage) {
        alert(`Error: ${errorMessage}`);
      }

      return { success: false, error };
    }
  }

  createRetryOptions(maxRetries = 3): RetryOptions {
    return {
      maxRetries,
      retryDelay: 1000,
      backoffMultiplier: 2,
    };
  }
}

export const apiOperationHandler = new ApiOperationHandler();
