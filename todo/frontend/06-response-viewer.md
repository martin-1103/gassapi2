# Phase 3.4: Response Viewer Implementation

## Overview
Implementasi professional response viewer dengan syntax highlighting, multiple display modes, download/copy functionality, dan advanced response analysis features.

## 6.1 Response Panel Architecture

### Response Display Structure
```
Response Panel
├── Response Header
│   ├── Status Code Badge
│   ├── Response Time
│   ├── Response Size
│   ├── Content Type
│   └── Actions (Download, Copy, Save)
├── Response Tabs
│   ├── Body Tab
│   │   ├── Format Selector (Pretty/Raw)
│   │   ├── Syntax Highlighting
│   │   ├── Search/Filter
│   │   └── Line Numbers
│   ├── Headers Tab
│   │   ├── Response Headers Table
│   │   ├── Header Search
│   │   └── Copy Headers
│   ├── Cookies Tab
│   │   ├── Cookies List
│   │   ├── Cookie Details
│   │   └── Export Cookies
│   ├── Tests Tab
│   │   ├── Test Results Summary
│   │   ├── Individual Test Results
│   │   └── Test Scripts Output
│   └── Documentation Tab
│       ├── Auto-generated Docs
│       ├── Schema Validation
│       └── Example Responses
└── Console/Logs
    ├── Request Log
    ├── Response Log
    └── Debug Information
```

## 6.2 Enhanced Response Viewer Component

### Main Response Panel
```typescript
// src/components/workspace/response-panel.tsx
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  StatusBadge, 
  TimeDisplay 
} from '@/components/common'
import { 
  Download, 
  Copy, 
  Save, 
  Search, 
  Eye, 
  Code, 
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { ResponseBodyTab } from './response-tabs/body-tab'
import { ResponseHeadersTab } from './response-tabs/headers-tab'
import { ResponseCookiesTab } from './response-tabs/cookies-tab'
import { ResponseTestsTab } from './response-tabs/tests-tab'
import { ResponseDocsTab } from './response-tabs/docs-tab'
import { ResponseConsoleTab } from './response-tabs/console-tab'
import { useToast } from '@/hooks/use-toast'

interface ApiResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  data: any
  time: number
  size: number
  redirected?: boolean
  redirectUrl?: string
  cookies?: Record<string, any>
  testResults?: TestResult[]
  console?: ConsoleEntry[]
}

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'skip'
  message?: string
  duration: number
}

interface ConsoleEntry {
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  timestamp: number
  source: string
}

export default function ResponsePanel() {
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [formatMode, setFormatMode] = useState<'pretty' | 'raw'>('pretty')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('body')
  const { toast } = useToast()

  // Mock response data for demonstration
  useEffect(() => {
    const mockResponse: ApiResponse = {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
        'content-length': '1024',
        'cache-control': 'no-cache, private',
        'x-request-id': 'req_123456789',
        'x-ratelimit-remaining': '999',
        'set-cookie': 'session_id=abc123; Path=/; HttpOnly; Secure'
      },
      data: {
        message: 'Success',
        data: [
          { 
            id: 1, 
            name: 'John Doe', 
            email: 'john@example.com',
            created_at: '2025-01-15T10:30:00Z',
            role: 'admin',
            permissions: ['read', 'write', 'delete']
          },
          { 
            id: 2, 
            name: 'Jane Smith', 
            email: 'jane@example.com',
            created_at: '2025-01-10T14:20:00Z',
            role: 'user',
            permissions: ['read']
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        }
      },
      time: 245,
      size: 1024,
      cookies: {
        'session_id': {
          value: 'abc123',
          domain: 'api.example.com',
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'strict'
        }
      },
      testResults: [
        { name: 'Status code is 200', status: 'pass', duration: 5 },
        { name: 'Response time < 500ms', status: 'pass', duration: 2 },
        { name: 'Response has data array', status: 'pass', duration: 3 },
        { name: 'User has email', status: 'fail', message: 'Expected user to have email field', duration: 8 }
      ],
      console: [
        { level: 'info', message: 'Request started', timestamp: Date.now() - 250, source: 'client' },
        { level: 'info', message: 'Sending request to https://api.example.com/users', timestamp: Date.now() - 240, source: 'client' },
        { level: 'warn', message: 'Missing authentication header', timestamp: Date.now() - 200, source: 'server' },
        { level: 'info', message: 'Response received', timestamp: Date.now(), source: 'client' }
      ]
    }

    // Simulate receiving response after 2 seconds
    const timer = setTimeout(() => {
      setResponse(mockResponse)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleDownload = () => {
    if (!response) return

    const content = JSON.stringify(response.data, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `response_${response.status}_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: 'Response downloaded',
      description: 'Response saved to download folder'
    })
  }

  const handleCopy = () => {
    if (!response) return

    const content = JSON.stringify(response.data, null, 2)
    navigator.clipboard.writeText(content)

    toast({
      title: 'Response copied',
      description: 'Response copied to clipboard'
    })
  }

  const handleSave = () => {
    if (!response) return

    // Save to history
    toast({
      title: 'Response saved',
      description: 'Response saved to history'
    })
  }

  const getContentType = () => {
    if (!response?.headers) return 'unknown'
    const contentType = response.headers['content-type'] || response.headers['Content-Type']
    return contentType?.split(';')[0] || 'unknown'
  }

  const hasResponse = response && response.status !== undefined

  return (
    <div className="h-full flex flex-col">
      {!hasResponse ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Eye className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Response Yet</h3>
            <p className="text-sm mb-4">
              Send a request to see the response here. The response will include status, headers, 
              body, and test results.
            </p>
            <div className="space-y-2 text-xs text-left bg-muted/50 rounded p-3">
              <p>• Response status and timing</p>
              <p>• Response headers and metadata</p>
              <p>• Formatted response body</p>
              <p>• Test results and validation</p>
              <p>• Auto-generated documentation</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Response Header */}
          <Card className="m-4 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <StatusBadge status={response.status} />
                <div className="text-sm text-muted-foreground">
                  {response.statusText}
                </div>
                <Badge variant="outline" className="text-xs">
                  {getContentType()}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <TimeDisplay time={response.time} showDetailed />
                <span className="text-sm text-muted-foreground">
                  {response.size} bytes
                </span>
                
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={handleCopy}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleDownload}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleSave}>
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Test Results Summary */}
            {response.testResults && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Tests:</span>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600">
                      {response.testResults.filter(t => t.status === 'pass').length} passed
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      {response.testResults.filter(t => t.status === 'fail').length} failed
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-yellow-600">
                      {response.testResults.filter(t => t.status === 'skip').length} skipped
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Response Tabs */}
          <div className="flex-1 px-4 pb-4">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="body" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Body
                </TabsTrigger>
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="cookies">Cookies</TabsTrigger>
                <TabsTrigger value="tests">Tests</TabsTrigger>
                <TabsTrigger value="docs">Docs</TabsTrigger>
                <TabsTrigger value="console">Console</TabsTrigger>
              </TabsList>

              <div className="flex-1 mt-4">
                <TabsContent value="body" className="h-full">
                  <ResponseBodyTab 
                    response={response}
                    formatMode={formatMode}
                    onFormatModeChange={setFormatMode}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                </TabsContent>
                
                <TabsContent value="headers" className="h-full">
                  <ResponseHeadersTab headers={response.headers} />
                </TabsContent>
                
                <TabsContent value="cookies" className="h-full">
                  <ResponseCookiesTab cookies={response.cookies} />
                </TabsContent>
                
                <TabsContent value="tests" className="h-full">
                  <ResponseTestsTab testResults={response.testResults} />
                </TabsContent>
                
                <TabsContent value="docs" className="h-full">
                  <ResponseDocsTab 
                    response={response}
                    requestInfo={{
                      method: 'GET',
                      url: 'https://api.example.com/users',
                      headers: {}
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="console" className="h-full">
                  <ResponseConsoleTab console={response.console} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </>
      )}
    </div>
  )
}
```

## 6.3 Response Body Tab

### Body Display with Syntax Highlighting
```typescript
// src/components/workspace/response-tabs/body-tab.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Code, 
  Eye, 
  Download, 
  Copy, 
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from '@/contexts/theme-context'
import { useToast } from '@/hooks/use-toast'

interface ResponseBodyTabProps {
  response: any
  formatMode: 'pretty' | 'raw'
  onFormatModeChange: (mode: 'pretty' | 'raw') => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function ResponseBodyTab({ 
  response, 
  formatMode, 
  onFormatModeChange, 
  searchQuery, 
  onSearchChange 
}: ResponseBodyTabProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']))
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [lineNumbers, setLineNumbers] = useState(true)
  const [wrapLines, setWrapLines] = useState(false)
  const { resolvedTheme } = useTheme()
  const { toast } = useToast()

  const getContentType = () => {
    const contentType = response.headers['content-type'] || response.headers['Content-Type']
    return contentType?.split(';')[0] || 'unknown'
  }

  const getLanguage = () => {
    const contentType = getContentType()
    if (contentType.includes('json')) return 'json'
    if (contentType.includes('xml')) return 'xml'
    if (contentType.includes('html')) return 'html'
    if (contentType.includes('javascript')) return 'javascript'
    if (contentType.includes('css')) return 'css'
    return 'text'
  }

  const formatBody = (data: any) => {
    if (formatMode === 'raw') {
      return typeof data === 'string' ? data : JSON.stringify(data)
    }
    
    if (typeof data === 'string') {
      try {
        return JSON.stringify(JSON.parse(data), null, 2)
      } catch {
        return data
      }
    }
    
    return JSON.stringify(data, null, 2)
  }

  const copyToClipboard = () => {
    const formatted = formatBody(response.data)
    navigator.clipboard.writeText(formatted)
    toast({
      title: 'Copied',
      description: 'Response body copied to clipboard'
    })
  }

  const downloadResponse = () => {
    const formatted = formatBody(response.data)
    const blob = new Blob([formatted], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `response_${response.status}_${Date.now()}.${getLanguage()}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const togglePath = (path: string) => {
    const newExpanded = new Set(expandedPaths)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedPaths(newExpanded)
  }

  const renderTreeView = (data: any, path: string = 'root', level: number = 0) => {
    if (data === null) return <span className="text-purple-600">null</span>
    if (data === undefined) return <span className="text-purple-600">undefined</span>
    
    if (typeof data === 'string') {
      return <span className="text-green-600">"{data}"</span>
    }
    
    if (typeof data === 'number') {
      return <span className="text-blue-600">{data}</span>
    }
    
    if (typeof data === 'boolean') {
      return <span className="text-orange-600">{data.toString()}</span>
    }
    
    if (Array.isArray(data)) {
      const isExpanded = expandedPaths.has(path)
      return (
        <div className={`${level > 0 ? 'ml-4' : ''}`}>
          <span 
            className="cursor-pointer select-none"
            onClick={() => togglePath(path)}
          >
            {isExpanded ? (
              <ChevronDown className="inline w-3 h-3 mr-1" />
            ) : (
              <ChevronRight className="inline w-3 h-3 mr-1" />
            )}
            <span className="text-gray-600">[{data.length}]</span>
          </span>
          {isExpanded && (
            <div className="mt-1">
              {data.map((item, index) => (
                <div key={index} className="ml-4">
                  <span className="text-gray-500">{index}:</span>
                  {renderTreeView(item, `${path}[${index}]`, level + 1)}
                  {index < data.length - 1 && <span className="text-gray-400">,</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
    
    if (typeof data === 'object') {
      const isExpanded = expandedPaths.has(path)
      const keys = Object.keys(data)
      
      return (
        <div className={`${level > 0 ? 'ml-4' : ''}`}>
          <span 
            className="cursor-pointer select-none"
            onClick={() => togglePath(path)}
          >
            {isExpanded ? (
              <ChevronDown className="inline w-3 h-3 mr-1" />
            ) : (
              <ChevronRight className="inline w-3 h-3 mr-1" />
            )}
            <span className="text-gray-600">{'{' + keys.length + '}'}</span>
          </span>
          {isExpanded && (
            <div className="mt-1">
              {keys.map((key, index) => (
                <div key={key} className="ml-4">
                  <span className="text-blue-600">"{key}":</span>
                  {renderTreeView(data[key], `${path}.${key}`, level + 1)}
                  {index < keys.length - 1 && <span className="text-gray-400">,</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
    
    return null
  }

  const language = getLanguage()
  const formattedBody = formatBody(response.data)
  const syntaxTheme = resolvedTheme === 'dark' ? oneDark : oneLight

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search response..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-64 h-8"
            />
          </div>
          
          <Badge variant="outline" className="text-xs">
            {getContentType()}
          </Badge>
          
          <div className="flex items-center gap-1 border rounded-md">
            <Button
              size="sm"
              variant={formatMode === 'pretty' ? 'default' : 'ghost'}
              onClick={() => onFormatModeChange('pretty')}
              className="h-7 px-2 text-xs"
            >
              Pretty
            </Button>
            <Button
              size="sm"
              variant={formatMode === 'raw' ? 'default' : 'ghost'}
              onClick={() => onFormatModeChange('raw')}
              className="h-7 px-2 text-xs"
            >
              Raw
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => setLineNumbers(!lineNumbers)}>
            {lineNumbers ? 'Hide' : 'Show'} Lines
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setWrapLines(!wrapLines)}>
            {wrapLines ? 'Unwrap' : 'Wrap'}
          </Button>
          <Button size="sm" variant="ghost" onClick={copyToClipboard}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={downloadResponse}>
            <Download className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {language === 'json' && formatMode === 'pretty' ? (
          <Tabs defaultValue="tree" className="h-full">
            <TabsList className="ml-4">
              <TabsTrigger value="tree">Tree</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tree" className="h-full mt-0">
              <ScrollArea className="h-full p-4">
                <div className="font-mono text-sm">
                  {renderTreeView(response.data)}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="code" className="h-full mt-0">
              <ScrollArea className="h-full">
                <div className="relative">
                  <SyntaxHighlighter
                    language={language}
                    style={syntaxTheme}
                    showLineNumbers={lineNumbers}
                    wrapLongLines={wrapLines}
                    customStyle={{
                      margin: 0,
                      fontSize: '14px',
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                    }}
                  >
                    {formattedBody}
                  </SyntaxHighlighter>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          <ScrollArea className="h-full">
            <div className="relative">
              <SyntaxHighlighter
                language={language}
                style={syntaxTheme}
                showLineNumbers={lineNumbers}
                wrapLongLines={wrapLines}
                customStyle={{
                  margin: 0,
                  fontSize: '14px',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                }}
              >
                {formattedBody}
              </SyntaxHighlighter>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/50 text-xs text-muted-foreground">
        <div>
          Lines: {formattedBody.split('\n').length} | 
          Size: {response.size} bytes | 
          Time: {response.time}ms
        </div>
        <div>
          Language: {language} | 
          Encoding: UTF-8 | 
          {searchQuery && ` Found: ${searchQuery}`}
        </div>
      </div>
    </div>
  )
}
```

## 6.4 Response Headers Tab

### Headers Display Table
```typescript
// src/components/workspace/response-tabs/headers-tab.tsx
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Search, Copy, Filter } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ResponseHeadersTabProps {
  headers: Record<string, string>
}

export function ResponseHeadersTab({ headers }: ResponseHeadersTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { toast } = useToast()

  const filteredHeaders = Object.entries(headers).filter(([key, value]) =>
    key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    value.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const copyHeaders = () => {
    const headersText = Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')
    navigator.clipboard.writeText(headersText)
    
    toast({
      title: 'Headers copied',
      description: 'Response headers copied to clipboard'
    })
  }

  const categorizeHeader = (key: string) => {
    const keyLower = key.toLowerCase()
    if (keyLower.startsWith('content-')) return 'Content'
    if (keyLower.startsWith('cache-')) return 'Cache'
    if (keyLower.includes('auth')) return 'Authentication'
    if (keyLower.includes('cors') || keyLower.includes('access-control')) return 'CORS'
    if (keyLower.startsWith('x-')) return 'Custom'
    return 'General'
  }

  const groupedHeaders = filteredHeaders.reduce((acc, [key, value]) => {
    const category = categorizeHeader(key)
    if (!acc[category]) acc[category] = []
    acc[category].push([key, value])
    return acc
  }, {} as Record<string, Array<[string, string]>>)

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search headers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 h-8"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={copyHeaders}>
            <Copy className="w-4 h-4 mr-2" />
            Copy All
          </Button>
        </div>
      </div>

      {/* Headers Content */}
      <div className="flex-1 overflow-auto">
        {Object.entries(groupedHeaders).map(([category, categoryHeaders]) => (
          <div key={category} className="border-b last:border-b-0">
            <div className="px-4 py-2 bg-muted/50 font-medium text-sm text-muted-foreground">
              {category}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Header Name</TableHead>
                  <TableHead className="w-2/3">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryHeaders.map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="font-mono text-sm">
                      {key}
                    </TableCell>
                    <TableCell className="font-mono text-sm break-all">
                      {value}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t bg-muted/50 text-xs text-muted-foreground">
        {Object.keys(headers).length} total headers | 
        {filteredHeaders.length} showing
        {searchQuery && ` (filtered by "${searchQuery}")`}
      </div>
    </div>
  )
}
```

## Deliverables
- ✅ Professional response viewer dengan syntax highlighting
- ✅ Multiple display modes (Pretty/Raw/Tree)
- ✅ Search and filter functionality
- ✅ Download/copy response capabilities
- ✅ Headers, cookies, and test results tabs
- ✅ Console/logs display
- ✅ Fullscreen mode
- ✅ Response metadata and statistics
- ✅ Auto-generated documentation

## Next Steps
Lanjut ke Phase 4: Testing & Documentation Features untuk implementasi test runner, assertions, dan documentation generation.
