export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (error: unknown, attempt: number) => void;
}

export class RetryUtility {
  static async retry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      backoffMultiplier = 2,
      onRetry
    } = options;

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          throw error;
        }

        // Call onRetry callback if provided
        if (onRetry) {
          onRetry(error, attempt);
        }

        // Calculate delay with exponential backoff
        const delay = retryDelay * Math.pow(backoffMultiplier, attempt - 1);
        
        // Add jitter to prevent thundering herd
        const jitteredDelay = delay + Math.random() * 100;
        
        await new Promise(resolve => setTimeout(resolve, jitteredDelay));
      }
    }

    throw lastError;
  }

  static isRetryableError(error: unknown): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    const hasResponse = (error as { response?: { status?: number } })?.response;
    if (!hasResponse) {
      return true; // Network error
    }

    const status = hasResponse.status as number;
    return status >= 500 || status === 429 || status === 408;
  }

  static getRetryMessage(attempt: number, maxRetries: number): string {
    return `Retry attempt ${attempt} of ${maxRetries}...`;
  }
}
