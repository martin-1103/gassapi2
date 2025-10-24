import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

interface ElectronResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  redirected?: boolean;
  redirectUrl?: string;
}

interface WindowWithElectronAPI extends Window {
  electronAPI?: {
    httpClient?: {
      sendRequest: (config: AxiosRequestConfig) => Promise<ElectronResponse>;
    };
    process?: {
      type: string;
    };
  };
}

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
      (window as WindowWithElectronAPI).process &&
      (window as WindowWithElectronAPI).process.type === 'renderer'
    );
  }

  /**
   * Sends a request specifically for Electron environment
   */
  async sendElectronRequest(
    config: AxiosRequestConfig,
  ): Promise<ElectronResponse> {
    // Di Electron, kita bisa bypass CORS dengan native HTTP client
    if ((window as WindowWithElectronAPI).electronAPI?.httpClient) {
      return await (
        window as WindowWithElectronAPI
      ).electronAPI.httpClient.sendRequest(config);
    }

    // Fallback ke axios jika Electron API tidak tersedia
    throw new Error('Electron HTTP client not available');
  }

  /**
   * Attempts to send request through CORS proxy if direct request fails
   */
  async sendRequestWithCorsProxy(
    config: AxiosRequestConfig,
    corsProxyUrls: string[],
  ): Promise<AxiosResponse | null> {
    for (const proxyUrl of corsProxyUrls) {
      try {
        const proxyConfig = {
          ...config,
          url: proxyUrl + config.url,
          headers: {
            ...config.headers,
            'X-Requested-With': 'XMLHttpRequest',
          },
        };

        return await axios(proxyConfig);
      } catch {
        continue; // Try the next proxy
      }
    }

    return null; // No proxy worked
  }
}
