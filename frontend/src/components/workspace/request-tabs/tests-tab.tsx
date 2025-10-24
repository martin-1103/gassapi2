import {
  Plus,
  Play,
  Trash2,
  Copy,
  Save,
  TestTube,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  Code,
} from 'lucide-react';
import * as React from 'react';

import { CodeEditor } from '@/components/common/code-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface TestScript {
  id: string;
  name: string;
  type: 'pre-request' | 'post-response';
  script: string;
  enabled: boolean;
  timeout: number;
}

interface RequestTestsTabProps {
  testScripts: TestScript[];
  onChange: (testScripts: TestScript[]) => void;
}

const TEST_TEMPLATES = {
  'Status Code': `pm.test("Status code is 200", () => {
    pm.expect(pm.response.status).to.equal(200);
});`,
  'Response Time': `pm.test("Response time is less than 500ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(500);
});`,
  'Response Format': `pm.test("Response has data array", () => {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
    pm.expect(jsonData.data).to.be.an('array');
});`,
  'Header Check': `pm.test("Content-Type header is present", () => {
    pm.expect(pm.response.headers).to.have.property('content-type');
});`,
  'JSON Structure': `pm.test("User object has required fields", () => {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('user');
    pm.expect(jsonData.user).to.have.property('id');
    pm.expect(jsonData.user).to.have.property('email');
});`,
  Authentication: `pm.test("Authentication token is valid", () => {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('token');
    pm.expect(jsonData.token).to.be.a('string');
    pm.expect(jsonData.token.length).to.be.greaterThan(10);
});`,
};

export function RequestTestsTab({
  testScripts,
  onChange,
}: RequestTestsTabProps) {
  const [selectedScript, setSelectedScript] = React.useState<TestScript | null>(
    testScripts[0] || null,
  );
  const [testResults, setTestResults] = React.useState<
    Array<{
      id: string;
      name: string;
      status: 'pass' | 'fail' | 'skip';
      message?: string;
      duration: number;
    }>
  >([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const { toast } = useToast();

  const addTestScript = () => {
    const newScript: TestScript = {
      id: `test_${Date.now()}`,
      name: `Test ${testScripts.length + 1}`,
      type: 'post-response',
      script: `pm.test("New test", () => {
    // Add your test code here
    pm.expect(true).to.be.true;
});`,
      enabled: true,
      timeout: 5000,
    };
    onChange([...testScripts, newScript]);
    setSelectedScript(newScript);
  };

  const updateTestScript = (id: string, updates: Partial<TestScript>) => {
    onChange(
      testScripts.map(script =>
        script.id === id ? { ...script, ...updates } : script,
      ),
    );
    if (selectedScript?.id === id) {
      setSelectedScript({ ...selectedScript, ...updates });
    }
  };

  const deleteTestScript = (id: string) => {
    onChange(testScripts.filter(script => script.id !== id));
    if (selectedScript?.id === id) {
      setSelectedScript(testScripts[0] || null);
    }
  };

  const duplicateTestScript = (script: TestScript) => {
    const duplicated: TestScript = {
      ...script,
      id: `test_${Date.now()}`,
      name: `${script.name} (Copy)`,
    };
    onChange([...testScripts, duplicated]);
    setSelectedScript(duplicated);
  };

  const addTestTemplate = (templateName: string, templateCode: string) => {
    const newScript: TestScript = {
      id: `test_${Date.now()}`,
      name: templateName,
      type: 'post-response',
      script: templateCode,
      enabled: true,
      timeout: 5000,
    };
    onChange([...testScripts, newScript]);
    setSelectedScript(newScript);
  };

  const runTests = async () => {
    setIsRunning(true);
    const mockResults = testScripts
      .filter(script => script.enabled)
      .map(script => ({
        id: script.id,
        name: script.name,
        status: Math.random() > 0.2 ? 'pass' : 'fail',
        message:
          Math.random() > 0.2
            ? 'Test passed successfully'
            : 'Test assertion failed',
        duration: Math.floor(Math.random() * 100) + 10,
      }));

    // Simulate test execution delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setTestResults(mockResults);
    setIsRunning(false);

    const passedTests = mockResults.filter(r => r.status === 'pass').length;
    const failedTests = mockResults.filter(r => r.status === 'fail').length;

    toast({
      title: 'Tests completed',
      description: `${passedTests} passed, ${failedTests} failed`,
      variant: failedTests === 0 ? 'default' : 'destructive',
    });
  };

  const getTestIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className='w-4 h-4 text-green-500' />;
      case 'fail':
        return <XCircle className='w-4 h-4 text-red-500' />;
      case 'skip':
        return <AlertCircle className='w-4 h-4 text-yellow-500' />;
      default:
        return <Play className='w-4 h-4 text-gray-500' />;
    }
  };

  const getTestResult = (scriptId: string) => {
    return testResults.find(result => result.id === scriptId);
  };

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center gap-3'>
          <h3 className='font-semibold'>Tests</h3>
          <Badge variant='outline'>
            {testScripts.filter(t => t.enabled).length} active
          </Badge>
          {testResults.length > 0 && (
            <div className='flex items-center gap-2'>
              <CheckCircle className='w-4 h-4 text-green-500' />
              <span className='text-xs text-green-600'>
                {testResults.filter(t => t.status === 'pass').length} passed
              </span>
              <XCircle className='w-4 h-4 text-red-500' />
              <span className='text-xs text-red-600'>
                {testResults.filter(t => t.status === 'fail').length} failed
              </span>
            </div>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={runTests}
            disabled={isRunning}
          >
            <Play className='w-4 h-4 mr-2' />
            {isRunning ? 'Running...' : 'Run Tests'}
          </Button>
          <Button size='sm' onClick={addTestScript}>
            <Plus className='w-4 h-4 mr-2' />
            Add Test
          </Button>
        </div>
      </div>

      <div className='flex-1 flex'>
        {/* Test Scripts List */}
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
                    onClick={() => setSelectedScript(script)}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                          <input
                            type='checkbox'
                            checked={script.enabled}
                            onChange={e => {
                              e.stopPropagation();
                              updateTestScript(script.id, {
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
                          deleteTestScript(script.id);
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

        {/* Test Editor */}
        <div className='flex-1 flex flex-col'>
          {selectedScript ? (
            <>
              {/* Test Script Header */}
              <div className='flex items-center justify-between p-4 border-b'>
                <div className='flex items-center gap-3'>
                  <input
                    type='text'
                    value={selectedScript.name}
                    onChange={e =>
                      updateTestScript(selectedScript.id, {
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
                    onClick={() => duplicateTestScript(selectedScript)}
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
                        onClick={() => addTestTemplate(name, code)}
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
                    updateTestScript(selectedScript.id, { script: value })
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
          ) : (
            <div className='flex-1 flex items-center justify-center text-muted-foreground'>
              <div className='text-center'>
                <TestTube className='w-12 h-12 mx-auto mb-4 opacity-50' />
                <h3 className='text-lg font-semibold mb-2'>No Test Selected</h3>
                <p className='text-sm'>
                  Select a test script to edit or create a new one
                </p>
                <div className='mt-4 space-y-2 text-left bg-muted/50 rounded p-3 max-w-md mx-auto'>
                  <p className='text-xs font-medium mb-1'>Available APIs:</p>
                  <ul className='text-xs space-y-1'>
                    <li>
                      <code className='bg-background px-1 py-0.5 rounded'>
                        pm.test(name, fn)
                      </code>{' '}
                      - Create test
                    </li>
                    <li>
                      <code className='bg-background px-1 py-0.5 rounded'>
                        pm.expect(value).to.equal(expected)
                      </code>{' '}
                      - Assertions
                    </li>
                    <li>
                      <code className='bg-background px-1 py-0.5 rounded'>
                        pm.response
                      </code>{' '}
                      - Response object
                    </li>
                    <li>
                      <code className='bg-background px-1 py-0.5 rounded'>
                        pm.environment
                      </code>{' '}
                      - Environment variables
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
