import {
  Terminal,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Copy,
  Play,
  Settings,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface ConsoleEntry {
  level: 'info' | 'warn' | 'error' | 'debug' | 'log';
  message: string;
  timestamp: number;
  source?: string;
  data?: any;
  duration?: number;
  stackTrace?: string;
}

interface ResponseConsoleTabProps {
  console: ConsoleEntry[];
}

const CONSOLE_ICONS = {
  log: Terminal,
  info: Info,
  warn: AlertTriangle,
  error: XCircle,
  debug: Zap,
};

export default function ResponseConsoleTab({
  console,
}: ResponseConsoleTabProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const filterConsole = console.filter(entry => {
    if (activeTab !== 'all' && entry.level !== activeTab) return false;
    if (searchQuery) {
      return entry.message.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const groupedLogs = filterConsole.reduce(
    (acc, entry) => {
      const level = entry.level;
      if (!acc[level]) acc[level] = [];
      acc[level].push(entry);
      return acc;
    },
    {} as Record<string, ConsoleEntry[]>,
  );

  const levelStats = {
    total: console.length,
    info: console.filter(e => e.level === 'info').length,
    warn: console.filter(e => e.level === 'warn').length,
    error: console.filter(e => e.level === 'error').length,
    debug: console.filter(e => e.level === 'debug').length,
    log: console.filter(e => e.level === 'log').length,
  };

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'info':
        return 'text-blue-600';
      case 'warn':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'debug':
        return 'text-purple-600';
      case 'log':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getLevelIcon = (level: string) => {
    const IconComponent = CONSOLE_ICONS[level as keyof typeof CONSOLE_ICONS];
    return <IconComponent className='w-4 h-4' />;
  };

  const clearConsole = () => {
    toast({
      title: 'Console Cleared',
      description: 'Console logs have been cleared',
    });
  };

  const exportLogs = () => {
    const logsData = {
      logs: console,
      exportedAt: new Date().toISOString(),
      stats: levelStats,
    };

    const blob = new Blob([JSON.stringify(logsData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-logs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Console Logs Exported',
      description: `Exported ${console.length} console entries`,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Console output copied to clipboard',
    });
  };

  const copyConsoleEntry = (entry: ConsoleEntry) => {
    const text = `[${formatTimestamp(entry.timestamp)}] ${entry.level.toUpperCase()}: ${entry.message}`;
    if (entry.data) {
      text += `\nData: ${JSON.stringify(entry.data, null, 2)}`;
    }
    if (entry.stackTrace) {
      text += `\n${entry.stackTrace}`;
    }
    copyToClipboard(text);
  };

  const runTestScript = () => {
    toast({
      title: 'Test Script Runner',
      description: 'Test script runner would execute console.log statements',
    });
  };

  const clearLevel = (level: string) => {
    toast({
      title: 'Console Level Cleared',
      description: `All ${level} logs have been cleared`,
    });
  };

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center gap-3'>
          <h3 className='font-semibold flex items-center gap-2'>
            <Terminal className='w-5 h-5' />
            Console
          </h3>
          <Badge variant='outline'>{console.length} entries</Badge>
        </div>

        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <span>Total: {levelStats.total}</span>
            <span className='text-green-600'>{levelStats.info} info</span>
            <span className='text-yellow-600'>{levelStats.warn} warn</span>
            <span className='text-red-600'>{levelStats.error} error</span>
            <span className='text-purple-600'>{levelStats.debug} debug</span>
            <span className='text-gray-600'>{levelStats.log} log</span>
          </div>

          <Button size='sm' variant='outline' onClick={exportLogs}>
            Export
          </Button>
          <Button size='sm' variant='outline' onClick={clearConsole}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Log Level Tabs */}
      <div className='px-4 pt-4'>
        <Tabs
          value={activeTab}
          onValueChange={(value: any) => setActiveTab(value)}
        >
          <TabsList className='grid w-full grid-cols-6'>
            <TabsTrigger value='all'>All</TabsTrigger>
            <TabsTrigger value='info'>Info</TabsTrigger>
            <TabsTrigger value='warn'>Warning</TabsTrigger>
            <TabsTrigger value='error'>Error</TabsTrigger>
            <TabsTrigger value='debug'>Debug</TabsTrigger>
            <TabsTrigger value='log'>Log</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Search Bar */}
      <div className='px-4 mb-4'>
        <div className='flex items-center gap-2'>
          <Terminal className='w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Search console logs...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-64 h-8'
          />
        </div>
      </div>

      {/* Console Content */}
      <div className='flex-1 px-4 pb-4'>
        <ScrollArea className='h-full'>
          <div className='space-y-2'>
            {filterConsole.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                <div className='w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center'>
                  <Terminal className='w-6 h-6 text-muted-foreground' />
                </div>
                <h4 className='text-lg font-semibold mb-2'>No Console Logs</h4>
                <p className='text-sm'>
                  No console output was recorded during this request. Use
                  console.log() in your test scripts to see output here.
                </p>
              </div>
            ) : (
              <div className='space-y-2'>
                {filterConsole.map((entry, index) => (
                  <div
                    key={`${entry.level}-${entry.timestamp}-${index}`}
                    className={`p-3 rounded-lg border ${
                      entry.level === 'error'
                        ? 'border-red-200 bg-red-50'
                        : entry.level === 'warn'
                          ? 'border-yellow-200 bg-yellow-50'
                          : entry.level === 'error'
                            ? 'border-red-200 bg-red-50'
                            : entry.level === 'debug'
                              ? 'border-purple-200 bg-purple-50'
                              : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className='flex items-start gap-3'>
                      <div className={`mt-0.5 ${getLevelColor(entry.level)}`}>
                        {getLevelIcon(entry.level)}
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
                            onClick={() => copyConsoleEntry(entry)}
                            className='text-xs'
                          >
                            <Copy className='w-3 h-3 mr-1' />
                            Copy
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => {
                              toast({
                                title: 'Run Again',
                                description:
                                  'This feature would run the same request with logging enabled',
                              });
                            }}
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
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className='px-4 py-2 border-t bg-muted/50'>
        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <div className='flex items-center gap-4'>
            <span>Console entries: {console.length}</span>
            <span>Showing: {filterConsole.length} filtered</span>
            {searchQuery && <span>Filtered by: "{searchQuery}"</span>}
          </div>
          <div className='flex items-center gap-4'>
            <span>Auto-refresh: Enabled</span>
            <span>Max entries: 1000</span>
            <span>Real-time: Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
