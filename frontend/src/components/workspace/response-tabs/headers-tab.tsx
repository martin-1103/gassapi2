import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Custom hook
import { useResponseHeadersState } from '@/hooks/useResponseHeadersState';

// Extracted components
import { HeaderFilter, HeaderFilterControls } from './components/HeaderFilter';
import { HeaderActions } from './components/HeaderActions';
import { HeaderDisplay } from './components/HeaderDisplay';
import { HeaderStats } from './components/HeaderStats';

// Utilities
import { STANDARD_HEADERS } from '@/lib/headers/header-analysis';

interface ResponseHeadersTabProps {
  headers: Record<string, string>;
}

export function ResponseHeadersTab({ headers }: ResponseHeadersTabProps) {
  // Gunakan custom hook untuk state management
  const {
    searchQuery,
    showOnlyStandard,
    filteredHeaders,
    groupedHeaders,
    totalHeaders,
    showingHeaders,
    totalCategories,
    headersSize,
    hasFilteredResults,
    handleCopyHeaders,
    handleCopyAsJSON,
    handleDownloadHeaders,
    handleSearchChange,
    toggleStandardFilter,
  } = useResponseHeadersState({ headers });

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center gap-4'>
          <h3 className='font-semibold'>Headers</h3>
          <Badge variant='outline'>{totalHeaders} total</Badge>
          {hasFilteredResults && (
            <Badge variant='secondary' className='text-xs'>
              {showingHeaders} showing
            </Badge>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <HeaderFilter
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />

          <HeaderActions
            onCopyHeaders={handleCopyHeaders}
            onCopyAsJSON={handleCopyAsJSON}
            onDownloadHeaders={handleDownloadHeaders}
          />
        </div>
      </div>

      {/* Filters */}
      <HeaderFilterControls
        showOnlyStandard={showOnlyStandard}
        standardHeadersCount={STANDARD_HEADERS.length}
        onToggleStandard={toggleStandardFilter}
      />

      {/* Headers Content */}
      <div className='flex-1 overflow-auto p-4'>
        <HeaderDisplay
          groupedHeaders={groupedHeaders}
          searchQuery={searchQuery}
        />
      </div>

      {/* Footer */}
      <HeaderStats
        totalHeaders={totalHeaders}
        showingHeaders={showingHeaders}
        totalCategories={totalCategories}
        headersSize={headersSize}
        searchQuery={searchQuery}
      />
    </div>
  );
}
