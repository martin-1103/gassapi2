import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Copy, 
  Trash2, 
  Plus, 
  MoreHorizontal,
  BookOpen,
  Download,
  Upload,
  Settings,
  Zap
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

interface RequestHeader {
  id: string
  key: string
  value: string
  enabled: boolean
  description?: string
}

interface EnhancedHeadersTabProps {
  headers: RequestHeader[]
  onChange: (headers: RequestHeader[]) => void
}

// Common headers templates
const COMMON_HEADERS = [
  { key: 'Content-Type', value: 'application/json', description: 'Media type of the request body' },
  { key: 'Accept', value: 'application/json', description: 'Media types yang dapat diterima' },
  { key: 'Authorization', value: 'Bearer {{token}}', description: 'Authentication credentials' },
  { key: 'User-Agent', value: 'GASS-API/1.0', description: 'Client identification' },
  { key: 'Cache-Control', value: 'no-cache', description: 'Cache directives' },
  { key: 'X-Requested-With', value: 'XMLHttpRequest', description: 'AJAX request identifier' },
  { key: 'X-API-Key', value: '{{api_key}}', description: 'API key authentication' },
  { key: 'X-Client-Version', value: '1.0.0', description: 'Client version' },
  { key: 'X-Request-ID', value: '{{request_id}}', description: 'Unique request identifier' },
  { key: 'X-Forwarded-For', value: '{{client_ip}}', description: 'Client IP address' }
]

// Header presets untuk berbagai API types
const HEADER_PRESETS = {
  'REST API': [
    { key: 'Content-Type', value: 'application/json' },
    { key: 'Accept', value: 'application/json' }
  ],
  'GraphQL': [
    { key: 'Content-Type', value: 'application/json' },
    { key: 'Accept', value: 'application/json' }
  ],
  'Form Submit': [
    { key: 'Content-Type', value: 'application/x-www-form-urlencoded' }
  ],
  'File Upload': [
    { key: 'Content-Type', value: 'multipart/form-data' }
  ],
  'WebSocket': [
    { key: 'Connection', value: 'Upgrade' },
    { key: 'Upgrade', value: 'websocket' },
    { key: 'Sec-WebSocket-Key', value: '{{websocket_key}}' }
  ]
}

export default function EnhancedHeadersTab({ headers, onChange }: EnhancedHeadersTabProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const { toast } = useToast()

  const addHeader = () => {
    const newHeader: RequestHeader = {
      id: Date.now().toString(),
      key: '',
      value: '',
      enabled: true
    }
    onChange([...headers, newHeader])
  }

  const updateHeader = (id: string, updates: Partial<RequestHeader>) => {
    onChange(headers.map(header => 
      header.id === id ? { ...header, ...updates } : header
    ))
  }

  const deleteHeader = (id: string) => {
    onChange(headers.filter(header => header.id !== id))
  }

  const duplicateHeader = (header: RequestHeader) => {
    const duplicated: RequestHeader = {
      ...header,
      id: Date.now().toString(),
      key: `${header.key}_copy`
    }
    onChange([...headers, duplicated])
  }

  const addCommonHeader = (template: typeof COMMON_HEADERS[0]) => {
    const newHeader: RequestHeader = {
      id: Date.now().toString(),
      key: template.key,
      value: template.value,
      enabled: true,
      description: template.description
    }
    onChange([...headers, newHeader])
  }

  const addPreset = (presetName: string) => {
    const preset = HEADER_PRESETS[presetName as keyof typeof HEADER_PRESETS]
    if (preset) {
      const newHeaders = preset.map(header => ({
        ...header,
        id: Date.now().toString() + Math.random(),
        enabled: true
      }))
      onChange([...headers, ...newHeaders])
      toast({
        title: 'Preset Added',
        description: `Added ${preset.length} headers from ${presetName} preset`
      })
    }
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
    toast({
      title: 'Headers Copied',
      description: 'Headers copied to clipboard'
    })
  }

  const exportHeaders = () => {
    const headersObj = getHeadersObject()
    const headersJson = JSON.stringify(headersObj, null, 2)
    
    const blob = new Blob([headersJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `headers_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Headers Exported',
      description: 'Headers saved to file'
    })
  }

  const importHeaders = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      try {
        const text = await file.text()
        const importedHeaders = JSON.parse(text)
        
        const newHeaders: RequestHeader[] = Object.entries(importedHeaders).map(([key, value], index) => ({
          id: Date.now().toString() + index,
          key,
          value: String(value),
          enabled: true
        }))
        
        onChange([...headers, ...newHeaders])
        toast({
          title: 'Headers Imported',
          description: `Imported ${newHeaders.length} headers from file`
        })
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

  const parseCurlHeaders = () => {
    const curlCommand = prompt('Paste cURL command to extract headers:')
    if (!curlCommand) return
    
    try {
      const headerRegex = /-H\s+['"`]([^'"`]+):\s*([^'"`]+)['"`]/g
      const matches = [...curlCommand.matchAll(headerRegex)]
      
      if (matches.length === 0) {
        toast({
          title: 'No Headers Found',
          description: 'Could not find headers in cURL command',
          variant: 'destructive'
        })
        return
      }
      
      const newHeaders: RequestHeader[] = matches.map((match, index) => ({
        id: Date.now().toString() + index,
        key: match[1].trim(),
        value: match[2].trim(),
        enabled: true
      }))
      
      onChange([...headers, ...newHeaders])
      toast({
        title: 'Headers Imported',
        description: `Imported ${newHeaders.length} headers from cURL command`
      })
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: 'Failed to parse cURL command',
        variant: 'destructive'
      })
    }
  }

  const bulkEdit = () => {
    const headersObj = getHeadersObject()
    const bulkText = JSON.stringify(headersObj, null, 2)
    
    const editText = prompt('Edit headers in JSON format:', bulkText)
    
    if (editText !== null) {
      try {
        const editedHeaders = JSON.parse(editText)
        const newHeaders: RequestHeader[] = Object.entries(editedHeaders).map(([key, value], index) => ({
          id: Date.now().toString() + index,
          key,
          value: String(value),
          enabled: true
        }))
        
        onChange(newHeaders)
        toast({
          title: 'Bulk Edit Success',
          description: `Updated ${newHeaders.length} headers`
        })
      } catch (error) {
        toast({
          title: 'Bulk Edit Failed',
          description: 'Invalid JSON format',
          variant: 'destructive'
        })
      }
    }
  }

  const enabledCount = headers.filter(header => header.enabled).length
  const totalCount = headers.length

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">Headers</h3>
          <Badge variant="outline">
            {enabledCount}/{totalCount} active
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={parseCurlHeaders}>
            <Download className="w-4 h-4 mr-2" />
            Import cURL
          </Button>
          <Button size="sm" variant="outline" onClick={importHeaders}>
            <Upload className="w-4 h-4 mr-2" />
            Import File
          </Button>
          <Button size="sm" variant="outline" onClick={bulkEdit}>
            <Settings className="w-4 h-4 mr-2" />
            Bulk Edit
          </Button>
          <Button size="sm" variant="outline" onClick={copyHeaders}>
            <Copy className="w-4 h-4 mr-2" />
            Copy All
          </Button>
          <Button size="sm" onClick={addHeader}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 mt-4">
          <TabsContent value="basic" className="h-full mt-0">
            {/* Headers Table */}
            <div className="px-4">
              <div className="border rounded-lg overflow-hidden">
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
                          <input
                            type="checkbox"
                            checked={header.enabled}
                            onChange={(e) => 
                              updateHeader(header.id, { enabled: e.target.checked })
                            }
                            className="rounded"
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
                            disabled={!header.enabled}
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
                            disabled={!header.enabled}
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
                            disabled={!header.enabled}
                          />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => duplicateHeader(header)}>
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => deleteHeader(header.id)}
                                className="text-destructive"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {headers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No headers added yet. Click "Add" to create a new header.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="h-full mt-0">
            <div className="px-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Common Headers
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {COMMON_HEADERS.map((header) => (
                      <div key={header.key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{header.key}</div>
                          <div className="text-xs text-muted-foreground">{header.description}</div>
                          <div className="text-xs font-mono mt-1">{header.value}</div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => addCommonHeader(header)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="presets" className="h-full mt-0">
            <div className="px-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Header Presets
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(HEADER_PRESETS).map(([name, preset]) => (
                      <div key={name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div>
                          <div className="font-medium text-sm">{name}</div>
                          <div className="text-xs text-muted-foreground">{preset.length} headers</div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => addPreset(name)}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Headers will be sent with the request
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={exportHeaders}>
              Export
            </Button>
            <Badge variant="outline" className="text-xs">
              {enabledCount} headers active
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
