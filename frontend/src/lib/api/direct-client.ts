/**
 * Direct HTTP Client untuk bypass backend dan testing API endpoints langsung
 * Mendukung web dan Electron environment dengan CORS handling
 */

import axios, { AxiosRequestConfig } from 'axios';
import { RequestHandler } from './helpers/request-handler';
import { ResponseHandler } from './helpers/response-handler';
import { ErrorHandler } from './helpers/error-handler';
import { isValidURL, interpolateUrl } from './helpers/api-utils';

export interface DirectRequestConfig {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  followRedirects?: boolean;
  validateSSL?: boolean;
}

export interface DirectResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
  size: number;
  redirected?: boolean;
  redirectUrl?: string;
  error?: {
    message: string;
    type: string;
    corsError?: boolean;
    solutions?: string[];
  };
}

export class DirectApiClient {
  private requestHandler: RequestHandler = new RequestHandler();
  private responseHandler: ResponseHandler = new ResponseHandler();
  private errorHandler: ErrorHandler = new ErrorHandler();
  private corsProxyUrls = [
    'https://cors-anywhere.herokuapp.com/',
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
  ];

  async sendRequest(config: DirectRequestConfig): Promise<DirectResponse> {
    // Set start time for both response and error handlers
    this.responseHandler.setStartTime();
    this.errorHandler.setStartTime();

    try {
      const axiosConfig: AxiosRequestConfig = {
        method: config.method,
        url: config.url,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'GASS-API-Client/1.0',
          ...config.headers,
        },
        data: config.body,
        timeout: config.timeout || 30000,
        maxRedirects: config.followRedirects ? 5 : 0,
        validateStatus: () => true, // Jangan throw pada HTTP errors
      };

      // Handle CORS untuk Electron vs Web
      if (this.requestHandler.isElectron()) {
        return this.sendElectronRequest(axiosConfig);
      } else {
        return this.sendWebRequest(axiosConfig);
      }
    } catch (error) {
      return this.errorHandler.handleGeneralError(error);
    }
  }

  private async sendWebRequest(
    config: AxiosRequestConfig,
  ): Promise<DirectResponse> {
    try {
      const response = await this.requestHandler.sendRequest(config);
      return this.responseHandler.formatResponse(response, config);
    } catch (error: any) {
      // Coba CORS proxy jika error adalah CORS
      if (this.errorHandler.isCorsError(error)) {
        return this.handleCorsError(config);
      }

      return this.errorHandler.handleWebError(error);
    }
  }

  private async sendElectronRequest(
    config: AxiosRequestConfig,
  ): Promise<DirectResponse> {
    try {
      const response = await this.requestHandler.sendElectronRequest(config);
      // For Electron response, we format it directly since it doesn't use AxiosResponse
      const endTime = Date.now();
      
      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        time: endTime - (this.responseHandler as any)['startTime'],
        size: this.responseHandler.calculateSize(response.data),
        redirected: response.redirected,
        redirectUrl: response.redirectUrl,
      };
    } catch (error) {
      // If Electron request fails, fallback to web request
      return this.sendWebRequest(config);
    }
  }

  private async handleCorsError(
    originalConfig: AxiosRequestConfig,
  ): Promise<DirectResponse> {
    // Try CORS proxy
    const response = await this.requestHandler.sendRequestWithCorsProxy(
      originalConfig,
      this.corsProxyUrls
    );

    if (response) {
      return this.responseHandler.formatResponse(response, originalConfig);
    }

    // Fallback: Return CORS error response
    return this.responseHandler.formatCorsErrorResponse();
  }

  /**
   * Validasi URL sebelum request
   */
  public isValidURL(url: string): boolean {
    return isValidURL(url);
  }

  /**
   * Dapatkan base URL dari environment variables
   */
  public interpolateUrl(url: string, variables: Record<string, string>): string {
    return interpolateUrl(url, variables);
  }
}

// Global instance
export const directApiClient = new DirectApiClient();