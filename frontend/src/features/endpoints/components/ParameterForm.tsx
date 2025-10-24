import React from 'react';
import { RequestParamsTab } from '@/components/workspace/request-tabs/params-tab';

interface ParameterFormProps {
  params: Array<{ id: string; key: string; value: string; enabled: boolean }>;
  onChange: (params: Array<{ id: string; key: string; value: string; enabled: boolean }>) => void;
  url: string;
}

export const ParameterForm: React.FC<ParameterFormProps> = ({ 
  params, 
  onChange, 
  url 
}) => {
  return (
    <RequestParamsTab
      params={params}
      onChange={onChange}
      url={url}
    />
  );
};