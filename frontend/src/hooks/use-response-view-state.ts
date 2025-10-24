import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ApiResponse } from '@/types/api';
import { formatResponseContent, generateDownloadFilename } from '@/lib/response/response-processor';

interface UseResponseViewStateProps {
  response?: ApiResponse | null;
  onCopyResponse?: () => void;
  onDownloadResponse?: () => void;
  onSaveResponse?: () => void;
}

/**
 * Custom hook for managing response view state
 * Includes functionality for line numbers, line wrapping, and tree view expansion
 */
export const useResponseViewState = ({
  response,
  onCopyResponse,
  onDownloadResponse,
  onSaveResponse,
}: UseResponseViewStateProps = {}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('body');
  const [searchQuery, setSearchQuery] = useState('');
  const [formatMode, setFormatMode] = useState<'pretty' | 'raw'>('pretty');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Response display options
  const [lineNumbers, setLineNumbers] = useState(true);
  const [wrapLines, setWrapLines] = useState(true);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));

  // Toggle path expansion for tree view
  const togglePath = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  }, []);

  const handleCopyResponse = useCallback(() => {
    if (!response) return;

    const content = formatResponseContent(response, formatMode);
    navigator.clipboard.writeText(content).then(() => {
      toast({
        title: 'Berhasil disalin',
        description: 'Response berhasil disalin ke clipboard',
      });
    }).catch(() => {
      toast({
        title: 'Gagal menyalin',
        description: 'Terjadi kesalahan saat menyalin response',
        variant: 'destructive',
      });
    });

    onCopyResponse?.();
  }, [response, formatMode, toast, onCopyResponse]);

  const handleDownloadResponse = useCallback(() => {
    if (!response) return;

    const content = formatResponseContent(response, formatMode);
    const filename = generateDownloadFilename(response);

    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Berhasil diunduh',
      description: `Response berhasil diunduh sebagai ${filename}`,
    });

    onDownloadResponse?.();
  }, [response, formatMode, toast, onDownloadResponse]);

  const handleSaveResponse = useCallback(() => {
    // Implementasi save response logic
    toast({
      title: 'Berhasil disimpan',
      description: 'Response berhasil disimpan',
    });

    onSaveResponse?.();
  }, [toast, onSaveResponse]);

  return {
    // State
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    formatMode,
    setFormatMode,
    isFullscreen,
    setIsFullscreen,

    // Response display options
    lineNumbers,
    setLineNumbers,
    wrapLines,
    setWrapLines,
    expandedPaths,
    togglePath,

    // Actions
    handleCopyResponse,
    handleDownloadResponse,
    handleSaveResponse,
  };
};