import { useState } from 'react';

import { useToast } from '@/hooks/use-toast';

export interface TestScript {
  id: string;
  name: string;
  type: 'pre-request' | 'post-response';
  script: string;
  enabled: boolean;
  timeout: number;
  lastResult?: {
    status: 'pass' | 'fail' | 'error';
    message?: string;
    duration: number;
  };
}

export interface TestExecutionState {
  isRunning: boolean;
  results: TestScript['lastResult'][];
}

export function useTestExecution() {
  const [executionState, setExecutionState] = useState<TestExecutionState>({
    isRunning: false,
    results: [],
  });
  const { toast } = useToast();

  const runTests = async (scripts: TestScript[]) => {
    const enabledScripts = scripts.filter(script => script.enabled);
    if (enabledScripts.length === 0) {
      toast({
        title: 'No Tests to Run',
        description: 'Enable at least one test script to run',
        variant: 'destructive',
      });
      return;
    }

    setExecutionState({ isRunning: true, results: [] });

    try {
      // Simulasi eksekusi test - ganti dengan implementasi nyata
      const testResults = await Promise.all(
        enabledScripts.map(async script => {
          const startTime = Date.now();

          try {
            // Basic script execution simulation
            new Function(script.script);
            const duration = Date.now() - startTime;

            return {
              status: 'pass' as const,
              duration,
              message: 'Test completed successfully',
            };
          } catch (error) {
            const duration = Date.now() - startTime;
            return {
              status: 'fail' as const,
              duration,
              message: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        }),
      );

      setExecutionState({ isRunning: false, results: testResults });

      const passedTests = testResults.filter(r => r.status === 'pass').length;
      toast({
        title: 'Tests Completed',
        description: `${passedTests}/${testResults.length} tests passed`,
      });
    } catch {
      setExecutionState({ isRunning: false, results: [] });
      toast({
        title: 'Test Execution Failed',
        description: 'An error occurred while running tests',
        variant: 'destructive',
      });
    }
  };

  const validateScript = (script: string) => {
    try {
      new Function(script);
      toast({
        title: 'Script Valid',
        description: 'Script syntax is valid',
      });
      return true;
    } catch (error) {
      toast({
        title: 'Script Invalid',
        description: `Syntax error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  const formatScript = (script: string) => {
    try {
      // Basic JavaScript formatting
      const formatted = script
        .replace(/\s+/g, ' ')
        .replace(/;\s*\n/g, ';\n')
        .replace(/{\s*\n/g, '{\n    ')
        .replace(/}\s*\n/g, '\n}\n')
        .trim();

      return formatted;
    } catch {
      toast({
        title: 'Format Failed',
        description: 'Could not format the script',
        variant: 'destructive',
      });
      return script;
    }
  };

  return {
    executionState,
    runTests,
    validateScript,
    formatScript,
  };
}
