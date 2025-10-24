import { Shield, CheckCircle2, AlertTriangle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { ApiEndpoint } from './types';

interface SecurityTabProps {
  endpoint: ApiEndpoint;
}

/**
 * Komponen untuk tab Security - menampilkan security requirements dan best practices
 */
export function SecurityTab({ endpoint }: SecurityTabProps) {
  const hasSecurity = endpoint.security && endpoint.security.length > 0;

  return (
    <div className='space-y-6'>
      {hasSecurity ? (
        <Card>
          <CardHeader>
            <CardTitle className='text-base flex items-center gap-2'>
              <Shield className='w-4 h-4' />
              Security Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {endpoint.security?.map((security, index) => (
              <div key={index} className='border rounded-lg p-3'>
                <div className='flex items-center gap-2 mb-2'>
                  <Badge variant='outline'>{security.type.toUpperCase()}</Badge>
                  <Badge variant='outline'>{security.scheme}</Badge>
                </div>
                {security.name && (
                  <div className='text-sm text-muted-foreground'>
                    Name: {security.name}
                  </div>
                )}
                {security.description && (
                  <div className='text-sm text-muted-foreground'>
                    {security.description}
                  </div>
                )}
                {security.in && (
                  <div className='text-sm text-muted-foreground'>
                    Location: {security.in}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className='pt-6 text-center'>
            <Shield className='w-12 h-12 mx-auto mb-4 text-muted-foreground' />
            <h4 className='text-lg font-semibold mb-2'>
              No Security Requirements
            </h4>
            <p className='text-sm text-muted-foreground'>
              This endpoint does not require authentication.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Security Best Practices</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-sm text-muted-foreground'>
          <div className='flex items-center gap-2'>
            <CheckCircle2 className='w-4 h-4 text-green-600 flex-shrink-0' />
            <span>Selalu gunakan HTTPS untuk production APIs</span>
          </div>
          <div className='flex items-center gap-2'>
            <CheckCircle2 className='w-4 h-4 text-green-600 flex-shrink-0' />
            <span>Implement authentication yang proper jika required</span>
          </div>
          <div className='flex items-center gap-2'>
            <CheckCircle2 className='w-4 h-4 text-green-600 flex-shrink-0' />
            <span>Validasi dan sanitize semua input</span>
          </div>
          <div className='flex items-center gap-2'>
            <AlertTriangle className='w-4 h-4 text-yellow-600 flex-shrink-0' />
            <span>Hati-hati dengan exposure data sensitif</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
