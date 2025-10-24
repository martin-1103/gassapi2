import { FileText, Globe, Code } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ImportFormatSelectorProps {
  importType: 'postman' | 'openapi' | 'curl';
  setImportType: (type: 'postman' | 'openapi' | 'curl') => void;
}

export const ImportFormatSelector: React.FC<ImportFormatSelectorProps> = ({
  importType,
  setImportType,
}) => {
  const formatOptions = [
    {
      value: 'postman' as const,
      title: 'Postman',
      icon: <FileText className='w-4 h-4' />,
      description: 'Import Postman Collection v2.1 format',
      acceptedFormats: '.json',
      example: 'Export from Postman: Share > Export > Collection v2.1',
    },
    {
      value: 'openapi' as const,
      title: 'OpenAPI',
      icon: <Globe className='w-4 h-4' />,
      description: 'Import OpenAPI 3.0 or Swagger 2.0 specifications',
      acceptedFormats: '.json, .yaml, .yml',
      example: 'Download OpenAPI spec from your API documentation',
    },
    {
      value: 'curl' as const,
      title: 'cURL',
      icon: <Code className='w-4 h-4' />,
      description: 'Import a single cURL command',
      acceptedFormats: '.txt, .curl',
      example: 'Copy cURL command from browser dev tools or API docs',
    },
  ];

  const selectedFormat = formatOptions.find(
    option => option.value === importType,
  );

  return (
    <div className='space-y-6'>
      {/* Import Type Selection */}
      <div>
        <Label className='text-base font-medium mb-3 block'>Import Type</Label>
        <div className='grid grid-cols-3 gap-3'>
          {formatOptions.map(type => (
            <Button
              key={type.value}
              variant={importType === type.value ? 'default' : 'outline'}
              onClick={() => setImportType(type.value)}
              className='flex items-center gap-2 h-12'
            >
              {type.icon}
              <span>{type.title}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Import Type Info */}
      {selectedFormat && (
        <div className='p-4 bg-muted/50 rounded-lg'>
          <div className='flex items-center gap-2 mb-2'>
            {selectedFormat.icon}
            <h3 className='font-medium'>{selectedFormat.title}</h3>
          </div>
          <p className='text-sm text-muted-foreground mb-2'>
            {selectedFormat.description}
          </p>
          <div className='text-xs'>
            <Badge variant='outline'>{selectedFormat.acceptedFormats}</Badge>
            <p className='mt-1 text-muted-foreground'>
              {selectedFormat.example}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
