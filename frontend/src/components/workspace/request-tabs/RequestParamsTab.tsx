import {
  Plus,
  Trash2,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Copy,
  Edit3,
  Hash,
  Search,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface QueryParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

interface RequestParamsTabProps {
  params: QueryParam[];
  onChange: (params: QueryParam[]) => void;
  url: string;
  onUrlChange: (url: string) => void;
}

// Common parameter templates
const PARAM_TEMPLATES = [
  { key: 'page', value: '1', description: 'Page number untuk pagination' },
  { key: 'limit', value: '10', description: 'Jumlah item per halaman' },
  { key: 'offset', value: '0', description: 'Offset untuk pagination' },
  { key: 'search', value: '', description: 'Keyword untuk pencarian' },
  { key: 'sort', value: 'created_at', description: 'Field untuk sorting' },
  { key: 'order', value: 'desc', description: 'Sorting order (asc/desc)' },
  { key: 'filter', value: '', description: 'Filter data' },
  { key: 'format', value: 'json', description: 'Response format (json/xml)' },
  {
    key: 'fields',
    value: '',
    description: 'Fields yang ingin diambil (comma separated)',
  },
  {
    key: 'include',
    value: '',
    description: 'Include related data (comma separated)',
  },
];

export default function RequestParamsTab({
  params,
  onChange,
  url,
  onUrlChange,
}: RequestParamsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

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

  const duplicateParam = (param: QueryParam) => {
    const duplicated: QueryParam = {
      ...param,
      id: Date.now().toString(),
      key: `${param.key}_copy`,
    };
    onChange([...params, duplicated]);
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

  const toggleAll = (enabled: boolean) => {
    onChange(params.map(param => ({ ...param, enabled })));
  };

  const addTemplate = (template: (typeof PARAM_TEMPLATES)[0]) => {
    const newParam: QueryParam = {
      id: Date.now().toString(),
      key: template.key,
      value: template.value,
      enabled: true,
      description: template.description,
    };
    onChange([...params, newParam]);
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
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: 'Invalid URL format',
        variant: 'destructive',
      });
    }
  };

  const bulkEdit = () => {
    const paramsText = params
      .filter(param => param.enabled)
      .map(param => `${param.key}=${param.value}`)
      .join('\n');

    const bulkText = prompt(
      'Edit parameters (key=value per line):',
      paramsText,
    );

    if (bulkText !== null) {
      try {
        const lines = bulkText.split('\n').filter(line => line.trim());
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
      } catch (error) {
        toast({
          title: 'Bulk Edit Failed',
          description: 'Invalid format. Use key=value per line.',
          variant: 'destructive',
        });
      }
    }
  };

  const filteredParams = params.filter(
    param =>
      param.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      param.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (param.description &&
        param.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const enabledCount = params.filter(param => param.enabled).length;
  const totalCount = params.length;

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center gap-3'>
          <h3 className='font-semibold'>Query Parameters</h3>
          <Badge variant='outline'>
            {enabledCount}/{totalCount} active
          </Badge>
        </div>

        <div className='flex items-center gap-2'>
          <Button size='sm' variant='outline' onClick={importFromUrl}>
            Import from URL
          </Button>
          <Button size='sm' variant='outline' onClick={bulkEdit}>
            <Edit3 className='w-4 h-4 mr-2' />
            Bulk Edit
          </Button>
          <Button size='sm' variant='outline' onClick={copyAllParams}>
            <Copy className='w-4 h-4 mr-2' />
            Copy All
          </Button>
          <Button size='sm' onClick={addParam}>
            <Plus className='w-4 h-4 mr-2' />
            Add
          </Button>
        </div>
      </div>

      {/* Templates */}
      <Card className='m-4'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm flex items-center gap-2'>
            <Hash className='w-4 h-4' />
            Common Templates
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='flex flex-wrap gap-2'>
            {PARAM_TEMPLATES.map(template => (
              <Button
                key={template.key}
                size='sm'
                variant='outline'
                onClick={() => addTemplate(template)}
                className='text-xs h-7 px-2'
              >
                {template.key}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Actions */}
      <div className='mx-4 mb-4'>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center gap-2 flex-1'>
            <Search className='w-4 h-4 text-muted-foreground' />
            <Input
              placeholder='Search parameters...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='flex-1'
            />
          </div>

          <div className='flex items-center gap-2'>
            <Button size='sm' variant='outline' onClick={() => toggleAll(true)}>
              Enable All
            </Button>
            <Button
              size='sm'
              variant='outline'
              onClick={() => toggleAll(false)}
            >
              Disable All
            </Button>
          </div>
        </div>
      </div>

      {/* Parameters Table */}
      <div className='flex-1 overflow-hidden px-4 pb-4'>
        <ScrollArea className='h-full'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-12'>Enabled</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className='w-24'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParams.map((param, index) => (
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
                      disabled={!param.enabled}
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
                      disabled={!param.enabled}
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
                      disabled={!param.enabled}
                    />
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-1'>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => moveParam(param.id, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className='w-4 h-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => moveParam(param.id, 'down')}
                        disabled={index === filteredParams.length - 1}
                      >
                        <ChevronDown className='w-4 h-4' />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size='sm' variant='ghost'>
                            <MoreHorizontal className='w-4 h-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => duplicateParam(param)}
                          >
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
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
              ))}
            </TableBody>
          </Table>

          {filteredParams.length === 0 && (
            <div className='text-center py-8 text-muted-foreground'>
              {searchTerm ? 'No parameters found' : 'No parameters added yet'}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className='p-4 border-t bg-muted/50'>
        <div className='flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            <div>Generated URL: </div>
            <code className='ml-2 px-2 py-1 bg-background rounded text-xs'>
              {url.includes('?')
                ? url.split('?')[0] + '?' + generateQueryString()
                : url + '?' + generateQueryString()}
            </code>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground'>URL Encoding:</span>
            <Button size='sm' variant='outline'>
              Apply Encoding
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
