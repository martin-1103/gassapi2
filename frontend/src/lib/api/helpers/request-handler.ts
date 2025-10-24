import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Handles the actual HTTP request sending logic
 */
export class RequestHandler {
  /**
   * Sends a request using Axios
   */
  async sendRequest(config: AxiosRequestConfig): Promise<AxiosResponse> {
    return axios(config);
  }

  /**
   * Checks if the current environment is Electron
   */
  isElectron(): boolean {
    return (
      typeof window !== 'undefined' &&
      (window as any).process &&
      (window as any).process.type === 'renderer'
    );
  }

  /**
   * Sends a request specifically for Electron environment
   */
  async sendElectronRequest(config: AxiosRequestConfig): Promise<any> {
    // Di Electron, kita bisa bypass CORS dengan native HTTP client
    if (window.electronAPI?.httpClient) {
      return await window.electronAPI.httpClient.sendRequest(config);
    }

    // Fallback ke axios jika Electron API tidak tersedia
    throw new Error('Electron HTTP client not available');
  }

  /**
   * Attempts to send request through CORS proxy if direct request fails
   */
  async sendRequestWithCorsProxy(
    originalConfig: AxiosRequestConfig,
    corsProxyUrls: string[]
  ): Promise<AxiosResponse | null> {
    for (const proxyUrl of corsProxyUrls) {
      try {
        const proxyConfig = {
          ...originalConfig,
          url: proxyUrl + originalConfig.url,
          headers: {
            ...originalConfig.headers,
            'X-Requested-With': 'XMLHttpRequest',
          },
        };

        return await axios(proxyConfig);
      } catch (error) {
        continue; // Try the next proxy
      }
    }

    return null; // No proxy worked
  }
}

// Types for Electron API
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