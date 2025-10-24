// Types dan constants untuk ParameterTemplates component

export interface Template {
  key: string;
  value: string;
  description: string;
}

export interface ParameterTemplatesProps {
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
