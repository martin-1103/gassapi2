import { DirectResponse, DirectRequestConfig } from '../direct-client';

/**
 * Handles processing and formatting of HTTP responses
 */
export class ResponseHandler {
  private startTime: number = 0;
  
  /**
   * Sets the start time for measuring request duration
   */
  setStartTime(): void {
    this.startTime = Date.now();
  }

  /**
   * Formats an Axios response into a DirectResponse
   */
  formatResponse(axiosResponse: any, config: DirectRequestConfig): DirectResponse {
    const endTime = Date.now();
    
    const response: DirectResponse = {
      status: axiosResponse.status,
      statusText: axiosResponse.statusText,
      headers: axiosResponse.headers as Record<string, string>,
      data: axiosResponse.data,
      time: endTime - this.startTime,
      size: this.calculateSize(axiosResponse.data),
    };

    // Add redirection information if available
    if (axiosResponse.request?.res?.responseUrl) {
      response.redirected = axiosResponse.request.res.responseUrl !== config.url;
      response.redirectUrl = axiosResponse.request.res.responseUrl;
    }

    return response;
  }

  /**
   * Creates a response for CORS error scenarios
   */
  formatCorsErrorResponse(): DirectResponse {
    const endTime = Date.now();
    return {
      status: 0,
      statusText: 'CORS Error',
      headers: {},
      data: null,
      time: endTime - this.startTime,
      size: 0,
      error: {
        message: 'Tidak bisa membuat request ke URL ini dari browser karena CORS policy.',
        type: 'CORS_ERROR',
        corsError: true,
        solutions: [
          'Gunakan desktop app (Electron) untuk local API testing',
          'Enable CORS pada target server',
          'Gunakan browser CORS extension untuk development',
          'Gunakan API proxy atau VPN',
        ],
      },
    };
  }

  /**
   * Calculates the size of data in bytes
   */
  calculateSize(data: any): number {
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