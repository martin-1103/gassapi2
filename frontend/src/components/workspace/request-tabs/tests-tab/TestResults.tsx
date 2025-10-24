import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TestExecutionState } from './hooks/use-test-execution'

interface TestResultsProps {
  executionState: TestExecutionState
}

export function TestResults({ executionState }: TestResultsProps) {
  if (executionState.results.length === 0 && !executionState.isRunning) {
    return null
  }

  return (
    <Card className="m-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">
          Test Results {executionState.isRunning && '(Running...)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-32">
          <div className="space-y-2">
            {executionState.results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={result.status === 'pass' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {result.status}
                  </Badge>
                  <span className="text-sm">Test {index + 1}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {result.duration}ms
                </div>
              </div>
            ))}
            {executionState.isRunning && (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Running tests...
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}