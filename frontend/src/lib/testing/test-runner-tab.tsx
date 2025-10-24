import {
  CheckCircle,
  XCircle,
  SkipForward,
  AlertCircle,
  Play,
  Save,
  Copy,
  MoreHorizontal,
  Terminal,
} from 'lucide-react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

import type { TestScript } from './types';

interface TestRunnerTabProps {
  scripts: TestScript[];
  onRunTests: () => void;
}

export default function TestRunnerTab({
  scripts,
  onRunTests,
}: TestRunnerTabProps) {
  const [selectedScript, setSelectedScript] = useState<TestScript | null>(
    scripts[0] || null,
  );
  const { toast } = useToast();

  const handleRunAllTests = useCallback(async () => {
    const enabledScripts = scripts.filter(script => script.enabled);

    if (enabledScripts.length === 0) {
      toast({
        title: 'No Tests to Run',
        description: 'Enable at least one test script',
        variant: 'destructive',
      });
      return;
    }

    onRunTests();
  }, [scripts, onRunTests, toast]);

  const handleScriptSelect = useCallback((script: TestScript) => {
    setSelectedScript(script);
  }, []);

  const getEnabledTestCount = useMemo(() => {
    return scripts.filter(script => script.enabled).length;
  }, [scripts]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pass':
        return <CheckCircle className='w-4 h-4 text-green-600' />;
      case 'fail':
        return <XCircle className='w-4 h-4 text-red-600' />;
      case 'skip':
        return <SkipForward className='w-4 h-4 text-yellow-600' />;
      default:
        return <AlertCircle className='w-4 h-4 text-gray-600' />;
    }
  };

  // Placeholder functions for missing handlers
  const handleScriptDuplicate = useCallback((script: TestScript) => {
    // TODO: Implement script duplication
    logger.debug('Duplicate script', { name: script.name }, 'test-runner-tab');
  }, []);

  const handleScriptToggle = useCallback((enabled: boolean) => {
    // TODO: Implement script toggle
    logger.debug('Toggle script enabled', { enabled }, 'test-runner-tab');
  }, []);

  const deleteScript = useCallback((scriptId: string) => {
    // TODO: Implement script deletion
    logger.debug('Delete script', { scriptId }, 'test-runner-tab');
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      setSelectedScript(null);
    };
  }, []);

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center gap-3'>
          <h3 className='font-semibold'>Test Runner</h3>
          <Badge variant='outline'>{getEnabledTestCount()} enabled</Badge>
        </div>

        <div className='flex items-center gap-2'>
          <Button size='sm' onClick={handleRunAllTests}>
            <Play className='w-4 h-4 mr-2' />
            Run All Tests
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={() => selectedScript && handleScriptSelect(selectedScript)}
          >
            <Play className='w-4 h-4 mr-2' />
            Run Selected
          </Button>
        </div>
      </div>

      {/* Selected Script Editor */}
      {selectedScript && (
        <div className='flex-1 p-4 border-b'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex-1 min-w-0'>
              <input
                type='text'
                value={selectedScript.name}
                onChange={e => {
                  const updatedScript = {
                    ...selectedScript,
                    name: e.target.value,
                  };
                  setSelectedScript(updatedScript);
                }}
                className='font-semibold bg-transparent border-none outline-none w-full px-3 py-2'
              />
            </div>
            <div className='ml-4'>
              <div className='text-sm text-muted-foreground'>
                Type: {selectedScript.type}
              </div>
              <div className='text-sm text-muted-foreground'>
                Timeout: {selectedScript.timeout}ms
              </div>
            </div>
          </div>

          {/* Script Actions */}
          <div className='flex items-center gap-2 mt-2'>
            <Button size='sm' variant='outline'>
              <Save className='w-4 h-4 mr-2' />
              Save
            </Button>
            <Button size='sm' variant='outline'>
              <Copy className='w-4 h-4 mr-2' />
              Copy
            </Button>
          </div>

          {/* Results Preview */}
          {selectedScript.lastResult && (
            <div className='mt-4 p-4 border rounded-lg bg-muted/50'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-sm text-muted-foreground'>Last Run:</span>
                {getStatusIcon(selectedScript.lastResult.status)}
                <span className='text-sm text-muted-foreground'>
                  {selectedScript.lastResult.duration}ms
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scripts Table */}
      {scripts.length > 0 ? (
        <div className='flex-1'>
          <Table className='w-full'>
            <TableHeader>
              <TableRow>
                <TableHead className='w-12'></TableHead>
                <TableHead className='w-1/3 font-medium'>Name</TableHead>
                <TableHead className='w-1/6 font-medium'>Type</TableHead>
                <TableHead className='w-1/6 font-medium'>Status</TableHead>
                <TableHead className='w-1/4 font-medium'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scripts.map(script => (
                <TableRow key={script.id}>
                  <TableCell>
                    <input
                      type='checkbox'
                      checked={script.enabled}
                      onChange={e => {
                        const updatedScript = {
                          ...script,
                          enabled: e.target.checked,
                        };
                        handleScriptSelect(updatedScript);
                      }}
                      className='rounded'
                    />
                  </TableCell>
                  <TableCell>
                    <div className='flex-1 min-w-0'>
                      <div className='font-medium text-sm'>{script.name}</div>
                      <div className='text-xs text-muted-foreground'>
                        {script.type}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => handleScriptSelect(script)}
                        className='text-blue-600 hover:text-blue-700'
                      >
                        Edit
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size='sm' variant='ghost'>
                            <MoreHorizontal className='w-4 h-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleScriptDuplicate(script)}
                          >
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleScriptToggle(script.enabled)}
                          >
                            {script.enabled ? 'Disable' : 'Enable'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => deleteScript(script.id)}
                            className='text-red-600'
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>

                  <TableCell>
                    {script.lastResult && (
                      <div className='flex items-center gap-2'>
                        {getStatusIcon(script.lastResult.status)}
                        <span className='text-xs text-muted-foreground'>
                          {script.lastResult.duration}ms
                        </span>
                      </div>
                    )}
                  </TableCell>

                  <TableCell className='text-sm'>
                    {formatDate(script.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className='flex-1 flex items-center justify-center text-center py-8'>
          <div className='w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center'>
            <Terminal className='w-6 h-6 text-muted-foreground' />
          </div>
          <h4 className='text-lg font-semibold mb-4'>
            No Test Scripts Available
          </h4>
          <p className='text-sm text-muted-foreground mb-4'>
            Create test scripts in the Tests tab to get started
          </p>
        </div>
      )}

      {/* Status Bar */}
      {scripts.length > 0 && (
        <div className='p-4 border-t bg-muted/50'>
          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <span>
              {getEnabledTestCount()} of {scripts.length} enabled
            </span>
            <div className='flex items-center gap-4'>
              <span>Ready: {scripts.length} total</span>
            </div>
            <Button size='sm' onClick={handleRunAllTests}>
              <Play className='w-4 h-4 mr-2' />
              Run All Tests
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
