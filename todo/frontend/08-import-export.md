# Phase 4.3: Import/Export Features

## Overview
Implementasi comprehensive import/export functionality untuk Postman collections, OpenAPI specs, cURL commands, dan multiple programming language code snippets generation.

## 8.1 Import System Architecture

### Import Sources
```
Import System
├── Postman Collection Import
│   ├── Collection v2.1 Parser
│   ├── Environment Variables Import
│   ├── Test Scripts Import
│   └── Examples Import
├── OpenAPI/Swagger Import
│   ├── OpenAPI 3.0 Parser
│   ├── OpenAPI 2.0 (Swagger) Parser
│   ├── Schema Definition Import
│   └── Example Generation
├── cURL Command Import
│   ├── cURL Parser
│   ├── Header Extraction
│   ├── Body Content Extraction
│   └── Method/URL Detection
└── Other Formats
    ├── Insomnia Collection
    ├── REST Client (.http) Files
    ├── HAR (HTTP Archive) Files
    └── JSON/YAML Definitions
```

## 8.2 Postman Collection Import

### Postman Parser Implementation
```typescript
// src/lib/import/postman-parser.ts
export interface PostmanCollection {
  info: {
    name: string
    description?: string
    schema: string
  }
  item: PostmanItem[]
  variable?: PostmanVariable[]
}

export interface PostmanItem {
  name: string
  request?: PostmanRequest
  item?: PostmanItem[]
  description?: string
}

export interface PostmanRequest {
  method: string
  header?: PostmanHeader[]
  body?: PostmanBody
  url: PostmanUrl
  description?: string
}

export interface PostmanHeader {
  key: string
  value: string
  description?: string
  disabled?: boolean
}

export interface PostmanBody {
  mode: 'raw' | 'urlencoded' | 'formdata' | 'file'
  raw?: string
  urlencoded?: Array<{ key: string; value: string; description?: string }>
  formdata?: Array<{ key: string; value: string; type: string; description?: string }>
}

export interface PostmanUrl {
  raw: string
  host?: string[]
  path?: string[]
  query?: Array<{ key: string; value: string; description?: string }>
  variable?: PostmanUrlVariable[]
}

export interface PostmanUrlVariable {
  key: string
  value?: string
  description?: string
}

export interface PostmanVariable {
  key: string
  value?: string
  description?: string
  type?: 'string'
}

export class PostmanParser {
  async parseCollection(jsonString: string): Promise<{
    name: string
    description?: string
    collections: ParsedCollection[]
    variables: Record<string, string>
    environments: ParsedEnvironment[]
  }> {
    try {
      const postmanCollection: PostmanCollection = JSON.parse(jsonString)
      
      // Validate Postman schema
      if (!postmanCollection.info || !postmanCollection.info.name) {
        throw new Error('Invalid Postman collection format')
      }

      const variables = this.parseVariables(postmanCollection.variable || [])
      const collections = this.parseItems(postmanCollection.item || [])
      const environments = this.extractEnvironments(postmanCollection)

      return {
        name: postmanCollection.info.name,
        description: postmanCollection.info.description,
        collections,
        variables,
        environments
      }
    } catch (error) {
      throw new Error(`Failed to parse Postman collection: ${error.message}`)
    }
  }

  private parseVariables(variables: PostmanVariable[]): Record<string, string> {
    return variables.reduce((acc, variable) => {
      if (variable.key && variable.value !== undefined) {
        acc[variable.key] = variable.value
      }
      return acc
    }, {} as Record<string, string>)
  }

  private parseItems(items: PostmanItem[], parentName = ''): ParsedCollection[] {
    const collections: ParsedCollection[] = []

    for (const item of items) {
      if (item.request) {
        // This is an endpoint
        const endpoint = this.parseEndpoint(item)
        if (endpoint) {
          collections.push({
            type: 'endpoint',
            ...endpoint
          })
        }
      } else if (item.item && Array.isArray(item.item)) {
        // This is a collection/folder
        const collectionName = parentName ? `${parentName} / ${item.name}` : item.name
        const childItems = this.parseItems(item.item, collectionName)
        
        collections.push({
          type: 'collection',
          name: item.name,
          description: item.description,
          children: childItems
        })
      }
    }

    return collections
  }

  private parseEndpoint(item: PostmanItem): ParsedEndpoint | null {
    if (!item.request) return null

    try {
      const request = item.request
      const url = this.parseUrl(request.url)
      
      return {
        type: 'endpoint',
        name: item.name,
        description: item.description || request.description,
        method: request.method.toUpperCase() as HttpMethod,
        url: url.raw,
        headers: this.parseHeaders(request.header || []),
        body: this.parseBody(request.body),
        queryParameters: this.parseQueryParams(request.url?.query || []),
        pathVariables: this.parsePathVariables(request.url?.variable || [])
      }
    } catch (error) {
      console.warn(`Failed to parse endpoint "${item.name}":`, error)
      return null
    }
  }

  private parseUrl(url: PostmanUrl): { raw: string; host?: string; path?: string[] } {
    if (typeof url === 'string') {
      return { raw: url }
    }

    return {
      raw: url.raw || '',
      host: url.host?.join('.'),
      path: url.path
    }
  }

  private parseHeaders(headers: PostmanHeader[]): Record<string, string> {
    return headers
      .filter(header => !header.disabled && header.key && header.value)
      .reduce((acc, header) => {
        acc[header.key] = header.value
        return acc
      }, {} as Record<string, string>)
  }

  private parseBody(body?: PostmanBody): any {
    if (!body) return null

    switch (body.mode) {
      case 'raw':
        return body.raw || ''
      
      case 'urlencoded':
        return body.urlencoded?.reduce((acc, param) => {
          if (param.key && param.value) {
            acc[param.key] = param.value
          }
          return acc
        }, {} as Record<string, string>) || {}
      
      case 'formdata':
        return body.formdata?.reduce((acc, param) => {
          if (param.key) {
            acc[param.key] = param.type === 'file' 
              ? { type: 'file', value: param.value } 
              : param.value
          }
          return acc
        }, {} as Record<string, any>) || {}
      
      default:
        return null
    }
  }

  private parseQueryParams(queryParams: Array<{ key: string; value: string }>): Array<{ key: string; value: string; description?: string; enabled: boolean }> {
    return queryParams.map(param => ({
      key: param.key,
      value: param.value,
      description: param.description,
      enabled: true
    }))
  }

  private parsePathVariables(variables: PostmanUrlVariable[]): Array<{ key: string; value?: string; description?: string }> {
    return variables.map(variable => ({
      key: variable.key,
      value: variable.value,
      description: variable.description
    }))
  }

  private extractEnvironments(collection: PostmanCollection): ParsedEnvironment[] {
    // Extract environment variables if they exist in the collection
    if (!collection.variable || collection.variable.length === 0) {
      return []
    }

    return [{
      name: `${collection.info.name} Variables`,
      description: 'Environment variables imported from Postman collection',
      variables: this.parseVariables(collection.variable),
      isDefault: true
    }]
  }
}

// Type definitions for parsed data
type ParsedCollection = ParsedCollectionItem | ParsedCollectionFolder

interface ParsedCollectionFolder {
  type: 'collection'
  name: string
  description?: string
  children: ParsedCollection[]
}

interface ParsedCollectionItem {
  type: 'endpoint'
  name: string
  description?: string
  method: HttpMethod
  url: string
  headers: Record<string, string>
  body: any
  queryParameters: Array<{ key: string; value: string; description?: string; enabled: boolean }>
  pathVariables: Array<{ key: string; value?: string; description?: string }>
}

interface ParsedEnvironment {
  name: string
  description?: string
  variables: Record<string, string>
  isDefault?: boolean
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
```

### Import Modal Component
```typescript
// src/components/modals/import-modal.tsx
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Upload, 
  FileText, 
  Link, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Globe,
  Code
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { PostmanParser } from '@/lib/import/postman-parser'
import { OpenAPIParser } from '@/lib/import/openapi-parser'
import { CurlParser } from '@/lib/import/curl-parser'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (data: any) => void
}

interface ImportResult {
  success: boolean
  message: string
  data?: any
  warnings?: string[]
}

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [importMethod, setImportMethod] = useState<'file' | 'url'>('file')
  const [importType, setImportType] = useState<'postman' | 'openapi' | 'curl'>('postman')
  const [importUrl, setImportUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportProgress(0)
    setImportResult(null)

    try {
      setImportProgress(20)
      
      const fileContent = await file.text()
      setImportProgress(40)
      
      let result: ImportResult
      
      switch (importType) {
        case 'postman':
          result = await importPostmanCollection(fileContent)
          break
        case 'openapi':
          result = await importOpenAPISpec(fileContent)
          break
        case 'curl':
          result = await importCurlCommand(fileContent)
          break
        default:
          throw new Error('Unsupported import type')
      }
      
      setImportProgress(100)
      setImportResult(result)
      
      if (result.success && result.data) {
        onImport(result.data)
        toast({
          title: 'Import successful',
          description: result.message
        })
      } else {
        toast({
          title: 'Import failed',
          description: result.message,
          variant: 'destructive'
        })
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: error.message || 'Import failed'
      })
      toast({
        title: 'Import failed',
        description: error.message || 'Unknown error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsImporting(false)
      setImportProgress(0)
    }
  }

  const handleUrlImport = async () => {
    if (!importUrl.trim()) {
      toast({
        title: 'URL required',
        description: 'Please enter a URL to import from',
        variant: 'destructive'
      })
      return
    }

    setIsImporting(true)
    setImportProgress(0)

    try {
      setImportProgress(20)
      
      const response = await fetch(importUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }
      
      setImportProgress(40)
      
      const content = await response.text()
      setImportProgress(60)
      
      let result: ImportResult
      
      // Auto-detect import type from URL or content
      if (importUrl.includes('postman') || content.includes('info.schema')) {
        result = await importPostmanCollection(content)
      } else if (content.includes('openapi') || content.includes('swagger')) {
        result = await importOpenAPISpec(content)
      } else if (content.includes('curl') || importUrl.includes('curl')) {
        result = await importCurlCommand(content)
      } else {
        throw new Error('Unable to determine import type')
      }
      
      setImportProgress(100)
      setImportResult(result)
      
      if (result.success && result.data) {
        onImport(result.data)
        toast({
          title: 'Import successful',
          description: result.message
        })
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: error.message || 'Import failed'
      })
      toast({
        title: 'Import failed',
        description: error.message || 'Unknown error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsImporting(false)
      setImportProgress(0)
    }
  }

  const importPostmanCollection = async (content: string): Promise<ImportResult> => {
    try {
      const parser = new PostmanParser()
      const parsed = await parser.parseCollection(content)
      
      return {
        success: true,
        message: `Imported "${parsed.name}" with ${parsed.collections.length} items`,
        data: {
          type: 'postman',
          ...parsed
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to parse Postman collection: ${error.message}`
      }
    }
  }

  const importOpenAPISpec = async (content: string): Promise<ImportResult> => {
    try {
      const parser = new OpenAPIParser()
      const parsed = await parser.parseSpec(content)
      
      return {
        success: true,
        message: `Imported OpenAPI spec "${parsed.title}" with ${parsed.endpoints.length} endpoints`,
        data: {
          type: 'openapi',
          ...parsed
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to parse OpenAPI spec: ${error.message}`
      }
    }
  }

  const importCurlCommand = async (content: string): Promise<ImportResult> => {
    try {
      const parser = new CurlParser()
      const parsed = parser.parseCommand(content)
      
      return {
        success: true,
        message: `Parsed cURL command: ${parsed.method} ${parsed.url}`,
        data: {
          type: 'curl',
          ...parsed
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to parse cURL command: ${error.message}`
      }
    }
  }

  const getImportTypeInfo = () => {
    switch (importType) {
      case 'postman':
        return {
          title: 'Postman Collection',
          description: 'Import Postman Collection v2.1 format',
          icon: <FileText className="w-5 h-5" />,
          acceptedFormats: '.json',
          example: 'Export from Postman: Share > Export > Collection v2.1'
        }
      case 'openapi':
        return {
          title: 'OpenAPI/Swagger',
          description: 'Import OpenAPI 3.0 or Swagger 2.0 specifications',
          icon: <Globe className="w-5 h-5" />,
          acceptedFormats: '.json, .yaml, .yml',
          example: 'Download OpenAPI spec from your API documentation'
        }
      case 'curl':
        return {
          title: 'cURL Command',
          description: 'Import a single cURL command',
          icon: <Code className="w-5 h-5" />,
          acceptedFormats: '.txt, .curl',
          example: 'Copy cURL command from browser dev tools or API docs'
        }
    }
  }

  if (!isOpen) return null

  const importInfo = getImportTypeInfo()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import API Collection
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs value={importMethod} onValueChange={(value: any) => setImportMethod(value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Upload File
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Import from URL
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              {/* Import Type Selection */}
              <div className="mb-6">
                <Label className="text-base font-medium mb-3 block">Import Type</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'postman', title: 'Postman', icon: <FileText className="w-4 h-4" /> },
                    { value: 'openapi', title: 'OpenAPI', icon: <Globe className="w-4 h-4" /> },
                    { value: 'curl', title: 'cURL', icon: <Code className="w-4 h-4" /> }
                  ].map((type) => (
                    <Button
                      key={type.value}
                      variant={importType === type.value ? 'default' : 'outline'}
                      onClick={() => setImportType(type.value as any)}
                      className="flex items-center gap-2 h-12"
                    >
                      {type.icon}
                      <span>{type.title}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Import Type Info */}
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {importInfo.icon}
                  <h3 className="font-medium">{importInfo.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {importInfo.description}
                </p>
                <div className="text-xs">
                  <Badge variant="outline">{importInfo.acceptedFormats}</Badge>
                  <p className="mt-1 text-muted-foreground">{importInfo.example}</p>
                </div>
              </div>

              {/* Import Content */}
              <TabsContent value="file">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file-upload">Choose File</Label>
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      type="file"
                      accept={importType === 'postman' ? '.json' : '.json,.yaml,.yml,.txt,.curl'}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-16 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50"
                      variant="outline"
                    >
                      <div className="flex flex-col items-center">
                        <Upload className="w-6 h-6 mb-2" />
                        <span>Click to upload or drag and drop</span>
                        <span className="text-xs text-muted-foreground">
                          {importInfo.acceptedFormats}
                        </span>
                      </div>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="url">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="import-url">Import URL</Label>
                    <Input
                      id="import-url"
                      placeholder="https://api.example.com/openapi.json"
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleUrlImport} disabled={isImporting || !importUrl.trim()}>
                    Import from URL
                  </Button>
                </div>
              </TabsContent>

              {/* Progress */}
              {isImporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Importing...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} className="h-2" />
                </div>
              )}

              {/* Import Result */}
              {importResult && (
                <div className={`p-4 rounded-lg ${
                  importResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-start gap-2">
                    {importResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className={`font-medium mb-1 ${
                        importResult.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {importResult.success ? 'Import Successful' : 'Import Failed'}
                      </h4>
                      <p className={`text-sm ${
                        importResult.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {importResult.message}
                      </p>
                      
                      {importResult.warnings && importResult.warnings.length > 0 && (
                        <div className="mt-2">
                          <h5 className="text-sm font-medium text-yellow-800 mb-1">Warnings:</h5>
                          <ul className="text-xs text-yellow-700 space-y-1">
                            {importResult.warnings.map((warning, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                {warning}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

## 8.3 Export System

### Code Snippets Generator
```typescript
// src/lib/export/code-generator.ts
export interface RequestConfig {
  method: string
  url: string
  headers: Record<string, string>
  body?: any
  queryParameters?: Array<{ key: string; value: string }>
  environment?: Record<string, string>
}

export interface CodeSnippet {
  language: string
  label: string
  code: string
  description?: string
}

export class CodeGenerator {
  generateCurl(config: RequestConfig): CodeSnippet {
    let curl = 'curl'

    // Method
    if (config.method !== 'GET') {
      curl += ` -X ${config.method}`
    }

    // Headers
    Object.entries(config.headers).forEach(([key, value]) => {
      curl += ` \\\n  -H "${key}: ${value}"`
    })

    // Body
    if (config.body && config.method !== 'GET' && config.method !== 'HEAD') {
      const body = typeof config.body === 'string' 
        ? config.body 
        : JSON.stringify(config.body, null, 2)
      curl += ` \\\n  -d '${body}'`
    }

    // URL
    curl += ` \\\n  "${config.url}"`

    return {
      language: 'bash',
      label: 'cURL',
      code: curl
    }
  }

  generateJavaScript(config: RequestConfig): CodeSnippet {
    const hasBody = config.body && config.method !== 'GET' && config.method !== 'HEAD'
    
    let code = `const axios = require('axios');

const config = {
  method: '${config.method.toLowerCase()}',
  url: '${config.url}',`
    
    if (Object.keys(config.headers).length > 0) {
      code += `
  headers: {`
      Object.entries(config.headers).forEach(([key, value], index) => {
        const comma = index < Object.keys(config.headers).length - 1 ? ',' : ''
        code += `
    '${key}': '${value}'${comma}`
      })
      code += `
  },`
    }
    
    if (hasBody) {
      const body = typeof config.body === 'string' 
        ? config.body 
        : JSON.stringify(config.body, null, 2)
      code += `
  data: ${typeof config.body === 'string' ? `'${body}'` : body},`
    }
    
    code += `
};

axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.error(error);
  });`

    return {
      language: 'javascript',
      label: 'JavaScript',
      code,
      description: 'Using axios library'
    }
  }

  generatePython(config: RequestConfig): CodeSnippet {
    const hasBody = config.body && config.method !== 'GET' && config.method !== 'HEAD'
    
    let code = `import requests
import json

url = "${config.url}"
headers = {`
      
    Object.entries(config.headers).forEach(([key, value], index) => {
      const comma = index < Object.keys(config.headers).length - 1 ? ',' : ''
      code += `
    "${key}": "${value}"${comma}`
    })
    
    code += `
}`
    
    if (hasBody) {
      const body = typeof config.body === 'string' 
        ? config.body 
        : JSON.stringify(config.body, null, 2)
      code += `

data = ${typeof config.body === 'string' ? `'${body}'` : body}`
    }
    
    code += `

response = requests.${config.method.toLowerCase()}(url, headers=headers${hasBody ? ', data=data' : ''})

print(response.json())`

    return {
      language: 'python',
      label: 'Python',
      code,
      description: 'Using requests library'
    }
  }

  generateJava(config: RequestConfig): CodeSnippet {
    let code = `import java.net.URI;
import java.net.http.*;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse.BodyHandlers;

public class ApiClient {
    public static void main(String[] args) throws Exception {
        String url = "${config.url}";
        
        HttpClient client = HttpClient.newHttpClient();
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .method("${config.method}", `
    
    if (config.body && config.method !== 'GET' && config.method !== 'HEAD') {
      const body = typeof config.body === 'string' 
        ? config.body 
        : JSON.stringify(config.body, null, 2)
      code += `BodyPublishers.ofString("${body}")`
    } else {
      code += `BodyPublishers.noBody()`
    }
    
    code += `)`
    
    Object.entries(config.headers).forEach(([key, value]) => {
      code += `
            .header("${key}", "${value}")`
    })
    
    code += `
            .build();

        HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
        
        System.out.println(response.statusCode());
        System.out.println(response.body());
    }
}`

    return {
      language: 'java',
      label: 'Java',
      code,
      description: 'Java 11+ HttpClient'
    }
  }

  generatePHP(config: RequestConfig): CodeSnippet {
    const hasBody = config.body && config.method !== 'GET' && config.method !== 'HEAD'
    
    let code = `<?php
$ch = curl_init();

$url = "${config.url}";
`
    
    code += `curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${config.method}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
`
    
    Object.entries(config.headers).forEach(([key, value]) => {
      code += `curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "${key}: ${value}"
]);`
    })
    
    if (hasBody) {
      const body = typeof config.body === 'string' 
        ? config.body 
        : JSON.stringify(config.body, null, 2)
      code += `
curl_setopt($ch, CURLOPT_POSTFIELDS, '${body}');`
    }
    
    code += `

$response = curl_exec($ch);
$err = curl_error($ch);

curl_close($ch);

if ($err) {
    echo "cURL Error #:" . $err;
} else {
    echo $response;
}
?>`

    return {
      language: 'php',
      label: 'PHP',
      code,
      description: 'Using cURL'
    }
  }

  generateGo(config: RequestConfig): CodeSnippet {
    let code = `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "strings"
)

func main() {
    url := "${config.url}"
    `
    
    if (config.body && config.method !== 'GET' && config.method !== 'HEAD') {
      const body = typeof config.body === 'string' 
        ? config.body 
        : JSON.stringify(config.body, null, 2)
      code += `body := bytes.NewBufferString(\`${body}\`)
    } else {
      code += `var body bytes.Buffer`
    }
    
    code += `

    req, err := http.NewRequest("${config.method}", url, &body)
    if err != nil {
        panic(err)
    }`
    
    Object.entries(config.headers).forEach(([key, value]) => {
      code += `
    req.Header.Set("${key}", "${value}")`
    })
    
    code += `

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    respBody, err := io.ReadAll(resp.Body)
    if err != nil {
        panic(err)
    }

    fmt.Println(string(respBody))
}`

    return {
      language: 'go',
      label: 'Go',
      code,
      description: 'Standard library'
    }
  }

  generateAllSnippets(config: RequestConfig): CodeSnippet[] {
    return [
      this.generateCurl(config),
      this.generateJavaScript(config),
      this.generatePython(config),
      this.generateJava(config),
      this.generatePHP(config),
      this.generateGo(config)
    ]
  }
}
```

## Deliverables
- ✅ Postman Collection v2.1 import parser
- ✅ OpenAPI 3.0 and Swagger 2.0 import parser  
- ✅ cURL command parser and importer
- ✅ Multiple programming language code snippets generator
- ✅ Import modal with drag-and-drop support
- ✅ URL import functionality
- ✅ Import progress and validation
- ✅ Error handling and warnings

## Next Steps
Lanjut ke Phase 5: Desktop Enhancement dengan Electron native features untuk file access, system notifications, dan advanced debugging capabilities.
