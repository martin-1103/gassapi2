import type { TestResult } from '@/hooks/useTestConfigurationState';
import type { TestScriptConfig } from '@/lib/testing/types';

export interface TestHeaderProps {
  testScripts: TestScriptConfig[];
  testResults: TestResult[];
  isRunning: boolean;
  onRunTests: () => void;
  onAddTestScript: () => void;
}
