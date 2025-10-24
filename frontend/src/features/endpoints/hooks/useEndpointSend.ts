import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

import { interpolateUrl, buildUrlWithParams, buildHeaders, addAuthHeaders, buildRequestBody, formatResponse } from '@/lib/utils/endpoint-builder-utils';
import { validateEndpoint } from '@/lib/validations/endpoint-validation';
import { endpointsApi } from '@/lib/api/endpoints';
import type { Endpoint, Environment, EndpointResponse } from '@/types/api';

interface UseEndpointSendProps {
  endpoint: Endpoint;
  environment: Environment | null;
  queryParams: Array<{ key: string; value: string; enabled: boolean }>;
  headersList: Array<{ key: string; value: string; enabled: boolean }>;
  bodyData: any;
  authData: any;
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
    onError: (error: any) => {
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
      let url = interpolateUrl(endpoint.url, environment);
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
    } catch (error: any) {
      const endTime = Date.now();

      if (error.response) {
        const errorResponse = {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data,
          time: endTime - startTime,
          size: JSON.stringify(error.response.data || {}).length,
        };
        setResponse(errorResponse);
        return errorResponse;
      } else {
        toast.error(error.message || 'Request gagal');
        throw error;
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