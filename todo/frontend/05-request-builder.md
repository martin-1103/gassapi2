# Phase 3.3: Request Builder Implementation

## Overview
Implementasi detailed request builder dengan tabs untuk params, headers, body, tests, dan authentication. Setiap tab akan memiliki advanced features untuk professional API testing.

## 5.1 Request Tabs System

### Tab Structure
```
Request Tabs
├── Params Tab
│   ├── Query Parameters Table
│   ├── Add/Delete/Move Rows
│   ├── URL Encoding Options
│   └── Parameter Types (string, file, etc.)
├── Headers Tab
│   ├── Headers Table (Key-Value)
│   ├── Common Headers Templates
│   ├── Header Auto-completion
│   └── Bulk Headers Editor
├── Body Tab
│   ├── Content Type Selector
│   ├── JSON Editor dengan Syntax Highlighting
│   ├── Form Data Editor
│   ├── Raw Text Editor
│   └── Binary File Upload
├── Tests Tab
│   ├── JavaScript Test Script Editor
│   ├── Pre-request Scripts
│   ├── Post-response Scripts
│   └── Test Results Viewer
└── Auth Tab
    ├── Authentication Type Selector
    ├── Bearer Token Input
    ├── Basic Auth Fields
    ├── API Key Configuration
    └── OAuth 2.0 Flow Setup
```

## 5.2 Request Parameters Tab

### Query Parameters Editor
```typescript
// src/components/workspace/request-tabs/params-tab.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, MoreHorizontal, ChevronUp, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface QueryParam {
  id: string
  key: string
  value: string
  enabled: boolean
  description?: string
}

export function RequestParamsTab() {
  const [params, setParams] = useState<QueryParam[]>([
    { id: '1', key: 'page', value: '1', enabled: true },
    { id: '2', key: 'limit', value: '10', enabled: true },
    { id: '3', key: 'search', value: '', enabled: false }
  ])

  const addParam = () => {
    const newParam: QueryParam = {
      id: Date.now().toString(),
      key: '',
      value: '',
      enabled: true
    }
    setParams([...params, newParam])
  }

  const updateParam = (id: string, updates: Partial<QueryParam>) => {
    setParams(params.map(param => 
      param.id === id ? { ...param, ...updates } : param
    ))
  }

  const deleteParam = (id: string) => {
    setParams(params.filter(param => param.id !== id))
  }

  const moveParam = (id: string, direction: 'up' | 'down') => {
    const index = params.findIndex(param => param.id === id)
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === params.length - 1)
    ) {
      return
    }

    const newParams = [...params]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newParams[index], newParams[targetIndex]] = [newParams[targetIndex], newParams[index]]
    setParams(newParams)
  }

  const generateQueryString = () => {
    const enabledParams = params.filter(param => param.enabled && param.key && param.value)
    const searchParams = new URLSearchParams()
    
    enabledParams.forEach(param => {
      searchParams.append(param.key, param.value)
    })
    
    return searchParams.toString()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold">Query Parameters</h3>
          <Badge variant="outline">
            {params.filter(p => p.enabled).length} active
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            Bulk Edit
          </Button>
          <Button size="sm" onClick={addParam}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Parameters Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Enabled</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {params.map((param, index) => (
              <TableRow key={param.id}>
                <TableCell>
                  <Checkbox
                    checked={param.enabled}
                    onCheckedChange={(checked) => 
                      updateParam(param.id, { enabled: !!checked })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Parameter name"
                    value={param.key}
                    onChange={(e) => 
                      updateParam(param.id, { key: e.target.value })
                    }
                    className="font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Parameter value"
                    value={param.value}
                    onChange={(e) => 
                      updateParam(param.id, { value: e.target.value })
                    }
                    className="font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Description (optional)"
                    value={param.description || ''}
                    onChange={(e) => 
                      updateParam(param.id, { description: e.target.value })
                    }
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveParam(param.id, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveParam(param.id, 'down')}
                      disabled={index === params.length - 1}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteParam(param.id)}
                          className="text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Generated URL:{' '}
            <code className="ml-2 px-2 py-1 bg-background rounded">
              ?{generateQueryString()}
            </code>
          </div>
          <Button size="sm" variant="outline">
            URL Encode
          </Button>
        </div>
      </div>
    </div>
  )
}
```

## 5.3 Headers Tab

### Headers Editor
```typescript
// src/components/workspace/request-tabs/headers-tab.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Copy, BookOpen } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { CodeEditor } from '@/components/common/code-editor'

interface RequestHeader {
  id: string
  key: string
  value: string
  enabled: boolean
  description?: string
}

const COMMON_HEADERS = [
  { key: 'Content-Type', value: 'application/json', description: 'Media type of the request body' },
  { key: 'Accept', value: 'application/json', description: 'Media types that are acceptable' },
  { key: 'Authorization', value: 'Bearer {{token}}', description: 'Authentication credentials' },
  { key: 'User-Agent', value: 'GASS-API/1.0', description: 'Client identification' },
  { key: 'Cache-Control', value: 'no-cache', description: 'Cache directives' },
  { key: 'X-Requested-With', value: 'XMLHttpRequest', description: 'AJAX request identifier' }
]

export function RequestHeadersTab() {
  const [headers, setHeaders] = useState<RequestHeader[]>([
    { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
    { id: '2', key: 'Accept', value: 'application/json', enabled: true }
  ])

  const addHeader = () => {
    const newHeader: RequestHeader = {
      id: Date.now().toString(),
      key: '',
      value: '',
      enabled: true
    }
    setHeaders([...headers, newHeader])
  }

  const addCommonHeader = (header: typeof COMMON_HEADERS[0]) => {
    const newHeader: RequestHeader = {
      id: Date.now().toString(),
      key: header.key,
      value: header.value,
      enabled: true,
      description: header.description
    }
    setHeaders([...headers, newHeader])
  }

  const updateHeader = (id: string, updates: Partial<RequestHeader>) => {
    setHeaders(headers.map(header => 
      header.id === id ? { ...header, ...updates } : header
    ))
  }

  const deleteHeader = (id: string) => {
    setHeaders(headers.filter(header => header.id !== id))
  }

  const getHeadersObject = () => {
    const enabledHeaders = headers.filter(header => header.enabled && header.key)
    return enabledHeaders.reduce((acc, header) => {
      acc[header.key] = header.value
      return acc
    }, {} as Record<string, string>)
  }

  const copyHeaders = () => {
    const headersObj = getHeadersObject()
    const headersText = Object.entries(headersObj)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')
    navigator.clipboard.writeText(headersText)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold">Headers</h3>
          <Badge variant="outline">
            {headers.filter(h => h.enabled).length} active
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={copyHeaders}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button size="sm" onClick={addHeader}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Common Headers */}
      <Card className="mx-4 mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Common Headers
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {COMMON_HEADERS.map((header) => (
              <Button
                key={header.key}
                size="sm"
                variant="outline"
                onClick={() => addCommonHeader(header)}
                className="text-xs h-6"
              >
                {header.key}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Headers Table */}
      <div className="flex-1 p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Enabled</TableHead>
              <TableHead>Header Name</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {headers.map((header) => (
              <TableRow key={header.id}>
                <TableCell>
                  <Checkbox
                    checked={header.enabled}
                    onCheckedChange={(checked) => 
                      updateHeader(header.id, { enabled: !!checked })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Header name"
                    value={header.key}
                    onChange={(e) => 
                      updateHeader(header.id, { key: e.target.value })
                    }
                    className="font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Header value"
                    value={header.value}
                    onChange={(e) => 
                      updateHeader(header.id, { value: e.target.value })
                    }
                    className="font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Description (optional)"
                    value={header.description || ''}
                    onChange={(e) => 
                      updateHeader(header.id, { description: e.target.value })
                    }
                    className="text-sm"
                  />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => deleteHeader(header.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Headers will be sent with the request
          </div>
          <CodeEditor
            value={JSON.stringify(getHeadersObject(), null, 2)}
            onChange={() => {}}
            language="json"
            rows={3}
            readOnly
          />
        </div>
      </div>
    </div>
  )
}
```

## 5.4 Body Tab

### Request Body Editor
```typescript
// src/components/workspace/request-tabs/body-tab.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CodeEditor } from '@/components/common/code-editor'
import { Upload, FileText, Binary, Code } from 'lucide-react'

interface BodyData {
  type: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary' | 'graphql'
  rawType: 'text' | 'javascript' | 'json' | 'html' | 'xml'
  formData: Array<{ key: string; value: string; type: 'text' | 'file'; enabled: boolean }>
  rawContent: string
  graphqlQuery: string
  graphqlVariables: string
}

export function RequestBodyTab() {
  const [bodyData, setBodyData] = useState<BodyData>({
    type: 'raw',
    rawType: 'json',
    formData: [],
    rawContent: '{\n  "key": "value"\n}',
    graphqlQuery: '',
    graphqlVariables: ''
  })

  const updateBodyType = (type: BodyData['type']) => {
    setBodyData(prev => ({ ...prev, type }))
  }

  const updateRawType = (rawType: BodyData['rawType']) => {
    setBodyData(prev => ({ ...prev, rawType }))
  }

  const updateRawContent = (content: string) => {
    setBodyData(prev => ({ ...prev, rawContent: content }))
  }

  const getContentType = () => {
    switch (bodyData.type) {
      case 'form-data':
        return 'multipart/form-data'
      case 'x-www-form-urlencoded':
        return 'application/x-www-form-urlencoded'
      case 'raw':
        switch (bodyData.rawType) {
          case 'json': return 'application/json'
          case 'xml': return 'application/xml'
          case 'html': return 'text/html'
          case 'javascript': return 'application/javascript'
          default: return 'text/plain'
        }
      case 'graphql':
        return 'application/json'
      case 'binary':
        return 'application/octet-stream'
      default:
        return null
    }
  }

  const getBodyPreview = () => {
    switch (bodyData.type) {
      case 'form-data':
        return bodyData.formData
          .filter(item => item.enabled)
          .map(item => `${item.key}: ${item.value || '(file)'}`)
          .join('\n')
      case 'x-www-form-urlencoded':
        return bodyData.formData
          .filter(item => item.enabled)
          .map(item => `${encodeURIComponent(item.key)}=${encodeURIComponent(item.value)}`)
          .join('&')
      case 'raw':
        return bodyData.rawContent
      case 'graphql':
        return JSON.stringify({
          query: bodyData.graphqlQuery,
          variables: bodyData.graphqlVariables ? JSON.parse(bodyData.graphqlVariables) : {}
        }, null, 2)
      default:
        return 'No body'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Body Type Selector */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold">Body</h3>
          {getContentType() && (
            <Badge variant="outline">{getContentType()}</Badge>
          )}
        </div>
        
        <Select value={bodyData.type} onValueChange={updateBodyType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">none</SelectItem>
            <SelectItem value="form-data">form-data</SelectItem>
            <SelectItem value="x-www-form-urlencoded">x-www-form-urlencoded</SelectItem>
            <SelectItem value="raw">raw</SelectItem>
            <SelectItem value="binary">binary</SelectItem>
            <SelectItem value="graphql">GraphQL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Body Content */}
      <div className="flex-1 p-4">
        {bodyData.type === 'none' && (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>This request does not have a body</p>
            </div>
          </div>
        )}

        {bodyData.type === 'raw' && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <Select value={bodyData.rawType} onValueChange={updateRawType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-muted-foreground">
                {getContentType()}
              </div>
            </div>

            <div className="flex-1">
              <CodeEditor
                value={bodyData.rawContent}
                onChange={updateRawContent}
                language={bodyData.rawType === 'javascript' ? 'javascript' : 'json'}
                placeholder="Enter request body..."
                rows={20}
              />
            </div>
          </div>
        )}

        {bodyData.type === 'form-data' && (
          <div className="h-full">
            <FormDataTab bodyData={bodyData} setBodyData={setBodyData} />
          </div>
        )}

        {bodyData.type === 'binary' && (
          <div className="h-full flex items-center justify-center">
            <Card className="w-96">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="text-lg font-semibold mb-2">Select File</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose a file to send as binary data
                  </p>
                  <Button className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {bodyData.type === 'graphql' && (
          <div className="h-full">
            <Tabs defaultValue="query" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="query">QUERY</TabsTrigger>
                <TabsTrigger value="variables">VARIABLES</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 mt-4">
                <TabsContent value="query" className="h-full">
                  <CodeEditor
                    value={bodyData.graphqlQuery}
                    onChange={(value) => setBodyData(prev => ({ ...prev, graphqlQuery: value }))}
                    language="javascript"
                    placeholder="query {\n  users {\n    id\n    name\n  }\n}"
                    rows={15}
                  />
                </TabsContent>
                
                <TabsContent value="variables" className="h-full">
                  <CodeEditor
                    value={bodyData.graphqlVariables}
                    onChange={(value) => setBodyData(prev => ({ ...prev, graphqlVariables: value }))}
                    language="json"
                    placeholder='{\n  "limit": 10\n}'
                    rows={10}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>

      {/* Preview */}
      {bodyData.type !== 'none' && bodyData.type !== 'binary' && (
        <div className="p-4 border-t bg-muted/50">
          <div className="text-sm text-muted-foreground mb-2">Preview:</div>
          <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
            {getBodyPreview()}
          </pre>
        </div>
      )}
    </div>
  )
}

// Separate component for form-data
function FormDataTab({ bodyData, setBodyData }: any) {
  const addFormField = () => {
    const newField = {
      id: Date.now().toString(),
      key: '',
      value: '',
      type: 'text' as const,
      enabled: true
    }
    setBodyData(prev => ({
      ...prev,
      formData: [...prev.formData, newField]
    }))
  }

  const updateField = (id: string, updates: any) => {
    setBodyData(prev => ({
      ...prev,
      formData: prev.formData.map(field =>
        field.id === id ? { ...field, ...updates } : field
      )
    }))
  }

  const deleteField = (id: string) => {
    setBodyData(prev => ({
      ...prev,
      formData: prev.formData.filter(field => field.id !== id)
    }))
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium">Form Data</h4>
        <Button size="sm" onClick={addFormField}>
          Add Field
        </Button>
      </div>

      <div className="flex-1 space-y-2 overflow-auto">
        {bodyData.formData.map((field: any) => (
          <div key={field.id} className="flex gap-2 items-center">
            <input
              type="checkbox"
              checked={field.enabled}
              onChange={(e) => updateField(field.id, { enabled: e.target.checked })}
              className="rounded"
            />
            <input
              type="text"
              placeholder="Key"
              value={field.key}
              onChange={(e) => updateField(field.id, { key: e.target.value })}
              className="flex-1 px-3 py-2 border rounded"
            />
            {field.type === 'text' ? (
              <input
                type="text"
                placeholder="Value"
                value={field.value}
                onChange={(e) => updateField(field.id, { value: e.target.value })}
                className="flex-1 px-3 py-2 border rounded"
              />
            ) : (
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    updateField(field.id, { value: file.name })
                  }
                }}
                className="flex-1 px-3 py-2 border rounded"
              />
            )}
            <Select value={field.type} onValueChange={(type: any) => updateField(field.id, { type })}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="file">File</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" onClick={() => deleteField(field.id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Deliverables
- ✅ Query Parameters Editor dengan add/delete/move functionality
- ✅ Advanced Headers Editor dengan common headers templates
- ✅ Multiple Body Types support (JSON, form-data, GraphQL, binary)
- ✅ Tests Tab untuk JavaScript test scripts
- ✅ Authentication Tab dengan multiple auth types
- ✅ Environment variable integration
- ✅ Code formatting dan validation

## Next Steps
Lanjut ke Phase 3.4: Response Viewer Implementation untuk professional response display dengan syntax highlighting dan advanced features.
