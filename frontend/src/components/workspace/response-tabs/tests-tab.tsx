import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  PlayCircle,
  BarChart3,
  List,
  Eye,
  RefreshCw,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TestResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'skip' | 'error';
  message?: string;
  duration: number;
  error?: any;
  assertionResults?: AssertionResult[];
}

interface AssertionResult {
  assertion: string;
  status: 'pass' | 'fail';
  message: string;
  actual?: any;
  expected?: any;
}

interface ConsoleEntry {
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: number;
  data?: any;
}

interface ResponseTestsTabProps {
  testResults: TestResult[];
  console?: ConsoleEntry[];
  onRunTests?: () => void;
  isRunning?: boolean;
}

export function ResponseTestsTab({
  testResults,
  console = [],
  onRunTests,
  isRunning = false,
}: ResponseTestsTabProps) {
  const passedTests = testResults.filter(t => t.status === 'pass').length;
  const failedTests = testResults.filter(t => t.status === 'fail').length;
  const skippedTests = testResults.filter(t => t.status === 'skip').length;
  const errorTests = testResults.filter(t => t.status === 'error').length;
  const totalTests = testResults.length;

  const averageDuration =
    testResults.length > 0
      ? testResults.reduce((sum, test) => sum + test.duration, 0) /
        testResults.length
      : 0;

  const getTestIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className='w-4 h-4 text-green-500' />;
      case 'fail':
        return <XCircle className='w-4 h-4 text-red-500' />;
      case 'skip':
        return <AlertCircle className='w-4 h-4 text-yellow-500' />;
      case 'error':
        return <AlertCircle className='w-4 h-4 text-orange-500' />;
      default:
        return <PlayCircle className='w-4 h-4 text-gray-500' />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'fail':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'skip':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConsoleIcon = (level: ConsoleEntry['level']) => {
    switch (level) {
      case 'log':
        return <List className='w-4 h-4 text-blue-500' />;
      case 'info':
        return <Eye className='w-4 h-4 text-blue-500' />;
      case 'warn':
        return <AlertCircle className='w-4 h-4 text-yellow-500' />;
      case 'error':
        return <XCircle className='w-4 h-4 text-red-500' />;
      case 'debug':
        return <List className='w-4 h-4 text-gray-500' />;
      default:
        return <List className='w-4 h-4' />;
    }
  };

  const getConsoleColor = (level: ConsoleEntry['level']) => {
    switch (level) {
      case 'log':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'warn':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'debug':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatConsoleMessage = (entry: ConsoleEntry) => {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const message =
      typeof entry.message === 'string'
        ? entry.message
        : JSON.stringify(entry.message);

    return `[${timestamp}] ${message}`;
  };

  const getPerformanceData = () => {
    if (testResults.length === 0) return null;

    const durations = testResults.map(t => t.duration);
    const fastest = Math.min(...durations);
    const slowest = Math.max(...durations);
    const total = durations.reduce((sum, d) => sum + d, 0);

    return {
      fastest,
      slowest,
      total,
      average: averageDuration,
      testCount: testResults.length,
    };
  };

  const performanceData = getPerformanceData();

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center gap-3'>
          <h3 className='font-semibold'>Test Results</h3>
          <Badge variant='outline'>{totalTests} tests</Badge>
          {isRunning && (
            <Badge variant='secondary' className='animate-pulse'>
              Running...
            </Badge>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={onRunTests}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <RefreshCw className='w-4 h-4 mr-2 animate-spin' />
                Running
              </>
            ) : (
              <>
                <PlayCircle className='w-4 h-4 mr-2' />
                Run Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Header */}
      <Card className='m-4'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-lg flex items-center gap-2'>
            <BarChart3 className='w-5 h-5' />
            Test Results Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-4 gap-4 mb-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {passedTests}
              </div>
              <div className='text-sm text-muted-foreground'>Passed</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-red-600'>
                {failedTests}
              </div>
              <div className='text-sm text-muted-foreground'>Failed</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-yellow-600'>
                {skippedTests}
              </div>
              <div className='text-sm text-muted-foreground'>Skipped</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-gray-600'>
                {averageDuration.toFixed(0)}ms
              </div>
              <div className='text-sm text-muted-foreground'>Avg Duration</div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span>Overall Success Rate</span>
              <span>
                {totalTests > 0
                  ? Math.round((passedTests / totalTests) * 100)
                  : 0}
                %
              </span>
            </div>
            <Progress
              value={totalTests > 0 ? (passedTests / totalTests) * 100 : 0}
              className='h-2'
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Results Content */}
      <div className='flex-1 px-4 pb-4'>
        <Tabs defaultValue='list' className='h-full flex flex-col'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='list' className='flex items-center gap-2'>
              <List className='w-4 h-4' />
              List View
            </TabsTrigger>
            <TabsTrigger value='details' className='flex items-center gap-2'>
              <Eye className='w-4 h-4' />
              Details
            </TabsTrigger>
            <TabsTrigger value='console' className='flex items-center gap-2'>
              <AlertCircle className='w-4 h-4' />
              Console
            </TabsTrigger>
          </TabsList>

          <div className='flex-1 mt-4'>
            <TabsContent value='list' className='h-full'>
              <ScrollArea className='h-full'>
                <div className='space-y-2'>
                  {testResults.map(result => (
                    <Card
                      key={result.id}
                      className={`border-l-4 ${getStatusColor(result.status)}`}
                    >
                      <CardContent className='p-4'>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-2'>
                              {getTestIcon(result.status)}
                              <h4 className='font-medium'>{result.name}</h4>
                              <Badge variant='outline' className='text-xs'>
                                {result.status}
                              </Badge>
                            </div>

                            {result.message && (
                              <p className='text-sm text-muted-foreground mb-2'>
                                {result.message}
                              </p>
                            )}

                            <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                              <div className='flex items-center gap-1'>
                                <Clock className='w-3 h-3' />
                                {result.duration}ms
                              </div>
                              {result.error && (
                                <div className='text-red-600'>
                                  Error: {result.error.message}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Assertion Results */}
                        {result.assertionResults &&
                          result.assertionResults.length > 0 && (
                            <div className='mt-3 pt-3 border-t'>
                              <div className='text-sm font-medium mb-2'>
                                Assertions:
                              </div>
                              <div className='space-y-1'>
                                {result.assertionResults.map(
                                  (assertion, index) => (
                                    <div
                                      key={index}
                                      className={`text-xs p-2 rounded ${
                                        assertion.status === 'pass'
                                          ? 'bg-green-50 text-green-700'
                                          : 'bg-red-50 text-red-700'
                                      }`}
                                    >
                                      <div className='flex items-center gap-2'>
                                        {assertion.status === 'pass' ? (
                                          <CheckCircle className='w-3 h-3' />
                                        ) : (
                                          <XCircle className='w-3 h-3' />
                                        )}
                                        <span>{assertion.message}</span>
                                      </div>
                                      {assertion.status === 'fail' && (
                                        <div className='mt-1 ml-5 text-xs'>
                                          Expected:{' '}
                                          {JSON.stringify(assertion.expected)}
                                          <br />
                                          Actual:{' '}
                                          {JSON.stringify(assertion.actual)}
                                        </div>
                                      )}
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value='details' className='h-full'>
              <ScrollArea className='h-full'>
                <div className='space-y-4'>
                  {/* Performance Analysis */}
                  {performanceData && (
                    <Card>
                      <CardHeader>
                        <CardTitle className='text-base'>
                          Performance Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <div className='text-sm font-medium'>
                              Fastest Test
                            </div>
                            <div className='text-2xl font-bold text-green-600'>
                              {performanceData.fastest}ms
                            </div>
                          </div>
                          <div>
                            <div className='text-sm font-medium'>
                              Slowest Test
                            </div>
                            <div className='text-2xl font-bold text-red-600'>
                              {performanceData.slowest}ms
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Test Categories */}
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-base'>
                        Test Categories
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        {[
                          {
                            name: 'Status Code Tests',
                            count: passedTests,
                            color: 'bg-blue-500',
                          },
                          {
                            name: 'Response Time Tests',
                            count: failedTests,
                            color: 'bg-green-500',
                          },
                          {
                            name: 'Data Validation Tests',
                            count: skippedTests,
                            color: 'bg-yellow-500',
                          },
                        ].map(category => (
                          <div
                            key={category.name}
                            className='flex items-center justify-between'
                          >
                            <span className='text-sm'>{category.name}</span>
                            <div className='flex items-center gap-2'>
                              <div className='w-24 bg-gray-200 rounded-full h-2'>
                                <div
                                  className={`${category.color} h-2 rounded-full`}
                                  style={{
                                    width: `${(category.count / totalTests) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className='text-sm text-muted-foreground w-8'>
                                {category.count}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value='console' className='h-full'>
              <ScrollArea className='h-full'>
                <div className='space-y-2'>
                  {console.length === 0 ? (
                    <div className='text-center text-muted-foreground py-8'>
                      <List className='w-12 h-12 mx-auto mb-4 opacity-50' />
                      <h3 className='text-lg font-semibold mb-2'>
                        No Console Output
                      </h3>
                      <p className='text-sm'>
                        Test scripts console output will appear here
                      </p>
                    </div>
                  ) : (
                    console.map((entry, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${getConsoleColor(entry.level)}`}
                      >
                        <div className='flex items-start gap-2'>
                          {getConsoleIcon(entry.level)}
                          <div className='flex-1'>
                            <div className='font-mono text-xs mb-1'>
                              {formatConsoleMessage(entry)}
                            </div>
                            {entry.data && (
                              <div className='text-xs mt-1 font-mono bg-black/5 p-2 rounded'>
                                {typeof entry.data === 'string'
                                  ? entry.data
                                  : JSON.stringify(entry.data, null, 2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
