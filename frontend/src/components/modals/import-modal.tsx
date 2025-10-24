import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Upload, 
  Link, 
  FileText, 
  Code, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Globe,
  Loader2
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface ImportResult {
  success: boolean
  message: string
  data?: any
  warnings?: string[]
  importedCount?: number
}

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (data: any) => void
}

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [importMethod, setImportMethod] = React.useState<'file' | 'url'>('file')
  const [importType, setImportType] = React.useState<'postman' | 'openapi' | 'curl'>('postman')
  const [importUrl, setImportUrl] = React.useState('')
  const [isImporting, setIsImporting] = React.useState(false)
  const [importProgress, setImportProgress] = React.useState(0)
  const [importResult, setImportResult] = React.useState<ImportResult | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
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
    } catch (error: any) {
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
    } catch (error: any) {
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
      const parsed = JSON.parse(content)
      
      // Validate Postman schema
      if (!parsed.info || !parsed.info.name) {
        throw new Error('Invalid Postman collection format')
      }

      const collections = parsed.item || []
      const environments = parsed.variable || []

      // Mock parsing logic - in real implementation, this would be more sophisticated
      const mockData = {
        type: 'postman',
        name: parsed.info.name,
        description: parsed.info.description,
        collections: collections.map((item: any) => ({
          id: `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: item.name,
          description: item.description,
          endpoints: item.item ? item.item.filter((subItem: any) => subItem.request).map((endpoint: any) => ({
            id: `endpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: endpoint.name || item.name,
            method: endpoint.request?.method || 'GET',
            url: endpoint.request?.url?.raw || '',
            headers: endpoint.request?.header?.reduce((acc: any, header: any) => {
              if (header.key && header.value && !header.disabled) {
                acc[header.key] = header.value
              }
              return acc
            }, {}) || {},
            body: endpoint.request?.body?.raw || '',
            description: endpoint.request?.description
          })) : []
        })) : []
      }))
      
      return {
        success: true,
        message: `Imported "${parsed.info.name}" with ${collections.length} collections`,
        data: mockData,
        importedCount: collections.length
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to parse Postman collection: ${error.message}`
      }
    }
  }

  const importOpenAPISpec = async (content: string): Promise<ImportResult> => {
    try {
      const parsed = JSON.parse(content)
      
      // Validate OpenAPI schema
      if (!parsed.openapi && !parsed.swagger) {
        throw new Error('Invalid OpenAPI/Swagger specification')
      }

      const paths = parsed.paths || {}
      const info = parsed.info || {}

      // Mock parsing logic for OpenAPI
      const endpoints = Object.entries(paths).flatMap(([path, pathItem]: [string, any]) => {
        return Object.entries(pathItem).map(([method, operation]: [string, any]) => ({
          id: `endpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`,
          method: method.toUpperCase(),
          url: path,
          description: operation.description,
          headers: operation.parameters?.filter((p: any) => p.in === 'header').reduce((acc: any, p: any) => {
            acc[p.name] = p.schema?.example || ''
            return acc
          }, {}) || {},
          body: operation.requestBody?.content?.['application/json']?.schema?.example || '',
          tags: operation.tags || []
        }))
      })
      
      return {
        success: true,
        message: `Imported OpenAPI spec "${info.title || 'API'}" with ${endpoints.length} endpoints`,
        data: {
          type: 'openapi',
          name: info.title || 'API',
          description: info.description,
          version: info.version,
          endpoints
        },
        importedCount: endpoints.length
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to parse OpenAPI spec: ${error.message}`
      }
    }
  }

  const importCurlCommand = async (content: string): Promise<ImportResult> => {
    try {
      // Simple cURL parsing - in real implementation, this would be more sophisticated
      const methodMatch = content.match(/-X\s+([A-Z]+)/i)
      const urlMatch = content.match(/'([^']+)'| "([^"]+)"|([^\s]+)\s+/)
      
      if (!methodMatch || !urlMatch) {
        throw new Error('Invalid cURL command format')
      }

      const method = methodMatch[1].toUpperCase()
      const url = urlMatch[1] || urlMatch[2] || urlMatch[3]

      // Extract headers (simplified)
      const headerMatches = content.match(/-H\s+['"]([^'"]+)['"]:?\s*['"]([^'"]*)['"]?/gi)
      const headers: Record<string, string> = {}
      if (headerMatches) {
        headerMatches.forEach((match: any) => {
          const [, key, value] = match.split(/:\s*['"]([^'"]*)['"]?/)
          if (key && value) {
            headers[key] = value
          }
        })
      }

      // Extract body (simplified)
      let body = ''
      const bodyMatch = content.match(/-d\s+['"]([^'"]*)['"]/i)
      if (bodyMatch) {
        body = bodyMatch[1]
      }

      return {
        success: true,
        message: `Parsed cURL command: ${method} ${url}`,
        data: {
          type: 'curl',
          method,
          url,
          headers,
          body
        }
      }
    } catch (error: any) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import API Collection
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
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

            <div className="mt-4">
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
            </div>
          </Tabs>

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
                  
                  {importResult.importedCount && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Imported:</span> {importResult.importedCount} items
                    </div>
                  )}
                  
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

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
