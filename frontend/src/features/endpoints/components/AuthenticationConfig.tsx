import React from 'react';
import { RequestAuthTab } from '@/components/workspace/request-tabs/AuthTab';

interface AuthenticationConfigProps {
  authData: any;
  onChange: (authData: any) => void;
}

export const AuthenticationConfig: React.FC<AuthenticationConfigProps> = ({ 
  authData, 
  onChange 
}) => {
  return (
    <RequestAuthTab 
      authData={authData} 
      onChange={onChange} 
    />
  );
};