import { Code, Zap, Copy } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

import { TestScript } from './hooks/use-test-execution';

interface TestEditorProps {
  selectedScript: TestScript | null;
  onUpdateScript: (id: string, updates: Partial<TestScript>) => void;
  onDuplicateScript: (script: TestScript) => void;
  onValidateScript: (script: string) => boolean;
  onFormatScript: (script: string) => string;
  templates: Record<string, string>;
  onAddTemplate: (name: string, template: string) => void;
}

export function TestEditor({
  selectedScript,
  onUpdateScript,
  onDuplicateScript,
  onValidateScript,
  onFormatScript,
  templates,
  onAddTemplate,
}: TestEditorProps) {
  const handleFormatScript = () => {
    if (!selectedScript) return;
    const formatted = onFormatScript(selectedScript.script);
    onUpdateScript(selectedScript.id, { script: formatted });
  };

  const handleValidateScript = () => {
    if (!selectedScript) return;
    onValidateScript(selectedScript.script);
  };

  return (
    <div className='flex-1 flex flex-col'>
      {selectedScript ? (
        <>
          {/* Script Header */}
          <div className='flex items-center justify-between p-4 border-b'>
            <div className='flex items-center gap-3'>
              <input
                type='text'
                value={selectedScript.name}
                onChange={e =>
                  onUpdateScript(selectedScript.id, { name: e.target.value })
                }
                className='font-medium bg-transparent border-none outline-none'
              />
              <Badge variant='outline' className='text-xs'>
                {selectedScript.type}
              </Badge>
            </div>

            <div className='flex items-center gap-2'>
              <Button size='sm' variant='ghost' onClick={handleFormatScript}>
                <Code className='w-4 h-4' />
              </Button>
              <Button size='sm' variant='ghost' onClick={handleValidateScript}>
                <Zap className='w-4 h-4' />
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => onDuplicateScript(selectedScript)}
              >
                <Copy className='w-4 h-4' />
              </Button>
            </div>
          </div>

          {/* Templates */}
          <Card className='mx-4 my-4'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm'>Test Templates</CardTitle>
            </CardHeader>
            <CardContent className='pt-0'>
              <ScrollArea className='h-32'>
                <div className='grid grid-cols-2 gap-2'>
                  {Object.entries(templates).map(([name, template]) => (
                    <Button
                      key={name}
                      size='sm'
                      variant='outline'
                      onClick={() => onAddTemplate(name, template)}
                      className='text-xs justify-start h-auto py-2'
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Code Editor */}
          <div className='flex-1 p-4'>
            <Textarea
              value={selectedScript.script}
              onChange={e =>
                onUpdateScript(selectedScript.id, { script: e.target.value })
              }
              className='h-full font-mono text-sm resize-none'
              placeholder='// Write your test script here...'
              spellCheck={false}
            />
          </div>

          {/* Script Footer */}
          <div className='p-4 border-t bg-muted/50'>
            <div className='flex items-center justify-between text-sm text-muted-foreground'>
              <div>Timeout: {selectedScript.timeout}ms</div>
              <div>Language: JavaScript (Postman/Sandbox API)</div>
            </div>
          </div>
        </>
      ) : (
        <div className='flex-1 flex items-center justify-center text-muted-foreground'>
          <div className='text-center'>
            <p className='text-lg font-semibold mb-2'>No Test Selected</p>
            <p className='text-sm'>
              Select a test script to edit or create a new one
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
