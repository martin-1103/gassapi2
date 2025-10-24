import * as React from 'react';

export interface AuthData {
  type: 'noauth' | 'bearer' | 'basic' | 'apikey' | 'oauth2';
  bearer: {
    token: string;
    prefix: string;
  };
  basic: {
    username: string;
    password: string;
  };
  apikey: {
    key: string;
    value: string;
    addTo: 'header' | 'query';
  };
  oauth2: {
    grantType: 'authorization_code' | 'client_credentials' | 'password';
    clientId: string;
    clientSecret: string;
    scope?: string;
    redirectUri?: string;
    authUrl?: string;
    accessToken?: string;
    refreshToken?: string;
  };
}

export interface UseAuthStateProps {
  authData: AuthData;
  onChange: (authData: AuthData) => void;
}

export function useAuthState({ authData, onChange }: UseAuthStateProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showSecret, setShowSecret] = React.useState(false);

  const updateAuthType = (type: AuthData['type']) => {
    onChange({
      ...authData,
      type,
    });
  };

  const updateBearer = (updates: Partial<AuthData['bearer']>) => {
    onChange({
      ...authData,
      bearer: { ...authData.bearer, ...updates },
    });
  };

  const updateBasic = (updates: Partial<AuthData['basic']>) => {
    onChange({
      ...authData,
      basic: { ...authData.basic, ...updates },
    });
  };

  const updateApiKey = (updates: Partial<AuthData['apikey']>) => {
    onChange({
      ...authData,
      apikey: { ...authData.apikey, ...updates },
    });
  };

  const updateOAuth2 = (updates: Partial<AuthData['oauth2']>) => {
    onChange({
      ...authData,
      oauth2: { ...authData.oauth2, ...updates },
    });
  };

  const generateBasicAuth = () => {
    if (authData.basic.username && authData.basic.password) {
      // Polyfill untuk btoa jika tidak tersedia
      const btoa = (str: string) => {
        if (typeof window !== 'undefined' && window.btoa) {
          return window.btoa(str);
        }
        // Manual base64 encoding untuk Node.js environment
        return Buffer.from(str, 'binary').toString('base64');
      };

      const credentials = btoa(
        `${authData.basic.username}:${authData.basic.password}`,
      );
      return `Basic ${credentials}`;
    }
    return '';
  };

  const getAuthDescription = (type: AuthData['type']) => {
    switch (type) {
      case 'noauth':
        return 'No authentication required for this request';
      case 'bearer':
        return 'Use Bearer token authentication (JWT, OAuth 2.0)';
      case 'basic':
        return 'Use Basic authentication with username and password';
      case 'apikey':
        return 'Use API key authentication in header or query parameters';
      case 'oauth2':
        return 'Use OAuth 2.0 authentication flow';
      default:
        return '';
    }
  };

  return {
    showPassword,
    setShowPassword,
    showSecret,
    setShowSecret,
    updateAuthType,
    updateBearer,
    updateBasic,
    updateApiKey,
    updateOAuth2,
    generateBasicAuth,
    getAuthDescription,
  };
}
