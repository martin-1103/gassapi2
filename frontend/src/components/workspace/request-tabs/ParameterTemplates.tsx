import { Hash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { ParameterTemplatesProps } from './parameter-templates/types';
import { PARAM_TEMPLATES } from './parameter-templates/types';

// Component untuk menampilkan parameter templates
export function ParameterTemplates({
  templates = PARAM_TEMPLATES,
  onAddTemplate,
}: ParameterTemplatesProps) {
  return (
    <Card className='m-4'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm flex items-center gap-2'>
          <Hash className='w-4 h-4' />
          Common Templates
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-0'>
        <div className='flex flex-wrap gap-2'>
          {templates.map(template => (
            <Button
              key={template.key}
              size='sm'
              variant='outline'
              onClick={() => onAddTemplate(template)}
              className='text-xs h-7 px-2'
            >
              {template.key}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Re-export types secara terpisah
export type { ParameterTemplatesProps } from './parameter-templates/types';
