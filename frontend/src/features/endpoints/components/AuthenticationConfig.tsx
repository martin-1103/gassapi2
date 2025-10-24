import React from 'react';

import { RequestAuthTab } from '@/components/workspace/request-tabs/AuthTab';
import type { AuthData } from '@/types/api';

interface AuthenticationConfigProps {
  authData: AuthData;
  onChange: (authData: AuthData) => void;
}

export const AuthenticationConfig: React.FC<AuthenticationConfigProps> = ({
  authData,
  onChange,
}) => {
  return <RequestAuthTab authData={authData} onChange={onChange} />;
};
