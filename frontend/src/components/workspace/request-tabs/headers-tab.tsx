import { Copy } from 'lucide-react';

import { CodeEditor } from '@/components/common/code-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { HeaderEmptyState } from './components/HeaderEmptyState';
import { HeaderTable } from './components/HeaderTable';
import { HeaderTemplates } from './components/HeaderTemplates';
import { useHeadersState } from '@/hooks/useHeadersState';
import { RequestHeader } from '@/lib/utils/header-utils';

interface RequestHeadersTabProps {
  headers: RequestHeader[];
  onChange: (headers: RequestHeader[]) => void;
}

export function RequestHeadersTab({
  headers,
  onChange,
}: RequestHeadersTabProps) {
  // Gunakan custom hook untuk semua state dan logic
  const {
    headers: managedHeaders,
    showCommonHeaders,
    validation,
    duplicateHeaders,
    addHeader,
    addCommonHeader,
    updateHeader,
    deleteHeader,
    duplicateExistingHeader,
    clearDisabledHeaders,
    copyHeaders,
    copyAsCurl,
    copyHeaderValue,
    setShowCommonHeaders,
    getHeadersObject,
    enabledHeadersCount,
    hasHeaders,
  } = useHeadersState({
    initialHeaders: headers,
    onHeadersChange: onChange,
  });

  return (
    <TooltipProvider>
      <div className='h-full flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b'>
          <div className='flex items-center gap-4'>
            <h3 className='font-semibold'>Headers</h3>
            <Badge variant='outline'>{enabledHeadersCount} active</Badge>
            {!validation.isValid && (
              <Badge variant='destructive' className='text-xs'>
                Validation Errors
              </Badge>
            )}
          </div>

          <div className='flex items-center gap-2'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={copyAsCurl}
                  disabled={enabledHeadersCount === 0}
                >
                  Copy as cURL
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy headers as cURL command</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={copyHeaders}
                  disabled={enabledHeadersCount === 0}
                >
                  <Copy className='w-4 h-4 mr-2' />
                  Copy
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy headers to clipboard</TooltipContent>
            </Tooltip>

            <Button size='sm' onClick={addHeader}>
              Add
            </Button>
          </div>
        </div>

        {/* Common Headers Templates */}
        <HeaderTemplates
          showCommonHeaders={showCommonHeaders}
          onHideCommonHeaders={() => setShowCommonHeaders(false)}
          onAddCommonHeader={addCommonHeader}
        />

        {/* Headers Table */}
        <div className='flex-1 p-4'>
          {!hasHeaders ? (
            <HeaderEmptyState onAddHeader={addHeader} />
          ) : (
            <HeaderTable
              headers={managedHeaders}
              validationErrors={validation.errors}
              duplicateHeaders={duplicateHeaders}
              onUpdateHeader={updateHeader}
              onDeleteHeader={deleteHeader}
              onDuplicateHeader={duplicateExistingHeader}
              onCopyHeaderValue={copyHeaderValue}
            />
          )}
        </div>

        {/* Footer */}
        <div className='p-4 border-t bg-muted/50'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-muted-foreground'>
              Active headers will be sent with request
            </div>
            <div className='flex items-center gap-2'>
              {!showCommonHeaders && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => setShowCommonHeaders(true)}
                >
                  Common Headers
                </Button>
              )}

              {managedHeaders.filter(h => !h.enabled).length > 0 && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={clearDisabledHeaders}
                >
                  Clear Disabled
                </Button>
              )}

              <CodeEditor
                value={JSON.stringify(getHeadersObject(), null, 2)}
                onChange={() => {}}
                language='json'
                rows={3}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
