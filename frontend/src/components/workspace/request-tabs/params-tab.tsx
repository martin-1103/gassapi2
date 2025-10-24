import {
  Plus,
  Trash2,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface QueryParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

interface RequestParamsTabProps {
  params: QueryParam[];
  onChange: (params: QueryParam[]) => void;
}

export function RequestParamsTab({ params, onChange }: RequestParamsTabProps) {
  const addParam = () => {
    const newParam: QueryParam = {
      id: Date.now().toString(),
      key: '',
      value: '',
      enabled: true,
    };
    onChange([...params, newParam]);
  };

  const updateParam = (id: string, updates: Partial<QueryParam>) => {
    onChange(
      params.map(param => (param.id === id ? { ...param, ...updates } : param)),
    );
  };

  const deleteParam = (id: string) => {
    onChange(params.filter(param => param.id !== id));
  };

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

  const copyAsCurl = () => {
    const queryString = generateQueryString();
    if (!queryString) return;

    const curl = `curl -G -d "${queryString}" "https://example.com"`;
    navigator.clipboard.writeText(curl);
  };

  const enabledCount = params.filter(p => p.enabled).length;

  return (
    <TooltipProvider>
      <div className='h-full flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b'>
          <div className='flex items-center gap-4'>
            <h3 className='font-semibold'>Query Parameters</h3>
            <Badge variant='outline'>{enabledCount} active</Badge>
          </div>

          <div className='flex items-center gap-2'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={copyAsCurl}
                  disabled={enabledCount === 0}
                >
                  Copy as cURL
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy parameters as cURL command</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size='sm' variant='outline'>
                  Bulk Edit
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit parameters in bulk format</p>
              </TooltipContent>
            </Tooltip>

            <Button size='sm' onClick={addParam}>
              <Plus className='w-4 h-4 mr-2' />
              Add
            </Button>
          </div>
        </div>

        {/* Parameters Table */}
        <div className='flex-1 overflow-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-12'>Enabled</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className='w-20'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {params.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className='text-center py-8 text-muted-foreground'
                  >
                    <div className='flex flex-col items-center'>
                      <Plus className='w-8 h-8 mb-2 opacity-50' />
                      <p>No parameters added yet</p>
                      <p className='text-sm'>
                        Click "Add" to create your first parameter
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                params.map((param, index) => (
                  <TableRow key={param.id}>
                    <TableCell>
                      <Checkbox
                        checked={param.enabled}
                        onCheckedChange={checked =>
                          updateParam(param.id, { enabled: !!checked })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder='Parameter name'
                        value={param.key}
                        onChange={e =>
                          updateParam(param.id, { key: e.target.value })
                        }
                        className='font-mono text-sm'
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder='Parameter value'
                        value={param.value}
                        onChange={e =>
                          updateParam(param.id, { value: e.target.value })
                        }
                        className='font-mono text-sm'
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder='Description (optional)'
                        value={param.description || ''}
                        onChange={e =>
                          updateParam(param.id, { description: e.target.value })
                        }
                        className='text-sm'
                      />
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1'>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => moveParam(param.id, 'up')}
                              disabled={index === 0}
                            >
                              <ChevronUp className='w-4 h-4' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Move up</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => moveParam(param.id, 'down')}
                              disabled={index === params.length - 1}
                            >
                              <ChevronDown className='w-4 h-4' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Move down</TooltipContent>
                        </Tooltip>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size='sm' variant='ghost'>
                              <MoreHorizontal className='w-4 h-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem>URL Encode</DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteParam(param.id)}
                              className='text-destructive'
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className='p-4 border-t bg-muted/50'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-muted-foreground'>
              Generated URL:{' '}
              <code className='ml-2 px-2 py-1 bg-background rounded text-xs'>
                {generateQueryString()
                  ? `?${generateQueryString()}`
                  : 'No parameters'}
              </code>
            </div>
            <div className='flex items-center gap-2'>
              <Button size='sm' variant='outline'>
                URL Encode All
              </Button>
              <Button size='sm' variant='outline'>
                Clear Disabled
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
