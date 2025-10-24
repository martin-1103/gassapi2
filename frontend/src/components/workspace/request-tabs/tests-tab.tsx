// import * as React from 'react'; // Removed unused React import

import {
  useTestConfigurationState,
  TestScript,
} from '@/hooks/useTestConfigurationState';

import { TestEmptyState } from './test-empty-state';
import { TestHeader } from './test-header';
import { TestScriptEditor } from './test-script-editor';
import { TestScriptList } from './test-script-list';

interface RequestTestsTabProps {
  testScripts: TestScript[];
  onChange: (testScripts: TestScript[]) => void;
}

export function RequestTestsTab({
  testScripts,
  onChange,
}: RequestTestsTabProps) {
  const {
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
  } = useTestConfigurationState(testScripts, onChange);

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <TestHeader
        testScripts={testScripts}
        testResults={testResults}
        isRunning={isRunning}
        onRunTests={() => runTests(testScripts)}
        onAddTestScript={addTestScript}
      />

      <div className='flex-1 flex'>
        {/* Test Scripts List */}
        <TestScriptList
          testScripts={testScripts}
          selectedScript={selectedScript}
          onSelectScript={setSelectedScript}
          onUpdateScript={updateTestScript}
          onDeleteScript={deleteTestScript}
          getTestResult={getTestResult}
          getTestIcon={getTestIcon}
        />

        {/* Test Editor */}
        <div className='flex-1 flex flex-col'>
          {selectedScript ? (
            <TestScriptEditor
              selectedScript={selectedScript}
              onUpdateScript={updateTestScript}
              onDuplicateScript={duplicateTestScript}
              onAddTemplate={addTestTemplate}
            />
          ) : (
            <TestEmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
