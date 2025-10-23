import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CodeEditor } from '@/components/common/CodeEditor'
import { 
  Upload, 
  FileText, 
  Binary, 
  Code,
  Send,
  Database,
  Globe,
  FileJson,
  FileText as FileTextIcon,
  Link as LinkIcon
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface BodyData {
  type: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary' | 'graphql'
  rawType: 'text' | 'javascript' | 'json' | 'html' | 'xml' | 'yaml'
  formData: Array<{ 
    id: string
    key: string
    value: string
    type: 'text' | 'file'
    enabled: boolean
    file?: File
  }>
  rawContent: string
  graphqlQuery: string
  graphqlVariables: string
}

interface AdvancedBodyTabProps {
  body: BodyData
  onChange: (body: BodyData) => void
}

// Form data editor component
function FormDataEditor({ 
  formData, 
  onChange 
}: { 
  formData: BodyData['formData']
  onChange: (formData: BodyData['formData']) => void 
}) {
  const addFormField = () => {
    const newField = {
      id: Date.now().toString(),
      key: '',
      value: '',
      type: 'text' as const,
      enabled: true
    }
    onChange([...formData, newField])
  }

  const updateField = (id: string, updates: Partial<typeof formData[0]>) => {
    onChange(formData.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ))
  }

  const deleteField = (id: string) => {
    onChange(formData.filter(field => field.id !== id))
  }

  const handleFileSelect = (id: string, file: File) => {
    updateField(id, { file, value: file.name })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h4 className="font-medium">Form Data</h4>
        <Button size="sm" onClick={addFormField}>
          Add Field
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {formData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No form fields added. Click "Add Field" to create one.
          </div>
        ) : (
          <div className="space-y-3">
            {formData.map((field) => (
              <div key={field.id} className="flex gap-2 items-center p-3 border rounded-lg">
                <input
                  type="checkbox"
                  checked={field.enabled}
                  onChange={(e) => updateField(field.id, { enabled: e.target.checked })}
                  className="rounded"
                />
                
                <Select 
                  value={field.type} 
                  onValueChange={(value: 'text' | 'file') => updateField(field.id, { type: value })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="file">File</SelectItem>
                  </SelectContent>
                </Select>

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
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileSelect(field.id, file)
                      }}
                      className="hidden"
                      id={`file-${field.id}`}
                    />
                    <label
                      htmlFor={`file-${field.id}`}
                      className="flex-1 px-3 py-2 border rounded cursor-pointer hover:bg-muted"
                    >
                      {field.file ? field.file.name : 'Choose file'}
                    </label>
                  </div>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteField(field.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdvancedBodyTab({ body, onChange }: AdvancedBodyTabProps) {
  const { toast } = useToast()

  const updateBodyType = (type: BodyData['type']) => {
    onChange({ ...body, type })
  }

  const updateRawType = (rawType: BodyData['rawType']) => {
    onChange({ ...body, rawType })
  }

  const updateRawContent = (content: string) => {
    onChange({ ...body, rawContent: content })
  }

  const updateFormData = (formData: BodyData['formData']) => {
    onChange({ ...body, formData })
  }

  const updateGraphQLQuery = (query: string) => {
    onChange({ ...body, graphqlQuery: query })
  }

  const updateGraphQLVariables = (variables: string) => {
    onChange({ ...body, graphqlVariables: variables })
  }

  const getContentType = () => {
    switch (body.type) {
      case 'form-data':
        return 'multipart/form-data'
      case 'x-www-form-urlencoded':
        return 'application/x-www-form-urlencoded'
      case 'raw':
        switch (body.rawType) {
          case 'json': return 'application/json'
          case 'xml': return 'application/xml'
          case 'html': return 'text/html'
          case 'javascript': return 'application/javascript'
          case 'yaml': return 'application/yaml'
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
    switch (body.type) {
      case 'form-data':
        return body.formData
          .filter(item => item.enabled)
          .map(item => `${item.key}: ${item.type === 'file' ? '(file)' : item.value}`)
          .join('\n')
      case 'x-www-form-urlencoded':
        return body.formData
          .filter(item => item.enabled)
          .map(item => `${encodeURIComponent(item.key)}=${encodeURIComponent(item.value)}`)
          .join('&')
      case 'raw':
        return body.rawContent
      case 'graphql':
        return JSON.stringify({
          query: body.graphqlQuery,
          variables: body.graphqlVariables ? JSON.parse(body.graphqlVariables) : {}
        }, null, 2)
      default:
        return 'No body'
    }
  }

  const getLanguage = () => {
    switch (body.rawType) {
      case 'javascript': return 'javascript'
      case 'json': return 'json'
      case 'html': return 'html'
      case 'xml': return 'xml'
      case 'yaml': return 'yaml'
      default: return 'text'
    }
  }

  const formatJSON = () => {
    if (body.rawType === 'json' && body.rawContent) {
      try {
        const parsed = JSON.parse(body.rawContent)
        const formatted = JSON.stringify(parsed, null, 2)
        updateRawContent(formatted)
      } catch {
        toast({
          title: 'Format Failed',
          description: 'Invalid JSON syntax',
          variant: 'destructive'
        })
      }
    }
  }

  const formatXML = () => {
    if (body.rawType === 'xml' && body.rawContent) {
      // Basic XML formatting (simplified)
      try {
        const formatted = body.rawContent
          .replace(/></g, '>\n<')
          .replace(/^\s*\n/g, '')
        updateRawContent(formatted)
      } catch {
        toast({
          title: 'Format Failed',
          description: 'Could not format XML',
          variant: 'destructive'
        })
      }
    }
  }

  const addGraphQLTemplate = () => {
    const query = `query {
  users(first: 10) {
    edges {
      node {
        id
        name
        email
      }
    }
  }
}`
    const variables = `{
  "first": 10
}`
    updateGraphQLQuery(query)
    updateGraphQLVariables(variables)
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
        
        <Select value={body.type} onValueChange={updateBodyType}>
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
        {body.type === 'none' && (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Body</h3>
              <p className="text-sm">This request does not have a body</p>
            </div>
          </div>
        )}

        {body.type === 'raw' && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <Select value={body.rawType} onValueChange={updateRawType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="yaml">YAML</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                {(body.rawType === 'json' || body.rawType === 'xml') && (
                  <Button size="sm" variant="outline" onClick={formatJSON}>
                    Format
                  </Button>
                )}
                <Badge variant="outline" className="text-xs">
                  {getContentType()}
                </Badge>
              </div>
            </div>

            <div className="flex-1">
              <CodeEditor
                value={body.rawContent}
                onChange={updateRawContent}
                language={getLanguage()}
                placeholder="Enter request body..."
                rows={20}
              />
            </div>
          </div>
        )}

        {body.type === 'form-data' && (
          <div className="h-full">
            <FormDataEditor
              formData={body.formData}
              onChange={updateFormData}
            />
          </div>
        )}

        {body.type === 'x-www-form-urlencoded' && (
          <div className="h-full">
            <FormDataEditor
              formData={body.formData}
              onChange={updateFormData}
            />
          </div>
        )}

        {body.type === 'binary' && (
          <div className="h-full flex items-center justify-center">
            <Card className="w-96">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Binary className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
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

        {body.type === 'graphql' && (
          <div className="h-full">
            <Tabs defaultValue="query" className="h-full flex flex-col">
              <div className="flex items-center justify-between px-4 pt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="query">QUERY</TabsTrigger>
                  <TabsTrigger value="variables">VARIABLES</TabsTrigger>
                </TabsList>
                <Button size="sm" variant="outline" onClick={addGraphQLTemplate}>
                  <Database className="w-4 h-4 mr-2" />
                  Template
                </Button>
              </div>
              
              <div className="flex-1 mt-4 px-4">
                <TabsContent value="query" className="h-full">
                  <CodeEditor
                    value={body.graphqlQuery}
                    onChange={updateGraphQLQuery}
                    language="javascript"
                    placeholder="query {\n  users {\n    id\n    name\n  }\n}"
                    rows={15}
                  />
                </TabsContent>
                
                <TabsContent value="variables" className="h-full">
                  <CodeEditor
                    value={body.graphqlVariables}
                    onChange={updateGraphQLVariables}
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
      {body.type !== 'none' && body.type !== 'binary' && (
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
