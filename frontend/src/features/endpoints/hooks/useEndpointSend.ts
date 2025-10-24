import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';

import { endpointsApi } from '@/lib/api/endpoints';
import {
  interpolateUrl,
  buildUrlWithParams,
  buildHeaders,
  addAuthHeaders,
  buildRequestBody,
  formatResponse,
} from '@/lib/utils/endpoint-builder-utils';
import { validateEndpoint } from '@/lib/validations/endpoint-validation';
import type {
  Endpoint,
  Environment,
  EndpointResponse,
  AuthData,
  RequestBody,
} from '@/types/api';
import type { ApiError } from '@/types/error-types';

interface UseEndpointSendProps {
  endpoint: Endpoint;
  environment: Environment | null;
  queryParams: Array<{ key: string; value: string; enabled: boolean }>;
  headersList: Array<{ key: string; value: string; enabled: boolean }>;
  bodyData: RequestBody;
  authData: AuthData;
}

export function useEndpointSend({
  endpoint,
  environment,
  queryParams,
  headersList,
  bodyData,
  authData,
}: UseEndpointSendProps) {
  const queryClient = useQueryClient();
  const [response, setResponse] = useState<EndpointResponse | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Update endpoint mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Endpoint>) =>
      endpointsApi.update(endpoint.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['endpoints', endpoint.collection_id],
      });
      toast.success('Endpoint berhasil disimpan!');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Gagal menyimpan endpoint');
    },
  });

  // Send request logic
  const handleSend = async () => {
    // Validate endpoint before sending
    const validation = validateEndpoint(endpoint);
    if (!validation.isValid) {
      validation.errors.forEach(error => {
        toast.error(`${error.field}: ${error.message}`);
      });
      return;
    }

    setIsSending(true);
    const startTime = Date.now();

    try {
      // Build URL with query parameters
      const envVars =
        environment?.variables?.reduce(
          (acc, variable) => {
            if (variable.enabled) {
              acc[variable.key] = variable.value;
            }
            return acc;
          },
          {} as Record<string, string>,
        ) || {};

      let url = interpolateUrl(endpoint.url, envVars);
      url = buildUrlWithParams(url, queryParams);

      // Build headers
      let headers = buildHeaders(headersList);

      // Add authentication headers
      headers = addAuthHeaders(headers, authData);

      // Build request body
      const body = buildRequestBody(bodyData, endpoint.method);

      const axiosResponse = await axios({
        method: endpoint.method,
        url,
        headers,
        data: body,
      });

      const formattedResponse = formatResponse(axiosResponse, startTime);
      setResponse(formattedResponse);

      toast.success(`Request berhasil - ${axiosResponse.status}`);
      return formattedResponse;
    } catch (error: unknown) {
      const endTime = Date.now();
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        const errorResponse = {
          status: axiosError.response.status,
          statusText: axiosError.response.statusText,
          headers: axiosError.response.headers,
          data: axiosError.response.data,
          time: endTime - startTime,
          size: JSON.stringify(axiosError.response.data || {}).length,
        };
        setResponse(errorResponse);
        return errorResponse;
      } else {
        toast.error(axiosError.message || 'Request gagal');
        throw axiosError;
      }
    } finally {
      setIsSending(false);
    }
  };

  // Save endpoint logic
  const handleSave = () => {
    updateMutation.mutate({
      name: endpoint.name,
      method: endpoint.method,
      url: endpoint.url,
      headers: endpoint.headers,
      body: endpoint.body,
    });
  };

  return {
    response,
    setResponse,
    isSending,
    setIsSending,
    handleSend,
    handleSave,
    updateMutation,
  };
}
