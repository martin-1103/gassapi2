import { Copy } from 'lucide-react';
import { CodeEditor } from '@/components/common/code-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Code } from 'lucide-react';
import { TestScript } from '@/hooks/useTestConfigurationState';
import { TEST_TEMPLATES } from '@/lib/testing/test-templates';

interface TestScriptEditorProps {
  selectedScript: TestScript;
  onUpdateScript: (id: string, updates: Partial<TestScript>) => void;
  onDuplicateScript: (script: TestScript) => void;
  onAddTemplate: (name: string, code: string) => void;
}

export function TestScriptEditor({
  selectedScript,
  onUpdateScript,
  onDuplicateScript,
  onAddTemplate,
}: TestScriptEditorProps) {
  return (
    <>
      {/* Test Script Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center gap-3'>
          <input
            type='text'
            value={selectedScript.name}
            onChange={e =>
              onUpdateScript(selectedScript.id, {
                name: e.target.value,
              })
            }
            className='font-medium bg-transparent border-none outline-none'
          />
          <Badge variant='outline' className='text-xs'>
            {selectedScript.type}
          </Badge>
          <Badge variant='outline' className='text-xs'>
            {selectedScript.timeout}ms timeout
          </Badge>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => onDuplicateScript(selectedScript)}
          >
            <Copy className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {/* Test Templates */}
      <Card className='mx-4 mt-4'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm flex items-center gap-2'>
            <BookOpen className='w-4 h-4' />
            Test Templates
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='grid grid-cols-2 gap-2'>
            {Object.entries(TEST_TEMPLATES).map(([name, code]) => (
              <Button
                key={name}
                size='sm'
                variant='outline'
                onClick={() => onAddTemplate(name, code)}
                className='text-xs justify-start h-7'
                title={name}
              >
                {name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Code Editor */}
      <div className='flex-1 p-4'>
        <CodeEditor
          value={selectedScript.script}
          onChange={value =>
            onUpdateScript(selectedScript.id, { script: value })
          }
          language='javascript'
          placeholder='// Write your test script here...'
          rows={20}
          showValidation={false}
        />
      </div>

      {/* Test Script Footer */}
      <div className='p-4 border-t bg-muted/50'>
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <div>Timeout: {selectedScript.timeout}ms</div>
          <div className='flex items-center gap-2'>
            <Code className='w-4 h-4' />
            <span>JavaScript ES2020</span>
          </div>
        </div>
      </div>
    </>
  );
}