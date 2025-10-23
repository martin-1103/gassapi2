import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Copy, 
  FileText,
  Code,
  Database,
  Shield,
  Globe,
  Link as LinkIcon,
  Download,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle
  Clock
  Hash
  Layers
  Terminal
  Play
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ResponseDocsTabProps {
  response: any
  requestInfo?: {
    method: string
    url: string
    headers: Record<string, string>
    body?: any
  }
}

interface SchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | 'undefined'
  description?: string
  required?: boolean
  enum?: string[]
  format?: string
  pattern?: string
  minimum?: number
  maximum?: number
  items?: SchemaProperty
  properties?: Record<string, SchemaProperty>
  additionalProperties?: boolean | SchemaProperty
}

interface ApiEndpoint {
  method: string
  url: string
  description?: string
  parameters?: Array<{
    name: string
    in: 'query' | 'path' | 'header'
    required: boolean
    type: string
    description?: string
    schema?: SchemaProperty
  }>
  requestBody?: {
    description?: string
    required: boolean
    content: Record<string, {
      schema: SchemaProperty
    }>
  }
  responses: Record<string, {
    description?: string
    content: Record<string, {
      schema: SchemaProperty
    }>
  }>
  security?: Array<{
    type: string
    scheme: string
    description?: string
    name: string
    in: string
  }>
}

export function ResponseDocsTab({ response, requestInfo }: ResponseDocsTabProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showSchema, setShowSchema] = useState(false)
  const { toast } = useToast()

  const generateEndpointDocumentation = (): ApiEndpoint => {
    if (!requestInfo || !response) {
      return {
        method: 'GET',
        url: '/example',
        responses: {
          '200': {
            description: 'Success response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {}
                }
              }
            }
          }
      }
    }

    const method = requestInfo.method.toUpperCase()
    const url = new URL(requestInfo.url)
    const contentType = requestInfo.headers['content-type'] || response.headers['content-type'] || 'application/json'
    
    const endpoint: ApiEndpoint = {
      method: method,
      url: url.pathname + url.search,
      description: `Auto-generated documentation for ${method} ${url.pathname}`,
      parameters: [],
      responses: {
        [response.status.toString()]: {
          description: response.statusText || 'Response',
          content: {
            [contentType]: {
              schema: generateSchemaFromResponse(response.data)
            }
          }
        }
      }
    }

    // Extract query parameters
    url.searchParams.forEach((value, key) => {
      endpoint.parameters?.push({
        name: key,
        in: 'query',
        required: false,
        type: typeof value === 'string' ? 'string' : typeof value,
        description: `Query parameter: ${key}`
      })
    })

    return endpoint
  }

  const generateSchemaFromResponse = (data: any): SchemaProperty => {
    if (data === null) return { type: 'null', description: 'Null value' }
    if (data === undefined) return { type: 'undefined', description: 'Undefined value' }
    if (typeof data === 'string') return { type: 'string', description: 'String value' }
    if (typeof data === 'number') return { type: 'number', description: 'Numeric value' }
    if (typeof data === 'boolean') return { type: 'boolean', description: 'Boolean value' }
    if (Array.isArray(data)) {
      return {
        type: 'array',
        description: 'Array of items',
        items: data.length > 0 ? generateSchemaFromResponse(data[0]) : { type: 'string', description: 'Array item' }
      }
    }
    if (typeof data === 'object') {
      const properties: Record<string, SchemaProperty> = {}
      const required: string[] = []
      
      Object.entries(data).forEach(([key, value]) => {
        properties[key] = generateSchemaFromResponse(value)
        // Consider common required fields
        if (key.toLowerCase() !== 'id' && key.toLowerCase() !== 'name') {
          required.push(key)
        }
      })
      
      return {
        type: 'object',
        description: 'Object with properties',
        properties,
        required: required.length > 0 ? required : undefined
      }
    }
    
    return { type: 'any', description: 'Unknown type' }
  }

  const formatSchema = (schema: SchemaProperty, indent = 0): string => {
    const indentStr = '  '.repeat(indent)
    const nextIndentStr = '  '.repeat(indent + 1)
    
    let schemaText = `{\n${indentStr}$type: ${schema.type}`
    
    if (schema.description) {
      schemaText += `,\n${indentStr}description: "${schema.description}"`
    }
    
    if (schema.enum) {
      schemaText += `,\n${indentStr}enum: [${schema.enum.map(e => `"${e}"`).join(', ')}]`
    }
    
    if (schema.properties) {
      schemaText += `,\n${indentStr}properties: {\n`
      
      Object.entries(schema.properties).forEach(([key, prop], index, array) => {
        const isLast = index === array.length - 1
        schemaText += `${nextIndentStr}${key}: ${formatSchema(prop, indent + 1)}${isLast ? '' : ','}\n`
      })
      
      schemaText += `${indentStr}}`
    }
    
    if (schema.required) {
      schemaText += `,\n${indentStr}required: [${schema.required.map(r => `"${r}"`).join(', ')}]`
    }
    
    if (schema.items) {
      schemaText += `,\n${indentStr}items: ${formatSchema(schema.items, indent + 1)}`
    }
    
    if (schema.additionalProperties) {
      schemaText += `,\n${indentStr}additionalProperties: ${schema.additionalProperties}`
    }
    
    schemaText += `\n}`
    
    return schemaText
  }

  const copySchema = () => {
    const endpoint = generateEndpointDocumentation()
    const schema = formatSchema(endpoint.responses['200'].content['application/json'].schema)
    
    navigator.clipboard.writeText(schema)
    toast({
      title: 'Schema Copied',
      description: 'JSON schema copied to clipboard'
    })
  }

  const copyDocumentation = () => {
    const endpoint = generateEndpointDocumentation()
    const docs = {
      endpoint,
      response: response,
      request: requestInfo,
      generatedAt: new Date().toISOString()
    }
    
    const docsText = JSON.stringify(docs, null, 2)
    navigator.clipboard.writeText(docsText)
    
    toast({
      title: 'Documentation Copied',
      description: 'API documentation copied to clipboard'
    })
  }

  const downloadDocumentation = () => {
    const endpoint = generateEndpointDocumentation()
    const docs = {
      endpoint,
      response: response,
      request: requestInfo,
      generatedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(docs, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `api-docs-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Documentation Downloaded',
      description: 'API documentation saved to file'
    })
  }

  const copyAsMarkdown = () => {
    const endpoint = generateEndpointDocumentation()
    const markdown = generateMarkdownDocumentation(endpoint)
    
    navigator.clipboard.writeText(markdown)
    toast({
      title: 'Markdown Copied',
      description: 'API documentation copied as Markdown'
    })
  }

  const generateMarkdownDocumentation = (endpoint: ApiEndpoint): string => {
    let markdown = `# API Documentation\n\n`
    markdown += `## ${endpoint.method} ${endpoint.url}\n\n`
    
    if (endpoint.description) {
      markdown += `${endpoint.description}\n\n`
    }
    
    // Parameters
    if (endpoint.parameters && endpoint.parameters.length > 0) {
      markdown += `## Parameters\n\n`
      markdown += `| Name | Location | Type | Required | Description |\n`
      markdown += `|------|----------|------|----------|------------|\n`
      
      endpoint.parameters.forEach(param => {
        markdown += `| ${param.name} | ${param.in} | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.description || '-'} |\n`
      })
      
      markdown += `\n`
    }
    
    // Responses
    markdown += `## Responses\n\n`
    
    Object.entries(endpoint.responses).forEach(([statusCode, response]) => {
      markdown += `### ${statusCode} ${response.description}\n\n`
      
      Object.entries(response.content).forEach(([contentType, content]) => {
        markdown += `**Content-Type:** ${contentType}\n\n`
        markdown += `\`\`\`${formatSchema(content.schema)}\`\`\n\n`
      })
    })
    
    // Schema
    if (Object.keys(endpoint.responses).length > 0) {
      const firstResponse = Object.values(endpoint.responses)[0]
      const schema = Object.values(firstResponse.content)[0]?.schema
      
      if (schema) {
        markdown += `## Schema\n\n\`\`\`\n${formatSchema(schema)}\`\`\n`
      }
    }
    
    return markdown
  }

  const endpoint = generateEndpointDocumentation()
  const hasParameters = endpoint.parameters && endpoint.parameters.length > 0
  const hasRequestBody = endpoint.requestBody
  const hasSecurity = endpoint.security && endpoint.security.length > 0

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            API Documentation
          </h3>
          <Badge variant="outline" className="text-xs">
            Auto-generated
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowSchema(!showSchema)}>
            {showSchema ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            Schema
          </Button>
          <Button size="sm" variant="outline" onClick={copyAsMarkdown}>
            <FileText className="w-4 h-4 mr-2" />
            Markdown
          </Button>
          <Button size="sm" variant="outline" onClick={downloadDocumentation}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="schema" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Schema
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Examples
            </TabsTrigger>
            <TabsTrigger value="security" className="flexItem-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-4">
            <TabsContent value="overview" className="h-full mt-0">
              <ScrollArea className="h-full">
                <div className="space-y-6">
                  {/* Request Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Request Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Method</div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {endpoint.method}
                            </Badge>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {endpoint.url}
                            </code>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Content-Type</div>
                          <div className="text-sm">
                            {Object.keys(response.headers).find(key => key.toLowerCase() === 'content-type') ||
                             Object.keys(response.headers).find(key => key.toLowerCase() === 'content-type')}
                          </div>
                        </div>
                      </div>

                      {hasParameters && (
                        <>
                          <Separator />
                          <div>
                            <div className="text-sm font-medium text-muted-foreground mb-2">Parameters</div>
                            <div className="space-y-2">
                              {endpoint.parameters?.map((param, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <Badge variant="outline" className="text-xs">
                                    {param.in.toUpperCase()}
                                  </Badge>
                                  <span className="font-medium">{param.name}</span>
                                  <span className="text-muted-foreground">
                                    {param.type} {param.required && '• Required'}
                                  </span>
                                  {param.description && (
                                    <span className="text-muted-foreground ml-2">
                                      – {param.description}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {hasRequestBody && (
                        <>
                          <Separator />
                          <div>
                            <div className="text-sm font-medium text-muted-foreground mb-2">Request Body</div>
                            <div className="text-sm text-muted-foreground">
                              Request body content type is specified in the Content-Type header
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Response Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Response Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Status Code</div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={response.status >= 200 && response.status < 300 ? 'default' : 'destructive'}
                            >
                              {response.status}
                            </Badge>
                            <span className="text-sm">{response.statusText}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Response Time</div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{response.time}ms</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Content Length</div>
                          <div className="text-sm">{response.size} bytes</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Response Type</div>
                          <div className="text-sm">{getContentType()}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Example Response */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Example Response</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-xs">
                            <code>{JSON.stringify(response.data, null, 2)}</code>
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="schema" className="h-full mt-0">
              <ScrollArea className="h-full px-4">
                {showSchema && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">JSON Schema</h4>
                        <Button size="sm" variant="outline" onClick={copySchema}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                      
                      <Card>
                        <CardContent className="p-4">
                          <pre className="text-xs bg-muted/50 p-4 rounded-lg overflow-x-auto">
                            <code>{formatSchema(endpoint.responses['200'].content['application/json'].schema)}</code>
                          </pre>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

            <TabsContent value="examples" className="h-full mt-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">cURL Example</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-xs">
                        <code>{generateCurlExample()}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">JavaScript Example</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-xs">
                        <code>{generateJavaScriptExample()}</code>
                      </pre>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Python Example</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-xs">
                        <code>{generatePythonExample()}</code>
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="security" className="h-full mt-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-6">
                  {hasSecurity ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Security Requirements
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {endpoint.security?.map((security, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{security.type.toUpperCase()}</Badge>
                              <Badge variant="outline">{security.scheme}</Badge>
                            </div>
                            {security.name && (
                              <div className="text-sm text-muted-foreground">
                                Name: {security.name}
                              </div>
                            )}
                            {security.description && (
                              <div className="text-sm text-muted-foreground">
                                {security.description}
                              </div>
                            )}
                            {security.in && (
                              <div className="text-sm text-muted-foreground">
                                Location: {security.in}
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h4 className="text-lg font-semibold mb-2">No Security Requirements</h4>
                        <p className="text-sm text-muted-600">
                          This endpoint does not require authentication.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Security Best Practices</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>Always use HTTPS for production APIs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>Implement proper authentication if required</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>Validate and sanitize all inputs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        <span>Be careful with sensitive data exposure</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </div>
      </div>
    </div>
  )
}

function getContentType() {
  // This would extract content type from response headers
  return 'application/json' // Placeholder
}

function generateCurlExample(): string {
  const method = 'GET' // Would come from requestInfo
  const url = 'https://api.example.com/endpoint'
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  }
  
  let curlCommand = `curl -X ${method} "${url}"`
  
  Object.entries(headers).forEach(([key, value]) => {
    curlCommand += ` \\\n  -H "${key}: ${value}"`
  })
  
  return curlCommand
}

function generateJavaScriptExample(): string {
  const method = 'GET' // Would come from requestInfo
  const url = 'https://api.example.com/endpoint'
  
  return `const axios = require('axios');

const config = {
  method: '${method.toLowerCase()}',
  url: '${url}',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  }
};

axios(config)
  .then(function (response) {
  console.log(JSON.stringify(response.data, null, 2));
})
  .catch(function (error) {
  console.error(error);
});
`
}

function generatePythonExample(): string {
  const method = 'GET' // Would come from requestInfo
  const url = 'https://api.example.com/endpoint'
  
  return `import requests

url = "${url}"
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
}

response = requests.${method.toLowerCase()}(url, headers=headers)

print(response.json())
`
}
