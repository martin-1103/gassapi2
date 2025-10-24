import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import * as React from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ImportResult } from '@/types/import-types';

interface ImportResultProps {
  result: ImportResult | null;
  onClose?: () => void;
  onClear?: () => void;
}

export const ImportResultComponent: React.FC<ImportResultProps> = ({
  result,
  onClose,
  onClear,
}) => {
  if (!result) return null;

  const getStatusIcon = () => {
    if (result.success) {
      return <CheckCircle className='w-5 h-5 text-green-600' />;
    } else {
      return <XCircle className='w-5 h-5 text-red-600' />;
    }
  };

  const getStatusVariant = () => {
    return result.success ? 'default' : 'destructive';
  };

  const hasWarnings = result.warnings && result.warnings.length > 0;
  const hasData =
    result.data && ('items' in result.data ? result.data.items?.length : true);

  return (
    <div className='space-y-4'>
      {/* Status Alert */}
      <Alert variant={getStatusVariant() as 'default' | 'destructive'}>
        <div className='flex items-start gap-2'>
          {getStatusIcon()}
          <div className='flex-1'>
            <AlertDescription className='font-medium'>
              {result.message}
            </AlertDescription>
            {result.importedCount !== undefined && (
              <div className='mt-1'>
                <Badge variant={result.success ? 'default' : 'destructive'}>
                  {result.importedCount} items{' '}
                  {result.success ? 'imported' : 'failed'}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </Alert>

      {/* Warnings */}
      {hasWarnings && (
        <Alert variant='default' className='border-yellow-200 bg-yellow-50'>
          <AlertTriangle className='w-4 h-4 text-yellow-600' />
          <AlertDescription>
            <div className='space-y-1'>
              <p className='font-medium text-yellow-800'>Perhatian:</p>
              <ul className='text-sm text-yellow-700 space-y-1'>
                {(result.warnings ?? []).map((warning, index) => (
                  <li key={index} className='flex items-start gap-1'>
                    <span className='text-yellow-500 mt-0.5'>•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Data Preview */}
      {hasData && result.success && (
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Info className='w-4 h-4 text-blue-600' />
            <span className='text-sm font-medium text-blue-800'>
              Data Preview
            </span>
          </div>

          <div className='bg-muted/30 rounded-lg p-4'>
            <pre className='text-xs overflow-auto max-h-40'>
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>

          {/* Show specific data based on type */}
          {result.data?.type === 'postman' && (
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='font-medium'>Collections:</span>{' '}
                {result.data.collections?.length || 0}
              </div>
              <div>
                <span className='font-medium'>Endpoints:</span>{' '}
                {result.data.collections?.reduce(
                  (total: number, col) => total + (col.item?.length || 0),
                  0,
                ) || 0}
              </div>
            </div>
          )}

          {result.data?.type === 'openapi' && (
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='font-medium'>Version:</span>{' '}
                {result.data.version || 'N/A'}
              </div>
              <div>
                <span className='font-medium'>Endpoints:</span>{' '}
                {result.data.endpoints?.length || 0}
              </div>
            </div>
          )}

          {result.data?.type === 'curl' && (
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='font-medium'>Method:</span>{' '}
                {result.data.method || 'GET'}
              </div>
              <div>
                <span className='font-medium'>Headers:</span>{' '}
                {Object.keys(result.data.headers || {}).length}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className='flex justify-end gap-2 pt-4 border-t'>
        {onClear && (
          <Button variant='outline' onClick={onClear}>
            Clear Result
          </Button>
        )}
        {onClose && <Button onClick={onClose}>Close</Button>}
      </div>
    </div>
  );
};
