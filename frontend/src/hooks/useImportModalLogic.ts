import { useState, useCallback } from 'react';
import type { ChangeEvent } from 'react';

import { useToast } from '@/hooks/use-toast';
import { parseImportContent } from '@/utils/import/import-parser';
import { ImportResult, ImportValidationResult } from '@/utils/import/types';
import { validateImportContent } from '@/utils/import/validation';

// Proper type for import data
export interface ImportData {
  requests?: unknown[];
  info?: Record<string, unknown>;
  name?: string;
  [key: string]: unknown;
}

export interface ImportModalState {
  importMethod: 'file' | 'url';
  importType: 'postman' | 'openapi' | 'curl';
  importUrl: string;
  isImporting: boolean;
  importProgress: number;
  importResult: ImportResult | null;
  validationErrors: ImportValidationResult | null;
}

export interface ImportModalActions {
  setImportMethod: (method: 'file' | 'url') => void;
  setImportType: (type: 'postman' | 'openapi' | 'curl') => void;
  setImportUrl: (url: string) => void;
  handleFileUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleUrlImport: () => Promise<void>;
  resetState: () => void;
}

export const useImportModalLogic = (
  onImport: (data: ImportData) => void,
): [ImportModalState, ImportModalActions] => {
  const [state, setState] = useState<ImportModalState>({
    importMethod: 'file',
    importType: 'postman',
    importUrl: '',
    isImporting: false,
    importProgress: 0,
    importResult: null,
    validationErrors: null,
  });

  const { toast } = useToast();

  const setImportMethod = useCallback((method: 'file' | 'url') => {
    setState(prev => ({ ...prev, importMethod: method }));
  }, []);

  const setImportType = useCallback((type: 'postman' | 'openapi' | 'curl') => {
    setState(prev => ({
      ...prev,
      importType: type,
      importResult: null,
      validationErrors: null,
    }));
  }, []);

  const setImportUrl = useCallback((url: string) => {
    setState(prev => ({ ...prev, importUrl: url }));
  }, []);

  const handleFileUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setState(prev => ({
        ...prev,
        isImporting: true,
        importProgress: 0,
        importResult: null,
        validationErrors: null,
      }));

      try {
        setState(prev => ({ ...prev, importProgress: 20 }));

        const fileContent = await file.text();
        setState(prev => ({ ...prev, importProgress: 40 }));

        // Validate the content before parsing
        const validation = validateImportContent(fileContent, state.importType);
        setState(prev => ({ ...prev, validationErrors: validation }));

        if (!validation.isValid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        setState(prev => ({ ...prev, importProgress: 60 }));

        const result = await parseImportContent(fileContent, state.importType);
        setState(prev => ({
          ...prev,
          importProgress: 100,
          importResult: result,
        }));

        if (result.success && result.data) {
          onImport(result.data as ImportData);
          toast({
            title: 'Import successful',
            description: result.message,
          });
        } else {
          toast({
            title: 'Import failed',
            description: result.message,
            variant: 'destructive',
          });
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Import failed';
        const result: ImportResult = {
          success: false,
          message: errorMessage,
        };
        setState(prev => ({
          ...prev,
          importResult: result,
          validationErrors: {
            isValid: false,
            errors: [errorMessage],
            warnings: [],
          },
        }));
        toast({
          title: 'Import failed',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setState(prev => ({
          ...prev,
          isImporting: false,
          importProgress: 0,
        }));
      }
    },
    [state.importType, onImport, toast],
  );

  const handleUrlImport = useCallback(async () => {
    if (!state.importUrl.trim()) {
      toast({
        title: 'URL required',
        description: 'Please enter a URL to import from',
        variant: 'destructive',
      });
      return;
    }

    setState(prev => ({
      ...prev,
      isImporting: true,
      importProgress: 0,
      importResult: null,
      validationErrors: null,
    }));

    try {
      setState(prev => ({ ...prev, importProgress: 20 }));

      const response = await globalThis.fetch(state.importUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      setState(prev => ({ ...prev, importProgress: 40 }));

      const content = await response.text();
      setState(prev => ({ ...prev, importProgress: 60 }));

      // Auto-detect import type from URL or content if not specified
      let importType = state.importType;
      if (content.includes('openapi') || content.includes('swagger')) {
        importType = 'openapi';
      } else if (
        content.includes('info.schema') ||
        state.importUrl.includes('postman')
      ) {
        importType = 'postman';
      } else if (content.includes('curl') || state.importUrl.includes('curl')) {
        importType = 'curl';
      }

      // Validate the content before parsing
      const validation = validateImportContent(content, importType);
      setState(prev => ({ ...prev, validationErrors: validation }));

      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const result = await parseImportContent(content, importType);
      setState(prev => ({
        ...prev,
        importType, // Update the state to reflect the detected import type
        importProgress: 100,
        importResult: result,
      }));

      if (result.success && result.data) {
        onImport(result.data as ImportData);
        toast({
          title: 'Import successful',
          description: result.message,
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Import failed';
      const result: ImportResult = {
        success: false,
        message: errorMessage,
      };
      setState(prev => ({
        ...prev,
        importResult: result,
        validationErrors: {
          isValid: false,
          errors: [errorMessage],
          warnings: [],
        },
      }));
      toast({
        title: 'Import failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setState(prev => ({
        ...prev,
        isImporting: false,
        importProgress: 0,
      }));
    }
  }, [state.importUrl, state.importType, onImport, toast]);

  const resetState = useCallback(() => {
    setState({
      importMethod: 'file',
      importType: 'postman',
      importUrl: '',
      isImporting: false,
      importProgress: 0,
      importResult: null,
      validationErrors: null,
    });
  }, []);

  const actions: ImportModalActions = {
    setImportMethod,
    setImportType,
    setImportUrl,
    handleFileUpload,
    handleUrlImport,
    resetState,
  };

  return [state, actions];
};
