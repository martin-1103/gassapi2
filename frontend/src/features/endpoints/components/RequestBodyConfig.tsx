import React from 'react';

import RequestBodyTab from '@/components/workspace/request-tabs/body-tab';
import type { RequestBody } from '@/types/api';

interface RequestBodyConfigProps {
  bodyData: RequestBody;
  onChange: (bodyData: RequestBody) => void;
}

export const RequestBodyConfig: React.FC<RequestBodyConfigProps> = ({
  bodyData,
  onChange,
}) => {
  return <RequestBodyTab bodyData={bodyData} onChange={onChange} />;
};
