import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  BarChart3,
  List,
  Eye,
  Zap,
  Settings,
  Play
  SkipForward
} from 'lucide-react'

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'skip' | 'error'
  message?: string
  duration: number
  error?: Error
  assertionResults?: Array<{
    assertion: string
    status: 'pass' | 'fail'
    message: string
    actual?: any
    expected?: any
  }>
}

interface ResponseTestsTabProps {
  testResults: TestResult[]
}

export function ResponseTestsTab({ testResults }: ResponseTestsTabProps) {
  const passedTests = testResults.filter(t => t.status === 'pass').length
  const failedTests = testResults.filter(t => t.status === 'fail').length
  const skippedTests = testResults.filter(t => t.status === 'skip').length
  const errorTests = testResults.filter(t => t.status === 'error').length
  const totalTests = testResults.length

  const averageDuration = testResults.length > 0 
    ? testResults.reduce((sum, test) => sum + test.duration, 0) / testResults.length 
    : 0

  const getTestIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'skip':
        return <SkipForward className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-orange-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'fail':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'skip':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPerformanceColor = (duration: number) => {
    if (duration < 100) return 'text-green-600 bg-green-50'
    if (duration < 500) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getTestSummary = () => {
    const status = testResults.length === 0 ? 'no-tests' :
                  failedTests === 0 ? 'all-passed' :
                  passedTests > 0 ? 'partial-failure' : 'all-failed'

    switch (status) {
      case 'no-tests':
        return {
          label: 'No Tests',
          description: 'No tests were defined for this request',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        }
      case 'all-passed':
        return {
          label: 'All Tests Passed',
          description: 'All assertions were successful',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        }
      case 'all-failed':
        return {
          label: 'All Tests Failed',
          description: 'All assertions failed',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        }
      case 'partial-failure':
        return {
          label: 'Some Tests Failed',
          description: `${passedTests} passed, ${failedTests} failed`,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        }
      default:
        return {
          label: 'Unknown Status',
          description: 'Test status could not be determined',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        }
    }
  }

  const testSummary = getTestSummary()

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Test Results
          </h3>
          <Badge variant="outline" className={testSummary.bgColor}>
            {testSummary.label}
          </Badge>
        </div>
        
        {/* Summary Description */}
        <p className="text-sm text-muted-foreground mb-4">
          {testSummary.description}
        </p>

        {/* Overall Progress */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Success Rate</span>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">
                {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
              </span>
            </div>
          </div>
          <Progress 
            value={totalTests > 0 ? (passedTests / totalTests) * 100 : 0} 
            className="h-2 flex-1"
          />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{passedTests}</span>
            </div>
            <div className="text-sm text-muted-foreground">Passed</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{failedTests}</span>
            </div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <SkipForward className="w-4 h-4 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">{skippedTests}</span>
            </div>
            <div className="text-sm text-muted-foreground">Skipped</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-2xl font-bold">
                {averageDuration.toFixed(0)}ms
              </span>
            </div>
            <div className="text-sm text-muted-foreground">Avg Duration</div>
          </div>
        </div>
      </div>

      {/* Test Details */}
      <div className="flex-1">
        <Tabs defaultValue="list" className="h-full flex flex-col">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Details
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-4">
            <TabsContent value="list" className="h-full mt-0">
              <ScrollArea className="h-full">
                <div className="space-y-2 p-2">
                  {testResults.map((result, index) => (
                    <Card key={`${result.name}-${index}`} className={`border-l-4 ${getStatusColor(result.status)}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getTestIcon(result.status)}
                              <h4 className="font-medium text-sm">{result.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {result.status}
                              </Badge>
                            </div>
                            
                            {result.message && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {result.message}
                              </p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{result.duration}ms</span>
                              </div>
                              
                              {result.error && (
                                <div className="text-red-600">
                                  Error: {result.error.message}
                                </div>
                              )}
                            </div>

                            {/* Assertion Results */}
                            {result.assertionResults && result.assertionResults.length > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                <div className="text-sm font-medium mb-2">Assertions:</div>
                                <div className="space-y-1">
                                  {result.assertionResults.map((assertion, index) => (
                                    <div 
                                      key={index}
                                      className={`text-xs p-2 rounded ${
                                        assertion.status === 'pass' 
                                          ? 'bg-green-50 text-green-700' 
                                          : 'bg-red-50 text-red-700'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {assertion.status === 'pass' ? (
                                          <CheckCircle className="w-3 h-3" />
                                        ) : (
                                          <XCircle className="w-3 h-3" />
                                        )}
                                        <span>{assertion.message}</span>
                                      </div>
                                      
                                      {assertion.status === 'fail' && (
                                        <div className="mt-1 ml-5 text-xs">
                                          Expected: {JSON.stringify(assertion.expected)}
                                          <br />
                                          Actual: {JSON.stringify(assertion.actual)}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" className="text-xs">
                              <Play className="w-3 h-3 mr-1" />
                              Rerun
                            </Button>
                            <Button size="sm" variant="ghost" className="text-xs">
                              <Settings className="w-3 h-3 mr-1" />
                              Settings
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {testResults.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Zap className="w-6 h-6" />
                    </div>
                    <p>No test results available</p>
                    <p className="text-sm">Add test scripts to your requests to see results here</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="details" className="h-full mt-0">
              <ScrollArea className="h-full">
                <div className="space-y-6 p-4">
                  {/* Performance Analysis */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Performance Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium">Fastest Test</div>
                          <div className="text-2xl font-bold text-green-600">
                            {testResults.length > 0 ? Math.min(...testResults.map(t => t.duration)) : 0}ms
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Slowest Test</div>
                          <div className="text-2xl font-bold text-red-600">
                            {testResults.length > 0 ? Math.max(...testResults.map(t => t.duration)) : 0}ms
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Test Categories */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Test Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Status Code Tests</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${getStatusColor('pass')} h-2 rounded-full`}
                                style={{ 
                                  width: `${testResults.filter(t => t.name.toLowerCase().includes('status')).length > 0 
                                    ? (testResults.filter(t => t.name.toLowerCase().includes('status')).filter(t => t.status === 'pass').length / testResults.filter(t => t.name.toLowerCase().includes('status')).length * 100) 
                                    : 0}%` 
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8">
                              {testResults.filter(t => t.name.toLowerCase().includes('status')).length}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Response Time Tests</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${getStatusColor('pass')} h-2 rounded-full`}
                                style={{ 
                                  width: `${testResults.filter(t => t.name.toLowerCase().includes('time')).length > 0 
                                    ? (testResults.filter(t => t.name.toLowerCase().includes('time')).filter(t => t.status === 'pass').length / testResults.filter(t => t.name.toLowerCase().includes('time')).length * 100) 
                                    : 0}%` 
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8">
                              {testResults.filter(t => t.name.toLowerCase().includes('time')).length}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Data Validation Tests</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${getStatusColor('pass')} h-2 rounded-full`}
                                style={{ 
                                  width: `${testResults.filter(t => t.name.toLowerCase().includes('data')).length > 0 
                                    ? (testResults.filter(t => t.name.toLowerCase().includes('data')).filter(t => t.status === 'pass').length / testResults.filter(t => t.name.toLowerCase().includes('data')).length * 100) 
                                    : 0}%` 
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8">
                              {testResults.filter(t => t.name.toLowerCase().includes('data')).length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
