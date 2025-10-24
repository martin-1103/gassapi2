import { Play, Plus, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

import { TestScript } from './hooks/use-test-execution';

interface TestRunnerProps {
  scripts: TestScript[];
  activeTab: 'pre-request' | 'post-response';
  selectedScript: TestScript | null;
  onScriptSelect: (script: TestScript) => void;
  onUpdateScript: (id: string, updates: Partial<TestScript>) => void;
  onDeleteScript: (id: string) => void;
  onDuplicateScript: (script: TestScript) => void;
  onAddScript: () => void;
  onRunTests: () => void;
}

export function TestRunner({
  scripts,
  activeTab,
  selectedScript,
  onScriptSelect,
  onUpdateScript,
  onDeleteScript,
  onDuplicateScript,
  onAddScript,
  onRunTests,
}: TestRunnerProps) {
  const filteredScripts = scripts.filter(script => script.type === activeTab);

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center gap-3'>
          <h3 className='font-semibold'>Tests</h3>
          <Badge variant='outline'>
            {filteredScripts.filter(s => s.enabled).length} active
          </Badge>
        </div>

        <div className='flex items-center gap-2'>
          <Button size='sm' onClick={onRunTests}>
            <Play className='w-4 h-4 mr-2' />
            Run Tests
          </Button>
          <Button size='sm' onClick={onAddScript}>
            <Plus className='w-4 h-4 mr-2' />
            Add Test
          </Button>
        </div>
      </div>

      {/* Scripts List */}
      <div className='w-80'>
        <div className='p-3 border-b'>
          <h4 className='font-medium text-sm'>Test Scripts</h4>
        </div>

        <ScrollArea className='h-full'>
          <div className='p-2 space-y-1'>
            {filteredScripts.map(script => (
              <button
                key={script.id}
                type='button'
                className={`w-full p-3 rounded-lg border transition-colors text-left ${
                  selectedScript?.id === script.id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted'
                }`}
                aria-pressed={selectedScript?.id === script.id}
                onClick={() => onScriptSelect(script)}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <input
                        type='checkbox'
                        checked={script.enabled}
                        onChange={e => {
                          e.stopPropagation();
                          onUpdateScript(script.id, {
                            enabled: e.target.checked,
                          });
                        }}
                        className='rounded'
                      />
                      <span className='font-medium text-sm truncate'>
                        {script.name}
                      </span>
                    </div>

                    {script.lastResult && (
                      <div className='flex items-center gap-1 mt-1'>
                        <Badge
                          variant={
                            script.lastResult.status === 'pass'
                              ? 'default'
                              : 'destructive'
                          }
                          className='text-xs'
                        >
                          {script.lastResult.status}
                        </Badge>
                        <span className='text-xs text-muted-foreground'>
                          {script.lastResult.duration}ms
                        </span>
                      </div>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={e => e.stopPropagation()}
                      >
                        <Trash2 className='w-3 h-3' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => onDuplicateScript(script)}
                      >
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDeleteScript(script.id)}
                        className='text-destructive'
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
