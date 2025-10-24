import { Copy, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConsoleEntry } from '@/types/console';
import { formatTimestamp, getLevelColorClass, getLevelBackgroundClass } from '@/lib/console/console-utils';

interface ConsoleLogViewerProps {
  filteredEntries: ConsoleEntry[];
  onCopyEntry: (entry: ConsoleEntry) => void;
  onTestEntry: (entry: ConsoleEntry) => void;
}

// Console icons mapping
const CONSOLE_ICONS = {
  log: ({ className }: { className?: string }) => (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
    </svg>
  ),
  info: ({ className }: { className?: string }) => (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
    </svg>
  ),
  warn: ({ className }: { className?: string }) => (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
    </svg>
  ),
  error: ({ className }: { className?: string }) => (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
    </svg>
  ),
  debug: ({ className }: { className?: string }) => (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
    </svg>
  ),
};

export default function ConsoleLogViewer({
  filteredEntries,
  onCopyEntry,
  onTestEntry,
}: ConsoleLogViewerProps) {
  if (filteredEntries.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        <div className='w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center'>
          <CONSOLE_ICONS.log className='w-6 h-6 text-muted-foreground' />
        </div>
        <h4 className='text-lg font-semibold mb-2'>No Console Logs</h4>
        <p className='text-sm'>
          No console output was recorded during this request. Use
          console.log() in your test scripts to see output here.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className='h-full'>
      <div className='space-y-2'>
        {filteredEntries.map((entry, index) => (
          <div
            key={`${entry.level}-${entry.timestamp}-${index}`}
            className={`p-3 rounded-lg border ${getLevelBackgroundClass(entry.level)}`}
          >
            <div className='flex items-start gap-3'>
              <div className={`mt-0.5 ${getLevelColorClass(entry.level)}`}>
                {(() => {
                  const IconComponent = CONSOLE_ICONS[entry.level as keyof typeof CONSOLE_ICONS];
                  return <IconComponent className='w-4 h-4' />;
                })()}
              </div>

              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-1'>
                  <span className='text-xs text-muted-foreground'>
                    {formatTimestamp(entry.timestamp)}
                  </span>
                  <Badge variant='outline' className='text-xs'>
                    {entry.level.toUpperCase()}
                  </Badge>
                </div>

                <div className='flex-1'>
                  <p className='text-sm break-words'>{entry.message}</p>

                  {entry.data && (
                    <div className='mt-2 p-2 bg-muted/50 rounded text-xs'>
                      <div className='text-xs text-muted-foreground mb-1'>
                        Data:
                      </div>
                      <pre className='text-xs overflow-x-auto bg-background rounded'>
                        {JSON.stringify(entry.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  {entry.source && (
                    <div className='text-xs text-muted-foreground'>
                      Source: {entry.source}
                    </div>
                  )}

                  {entry.duration && (
                    <div className='text-xs text-muted-foreground'>
                      Duration: {entry.duration}ms
                    </div>
                  )}

                  {entry.stackTrace && (
                    <div className='mt-2'>
                      <details className='text-xs'>
                        <summary className='cursor-pointer hover:text-foreground'>
                          <span className='text-xs font-medium'>
                            Stack Trace:
                          </span>
                        </summary>
                        <pre className='mt-2 p-2 bg-background rounded text-xs overflow-x-auto'>
                          {entry.stackTrace}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className='flex items-center gap-1'>
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => onCopyEntry(entry)}
                    className='text-xs'
                  >
                    <Copy className='w-3 h-3 mr-1' />
                    Copy
                  </Button>
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => onTestEntry(entry)}
                    className='text-xs'
                  >
                    <Play className='w-3 h-3 mr-1' />
                    Test
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}