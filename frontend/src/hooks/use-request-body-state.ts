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

export function useRequestBodyState({ initialBodyData, onChange }: UseRequestBodyStateProps) {
  const [bodyData, setBodyData] = useState<BodyData>(initialBodyData);

  const updateBodyType = useCallback((type: BodyData['type']) => {
    setBodyData(prev => ({ ...prev, type }));
    onChange({ ...bodyData, type });
  }, [bodyData, onChange]);

  const updateRawType = useCallback((rawType: BodyData['rawType']) => {
    setBodyData(prev => ({ ...prev, rawType }));
    onChange({ ...bodyData, rawType });
  }, [bodyData, onChange]);

  const updateRawContent = useCallback((content: string) => {
    setBodyData(prev => ({ ...prev, rawContent: content }));
    onChange({ ...bodyData, rawContent: content });
  }, [bodyData, onChange]);

  const updateGraphQLQuery = useCallback((query: string) => {
    setBodyData(prev => ({ ...prev, graphqlQuery: query }));
    onChange({ ...bodyData, graphqlQuery: query });
  }, [bodyData, onChange]);

  const updateGraphQLVariables = useCallback((variables: string) => {
    setBodyData(prev => ({ ...prev, graphqlVariables: variables }));
    onChange({ ...bodyData, graphqlVariables: variables });
  }, [bodyData, onChange]);

  const addFormField = useCallback(() => {
    const newField = {
      id: Date.now().toString(),
      key: '',
      value: '',
      type: 'text' as const,
      enabled: true,
    };
    setBodyData(prev => ({ ...prev, formData: [...prev.formData, newField] }));
    onChange({ ...bodyData, formData: [...bodyData.formData, newField] });
  }, [bodyData, onChange]);

  const updateFormField = useCallback((id: string, updates: any) => {
    setBodyData(prev => ({
      ...prev,
      formData: prev.formData.map(field =>
        field.id === id ? { ...field, ...updates } : field,
      ),
    }));
    onChange({
      ...bodyData,
      formData: bodyData.formData.map(field =>
        field.id === id ? { ...field, ...updates } : field,
      ),
    });
  }, [bodyData, onChange]);

  const deleteFormField = useCallback((id: string) => {
    setBodyData(prev => ({
      ...prev,
      formData: prev.formData.filter(field => field.id !== id),
    }));
    onChange({
      ...bodyData,
      formData: bodyData.formData.filter(field => field.id !== id),
    });
  }, [bodyData, onChange]);

  const handleFileUpload = useCallback((id: string, file: File) => {
    updateFormField(id, { value: file.name });
  }, [updateFormField]);

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