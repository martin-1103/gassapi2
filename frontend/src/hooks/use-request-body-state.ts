import { useState, useCallback } from 'react';

export interface BodyData {
  type:
    | 'none'
    | 'form-data'
    | 'x-www-form-urlencoded'
    | 'raw'
    | 'binary'
    | 'graphql';
  rawType: 'text' | 'javascript' | 'json' | 'html' | 'xml';
  formData: Array<{
    id: string;
    key: string;
    value: string;
    type: 'text' | 'file';
    enabled: boolean;
  }>;
  rawContent: string;
  graphqlQuery: string;
  graphqlVariables: string;
  binaryFile?: File;
}

interface UseRequestBodyStateProps {
  initialBodyData: BodyData;
  onChange: (bodyData: BodyData) => void;
}

export function useRequestBodyState({
  initialBodyData,
  onChange,
}: UseRequestBodyStateProps) {
  const [bodyData, setBodyData] = useState<BodyData>(initialBodyData);

  const updateBodyType = useCallback(
    (type: BodyData['type']) => {
      setBodyData(prev => {
        const newData = { ...prev, type };
        onChange(newData);
        return newData;
      });
    },
    [onChange],
  );

  const updateRawType = useCallback(
    (rawType: BodyData['rawType']) => {
      setBodyData(prev => {
        const newData = { ...prev, rawType };
        onChange(newData);
        return newData;
      });
    },
    [onChange],
  );

  const updateRawContent = useCallback(
    (content: string) => {
      setBodyData(prev => {
        const newData = { ...prev, rawContent: content };
        onChange(newData);
        return newData;
      });
    },
    [onChange],
  );

  const updateGraphQLQuery = useCallback(
    (query: string) => {
      setBodyData(prev => {
        const newData = { ...prev, graphqlQuery: query };
        onChange(newData);
        return newData;
      });
    },
    [onChange],
  );

  const updateGraphQLVariables = useCallback(
    (variables: string) => {
      setBodyData(prev => {
        const newData = { ...prev, graphqlVariables: variables };
        onChange(newData);
        return newData;
      });
    },
    [onChange],
  );

  const addFormField = useCallback(() => {
    const newField = {
      id: Date.now().toString(),
      key: '',
      value: '',
      type: 'text' as const,
      enabled: true,
    };
    setBodyData(prev => {
      const newData = { ...prev, formData: [...prev.formData, newField] };
      onChange(newData);
      return newData;
    });
  }, [onChange]);

  const updateFormField = useCallback(
    (id: string, updates: Partial<FormData[0]>) => {
      setBodyData(prev => {
        const newData = {
          ...prev,
          formData: prev.formData.map(field =>
            field.id === id ? { ...field, ...updates } : field,
          ),
        };
        onChange(newData);
        return newData;
      });
    },
    [onChange],
  );

  const deleteFormField = useCallback(
    (id: string) => {
      setBodyData(prev => {
        const newData = {
          ...prev,
          formData: prev.formData.filter(field => field.id !== id),
        };
        onChange(newData);
        return newData;
      });
    },
    [onChange],
  );

  const handleFileUpload = useCallback(
    (id: string, file: File) => {
      updateFormField(id, { value: file.name });
    },
    [updateFormField],
  );

  return {
    bodyData,
    updateBodyType,
    updateRawType,
    updateRawContent,
    updateGraphQLQuery,
    updateGraphQLVariables,
    addFormField,
    updateFormField,
    deleteFormField,
    handleFileUpload,
  };
}
