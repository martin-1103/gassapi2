import { AlertTriangle, CheckCircle2, Copy, Database } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

import type { SchemaGeneratorProps } from './types';
import { SchemaProperty, formatSchema } from './utils/schema-utils';

/**
 * Komponen untuk menampilkan dan mengelola JSON Schema
 */
export function SchemaGenerator({
  endpoint,
  showSchema,
}: Omit<SchemaGeneratorProps, 'onCopySchema'>) {
  const { toast } = useToast();

  const handleCopySchema = async () => {
    try {
      await navigator.clipboard.writeText(
        formatSchema(
          endpoint.responses['200']?.content['application/json']?.schema || {
            type: 'object',
          },
        ),
      );
      toast({
        title: 'Schema Disalin',
        description: 'JSON schema berhasil disalin ke clipboard',
      });
    } catch {
      toast({
        title: 'Gagal Menyalin',
        description: 'Tidak dapat menyalin schema ke clipboard',
        variant: 'destructive',
      });
    }
  };

  const getContentType = (): string => {
    return 'application/json'; // Placeholder - akan diupdate dengan logic yang lebih baik
  };

  const schema = endpoint.responses['200']?.content['application/json']?.schema;

  return (
    <div className='space-y-6'>
      {/* Schema Information */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base flex items-center gap-2'>
            <Database className='w-4 h-4' />
            Schema Information
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>
                Type
              </div>
              <div className='flex items-center gap-2'>
                <Badge variant='outline'>{schema?.type || 'unknown'}</Badge>
              </div>
            </div>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>
                Content-Type
              </div>
              <div className='text-sm'>{getContentType()}</div>
            </div>
          </div>

          {schema?.properties && (
            <>
              <Separator />
              <div>
                <div className='text-sm font-medium text-muted-foreground mb-2'>
                  Properties ({Object.keys(schema.properties).length})
                </div>
                <div className='space-y-2'>
                  {Object.entries(schema.properties).map(
                    ([key, prop]: [string, SchemaProperty]) => (
                      <div
                        key={key}
                        className='flex items-center gap-2 text-sm'
                      >
                        <Badge variant='outline' className='text-xs'>
                          {prop.type}
                        </Badge>
                        <span className='font-medium'>{key}</span>
                        {schema.required?.includes(key) && (
                          <Badge variant='destructive' className='text-xs'>
                            Required
                          </Badge>
                        )}
                        {prop.description && (
                          <span className='text-muted-foreground ml-2'>
                            – {prop.description}
                          </span>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Schema Display */}
      {showSchema && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-base'>JSON Schema</CardTitle>
              <Button size='sm' variant='outline' onClick={handleCopySchema}>
                <Copy className='w-4 h-4 mr-2' />
                Salin
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className='h-[400px]'>
              <pre className='text-xs bg-muted/50 p-4 rounded-lg overflow-x-auto'>
                <code>{formatSchema(schema || { type: 'object' })}</code>
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Schema Validation Tips */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Validation Tips</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          <div className='flex items-center gap-2'>
            <CheckCircle2 className='w-4 h-4 text-green-600 flex-shrink-0' />
            <span>Gunakan schema untuk validasi input data</span>
          </div>
          <div className='flex items-center gap-2'>
            <CheckCircle2 className='w-4 h-4 text-green-600 flex-shrink-0' />
            <span>Required fields harus selalu diisi</span>
          </div>
          <div className='flex items-center gap-2'>
            <AlertTriangle className='w-4 h-4 text-yellow-600 flex-shrink-0' />
            <span>Perhatikan format dan constraint untuk setiap field</span>
          </div>
          <div className='flex items-center gap-2'>
            <AlertTriangle className='w-4 h-4 text-yellow-600 flex-shrink-0' />
            <span>Array items harus mengikuti schema yang ditentukan</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
