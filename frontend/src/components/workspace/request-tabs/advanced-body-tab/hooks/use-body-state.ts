import { useCallback } from 'react';

import { useToast } from '@/hooks/use-toast';

export interface BodyData {
  type:
    | 'none'
    | 'form-data'
    | 'x-www-form-urlencoded'
    | 'raw'
    | 'binary'
    | 'graphql';
  rawType: 'text' | 'javascript' | 'json' | 'html' | 'xml' | 'yaml';
  formData: Array<{
    id: string;
    key: string;
    value: string;
    type: 'text' | 'file';
    enabled: boolean;
    file?: File;
  }>;
  rawContent: string;
  graphqlQuery: string;
  graphqlVariables: string;
}

interface UseBodyStateProps {
  initialBody: BodyData;
  onChange: (body: BodyData) => void;
}

export function useBodyState({ initialBody, onChange }: UseBodyStateProps) {
  const { toast } = useToast();

  // Update body type
  const updateBodyType = useCallback(
    (type: BodyData['type']) => {
      onChange({ ...initialBody, type });
    },
    [initialBody, onChange],
  );

  // Update raw type
  const updateRawType = useCallback(
    (rawType: BodyData['rawType']) => {
      onChange({ ...initialBody, rawType });
    },
    [initialBody, onChange],
  );

  // Update raw content
  const updateRawContent = useCallback(
    (content: string) => {
      onChange({ ...initialBody, rawContent: content });
    },
    [initialBody, onChange],
  );

  // Update form data
  const updateFormData = useCallback(
    (formData: BodyData['formData']) => {
      onChange({ ...initialBody, formData });
    },
    [initialBody, onChange],
  );

  // Update GraphQL query
  const updateGraphQLQuery = useCallback(
    (query: string) => {
      onChange({ ...initialBody, graphqlQuery: query });
    },
    [initialBody, onChange],
  );

  // Update GraphQL variables
  const updateGraphQLVariables = useCallback(
    (variables: string) => {
      onChange({ ...initialBody, graphqlVariables: variables });
    },
    [initialBody, onChange],
  );

  // Get content type based on body type
  const getContentType = useCallback(() => {
    switch (initialBody.type) {
      case 'form-data':
        return 'multipart/form-data';
      case 'x-www-form-urlencoded':
        return 'application/x-www-form-urlencoded';
      case 'raw':
        switch (initialBody.rawType) {
          case 'json':
            return 'application/json';
          case 'xml':
            return 'application/xml';
          case 'html':
            return 'text/html';
          case 'javascript':
            return 'application/javascript';
          case 'yaml':
            return 'application/yaml';
          default:
            return 'text/plain';
        }
      case 'graphql':
        return 'application/json';
      case 'binary':
        return 'application/octet-stream';
      default:
        return null;
    }
  }, [initialBody.type, initialBody.rawType]);

  // Get body preview for display
  const getBodyPreview = useCallback(() => {
    switch (initialBody.type) {
      case 'form-data':
        return initialBody.formData
          .filter(item => item.enabled)
          .map(
            item =>
              `${item.key}: ${item.type === 'file' ? '(file)' : item.value}`,
          )
          .join('\n');
      case 'x-www-form-urlencoded':
        return initialBody.formData
          .filter(item => item.enabled)
          .map(
            item =>
              `${encodeURIComponent(item.key)}=${encodeURIComponent(item.value)}`,
          )
          .join('&');
      case 'raw':
        return initialBody.rawContent;
      case 'graphql':
        try {
          return JSON.stringify(
            {
              query: initialBody.graphqlQuery,
              variables: initialBody.graphqlVariables
                ? JSON.parse(initialBody.graphqlVariables)
                : {},
            },
            null,
            2,
          );
        } catch {
          return JSON.stringify(
            {
              query: initialBody.graphqlQuery,
              variables: {},
            },
            null,
            2,
          );
        }
      default:
        return 'No body';
    }
  }, [initialBody]);

  // Get language for code editor
  const getLanguage = useCallback(() => {
    switch (initialBody.rawType) {
      case 'javascript':
        return 'javascript';
      case 'json':
        return 'json';
      case 'html':
        return 'html';
      case 'xml':
        return 'xml';
      case 'yaml':
        return 'yaml';
      default:
        return 'text';
    }
  }, [initialBody.rawType]);

  // Format JSON content
  const formatJSON = useCallback(() => {
    if (initialBody.rawType === 'json' && initialBody.rawContent) {
      try {
        const parsed = JSON.parse(initialBody.rawContent);
        const formatted = JSON.stringify(parsed, null, 2);
        updateRawContent(formatted);
      } catch {
        toast({
          title: 'Format Failed',
          description: 'Invalid JSON syntax',
          variant: 'destructive',
        });
      }
    }
  }, [initialBody.rawType, initialBody.rawContent, updateRawContent, toast]);

  // Format XML content
  const formatXML = useCallback(() => {
    if (initialBody.rawType === 'xml' && initialBody.rawContent) {
      try {
        const formatted = initialBody.rawContent
          .replace(/></g, '>\n<')
          .replace(/^\s*\n/g, '');
        updateRawContent(formatted);
      } catch {
        toast({
          title: 'Format Failed',
          description: 'Could not format XML',
          variant: 'destructive',
        });
      }
    }
  }, [initialBody.rawType, initialBody.rawContent, updateRawContent, toast]);

  return {
    body: initialBody,
    updateBodyType,
    updateRawType,
    updateRawContent,
    updateFormData,
    updateGraphQLQuery,
    updateGraphQLVariables,
    getContentType,
    getBodyPreview,
    getLanguage,
    formatJSON,
    formatXML,
  };
}
