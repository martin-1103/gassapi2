import { Key, Shield, User, Lock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { ApiKeyAuth } from './ApiKeyAuth';
import { BasicAuth } from './BasicAuth';
import { BearerAuth } from './BearerAuth';
import { useAuthState, AuthData } from './hooks/use-auth-state';
import { OAuth2Auth } from './OAuth2Auth';

interface RequestAuthTabProps {
  authData: AuthData;
  onChange: (authData: AuthData) => void;
}

export function RequestAuthTab({ authData, onChange }: RequestAuthTabProps) {
  const {
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
  } = useAuthState({ authData, onChange });

  const getAuthIcon = (type: AuthData['type']) => {
    switch (type) {
      case 'noauth':
        return <User className='w-4 h-4' />;
      case 'bearer':
        return <Key className='w-4 h-4' />;
      case 'basic':
        return <Shield className='w-4 h-4' />;
      case 'apikey':
        return <Lock className='w-4 h-4' />;
      case 'oauth2':
        return <Key className='w-4 h-4' />;
      default:
        return <Shield className='w-4 h-4' />;
    }
  };

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center gap-4'>
          <h3 className='font-semibold'>Authentication</h3>
          <Badge variant='outline' className='flex items-center gap-1'>
            {getAuthIcon(authData.type)}
            <span className='capitalize'>{authData.type}</span>
          </Badge>
        </div>
      </div>

      {/* Auth Type Selector */}
      <div className='p-4 border-b'>
        <Label className='text-sm font-medium mb-2 block'>Type</Label>
        <Select value={authData.type} onValueChange={updateAuthType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='noauth'>No Auth</SelectItem>
            <SelectItem value='bearer'>Bearer Token</SelectItem>
            <SelectItem value='basic'>Basic Auth</SelectItem>
            <SelectItem value='apikey'>API Key</SelectItem>
            <SelectItem value='oauth2'>OAuth 2.0</SelectItem>
          </SelectContent>
        </Select>

        <p className='text-xs text-muted-foreground mt-2'>
          {getAuthDescription(authData.type)}
        </p>
      </div>

      {/* Auth Configuration */}
      <div className='flex-1 p-4'>
        {authData.type === 'noauth' && (
          <div className='h-full flex items-center justify-center text-muted-foreground'>
            <div className='text-center'>
              <User className='w-12 h-12 mx-auto mb-4 opacity-50' />
              <h3 className='text-lg font-semibold mb-2'>No Authentication</h3>
              <p className='text-sm'>
                Request ini tidak memerlukan autentikasi
              </p>
            </div>
          </div>
        )}

        {authData.type === 'bearer' && (
          <BearerAuth authData={authData} updateBearer={updateBearer} />
        )}

        {authData.type === 'basic' && (
          <BasicAuth
            authData={authData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            updateBasic={updateBasic}
            generateBasicAuth={generateBasicAuth}
          />
        )}

        {authData.type === 'apikey' && (
          <ApiKeyAuth authData={authData} updateApiKey={updateApiKey} />
        )}

        {authData.type === 'oauth2' && (
          <OAuth2Auth
            authData={authData}
            showSecret={showSecret}
            setShowSecret={setShowSecret}
            updateOAuth2={updateOAuth2}
          />
        )}
      </div>
    </div>
  );
}
