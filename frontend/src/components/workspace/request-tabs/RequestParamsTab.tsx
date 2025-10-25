import { useState } from 'react';

// Import custom hook
import {
  useParameterManagement,
  type QueryParam,
} from '@/hooks/useParameterManagement';

// Import extracted components
import { PARAM_TEMPLATES } from './parameter-templates/types';
import { ParameterActions } from './ParameterActions';
import { ParameterSearch } from './ParameterSearch';
import { ParameterTable } from './ParameterTable';
import { ParameterTemplates } from './ParameterTemplates';
import { URLPreview } from './URLPreview';

interface RequestParamsTabProps {
  params: QueryParam[];
  onChange: (params: QueryParam[]) => void;
  url: string;
  onUrlChange: (url: string) => void;
}

export default function RequestParamsTab({
  params,
  onChange,
  url,
  onUrlChange: _onUrlChange,
}: RequestParamsTabProps) {
  // Local state untuk search
  const [searchTerm, setSearchTerm] = useState('');

  // Gunakan custom hook untuk business logic
  const parameterManagement = useParameterManagement({ params, onChange, url });

  // Filter parameters berdasarkan search term
  const filteredParams = params.filter(
    param =>
      param.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      param.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (param.description &&
        param.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Hitung statistik parameters
  const paramsCount = {
    enabled: params.filter(param => param.enabled).length,
    total: params.length,
  };

  return (
    <div className='h-full flex flex-col'>
      {/* Header Actions */}
      <ParameterActions
        onImportFromUrl={parameterManagement.importFromUrl}
        onBulkEdit={parameterManagement.bulkEdit}
        onCopyAll={parameterManagement.copyAllParams}
        onAddParam={parameterManagement.addParam}
        paramsCount={paramsCount}
      />

      {/* Templates */}
      <ParameterTemplates
        templates={PARAM_TEMPLATES}
        onAddTemplate={parameterManagement.addTemplate}
      />

      {/* Search and Toggle Actions */}
      <ParameterSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onToggleAll={parameterManagement.toggleAll}
        paramsCount={paramsCount}
      />

      {/* Parameters Table */}
      <ParameterTable
        params={params}
        filteredParams={filteredParams}
        searchTerm={searchTerm}
        onUpdate={parameterManagement.updateParam}
        onDelete={parameterManagement.deleteParam}
        onMove={parameterManagement.moveParam}
        onDuplicate={parameterManagement.duplicateParam}
      />

      {/* URL Preview Footer */}
      <URLPreview
        url={url}
        queryString={parameterManagement.generateQueryString()}
      />
    </div>
  );
}
