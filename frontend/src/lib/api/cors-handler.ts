/**
 * CORS Handling untuk berbagai environment
 *
 * Web: detect CORS error dan suggest proxy
 * Electron: bypass CORS dengan webRequest API
 */

import type { RuntimeEnvironment, CorsProxyConfig } from '@/types/http-client';

export class CorsHandler {
  private environment: RuntimeEnvironment;

  constructor() {
    this.environment = this.detectEnvironment();
  }

  /**
   * Detect runtime environment (web vs electron)
   */
  private detectEnvironment(): RuntimeEnvironment {
    // Check kalau running di Electron
    const isElectron =
      typeof window !== 'undefined' &&
      window.navigator.userAgent.toLowerCase().includes('electron');

    if (isElectron) {
      return {
        type: 'electron',
        corsMode: 'electron-bypass',
      };
    }

    // Web environment - cek apakah perlu proxy
    const needsProxy = this.shouldUseProxy();

    return {
      type: 'web',
      corsMode: needsProxy ? 'proxy' : 'direct',
      corsProxyConfig: needsProxy ? this.getDefaultProxyConfig() : undefined,
    };
  }

  /**
   * Check apakah perlu pake proxy untuk CORS
   * Bisa di-override by user setting
   */
  private shouldUseProxy(): boolean {
    // Cek user preference dari localStorage
    const userPreference = localStorage.getItem('cors-proxy-enabled');
    if (userPreference !== null) {
      return userPreference === 'true';
    }

    // Default: false, let user enable manually kalau ada CORS issue
    return false;
  }

  /**
   * Default CORS proxy configuration
   * User bisa ganti dengan proxy mereka sendiri
   */
  private getDefaultProxyConfig(): CorsProxyConfig {
    return {
      enabled: true,
      url:
        localStorage.getItem('cors-proxy-url') ||
        'https://cors-anywhere.herokuapp.com',
      bypassDomains: ['localhost', '127.0.0.1', '0.0.0.0'],
    };
  }

  /**
   * Get current environment info
   */
  getEnvironment(): RuntimeEnvironment {
    return this.environment;
  }

  /**
   * Transform URL kalau perlu pake proxy
   */
  transformUrl(url: string): string {
    // Kalau Electron, ga perlu transform
    if (this.environment.type === 'electron') {
      return url;
    }

    // Kalau ga pake proxy, return original
    if (
      this.environment.corsMode !== 'proxy' ||
      !this.environment.corsProxyConfig?.enabled
    ) {
      return url;
    }

    // Check kalau URL ini perlu di-bypass (localhost, etc)
    const shouldBypass = this.shouldBypassProxy(url);
    if (shouldBypass) {
      return url;
    }

    // Apply proxy
    const proxyUrl = this.environment.corsProxyConfig.url;
    return `${proxyUrl}/${url}`;
  }

  /**
   * Check apakah URL ini bypass proxy
   */
  private shouldBypassProxy(url: string): boolean {
    const bypassDomains = this.environment.corsProxyConfig?.bypassDomains || [];

    try {
      const urlObj = new URL(url);
      return bypassDomains.some(
        domain =>
          urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`),
      );
    } catch {
      return false;
    }
  }

  /**
   * Check apakah error ini CORS error
   */
  isCorsError(error: unknown): boolean {
    if (!error) return false;

    const apiError = error as {
      message?: string;
      name?: string;
      response?: unknown;
    };
    const message = apiError.message?.toLowerCase() || '';
    const name = apiError.name?.toLowerCase() || '';

    return (
      message.includes('cors') ||
      message.includes('cross-origin') ||
      name === 'corserror' ||
      // Network error yang kemungkinan CORS
      (message.includes('network') && !apiError.response)
    );
  }

  /**
   * Get user-friendly CORS error message dengan solution
   */
  getCorsErrorMessage(url: string): {
    title: string;
    message: string;
    solutions: string[];
  } {
    const isLocalhost = this.isLocalhost(url);

    if (isLocalhost) {
      return {
        title: 'Tidak bisa akses localhost',
        message: 'Browser memblokir request ke localhost dari aplikasi web.',
        solutions: [
          'Jalankan API server dengan CORS enabled',
          'Gunakan aplikasi Desktop version (Electron)',
          'Setup CORS proxy di settings',
        ],
      };
    }

    return {
      title: 'CORS Error',
      message: 'Server tidak mengizinkan request dari aplikasi ini.',
      solutions: [
        'Minta backend team untuk enable CORS',
        'Enable CORS proxy di settings',
        'Gunakan aplikasi Desktop version (Electron)',
      ],
    };
  }

  /**
   * Check apakah URL adalah localhost
   */
  private isLocalhost(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.hostname === 'localhost' ||
        urlObj.hostname === '127.0.0.1' ||
        urlObj.hostname === '0.0.0.0' ||
        urlObj.hostname === '::1'
      );
    } catch {
      return false;
    }
  }

  /**
   * Enable/disable CORS proxy
   */
  setCorsProxyEnabled(enabled: boolean): void {
    localStorage.setItem('cors-proxy-enabled', String(enabled));
    this.environment = this.detectEnvironment();
  }

  /**
   * Set custom CORS proxy URL
   */
  setCorsProxyUrl(url: string): void {
    localStorage.setItem('cors-proxy-url', url);
    this.environment = this.detectEnvironment();
  }

  /**
   * Get CORS proxy config
   */
  getProxyConfig(): CorsProxyConfig | undefined {
    return this.environment.corsProxyConfig;
  }
}

// Singleton instance
export const corsHandler = new CorsHandler();
