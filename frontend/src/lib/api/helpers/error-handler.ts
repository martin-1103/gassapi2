import { DirectResponse } from '../direct-client';

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
  handleGeneralError(error: any): DirectResponse {
    const endTime = Date.now();

    return {
      status: 0,
      statusText: 'Network Error',
      headers: {},
      data: null,
      time: endTime - this.startTime,
      size: 0,
      error: {
        message: error.message || 'Unknown error occurred',
        type: this.getErrorType(error),
        corsError: this.isCorsError(error),
      },
    };
  }

  /**
   * Handles errors specifically from web/Axios requests
   */
  handleWebError(error: any): DirectResponse {
    const endTime = Date.now();

    return {
      status: error.response?.status || 0,
      statusText:
        error.response?.statusText || error.message || 'Request failed',
      headers: error.response?.headers || {},
      data: error.response?.data || null,
      time: endTime - this.startTime,
      size: this.calculateSize(error.response?.data),
      error: {
        message: error.message || 'Network error',
        type: this.getErrorType(error),
      },
    };
  }

  /**
   * Determines the type of error that occurred
   */
  getErrorType(error: any): string {
    if (error.code === 'ECONNREFUSED') return 'CONNECTION_REFUSED';
    if (error.code === 'ENOTFOUND') return 'DNS_ERROR';
    if (error.code === 'ETIMEDOUT') return 'TIMEOUT';
    if (error.code === 'ECONNRESET') return 'CONNECTION_RESET';
    if (this.isCorsError(error)) return 'CORS_ERROR';
    if (error.response) return 'HTTP_ERROR';
    return 'NETWORK_ERROR';
  }

  /**
   * Checks if the error is related to CORS policy
   */
  isCorsError(error: any): boolean {
    return (
      error.message?.includes('CORS') ||
      error.message?.includes('Cross-Origin') ||
      error.message?.includes('Access-Control') ||
      error.response?.status === 0
    );
  }

  /**
   * Calculates the size of data in bytes
   */
  private calculateSize(data: any): number {
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