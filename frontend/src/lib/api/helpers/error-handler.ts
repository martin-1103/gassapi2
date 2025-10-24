import { DirectResponse } from '../direct-client';

interface ApiError extends Error {
  code?: string;
  response?: {
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
    data?: unknown;
  };
  message?: string;
}

/**
 * Handles different types of errors that can occur during API requests
 */
export class ErrorHandler {
  private startTime: number = 0;

  /**
   * Sets the start time for measuring request duration
   */
  setStartTime(): void {
    this.startTime = Date.now();
  }

  /**
   * Handles general errors during requests
   */
  handleGeneralError(error: unknown): DirectResponse {
    const endTime = Date.now();

    return {
      status: 0,
      statusText: 'Network Error',
      headers: {},
      data: null,
      time: endTime - this.startTime,
      size: 0,
      error: {
        message: (error as ApiError).message || 'Unknown error occurred',
        type: this.getErrorType(error),
        corsError: this.isCorsError(error),
      },
    };
  }

  /**
   * Handles errors specifically from web/Axios requests
   */
  handleWebError(error: unknown): DirectResponse {
    const endTime = Date.now();

    const apiError = error as ApiError;
    return {
      status: apiError.response?.status || 0,
      statusText:
        apiError.response?.statusText || apiError.message || 'Request failed',
      headers: apiError.response?.headers || {},
      data: apiError.response?.data || null,
      time: endTime - this.startTime,
      size: this.calculateSize(apiError.response?.data),
      error: {
        message: apiError.message || 'Network error',
        type: this.getErrorType(error),
      },
    };
  }

  /**
   * Determines the type of error that occurred
   */
  getErrorType(error: unknown): string {
    const apiError = error as ApiError;
    if (apiError.code === 'ECONNREFUSED') return 'CONNECTION_REFUSED';
    if (apiError.code === 'ENOTFOUND') return 'DNS_ERROR';
    if (apiError.code === 'ETIMEDOUT') return 'TIMEOUT';
    if (apiError.code === 'ECONNRESET') return 'CONNECTION_RESET';
    if (this.isCorsError(error)) return 'CORS_ERROR';
    if (apiError.response) return 'HTTP_ERROR';
    return 'NETWORK_ERROR';
  }

  /**
   * Checks if the error is related to CORS policy
   */
  isCorsError(error: unknown): boolean {
    const apiError = error as ApiError;
    return (
      apiError.message?.includes('CORS') ||
      apiError.message?.includes('Cross-Origin') ||
      apiError.message?.includes('Access-Control') ||
      apiError.response?.status === 0
    );
  }

  /**
   * Calculates the size of data in bytes
   */
  private calculateSize(data: unknown): number {
    if (!data) return 0;

    try {
      if (typeof data === 'string') {
        return new Blob([data]).size;
      } else if (typeof data === 'object') {
        return new Blob([JSON.stringify(data)]).size;
      }
    } catch {
      // Fallback
      return JSON.stringify(data).length;
    }

    return 0;
  }
}
