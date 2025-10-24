import { Copy } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { CookieData } from '@/types/api';

interface CookiesTabProps {
  cookies: Record<string, CookieData> | null | undefined;
}

export const CookiesTab = ({ cookies }: CookiesTabProps) => {
  const { toast } = useToast();

  const copyCookies = () => {
    if (!cookies) return;

    const cookiesString = Object.entries(cookies)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');

    navigator.clipboard.writeText(cookiesString);
    toast({
      title: 'Cookies Copied',
      description: 'Response cookies copied to clipboard',
    });
  };

  if (!cookies) {
    return (
      <div className='h-full flex items-center justify-center text-muted-foreground'>
        No cookies to display
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col'>
      <div className='flex justify-end mb-2 p-4 border-b'>
        <Button size='sm' variant='ghost' onClick={copyCookies}>
          <Copy className='w-4 h-4 mr-2' />
          Copy All
        </Button>
      </div>
      <ScrollArea className='flex-1 p-4'>
        <div className='space-y-2'>
          {Object.entries(cookies).map(([key, value]) => (
            <div key={key} className='p-3 border rounded-lg'>
              <div className='font-medium text-sm mb-1'>{key}</div>
              <div className='text-sm break-all'>
                <Badge variant='secondary' className='break-all font-normal'>
                  {typeof value === 'object'
                    ? JSON.stringify(value)
                    : String(value)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
