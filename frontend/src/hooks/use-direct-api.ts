/**
 * React hook untuk Direct API Client
 * Mudahkan integration dengan React components
 */

import { useState, useCallback } from 'react';

import { directApiClient } from '@/lib/api/direct-client';
import { HistoryManager } from '@/lib/history/history-manager';
import { logger } from '@/lib/logger';
import type {
  HttpRequestConfig,
  HttpResponseData,
  HttpError,
  VariableContext,
} from '@/types/http-client';

interface UseDirectApiReturn {
  isLoading: boolean;
  response: HttpResponseData | null;
  error: HttpError | null;
  sendRequest: (config: HttpRequestConfig) => Promise<HttpResponseData | null>;
  clearResponse: () => void;
}

/**
 * Hook untuk send direct API request
 */
export function useDirectApi(
  variableContext?: VariableContext,
): UseDirectApiReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<HttpResponseData | null>(null);
  const [error, setError] = useState<HttpError | null>(null);
  const requestHistory = HistoryManager.getInstance();

  const sendRequest = useCallback(
    async (config: HttpRequestConfig) => {
      setIsLoading(true);
      setError(null);
      setResponse(null);

      const startTime = Date.now();

      try {
        // Set variable context kalau ada
        if (variableContext) {
          directApiClient.setVariableContext(variableContext);
        }

        // Convert HttpRequestConfig ke DirectRequestConfig
        const directConfig = {
          method: config.method,
          url: config.url,
          headers: config.headers?.reduce(
            (acc, header) => {
              if (header.enabled) {
                acc[header.key] = header.value;
              }
              return acc;
            },
            {} as Record<string, string>,
          ),
          body: config.body,
          timeout: config.timeout,
          followRedirects: config.followRedirects,
          validateSSL: config.validateSSL,
        };

        // Send request
        const result = await directApiClient.sendRequest(directConfig);
        const endTime = Date.now();

        // Convert DirectResponse ke HttpResponseData
        const httpResponseData: HttpResponseData = {
          status: result.status,
          statusText: result.statusText,
          headers: result.headers,
          data: result.data,
          time: result.time,
          size: result.size,
        };
        setResponse(httpResponseData);

        // Save to history
        try {
          await requestHistory.addToHistory({
            method: config.method,
            url: config.url,
            headers:
              config.headers?.reduce(
                (acc, header) => {
                  if (header.enabled) {
                    acc[header.key] = header.value;
                  }
                  return acc;
                },
                {} as Record<string, string>,
              ) || {},
            body: config.body,
            response: httpResponseData,
            status:
              result.status >= 200 && result.status < 300 ? 'success' : 'error',
            duration: endTime - startTime,
            collectionId:
              config.body?.type === 'json' &&
              typeof config.body.json === 'object' &&
              config.body.json !== null
                ? ((config.body.json as Record<string, unknown>)
                    ?.collectionId as string)
                : undefined,
          });
        } catch (historyError) {
          logger.error(
            'Failed to save request history',
            historyError as Error,
            'use-direct-api',
          );
        }

        return httpResponseData;
      } catch (err) {
        const httpError = err as HttpError;
        const endTime = Date.now();

        setError(httpError);

        // Save error to history juga
        try {
          await requestHistory.addToHistory({
            method: config.method,
            url: config.url,
            headers:
              config.headers?.reduce(
                (acc, header) => {
                  if (header.enabled) {
                    acc[header.key] = header.value;
                  }
                  return acc;
                },
                {} as Record<string, string>,
              ) || {},
            body: config.body,
            status: 'error',
            duration: endTime - startTime,
            collectionId:
              config.body?.type === 'json' &&
              typeof config.body.json === 'object' &&
              config.body.json !== null
                ? ((config.body.json as Record<string, unknown>)
                    ?.collectionId as string)
                : undefined,
          });
        } catch (historyError) {
          logger.error(
            'Failed to save request history',
            historyError as Error,
            'use-direct-api',
          );
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [variableContext, requestHistory],
  );

  const clearResponse = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  return {
    isLoading,
    response,
    error,
    sendRequest,
    clearResponse,
  };
}

/**
 * Hook untuk quick request (simplified version)
 */
export function useQuickRequest() {
  const [isLoading, setIsLoading] = useState(false);

  const quickRequest = useCallback(
    async (
      method: HttpRequestConfig['method'],
      url: string,
      options?: {
        headers?: Record<string, string>;
        body?: unknown;
        timeout?: number;
      },
    ): Promise<HttpResponseData | null> => {
      setIsLoading(true);

      try {
        const result = await directApiClient.quickRequest(method, url, options);
        return result;
      } catch (error) {
        logger.error('Quick request failed', error as Error, 'use-direct-api');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { quickRequest, isLoading };
}
