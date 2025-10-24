import React from 'react';
import RequestBodyTab from '@/components/workspace/request-tabs/body-tab';

interface RequestBodyConfigProps {
  bodyData: any;
  onChange: (bodyData: any) => void;
}

export const RequestBodyConfig: React.FC<RequestBodyConfigProps> = ({ 
  bodyData, 
  onChange 
}) => {
  return (
    <RequestBodyTab 
      bodyData={bodyData} 
      onChange={onChange} 
    />
  );
};