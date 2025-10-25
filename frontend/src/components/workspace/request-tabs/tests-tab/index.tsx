import { Settings, TestTube } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

import { useTestExecution, TestScript } from './hooks/use-test-execution';
import { TestEditor } from './TestEditor';
import { TestResults } from './TestResults';
import { TestRunner } from './TestRunner';

interface TestsTabProps {
  scripts: TestScript[];
  onChange: (scripts: TestScript[]) => void;
  onRunTests: () => void;
}

// Test templates
const TEST_TEMPLATES = {
  'Status Check': `pm.test("Status code is 200", () => {
    pm.expect(pm.response.status).to.equal(200);
});`,

  'Response Time': `pm.test("Response time is less than 500ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(500);
  });`,

  'JSON Structure': `pm.test("Response has data property", () => {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
    pm.expect(jsonData.data).to.be.an('array');
  });`,

  'Value Validation': `pm.test("Users array is not empty", () => {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.length).to.be.above(0);
  });`,

  'Header Validation': `pm.test("Content-Type is application/json", () => {
    pm.expect(pm.response.headers['content-type']).to.include('application/json');
  });`,

  'Authentication Check': `pm.test("Response contains authentication token", () => {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('token');
  });`,

  'Error Handling': `pm.test("Error response has proper format", () => {
    if (pm.response.status >= 400) {
        const jsonData = pm.response.json();
        pm.expect(jsonData).to.have.property('error');
        pm.expect(jsonData).to.have.property('message');
    }
  });`,

  'Pagination Check': `pm.test("Pagination parameters are valid", () => {
    const jsonData = pm.response.json();
    if (jsonData.pagination) {
        pm.expect(jsonData.pagination).to.have.property('page');
        pm.expect(jsonData.pagination).to.have.property('limit');
    }
  });`,
};

// Pre-request templates
const PRE_REQUEST_TEMPLATES = {
  'Set Headers': `pm.request.headers.add('Authorization', 'Bearer ' + pm.environment.get('token'));
pm.request.headers.add('X-Custom-Header', 'Custom-Value');`,

  'Generate UUID': `const uuid = require('uuid');
pm.environment.set('requestId', uuid.v4());`,

  Timestamp: `pm.environment.set('timestamp', new Date().toISOString());
pm.environment.set('unixTimestamp', Date.now());`,

  'Random Data': `const randomEmail = Math.random().toString(36).substring(2) + '@test.com';
pm.environment.set('randomEmail', randomEmail);

const randomNumber = Math.floor(Math.random() * 1000);
pm.environment.set('randomNumber', randomNumber);`,
};

export default function TestsTab({
  scripts,
  onChange,
  onRunTests,
}: TestsTabProps) {
  const [selectedScript, setSelectedScript] = useState<TestScript | null>(
    scripts[0] || null,
  );
  const [activeTab, setActiveTab] = useState<'pre-request' | 'post-response'>(
    'post-response',
  );
  const { toast } = useToast();
  const { executionState, runTests, validateScript, formatScript } =
    useTestExecution();

  const filteredScripts = scripts.filter(script => script.type === activeTab);

  const addScript = () => {
    const newScript: TestScript = {
      id: Date.now().toString(),
      name: `New ${activeTab === 'pre-request' ? 'Pre-request' : 'Post-response'} Test`,
      type: activeTab,
      script: `pm.test("New test", () => {
    // Tambahkan kode test di sini
    pm.expect(true).to.be.true;
  });`,
      enabled: true,
      timeout: 5000,
    };
    onChange([...scripts, newScript]);
    setSelectedScript(newScript);
  };

  const updateScript = (id: string, updates: Partial<TestScript>) => {
    onChange(
      scripts.map(script =>
        script.id === id ? { ...script, ...updates } : script,
      ),
    );
    if (selectedScript?.id === id) {
      setSelectedScript({ ...selectedScript, ...updates });
    }
  };

  const deleteScript = (id: string) => {
    onChange(scripts.filter(script => script.id !== id));
    if (selectedScript?.id === id) {
      setSelectedScript(filteredScripts[0] || null);
    }
  };

  const duplicateScript = (script: TestScript) => {
    const duplicated: TestScript = {
      ...script,
      id: Date.now().toString(),
      name: `${script.name} (Copy)`,
    };
    onChange([...scripts, duplicated]);
    setSelectedScript(duplicated);
  };

  const addTemplate = (templateName: string, template: string) => {
    const newScript: TestScript = {
      id: Date.now().toString(),
      name: templateName,
      type: activeTab,
      script: template,
      enabled: true,
      timeout: 5000,
    };
    onChange([...scripts, newScript]);
    setSelectedScript(newScript);
  };

  const exportScripts = () => {
    const exportData = {
      scripts: filteredScripts,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-scripts-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Scripts Exported',
      description: 'Test scripts saved to file',
    });
  };

  const importScripts = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importData = JSON.parse(text);

        if (importData.scripts && Array.isArray(importData.scripts)) {
          const newScripts = importData.scripts.map((script: TestScript) => ({
            ...script,
            id: Date.now().toString() + Math.random(),
          }));

          onChange([...scripts, ...newScripts]);
          toast({
            title: 'Scripts Imported',
            description: `Imported ${newScripts.length} test scripts`,
          });
        }
      } catch {
        toast({
          title: 'Import Failed',
          description: 'Invalid JSON file format',
          variant: 'destructive',
        });
      }
    };

    input.click();
  };

  const handleRunTests = () => {
    runTests(filteredScripts);
    onRunTests();
  };

  const templates =
    activeTab === 'pre-request' ? PRE_REQUEST_TEMPLATES : TEST_TEMPLATES;

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
          <Button size='sm' variant='outline' onClick={importScripts}>
            Import
          </Button>
          <Button size='sm' variant='outline' onClick={exportScripts}>
            Export
          </Button>
          <Button size='sm' onClick={handleRunTests}>
            Run Tests
          </Button>
          <Button size='sm' onClick={addScript}>
            Add Test
          </Button>
        </div>
      </div>

      {/* Script Type Tabs */}
      <div className='px-4 pt-4'>
        <Tabs
          value={activeTab}
          onValueChange={(value: string) =>
            setActiveTab(value as 'pre-request' | 'post-response')
          }
        >
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger
              value='pre-request'
              className='flex items-center gap-2'
            >
              <Settings className='w-4 h-4' />
              Pre-request
            </TabsTrigger>
            <TabsTrigger
              value='post-response'
              className='flex items-center gap-2'
            >
              <TestTube className='w-4 h-4' />
              Post-response
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Test Results */}
      <TestResults executionState={executionState} />

      {/* Main Content */}
      <div className='flex-1 flex'>
        <TestRunner
          scripts={scripts}
          activeTab={activeTab}
          selectedScript={selectedScript}
          onScriptSelect={setSelectedScript}
          onUpdateScript={updateScript}
          onDeleteScript={deleteScript}
          onDuplicateScript={duplicateScript}
          onAddScript={addScript}
          onRunTests={handleRunTests}
        />

        <TestEditor
          selectedScript={selectedScript}
          onUpdateScript={updateScript}
          onDuplicateScript={duplicateScript}
          onValidateScript={validateScript}
          onFormatScript={formatScript}
          templates={templates}
          onAddTemplate={addTemplate}
        />
      </div>
    </div>
  );
}
