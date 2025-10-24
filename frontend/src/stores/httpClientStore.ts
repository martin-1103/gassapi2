/**
 * HTTP Client Store
 * Manage settings dan state untuk Direct API Client
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { RuntimeEnvironment, CorsProxyConfig } from '@/types/http-client';

interface HttpClientSettings {
  // CORS settings
  corsProxyEnabled: boolean;
  corsProxyUrl: string;

  // Request settings
  defaultTimeout: number;
  followRedirects: boolean;
  validateSSL: boolean;

  // History settings
  saveHistory: boolean;
  maxHistoryItems: number;

  // Display settings
  prettyPrintJson: boolean;
  showRequestHeaders: boolean;
  showResponseHeaders: boolean;
  autoSaveRequests: boolean;
}

interface HttpClientState extends HttpClientSettings {
  environment: RuntimeEnvironment | null;
}

interface HttpClientActions {
  // CORS settings
  setCorsProxyEnabled: (enabled: boolean) => void;
  setCorsProxyUrl: (url: string) => void;
  getCorsProxyConfig: () => CorsProxyConfig | undefined;

  // Request settings
  setDefaultTimeout: (timeout: number) => void;
  setFollowRedirects: (follow: boolean) => void;
  setValidateSSL: (validate: boolean) => void;

  // History settings
  setSaveHistory: (save: boolean) => void;
  setMaxHistoryItems: (max: number) => void;

  // Display settings
  setPrettyPrintJson: (pretty: boolean) => void;
  setShowRequestHeaders: (show: boolean) => void;
  setShowResponseHeaders: (show: boolean) => void;
  setAutoSaveRequests: (save: boolean) => void;

  // Environment
  setEnvironment: (env: RuntimeEnvironment) => void;

  // Reset
  resetSettings: () => void;
}

type HttpClientStore = HttpClientState & HttpClientActions;

const defaultSettings: HttpClientSettings = {
  corsProxyEnabled: false,
  corsProxyUrl: 'https://cors-anywhere.herokuapp.com',
  defaultTimeout: 30000,
  followRedirects: true,
  validateSSL: true,
  saveHistory: true,
  maxHistoryItems: 1000,
  prettyPrintJson: true,
  showRequestHeaders: true,
  showResponseHeaders: true,
  autoSaveRequests: true,
};

export const useHttpClientStore = create<HttpClientStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...defaultSettings,
      environment: null,

      // CORS settings
      setCorsProxyEnabled: (enabled: boolean) =>
        set({ corsProxyEnabled: enabled }),

      setCorsProxyUrl: (url: string) => set({ corsProxyUrl: url }),

      getCorsProxyConfig: (): CorsProxyConfig | undefined => {
        const state = get();
        if (!state.corsProxyEnabled) return undefined;

        return {
          enabled: true,
          url: state.corsProxyUrl,
          bypassDomains: ['localhost', '127.0.0.1', '0.0.0.0'],
        };
      },

      // Request settings
      setDefaultTimeout: (timeout: number) => set({ defaultTimeout: timeout }),

      setFollowRedirects: (follow: boolean) => set({ followRedirects: follow }),

      setValidateSSL: (validate: boolean) => set({ validateSSL: validate }),

      // History settings
      setSaveHistory: (save: boolean) => set({ saveHistory: save }),

      setMaxHistoryItems: (max: number) => set({ maxHistoryItems: max }),

      // Display settings
      setPrettyPrintJson: (pretty: boolean) => set({ prettyPrintJson: pretty }),

      setShowRequestHeaders: (show: boolean) =>
        set({ showRequestHeaders: show }),

      setShowResponseHeaders: (show: boolean) =>
        set({ showResponseHeaders: show }),

      setAutoSaveRequests: (save: boolean) => set({ autoSaveRequests: save }),

      // Environment
      setEnvironment: (env: RuntimeEnvironment) => set({ environment: env }),

      // Reset
      resetSettings: () => set({ ...defaultSettings }),
    }),
    {
      name: 'http-client-settings',
    },
  ),
);
