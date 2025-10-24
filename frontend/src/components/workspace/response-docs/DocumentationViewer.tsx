import {
  BookOpen,
  Copy,
  Eye,
  EyeOff,
  Database,
  Globe,
  Code,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

import { OverviewTab } from './OverviewTab';
import { SecurityTab } from './SecurityTab';
import { DocumentationViewerProps } from './types';
import { copyToClipboard } from './utils/export-utils';
import { formatSchema } from './utils/schema-utils';

/**
 * Komponen utama untuk menampilkan documentation tabs
 */
export function DocumentationViewer({
  endpoint,
  response,
  showSchema,
  onToggleSchema,
  onCopySchema,
  onCopyDocs,
  onCopyMarkdown,
  onDownload,
}: DocumentationViewerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const handleCopySchema = async () => {
    try {
      const schema =
        endpoint.responses['200']?.content['application/json']?.schema;
      const schemaText = formatSchema(schema || { type: 'object' });
      await copyToClipboard(schemaText);
      toast({
        title: 'Schema Disalin',
        description: 'JSON schema berhasil disalin ke clipboard',
      });
      onCopySchema();
    } catch {
      toast({
        title: 'Gagal Menyalin',
        description: 'Tidak dapat menyalin schema',
        variant: 'destructive',
      });
    }
  };

  const handleCopyDocs = async () => {
    try {
      const docs = {
        endpoint,
        response,
        generatedAt: new Date().toISOString(),
      };
      const docsText = JSON.stringify(docs, null, 2);
      await copyToClipboard(docsText);
      toast({
        title: 'Documentation Disalin',
        description: 'API documentation berhasil disalin',
      });
      onCopyDocs();
    } catch {
      toast({
        title: 'Gagal Menyalin',
        description: 'Tidak dapat menyalin documentation',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center gap-3'>
          <h3 className='font-semibold flex items-center gap-2'>
            <BookOpen className='w-5 h-5' />
            API Documentation
          </h3>
          <Badge variant='outline' className='text-xs'>
            Auto-generated
          </Badge>
        </div>

        <div className='flex items-center gap-2'>
          <Button size='sm' variant='outline' onClick={onToggleSchema}>
            {showSchema ? (
              <EyeOff className='w-4 h-4' />
            ) : (
              <Eye className='w-4 h-4' />
            )}
            Schema
          </Button>
          <Button size='sm' variant='outline' onClick={handleCopyDocs}>
            <Copy className='w-4 h-4 mr-2' />
            JSON
          </Button>
          <Button size='sm' variant='outline' onClick={onCopyMarkdown}>
            <Copy className='w-4 h-4 mr-2' />
            Markdown
          </Button>
          <Button size='sm' variant='outline' onClick={onDownload}>
            <Copy className='w-4 h-4 mr-2' />
            Download
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 p-4'>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='h-full flex flex-col'
        >
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='overview' className='flex items-center gap-2'>
              <Globe className='w-4 h-4' />
              Overview
            </TabsTrigger>
            <TabsTrigger value='schema' className='flex items-center gap-2'>
              <Database className='w-4 h-4' />
              Schema
            </TabsTrigger>
            <TabsTrigger value='examples' className='flex items-center gap-2'>
              <Code className='w-4 h-4' />
              Examples
            </TabsTrigger>
            <TabsTrigger value='security' className='flex items-center gap-2'>
              <Copy className='w-4 h-4' />
              Security
            </TabsTrigger>
          </TabsList>

          <div className='flex-1 mt-4'>
            <TabsContent value='overview' className='h-full mt-0'>
              <ScrollArea className='h-full'>
                <OverviewTab endpoint={endpoint} response={response} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value='schema' className='h-full mt-0'>
              <ScrollArea className='h-full'>
                {showSchema && (
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <h4 className='font-medium'>JSON Schema</h4>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={handleCopySchema}
                        >
                          <Copy className='w-4 h-4 mr-2' />
                          Copy
                        </Button>
                      </div>
                    </div>

                    <div className='bg-card rounded-lg border'>
                      <div className='p-4'>
                        <pre className='text-xs bg-muted/50 p-4 rounded-lg overflow-x-auto'>
                          <code>
                            {formatSchema(
                              endpoint.responses['200']?.content[
                                'application/json'
                              ]?.schema || { type: 'object' },
                            )}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value='examples' className='h-full mt-0'>
              <ScrollArea className='h-full'>
                <div className='text-center py-12'>
                  <Code className='w-12 h-12 mx-auto mb-4 text-muted-foreground' />
                  <h3 className='text-lg font-semibold mb-2'>Code Examples</h3>
                  <p className='text-sm text-muted-foreground'>
                    Gunakan tab &quot;Export & Examples&quot; untuk melihat
                    contoh kode dalam berbagai bahasa
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value='security' className='h-full mt-0'>
              <ScrollArea className='h-full'>
                <SecurityTab endpoint={endpoint} />
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
