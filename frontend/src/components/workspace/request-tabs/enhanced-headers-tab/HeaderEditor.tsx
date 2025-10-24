import { BookOpen, Zap, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

import {
  COMMON_HEADERS,
  HEADER_PRESETS,
  parseHeadersFromJson,
  parseHeadersFromCurl,
} from './utils/header-utils';

import { RequestHeader } from './index';

interface HeaderEditorProps {
  headers: RequestHeader[];
  onAddHeader: (header: RequestHeader) => void;
  onAddMultipleHeaders: (headers: RequestHeader[]) => void;
}

export default function HeaderEditor({
  headers,
  onAddHeader,
  onAddMultipleHeaders,
}: HeaderEditorProps) {
  const { toast } = useToast();
  const [curlDialogOpen, setCurlDialogOpen] = useState(false);
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [curlInput, setCurlInput] = useState('');
  const [bulkEditText, setBulkEditText] = useState('');

  const addCommonHeader = (template: {
    key: string;
    value: string;
    description: string;
  }) => {
    const newHeader: RequestHeader = {
      id: Date.now().toString(),
      key: template.key,
      value: template.value,
      enabled: true,
      description: template.description,
    };
    onAddHeader(newHeader);
  };

  const addPreset = (presetName: string) => {
    const preset = HEADER_PRESETS[presetName as keyof typeof HEADER_PRESETS];
    if (preset) {
      const newHeaders = preset.map(header => ({
        ...header,
        id: Date.now().toString() + Math.random(),
        enabled: true,
      }));
      onAddMultipleHeaders(newHeaders);
      toast({
        title: 'Preset Added',
        description: `Added ${preset.length} headers from ${presetName} preset`,
      });
    }
  };

  const parseCurlHeaders = () => {
    if (!curlInput.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter a cURL command',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newHeaders = parseHeadersFromCurl(curlInput);

      if (newHeaders.length === 0) {
        toast({
          title: 'No Headers Found',
          description: 'Could not find headers in cURL command',
          variant: 'destructive',
        });
        return;
      }

      onAddMultipleHeaders(newHeaders);
      toast({
        title: 'Headers Imported',
        description: `Imported ${newHeaders.length} headers from cURL command`,
      });
      setCurlInput('');
      setCurlDialogOpen(false);
    } catch {
      toast({
        title: 'Import Failed',
        description: 'Failed to parse cURL command',
        variant: 'destructive',
      });
    }
  };

  const importHeaders = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const newHeaders = parseHeadersFromJson(text);
        onAddMultipleHeaders(newHeaders);
        toast({
          title: 'Headers Imported',
          description: `Imported ${newHeaders.length} headers from file`,
        });
      } catch {
        toast({
          title: 'Import Failed',
          description: 'Invalid JSON file format',
          variant: 'destructive',
        });
      }
    };

    input.click();
  };

  const handleBulkEdit = () => {
    const headersObj = headers.reduce(
      (acc, header) => {
        if (header.enabled && header.key) {
          acc[header.key] = header.value;
        }
        return acc;
      },
      {} as Record<string, string>,
    );

    const initialText = JSON.stringify(headersObj, null, 2);
    setBulkEditText(initialText);
    setBulkEditDialogOpen(true);
  };

  const applyBulkEdit = () => {
    if (!bulkEditText.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter headers in JSON format',
        variant: 'destructive',
      });
      return;
    }

    try {
      const editedHeaders = parseHeadersFromJson(bulkEditText);
      onAddMultipleHeaders(editedHeaders);
      toast({
        title: 'Bulk Edit Success',
        description: `Updated ${editedHeaders.length} headers`,
      });
      setBulkEditDialogOpen(false);
    } catch {
      toast({
        title: 'Bulk Edit Failed',
        description: 'Invalid JSON format',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='space-y-4'>
      {/* Quick Actions */}
      <div className='grid grid-cols-2 gap-2'>
        <Dialog open={curlDialogOpen} onOpenChange={setCurlDialogOpen}>
          <DialogTrigger asChild>
            <Button size='sm' variant='outline'>
              Import cURL
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import cURL Headers</DialogTitle>
              <DialogDescription>
                Paste a cURL command to extract and import its headers.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder='Paste your cURL command here...'
              value={curlInput}
              onChange={e => setCurlInput(e.target.value)}
              className='min-h-[100px]'
            />
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setCurlDialogOpen(false)}
              >
                Batal
              </Button>
              <Button onClick={parseCurlHeaders}>Import Headers</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button size='sm' variant='outline' onClick={importHeaders}>
          Import File
        </Button>

        <Button size='sm' variant='outline' onClick={handleBulkEdit}>
          Bulk Edit
        </Button>

        <Dialog open={bulkEditDialogOpen} onOpenChange={setBulkEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Headers</DialogTitle>
              <DialogDescription>
                Edit headers in JSON format. Headers will be replaced with the
                edited version.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder='Enter headers in JSON format...'
              value={bulkEditText}
              onChange={e => setBulkEditText(e.target.value)}
              className='min-h-[200px] font-mono text-sm'
            />
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setBulkEditDialogOpen(false)}
              >
                Batal
              </Button>
              <Button onClick={applyBulkEdit}>Apply Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button
          size='sm'
          onClick={() =>
            onAddHeader({
              id: Date.now().toString(),
              key: '',
              value: '',
              enabled: true,
            })
          }
        >
          <Plus className='w-4 h-4 mr-2' />
          Add Header
        </Button>
      </div>

      {/* Common Headers */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm flex items-center gap-2'>
            <BookOpen className='w-4 h-4' />
            Common Headers
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='space-y-3 max-h-64 overflow-y-auto'>
            {COMMON_HEADERS.map(header => (
              <div
                key={header.key}
                className='flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50'
              >
                <div className='flex-1'>
                  <div className='font-medium text-sm'>{header.key}</div>
                  <div className='text-xs text-muted-foreground'>
                    {header.description}
                  </div>
                  <div className='text-xs font-mono mt-1'>{header.value}</div>
                </div>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => addCommonHeader(header)}
                >
                  <Plus className='w-4 h-4' />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Header Presets */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm flex items-center gap-2'>
            <Zap className='w-4 h-4' />
            Header Presets
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {Object.entries(HEADER_PRESETS).map(([name, preset]) => (
              <div
                key={name}
                className='flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50'
              >
                <div>
                  <div className='font-medium text-sm'>{name}</div>
                  <div className='text-xs text-muted-foreground'>
                    {preset.length} headers
                  </div>
                </div>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => addPreset(name)}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
