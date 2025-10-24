/**
 * Header table component for editing headers
 * Extracted from RequestHeadersTab for better organization
 */

import { Copy, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RequestHeader } from '@/lib/utils/header-utils';
import { ValidationError } from '@/lib/validations/header-validation';

interface HeaderTableProps {
  headers: RequestHeader[];
  validationErrors?: Array<{ headerId: string; errors: ValidationError[] }>;
  duplicateHeaders?: string[];
  onUpdateHeader: (id: string, updates: Partial<RequestHeader>) => void;
  onDeleteHeader: (id: string) => void;
  onDuplicateHeader: (id: string) => void;
  onCopyHeaderValue: (id: string) => void;
}

export function HeaderTable({
  headers,
  validationErrors = [],
  duplicateHeaders = [],
  onUpdateHeader,
  onDeleteHeader,
  onDuplicateHeader,
  onCopyHeaderValue,
}: HeaderTableProps) {
  // Get validation errors untuk header tertentu
  const getErrorsForHeader = (headerId: string): ValidationError[] => {
    const headerErrors = validationErrors.find(e => e.headerId === headerId);
    return headerErrors?.errors || [];
  };

  // Check apakah header duplikat
  const isDuplicate = (headerId: string): boolean => {
    return duplicateHeaders.includes(headerId);
  };

  if (headers.length === 0) {
    return null; // Empty state handled by parent component
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='w-12'>Enabled</TableHead>
          <TableHead>Header Name</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className='w-20'>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {headers.map(header => {
          const errors = getErrorsForHeader(header.id);
          const hasErrors = errors.length > 0;
          const isDup = isDuplicate(header.id);

          return (
            <TableRow
              key={header.id}
              className={hasErrors || isDup ? 'bg-destructive/5' : ''}
            >
              <TableCell>
                <Checkbox
                  checked={header.enabled}
                  onCheckedChange={checked =>
                    onUpdateHeader(header.id, { enabled: !!checked })
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder='Header name'
                  value={header.key}
                  onChange={e =>
                    onUpdateHeader(header.id, { key: e.target.value })
                  }
                  className={`font-mono text-sm ${
                    isDup ? 'border-orange-300' : ''
                  }`}
                />
                {isDup && (
                  <p className='text-xs text-orange-600 mt-1'>
                    Duplicate header name
                  </p>
                )}
              </TableCell>
              <TableCell>
                <Input
                  placeholder='Header value'
                  value={header.value}
                  onChange={e =>
                    onUpdateHeader(header.id, { value: e.target.value })
                  }
                  className='font-mono text-sm'
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder='Description (optional)'
                  value={header.description || ''}
                  onChange={e =>
                    onUpdateHeader(header.id, {
                      description: e.target.value,
                    })
                  }
                  className='text-sm'
                />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size='sm' variant='ghost'>
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onDuplicateHeader(header.id)}>
                      <Trash2 className='w-4 h-4 mr-2' />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCopyHeaderValue(header.id)}>
                      <Copy className='w-4 h-4 mr-2' />
                      Copy Value
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDeleteHeader(header.id)}
                      className='text-destructive'
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}