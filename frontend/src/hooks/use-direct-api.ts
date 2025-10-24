/**
 * React hook untuk Direct API Client
 * Mudahkan integration dengan React components
 */

import { useState, useCallback } from 'react';

import { directApiClient } from '@/lib/api/direct-client';
import { requestHistory } from '@/lib/history/request-history';
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

        // Send request
        const result = await directApiClient.sendRequest(config);
        const endTime = Date.now();

        setResponse(result);

        // Save to history
        try {
          await requestHistory.addItem({
            id: crypto.randomUUID(),
            timestamp: startTime,
            request: config,
            response: result,
            duration: endTime - startTime,
            collectionId:
              config.body?.type === 'json'
                ? (config.body.json as any)?.collectionId
                : undefined,
          });
        } catch (historyError) {
          console.error('Failed to save request history:', historyError);
        }

        return result;
      } catch (err) {
        const httpError = err as HttpError;
        const endTime = Date.now();

        setError(httpError);

        // Save error to history juga
        try {
          await requestHistory.addItem({
            id: crypto.randomUUID(),
            timestamp: startTime,
            request: config,
            error: httpError,
            duration: endTime - startTime,
          });
        } catch (historyError) {
          console.error('Failed to save request history:', historyError);
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [variableContext],
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
        body?: any;
        timeout?: number;
      },
    ): Promise<HttpResponseData | null> => {
      setIsLoading(true);

      try {
        const result = await directApiClient.quickRequest(method, url, options);
        return result;
      } catch (error) {
        console.error('Quick request failed:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { quickRequest, isLoading };
}
