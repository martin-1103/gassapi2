/**
 * Cookie table component for displaying cookie information
 */

import { Clock, Trash2, Shield, Info } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getSecurityIcon } from '@/lib/security/cookie-security';
import type { CookieType } from '@/lib/utils/cookie-utils';
import { formatExpiry, isCookieExpired } from '@/lib/utils/cookie-utils';

interface CookieTableProps {
  cookies: CookieType[];
  expandedCookies: Set<string>;
  editMode: boolean;
  editCookie: Partial<CookieType> | null;
  onToggleExpanded: (name: string) => void;
  onUpdateCookie: (name: string, updates: Partial<CookieType>) => void;
  onDeleteCookie: (name: string) => void;
  onSetEditCookie: (cookie: Partial<CookieType> | null) => void;
}

export function CookieTable({
  cookies,
  expandedCookies,
  editMode,
  editCookie,
  onToggleExpanded,
  onUpdateCookie,
  onDeleteCookie,
  onSetEditCookie,
}: CookieTableProps) {
  return (
    <div className='space-y-2'>
      {cookies.map(cookie => (
        <Card key={cookie.name} className='p-4'>
          <div className='flex items-start justify-between'>
            <div className='flex-1 min-w-0'>
              {/* Cookie Name and Security Info */}
              <div className='flex items-center gap-2 mb-2'>
                <span className='font-medium text-sm'>{cookie.name}</span>
                {(() => {
                  const security = getSecurityIcon(cookie);
                  if (security.icon === 'shield') {
                    return (
                      <Shield className={`w-4 h-4 ${security.className}`} />
                    );
                  } else {
                    return <Info className={`w-4 h-4 ${security.className}`} />;
                  }
                })()}
                {isCookieExpired(cookie) && (
                  <Badge variant='destructive' className='text-xs'>
                    Expired
                  </Badge>
                )}
              </div>

              {/* Cookie Value Input */}
              <div className='mb-2'>
                <Input
                  value={
                    editMode ? editCookie?.value || cookie.value : cookie.value
                  }
                  onChange={e =>
                    onSetEditCookie({ ...editCookie, value: e.target.value })
                  }
                  disabled={!editMode}
                  className='font-mono text-sm w-full'
                  readOnly={!editMode}
                  placeholder='Cookie value'
                />
              </div>

              {/* Cookie Details Toggle */}
              <Button
                size='sm'
                variant='ghost'
                onClick={() => onToggleExpanded(cookie.name)}
                className='text-xs'
              >
                {expandedCookies.has(cookie.name)
                  ? 'Hide Details'
                  : 'Show Details'}
              </Button>

              {/* Expanded Details */}
              {expandedCookies.has(cookie.name) && (
                <div className='mt-4 p-3 bg-muted/50 rounded-lg space-y-2'>
                  <div className='grid grid-cols-2 gap-4 text-xs'>
                    <span className='text-muted-foreground'>Domain:</span>
                    <span>{cookie.domain || 'Current'}</span>
                  </div>
                  <div className='grid grid-cols-2 gap-4 text-xs'>
                    <span className='text-muted-foreground'>Path:</span>
                    <span>{cookie.path || '/'}</span>
                  </div>
                  <div className='grid grid-cols-2 gap-4 text-xs'>
                    <span className='text-muted-foreground'>Expires:</span>
                    <span
                      className={isCookieExpired(cookie) ? 'text-red-600' : ''}
                    >
                      {formatExpiry(cookie.expires)}
                    </span>
                  </div>
                  <div className='grid grid-cols-2 gap-4 text-xs'>
                    <span className='text-muted-foreground'>HttpOnly:</span>
                    <span>{cookie.httpOnly ? 'Yes' : 'No'}</span>
                  </div>
                  <div className='grid grid-cols-2 gap-4 text-xs'>
                    <span className='text-muted-foreground'>Secure:</span>
                    <span>{cookie.secure ? 'Yes' : 'No'}</span>
                  </div>
                  <div className='grid grid-cols-2 gap-4 text-xs'>
                    <span className='text-muted-foreground'>SameSite:</span>
                    <span>{cookie.sameSite}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Cookie Actions */}
            <div className='flex items-center gap-1'>
              {editMode ? (
                <>
                  <Button
                    size='sm'
                    onClick={() => {
                      if (editCookie && editCookie.name && editCookie.value) {
                        onUpdateCookie(cookie.name, {
                          value: editCookie.value,
                        });
                        onSetEditCookie(null);
                      }
                    }}
                    className='text-green-600'
                  >
                    Save
                  </Button>
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => onSetEditCookie(null)}
                    className='text-gray-600'
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button size='sm' variant='ghost'>
                    <Clock className='w-4 h-4' />
                  </Button>
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => onDeleteCookie(cookie.name)}
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
