import { Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Interface untuk template
interface Template {
  key: string;
  value: string;
  description: string;
}

// Props interface untuk ParameterTemplates component
interface ParameterTemplatesProps {
  templates: Template[];
  onAddTemplate: (template: Template) => void;
}

// Common parameter templates - dipindahkan dari component utama
export const PARAM_TEMPLATES: Template[] = [
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

// Component untuk menampilkan parameter templates
export function ParameterTemplates({
  templates = PARAM_TEMPLATES,
  onAddTemplate
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