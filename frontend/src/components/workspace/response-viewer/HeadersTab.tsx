import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface HeadersTabProps {
  headers: Record<string, string> | null | undefined;
}

export const HeadersTab = ({ headers }: HeadersTabProps) => {
  const { toast } = useToast();

  const copyHeaders = () => {
    if (!headers) return;
    
    const headersString = Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
      
    navigator.clipboard.writeText(headersString);
    toast({
      title: 'Headers Copied',
      description: 'Response headers copied to clipboard',
    });
  };

  if (!headers) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No headers to display
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end mb-2">
        <Button size="sm" variant="ghost" onClick={copyHeaders}>
          <Copy className="w-4 h-4 mr-2" />
          Copy All
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {Object.entries(headers).map(([key, value]) => (
            <div key={key} className="flex border-b pb-2">
              <div className="w-1/3 font-medium text-sm break-all pr-4">
                {key}
              </div>
              <div className="w-2/3 text-sm break-all">
                <Badge variant="secondary" className="break-all font-normal">
                  {value}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};