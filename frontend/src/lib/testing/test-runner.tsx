import { TestRunner, TestContext, ConsoleEntry } from './test-runner'
import { TestScript, TestResult } from '@/types/testing'

interface TestRunnerTabProps {
  scripts: TestScript[]
  onRunTests: () => void
}

export default function TestRunnerTab({ scripts, onRunTests }: TestRunnerTabProps) {
  const [selectedScript, setSelectedScript] = useState<TestScript | null>(scripts[0])
  const [testContext, setTestContext] = useState<TestContext | null>(null)
  const { toast } = useToast()

  const handleRunAllTests = async () => {
    const enabledScripts = scripts.filter(script => script.enabled)
    
    if (enabledScripts.length === 0) {
      toast({
        title: 'No Tests to Run',
        description: 'Enable at least one test script',
        variant: 'destructive'
      })
      return
    }

    onRunTests()
  }

  const handleScriptSelect = (script: TestScript) => {
    setSelectedScript(script)
  }

  const getEnabledTestCount = () => {
    return scripts.filter(script => script.enabled).length
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'skip':
        return <SkipForward className="w-4 h-4 text-yellow-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">Test Runner</h3>
          <Badge variant="outline">
            {getEnabledTestCount()} enabled
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleRunAllTests}}>
            <Play className="w-4 h-4 mr-2" />
            Run All Tests
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleScriptSelect(selectedScript)}>
            {Play className="w-4 h-4 mr-2" />
            Run Selected
          </Button>
        </div>
      </div>

      {/* Selected Script Editor */}
      {selectedScript ? (
        <div className="flex-1 p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={selectedScript.name}
                onChange={(e) => {
                  const updatedScript = { ...selectedScript, name: e.target.value }
                  setSelectedScript(updatedScript)
                }}
                className="font-semibold bg-transparent border-none outline-none w-full px-3 py-2"
              />
            />
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">
              Type: {selectedScript.type}
            </div>
            <div className="text-sm text-muted-foreground">
              Timeout: {selectedScript.timeout}ms
            </div>
          </div>

          {/* Script Actions */}
          <div className="flex items-center gap-2 mt-2">
            <Button size="sm" variant="outline">
              <Save className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          </div>

          {/* Results Preview */}
          {selectedScript.lastResult && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">Last Run:</span>
                <Badge variant={getStatusIcon(selectedScript.lastResult.status)}>
                  {getStatusIcon(selectedScript.lastResult.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedScript.lastResult.duration}ms
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scripts Table */}
      <div className="flex-1">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3 font-medium">Name</TableHead>
              <TableHead className="w-1/6 font-medium">Type</TableHead>
              <TableHead className="w-1/6 font-medium">Status</TableHead>
              <TableHead className="w-1/4 font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scripts.map((script, index) => (
              <TableRow key={script.id}>
                <TableCell className="w-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={script.enabled}
                      onChange={(e) => {
                        const updatedScript = { ...script, enabled: e.target.checked }
                        handleScriptSelect(updatedScript)
                      }}
                      className="rounded"
                    />
                  </div>
                  <TableCell>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm">{script.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {script.type}
                      </span>
                      </div>
                </TableCell>
                <TableCell className="w-1/3">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleScriptSelect(script)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleScriptDuplicate(script)}>
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleScriptToggle(script.enabled)}>
                          {script.enabled ? 'Disable' : 'Enable'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => deleteScript(script.id)}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>

                <TableCell className="w-auto">
                  {script.lastResult && (
                    <div className="flex items-center gap-2">
                      {getStatusIcon(script.lastResult.status)}
                      <span className="text-xs text-muted-foreground">
                        {script.lastResult.duration}ms
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="w-1/3 text-sm">
                  {formatDate(script.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Status Bar */}
      <div className="mt-4 p-4 border-t bg-muted/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {getEnabledTestCount()} of {scripts.length} enabled
          </span>
          <div className="flex items-center gap-4">
            <span>Ready: {scripts.length} total</span>
          </div>
          <Button size="sm" onClick={handleRunAllTests}>
            <Play className="w-4 h-4 mr-2" />
            Run All Tests
          </Button>
          </div>
        </div>
    </div>
  )
  ) : (
      <div className="flex-1 flex items-center justify-center text-center py-8">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Terminal className="w-6 h-6 text-muted-foreground" />
          <h4 className="text-lg font-semibold mb-4">No Test Scripts Available</h4>
          <p className="text-sm text-muted-600">
            <p className="mb-4">
              Create test scripts in the Tests tab to get started
            </p>
          </div>
        </div>
      </div>
    )
  )
  }
  )
}
