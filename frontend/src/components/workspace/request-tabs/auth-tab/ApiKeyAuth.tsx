import { Info } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { AuthData } from './hooks/use-auth-state';

interface ApiKeyAuthProps {
  authData: AuthData;
  updateApiKey: (updates: Partial<AuthData['apikey']>) => void;
}

export function ApiKeyAuth({ authData, updateApiKey }: ApiKeyAuthProps) {
  return (
    <div className='space-y-4'>
      <div>
        <Label htmlFor='apikey-key'>Key</Label>
        <Input
          id='apikey-key'
          placeholder='e.g., X-API-Key, Authorization'
          value={authData.apikey.key}
          onChange={e => updateApiKey({ key: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor='apikey-value'>Value</Label>
        <Input
          id='apikey-value'
          placeholder='Enter API key value'
          value={authData.apikey.value}
          onChange={e => updateApiKey({ value: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor='apikey-addto'>Add to</Label>
        <Select
          value={authData.apikey.addTo}
          onValueChange={addTo =>
            updateApiKey({ addTo: addTo as 'header' | 'query' })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='header'>Header</SelectItem>
            <SelectItem value='query'>Query Parameter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className='pt-4'>
          <div className='flex items-start gap-2'>
            <Info className='w-4 h-4 text-blue-500 mt-0.5' />
            <div className='text-xs text-muted-foreground'>
              <p className='font-medium mb-1'>How it works:</p>
              <p>API key akan ditambahkan sebagai:</p>
              {authData.apikey.addTo === 'header' ? (
                <code className='block bg-muted p-1 rounded mt-1 text-xs'>
                  {authData.apikey.key || '<key>'}:{' '}
                  {authData.apikey.value || '<value>'}
                </code>
              ) : (
                <code className='block bg-muted p-1 rounded mt-1 text-xs'>
                  ?{authData.apikey.key || '<key>'}=
                  {authData.apikey.value || '<value>'}
                </code>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
