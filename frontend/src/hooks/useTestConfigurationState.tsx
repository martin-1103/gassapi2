import { CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react';
import React, { useState } from 'react';

import { useToast } from '@/hooks/use-toast';

export interface TestScript {
  id: string;
  name: string;
  type: 'pre-request' | 'post-response';
  script: string;
  enabled: boolean;
  timeout: number;
}

export interface TestResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message?: string;
  duration: number;
}

export function useTestConfigurationState(
  initialScripts: TestScript[],
  onChange: (scripts: TestScript[]) => void,
) {
  const [selectedScript, setSelectedScript] = useState<TestScript | null>(
    initialScripts[0] || null,
  );
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const addTestScript = () => {
    const newScript: TestScript = {
      id: `test_${Date.now()}`,
      name: `Test ${initialScripts.length + 1}`,
      type: 'post-response',
      script: `pm.test("New test", () => {
    // Add your test code here
    pm.expect(true).to.be.true;
});`,
      enabled: true,
      timeout: 5000,
    };
    onChange([...initialScripts, newScript]);
    setSelectedScript(newScript);
  };

  const updateTestScript = (id: string, updates: Partial<TestScript>) => {
    const updatedScripts = initialScripts.map(script =>
      script.id === id ? { ...script, ...updates } : script,
    );
    onChange(updatedScripts);

    if (selectedScript?.id === id) {
      setSelectedScript({ ...selectedScript, ...updates });
    }
  };

  const deleteTestScript = (id: string) => {
    const filteredScripts = initialScripts.filter(script => script.id !== id);
    onChange(filteredScripts);

    if (selectedScript?.id === id) {
      setSelectedScript(filteredScripts[0] || null);
    }
  };

  const duplicateTestScript = (script: TestScript) => {
    const duplicated: TestScript = {
      ...script,
      id: `test_${Date.now()}`,
      name: `${script.name} (Copy)`,
    };
    onChange([...initialScripts, duplicated]);
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
    onChange([...initialScripts, newScript]);
    setSelectedScript(newScript);
  };

  const runTests = async (scripts: TestScript[]) => {
    setIsRunning(true);
    const mockResults = scripts
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

  const getTestResult = (scriptId: string) => {
    return testResults.find(result => result.id === scriptId);
  };

  const getTestIcon = (status: string): React.ReactElement => {
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

  return {
    selectedScript,
    testResults,
    isRunning,
    setSelectedScript,
    addTestScript,
    updateTestScript,
    deleteTestScript,
    duplicateTestScript,
    addTestTemplate,
    runTests,
    getTestResult,
    getTestIcon,
  };
}
