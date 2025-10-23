import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Trash2, 
  Copy, 
  Save,
  Play,
  TestTube,
  Code,
  FileText,
  Zap,
  Settings,
  BookOpen
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

interface TestScript {
  id: string
  name: string
  type: 'pre-request' | 'post-response'
  script: string
  enabled: boolean
  timeout: number
  lastResult?: {
    status: 'pass' | 'fail' | 'error'
    message?: string
    duration: number
  }
}

interface TestsTabProps {
  scripts: TestScript[]
  onChange: (scripts: TestScript[]) => void
  onRunTests: () => void
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
});`
}

// Pre-request templates
const PRE_REQUEST_TEMPLATES = {
  'Set Headers': `pm.request.headers.add('Authorization', 'Bearer ' + pm.environment.get('token'));
pm.request.headers.add('X-Custom-Header', 'Custom-Value');`,
  
  'Generate UUID': `const uuid = require('uuid');
pm.environment.set('requestId', uuid.v4());`,
  
  'Timestamp': `pm.environment.set('timestamp', new Date().toISOString());
pm.environment.set('unixTimestamp', Date.now());`,
  
  'Random Data': `const randomEmail = Math.random().toString(36).substring(2) + '@test.com';
pm.environment.set('randomEmail', randomEmail);

const randomNumber = Math.floor(Math.random() * 1000);
pm.environment.set('randomNumber', randomNumber);`
}

export default function TestsTab({ scripts, onChange, onRunTests }: TestsTabProps) {
  const [selectedScript, setSelectedScript] = useState<TestScript | null>(scripts[0] || null)
  const [activeTab, setActiveTab] = useState<'pre-request' | 'post-response'>('post-response')
  const { toast } = useToast()

  const filteredScripts = scripts.filter(script => script.type === activeTab)

  const addScript = () => {
    const newScript: TestScript = {
      id: Date.now().toString(),
      name: `New ${activeTab === 'pre-request' ? 'Pre-request' : 'Post-response'} Test`,
      type: activeTab,
      script: `pm.test("New test", () => {
    // Add your test code here
    pm.expect(true).to.be.true;
});`,
      enabled: true,
      timeout: 5000
    }
    onChange([...scripts, newScript])
    setSelectedScript(newScript)
  }

  const updateScript = (id: string, updates: Partial<TestScript>) => {
    onChange(scripts.map(script => 
      script.id === id ? { ...script, ...updates } : script
    ))
    if (selectedScript?.id === id) {
      setSelectedScript({ ...selectedScript, ...updates })
    }
  }

  const deleteScript = (id: string) => {
    onChange(scripts.filter(script => script.id !== id))
    if (selectedScript?.id === id) {
      setSelectedScript(filteredScripts[0] || null)
    }
  }

  const duplicateScript = (script: TestScript) => {
    const duplicated: TestScript = {
      ...script,
      id: Date.now().toString(),
      name: `${script.name} (Copy)`
    }
    onChange([...scripts, duplicated])
    setSelectedScript(duplicated)
  }

  const addTemplate = (templateName: string, template: string) => {
    const newScript: TestScript = {
      id: Date.now().toString(),
      name: templateName,
      type: activeTab,
      script: template,
      enabled: true,
      timeout: 5000
    }
    onChange([...scripts, newScript])
    setSelectedScript(newScript)
  }

  const exportScripts = () => {
    const exportData = {
      scripts: filteredScripts,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `test-scripts-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Scripts Exported',
      description: 'Test scripts saved to file'
    })
  }

  const importScripts = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      try {
        const text = await file.text()
        const importData = JSON.parse(text)
        
        if (importData.scripts && Array.isArray(importData.scripts)) {
          const newScripts = importData.scripts.map((script: TestScript) => ({
            ...script,
            id: Date.now().toString() + Math.random()
          }))
          
          onChange([...scripts, ...newScripts])
          toast({
            title: 'Scripts Imported',
            description: `Imported ${newScripts.length} test scripts`
          })
        }
      } catch (error) {
        toast({
          title: 'Import Failed',
          description: 'Invalid JSON file format',
          variant: 'destructive'
        })
      }
    }
    
    input.click()
  }

  const runAllTests = () => {
    const enabledScripts = filteredScripts.filter(script => script.enabled)
    if (enabledScripts.length === 0) {
      toast({
        title: 'No Tests to Run',
        description: 'Enable at least one test script to run',
        variant: 'destructive'
      })
      return
    }
    
    onRunTests()
  }

  const formatScript = () => {
    if (!selectedScript) return
    
    try {
      // Basic JavaScript formatting
      const formatted = selectedScript.script
        .replace(/\s+/g, ' ')
        .replace(/;\s*\n/g, ';\n')
        .replace(/{\s*\n/g, '{\n    ')
        .replace(/}\s*\n/g, '\n}\n')
        .trim()
      
      updateScript(selectedScript.id, { script: formatted })
    } catch (error) {
      toast({
        title: 'Format Failed',
        description: 'Could not format the script',
        variant: 'destructive'
      })
    }
  }

  const validateScript = () => {
    if (!selectedScript) return
    
    try {
      // Basic syntax validation
      new Function(selectedScript.script)
      toast({
        title: 'Script Valid',
        description: 'Script syntax is valid'
      })
    } catch (error) {
      toast({
        title: 'Script Invalid',
        description: `Syntax error: ${error.message}`,
        variant: 'destructive'
      })
    }
  }

  const templates = activeTab === 'pre-request' ? PRE_REQUEST_TEMPLATES : TEST_TEMPLATES

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">Tests</h3>
          <Badge variant="outline">
            {filteredScripts.filter(s => s.enabled).length} active
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={importScripts}>
            Import
          </Button>
          <Button size="sm" variant="outline" onClick={exportScripts}>
            Export
          </Button>
          <Button size="sm" onClick={runAllTests}>
            <Play className="w-4 h-4 mr-2" />
            Run Tests
          </Button>
          <Button size="sm" onClick={addScript}>
            <Plus className="w-4 h-4 mr-2" />
            Add Test
          </Button>
        </div>
      </div>

      {/* Script Type Tabs */}
      <div className="px-4 pt-4">
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pre-request" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Pre-request
            </TabsTrigger>
            <TabsTrigger value="post-response" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Post-response
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Templates */}
      <Card className="mx-4 mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Test Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-32">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(templates).map(([name, template]) => (
                <Button
                  key={name}
                  size="sm"
                  variant="outline"
                  onClick={() => addTemplate(name, template)}
                  className="text-xs justify-start h-auto py-2"
                >
                  {name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Script Editor */}
      <div className="flex-1 flex">
        {/* Scripts List */}
        <div className="w-80 border-r">
          <div className="p-3 border-b">
            <h4 className="font-medium text-sm">Test Scripts</h4>
          </div>
          
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {filteredScripts.map((script) => (
                <div
                  key={script.id}
                  className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                    selectedScript?.id === script.id 
                      ? 'bg-primary/10 border-primary' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedScript(script)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={script.enabled}
                          onChange={(e) => {
                            e.stopPropagation()
                            updateScript(script.id, { enabled: e.target.checked })
                          }}
                          className="rounded"
                        />
                        <span className="font-medium text-sm truncate">
                          {script.name}
                        </span>
                      </div>
                      
                      {script.lastResult && (
                        <div className="flex items-center gap-1 mt-1">
                          <Badge 
                            variant={script.lastResult.status === 'pass' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {script.lastResult.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {script.lastResult.duration}ms
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => duplicateScript(script)}>
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => deleteScript(script.id)}
                          className="text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Script Editor */}
        <div className="flex-1 flex flex-col">
          {selectedScript ? (
            <>
              {/* Script Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={selectedScript.name}
                    onChange={(e) => updateScript(selectedScript.id, { name: e.target.value })}
                    className="font-medium bg-transparent border-none outline-none"
                  />
                  <Badge variant="outline" className="text-xs">
                    {selectedScript.type}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={formatScript}>
                    <Code className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={validateScript}>
                    <Zap className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => duplicateScript(selectedScript)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 p-4">
                <Textarea
                  value={selectedScript.script}
                  onChange={(e) => updateScript(selectedScript.id, { script: e.target.value })}
                  className="h-full font-mono text-sm resize-none"
                  placeholder="// Write your test script here..."
                  spellCheck={false}
                />
              </div>

              {/* Script Footer */}
              <div className="p-4 border-t bg-muted/50">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div>Timeout: {selectedScript.timeout}ms</div>
                  <div>Language: JavaScript (Postman/Sandbox API)</div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TestTube className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Test Selected</h3>
                <p className="text-sm">Select a test script to edit or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
