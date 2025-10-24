import { Trash2, CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TestScript, TestResult } from '@/hooks/useTestConfigurationState';

interface TestScriptListProps {
  testScripts: TestScript[];
  selectedScript: TestScript | null;
  onSelectScript: (script: TestScript) => void;
  onUpdateScript: (id: string, updates: Partial<TestScript>) => void;
  onDeleteScript: (id: string) => void;
  getTestResult: (scriptId: string) => TestResult | undefined;
  getTestIcon: (status: string) => string;
}

export function TestScriptList({
  testScripts,
  selectedScript,
  onSelectScript,
  onUpdateScript,
  onDeleteScript,
  getTestResult,
  getTestIcon,
}: TestScriptListProps) {
  return (
    <div className='w-80 border-r'>
      <div className='p-3 border-b'>
        <h4 className='font-medium text-sm'>Test Scripts</h4>
      </div>

      <ScrollArea className='h-full'>
        <div className='p-2 space-y-1'>
          {testScripts.map(script => {
            const result = getTestResult(script.id);
            return (
              <div
                key={script.id}
                className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                  selectedScript?.id === script.id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => onSelectScript(script)}
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

                    {result && (
                      <div className='flex items-center gap-1 mt-1'>
                        {getTestIcon(result.status)}
                        <span className='text-xs text-muted-foreground'>
                          {result.duration}ms
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={e => {
                      e.stopPropagation();
                      onDeleteScript(script.id);
                    }}
                    className='h-6 w-6 p-0'
                  >
                    <Trash2 className='w-3 h-3' />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}