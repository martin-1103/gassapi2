/**
 * Direct HTTP Client untuk bypass backend dan testing API endpoints langsung
 * Mendukung web dan Electron environment dengan CORS handling
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

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
  private startTime: number = 0;
  private corsProxyUrls = [
    'https://cors-anywhere.herokuapp.com/',
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
  ];

  async sendRequest(config: DirectRequestConfig): Promise<DirectResponse> {
    this.startTime = Date.now();

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
      if (this.isElectron()) {
        return this.sendElectronRequest(axiosConfig);
      } else {
        return this.sendWebRequest(axiosConfig);
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async sendWebRequest(
    config: AxiosRequestConfig,
  ): Promise<DirectResponse> {
    try {
      const response: AxiosResponse = await axios(config);
      const endTime = Date.now();

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        data: response.data,
        time: endTime - this.startTime,
        size: this.calculateSize(response.data),
        redirected: response.request?.res?.responseUrl !== config.url,
        redirectUrl: response.request?.res?.responseUrl,
      };
    } catch (error: any) {
      // Coba CORS proxy jika error adalah CORS
      if (this.isCorsError(error)) {
        return this.handleCorsError(config);
      }

      return this.handleWebError(error);
    }
  }

  private async sendElectronRequest(
    config: AxiosRequestConfig,
  ): Promise<DirectResponse> {
    // Di Electron, kita bisa bypass CORS dengan native HTTP client
    if (window.electronAPI?.httpClient) {
      try {
        const response =
          await window.electronAPI.httpClient.sendRequest(config);
        const endTime = Date.now();

        return {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data,
          time: endTime - this.startTime,
          size: this.calculateSize(response.data),
          redirected: response.redirected,
          redirectUrl: response.redirectUrl,
        };
      } catch (error) {
        return this.handleError(error);
      }
    }

    // Fallback ke axios jika Electron API tidak tersedia
    return this.sendWebRequest(config);
  }

  private async handleCorsError(
    originalConfig: AxiosRequestConfig,
  ): Promise<DirectResponse> {
    // Coba CORS proxy
    for (const proxyUrl of this.corsProxyUrls) {
      try {
        const proxyConfig = {
          ...originalConfig,
          url: proxyUrl + originalConfig.url,
          headers: {
            ...originalConfig.headers,
            'X-Requested-With': 'XMLHttpRequest',
          },
        };

        const response = await axios(proxyConfig);
        const endTime = Date.now();

        return {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers as Record<string, string>,
          data: response.data,
          time: endTime - this.startTime,
          size: this.calculateSize(response.data),
          redirected: false,
        };
      } catch {
        continue;
      }
    }

    // Fallback: Tampilkan instruksi ke user
    const endTime = Date.now();
    return {
      status: 0,
      statusText: 'CORS Error',
      headers: {},
      data: null,
      time: endTime - this.startTime,
      size: 0,
      error: {
        message:
          'Tidak bisa membuat request ke URL ini dari browser karena CORS policy.',
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

  private handleError(error: any): DirectResponse {
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

  private handleWebError(error: any): DirectResponse {
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

  private getErrorType(error: any): string {
    if (error.code === 'ECONNREFUSED') return 'CONNECTION_REFUSED';
    if (error.code === 'ENOTFOUND') return 'DNS_ERROR';
    if (error.code === 'ETIMEDOUT') return 'TIMEOUT';
    if (error.code === 'ECONNRESET') return 'CONNECTION_RESET';
    if (this.isCorsError(error)) return 'CORS_ERROR';
    if (error.response) return 'HTTP_ERROR';
    return 'NETWORK_ERROR';
  }

  private isCorsError(error: any): boolean {
    return (
      error.message?.includes('CORS') ||
      error.message?.includes('Cross-Origin') ||
      error.message?.includes('Access-Control') ||
      error.response?.status === 0
    );
  }

  private isElectron(): boolean {
    return (
      window &&
      (window as any).process &&
      (window as any).process.type === 'renderer'
    );
  }

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

  /**
   * Validasi URL sebelum request
   */
  isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Dapatkan base URL dari environment variables
   */
  interpolateUrl(url: string, variables: Record<string, string>): string {
    if (!url || !variables) return url;

    return url.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return variables[trimmedKey] !== undefined
        ? variables[trimmedKey]
        : match;
    });
  }
}

// Global instance
export const directApiClient = new DirectApiClient();

// Types untuk Electron API
declare global {
  interface Window {
    electronAPI?: {
      httpClient?: {
        sendRequest: (config: AxiosRequestConfig) => Promise<any>;
      };
      process?: {
        type: string;
      };
    };
  }
}
