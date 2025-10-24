import { Upload, Link, FileText } from 'lucide-react';
import React from 'react';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ImportConfigFormProps {
  importMethod: 'file' | 'url';
  importType: 'postman' | 'openapi' | 'curl';
  importUrl: string;
  setImportMethod: (method: 'file' | 'url') => void;
  setImportUrl: (url: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUrlImport: () => void;
  isImporting: boolean;
  acceptedFormats: string;
}

export const ImportConfigForm: React.FC<ImportConfigFormProps> = ({
  importMethod,
  importType,
  importUrl,
  setImportMethod,
  setImportUrl,
  onFileUpload,
  onUrlImport,
  isImporting,
  acceptedFormats,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Tabs
      value={importMethod}
      onValueChange={value => setImportMethod(value as 'file' | 'url')}
    >
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='file' className='flex items-center gap-2'>
          <FileText className='w-4 h-4' />
          Upload File
        </TabsTrigger>
        <TabsTrigger value='url' className='flex items-center gap-2'>
          <Link className='w-4 h-4' />
          Import from URL
        </TabsTrigger>
      </TabsList>

      <div className='mt-4'>
        <TabsContent value='file'>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='file-upload'>Choose File</Label>
              <input
                ref={fileInputRef}
                id='file-upload'
                type='file'
                accept={
                  importType === 'postman'
                    ? '.json'
                    : importType === 'openapi'
                      ? '.json,.yaml,.yml'
                      : '.txt,.curl'
                }
                onChange={onFileUpload}
                className='hidden'
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className='w-full h-16 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50'
                variant='outline'
                disabled={isImporting}
              >
                <div className='flex flex-col items-center'>
                  <Upload className='w-6 h-6 mb-2' />
                  <span>Click to upload or drag and drop</span>
                  <span className='text-xs text-muted-foreground'>
                    {acceptedFormats}
                  </span>
                </div>
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='url'>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='import-url'>Import URL</Label>
              <Input
                id='import-url'
                placeholder='https://api.example.com/openapi.json'
                value={importUrl}
                onChange={e => setImportUrl(e.target.value)}
                disabled={isImporting}
              />
            </div>
            <Button
              onClick={onUrlImport}
              disabled={isImporting || !importUrl.trim()}
            >
              Import from URL
            </Button>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};
