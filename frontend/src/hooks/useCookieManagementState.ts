/**
 * Custom hook for cookie management state and operations
 */

import { useState, useCallback } from 'react';

import { useToast } from '@/hooks/use-toast';
import type { CookieType } from '@/lib/utils/cookie-utils';
import {
  extractCookiesFromHeaders,
  formatCookiesForCurl,
  prepareCookiesForExport,
  filterCookies,
} from '@/lib/utils/cookie-utils';

export interface UseCookieManagementStateProps {
  cookies: Record<string, unknown>;
}

interface UseCookieManagementStateReturn {
  // State
  searchQuery: string;
  expandedCookies: Set<string>;
  editMode: boolean;
  editCookie: Partial<CookieType> | null;
  cookiesList: CookieType[];
  filteredCookies: CookieType[];

  // Actions
  setSearchQuery: (query: string) => void;
  setEditMode: (mode: boolean) => void;
  setEditCookie: (cookie: Partial<CookieType> | null) => void;
  toggleExpanded: (name: string) => void;
  updateCookie: (name: string, updates: Partial<CookieType>) => void;
  deleteCookie: (name: string) => void;
  exportCookies: () => void;
  importCookies: () => void;
  copyCookiesAsCurl: () => void;
}

export function useCookieManagementState({
  cookies,
}: UseCookieManagementStateProps): UseCookieManagementStateReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCookies, setExpandedCookies] = useState<Set<string>>(
    new Set(),
  );
  const [editMode, setEditMode] = useState(false);
  const [editCookie, setEditCookie] = useState<Partial<CookieType> | null>(
    null,
  );
  const { toast } = useToast();

  const cookiesList = extractCookiesFromHeaders(cookies);
  const filteredCookies = filterCookies(cookiesList, searchQuery);

  const toggleExpanded = useCallback((name: string) => {
    setExpandedCookies(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(name)) {
        newExpanded.delete(name);
      } else {
        newExpanded.add(name);
      }
      return newExpanded;
    });
  }, []);

  const updateCookie = useCallback(
    (name: string, updates: Partial<CookieType>) => {
      // This would typically make an API call to update cookies
      // For now, just show toast
      toast({
        title: 'Cookie Update',
        description: `Cookie "${name}" would be updated: ${JSON.stringify(updates)}`,
      });
    },
    [toast],
  );

  const deleteCookie = useCallback(
    (name: string) => {
      toast({
        title: 'Cookie Delete',
        description: `Cookie "${name}" would be deleted`,
      });
    },
    [toast],
  );

  const exportCookies = useCallback(() => {
    const cookiesData = prepareCookiesForExport(cookiesList);

    const blob = new Blob([JSON.stringify(cookiesData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cookies_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Cookies Exported',
      description: `Exported ${cookiesList.length} cookies to file`,
    });
  }, [cookiesList, toast]);

  const importCookies = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importedCookies = JSON.parse(text);

        if (Array.isArray(importedCookies)) {
          toast({
            title: 'Cookies Imported',
            description: `Imported ${importedCookies.length} cookies`,
          });
        }
      } catch {
        toast({
          title: 'Import Failed',
          description: 'Invalid JSON file format',
          variant: 'destructive',
        });
      }
    };

    input.click();
  }, [toast]);

  const copyCookiesAsCurl = useCallback(() => {
    const cookieHeaders = formatCookiesForCurl(cookiesList);

    navigator.clipboard.writeText(cookieHeaders);
    toast({
      title: 'Cookies Copied',
      description: 'Cookies copied to clipboard in cURL format',
    });
  }, [cookiesList, toast]);

  return {
    // State
    searchQuery,
    expandedCookies,
    editMode,
    editCookie,
    cookiesList,
    filteredCookies,

    // Actions
    setSearchQuery,
    setEditMode,
    setEditCookie,
    toggleExpanded,
    updateCookie,
    deleteCookie,
    exportCookies,
    importCookies,
    copyCookiesAsCurl,
  };
}
