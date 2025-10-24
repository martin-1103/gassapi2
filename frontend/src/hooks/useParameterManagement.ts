import { useState, useCallback } from 'react';

import { useToast } from '@/hooks/use-toast';

// Interface untuk query parameter
export interface QueryParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

// Props interface untuk hook
interface UseParameterManagementProps {
  params: QueryParam[];
  onChange: (params: QueryParam[]) => void;
  url: string;
}

// Return interface untuk hook
interface UseParameterManagementReturn {
  // CRUD operations
  addParam: () => void;
  updateParam: (id: string, updates: Partial<QueryParam>) => void;
  deleteParam: (id: string) => void;
  duplicateParam: (param: QueryParam) => void;
  moveParam: (id: string, direction: 'up' | 'down') => void;

  // Bulk operations
  toggleAll: (enabled: boolean) => void;
  addTemplate: (template: {
    key: string;
    value: string;
    description?: string;
  }) => void;
  copyAllParams: () => void;
  importFromUrl: () => void;
  bulkEdit: () => void;

  // Utilities
  generateQueryString: () => string;
  showBulkEditDialog: boolean;
  setShowBulkEditDialog: (show: boolean) => void;
  bulkEditText: string;
  setBulkEditText: (text: string) => void;
  applyBulkEdit: () => void;
}

// Hook untuk mengelola operasi CRUD pada parameters
export function useParameterManagement({
  params,
  onChange,
  url,
}: UseParameterManagementProps): UseParameterManagementReturn {
  const { toast } = useToast();

  // State for bulk edit dialog
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false);
  const [bulkEditText, setBulkEditText] = useState('');

  // Tambah parameter baru
  const addParam = () => {
    const newParam: QueryParam = {
      id: Date.now().toString(),
      key: '',
      value: '',
      enabled: true,
    };
    onChange([...params, newParam]);
  };

  // Update parameter yang ada
  const updateParam = (id: string, updates: Partial<QueryParam>) => {
    onChange(
      params.map(param => (param.id === id ? { ...param, ...updates } : param)),
    );
  };

  // Hapus parameter
  const deleteParam = (id: string) => {
    onChange(params.filter(param => param.id !== id));
  };

  // Duplikat parameter
  const duplicateParam = (param: QueryParam) => {
    const duplicated: QueryParam = {
      ...param,
      id: Date.now().toString(),
      key: `${param.key}_copy`,
    };
    onChange([...params, duplicated]);
  };

  // Pindahkan posisi parameter (up/down)
  const moveParam = (id: string, direction: 'up' | 'down') => {
    const index = params.findIndex(param => param.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === params.length - 1)
    ) {
      return;
    }

    const newParams = [...params];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newParams[index], newParams[targetIndex]] = [
      newParams[targetIndex],
      newParams[index],
    ];
    onChange(newParams);
  };

  // Toggle semua parameter (enable/disable)
  const toggleAll = (enabled: boolean) => {
    onChange(params.map(param => ({ ...param, enabled })));
  };

  // Tambah parameter dari template
  const addTemplate = (template: {
    key: string;
    value: string;
    description?: string;
  }) => {
    const newParam: QueryParam = {
      id: Date.now().toString(),
      key: template.key,
      value: template.value,
      enabled: true,
      description: template.description,
    };
    onChange([...params, newParam]);
  };

  // Generate query string dari parameters yang aktif
  const generateQueryString = () => {
    const enabledParams = params.filter(
      param => param.enabled && param.key && param.value,
    );
    const searchParams = new URLSearchParams();

    enabledParams.forEach(param => {
      searchParams.append(param.key, param.value);
    });

    return searchParams.toString();
  };

  // Copy semua parameters ke clipboard
  const copyAllParams = () => {
    const paramsText = params
      .filter(param => param.enabled && param.key)
      .map(param => `${param.key}=${encodeURIComponent(param.value)}`)
      .join('&');

    navigator.clipboard.writeText(paramsText);
    toast({
      title: 'Duplicated',
      description: 'Query parameters copied to clipboard',
    });
  };

  // Import parameters dari URL
  const importFromUrl = () => {
    try {
      const urlObj = new URL(url);
      const searchParams = new URLSearchParams(urlObj.search);
      const importedParams: QueryParam[] = [];

      for (const [key, value] of searchParams.entries()) {
        importedParams.push({
          id: Date.now().toString() + Math.random(),
          key,
          value,
          enabled: true,
        });
      }

      onChange(importedParams);
      toast({
        title: 'Import Success',
        description: `Imported ${importedParams.length} parameters from URL`,
      });
    } catch {
      toast({
        title: 'Import Failed',
        description: 'Invalid URL format',
        variant: 'destructive',
      });
    }
  };

  // Bulk edit parameters
  const bulkEdit = useCallback(() => {
    const paramsText = params
      .filter(param => param.enabled)
      .map(param => `${param.key}=${param.value}`)
      .join('\n');

    setBulkEditText(paramsText);
    setShowBulkEditDialog(true);
  }, [params]);

  // Apply bulk edit
  const applyBulkEdit = useCallback(() => {
    try {
      const lines = bulkEditText.split('\n').filter(line => line.trim());
      const bulkParams: QueryParam[] = [];

      lines.forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          bulkParams.push({
            id: Date.now().toString() + Math.random(),
            key: key.trim(),
            value: valueParts.join('='),
            enabled: true,
          });
        }
      });

      onChange(bulkParams);
      toast({
        title: 'Bulk Edit Success',
        description: `Updated ${bulkParams.length} parameters`,
      });
      setShowBulkEditDialog(false);
    } catch {
      toast({
        title: 'Bulk Edit Failed',
        description: 'Invalid format. Use key=value per line.',
        variant: 'destructive',
      });
    }
  }, [bulkEditText, onChange, toast]);

  return {
    // CRUD operations
    addParam,
    updateParam,
    deleteParam,
    duplicateParam,
    moveParam,

    // Bulk operations
    toggleAll,
    addTemplate,
    copyAllParams,
    importFromUrl,
    bulkEdit,
    applyBulkEdit,

    // Utilities
    generateQueryString,
    showBulkEditDialog,
    setShowBulkEditDialog,
    bulkEditText,
    setBulkEditText,
  };
}
