import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Copy,
  FileText,
  Download,
  Terminal,
  Play,
  Code,
  Globe,
  Hash,
  Layers
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ExportManagerProps } from './types'
import {
  generateMarkdownDocumentation,
  generateCurlExample,
  generateJavaScriptExample,
  generatePythonExample,
  copyToClipboard,
  downloadDocumentation
} from './utils/export-utils'

/**
 * Komponen untuk mengelola export documentation ke berbagai format
 */
export function ExportManager({
  endpoint,
  response,
  requestInfo,
  onCopyDocumentation,
  onCopyMarkdown,
  onDownload
}: ExportManagerProps) {
  const { toast } = useToast()
  const [activeExampleTab, setActiveExampleTab] = useState('curl')

  const handleCopyMarkdown = async () => {
    try {
      const markdown = generateMarkdownDocumentation(endpoint)
      await copyToClipboard(markdown)
      toast({
        title: 'Markdown Disalin',
        description: 'Documentation berhasil disalin sebagai Markdown'
      })
    } catch (err) {
      toast({
        title: 'Gagal Menyalin',
        description: 'Tidak dapat menyalin documentation ke clipboard',
        variant: 'destructive'
      })
    }
  }

  const getContentType = (): string => {
    // Extract content type dari response headers
    const contentTypeHeader = Object.keys(response.headers || {}).find(
      key => key.toLowerCase() === 'content-type'
    )
    return contentTypeHeader ? response.headers[contentTypeHeader] : 'application/json'
  }

  const formatResponseData = (): string => {
    return JSON.stringify(response.data, null, 2)
  }

  const generateExampleCode = (): string => {
    const method = requestInfo?.method || 'GET'
    const url = requestInfo?.url || endpoint.url
    const headers = {
      'Content-Type': getContentType(),
      ...Object.fromEntries(
        Object.entries(requestInfo?.headers || {}).filter(([key]) =>
          key.toLowerCase() !== 'content-type'
        )
      )
    }

    switch (activeExampleTab) {
      case 'curl':
        return generateCurlExample(method, url, headers)
      case 'javascript':
        return generateJavaScriptExample(method, url, headers)
      case 'python':
        return generatePythonExample(method, url, headers)
      default:
        return generateCurlExample(method, url, headers)
    }
  }

  const hasParameters = endpoint.parameters && endpoint.parameters.length > 0

  return (
    <div className="space-y-6">
      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={handleCopyMarkdown} variant="outline" className="h-auto p-4">
              <FileText className="w-6 h-6 mb-2" />
              <div className="text-sm font-medium">Copy Markdown</div>
              <div className="text-xs text-muted-foreground">
                Export sebagai format Markdown
              </div>
            </Button>

            <Button onClick={onCopyDocumentation} variant="outline" className="h-auto p-4">
              <Code className="w-6 h-6 mb-2" />
              <div className="text-sm font-medium">Copy JSON</div>
              <div className="text-xs text-muted-foreground">
                Export documentation sebagai JSON
              </div>
            </Button>

            <Button onClick={onDownload} variant="outline" className="h-auto p-4">
              <Download className="w-6 h-6 mb-2" />
              <div className="text-sm font-medium">Download File</div>
              <div className="text-xs text-muted-foreground">
                Download documentation file
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Request Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Request Overview
          </CardTitle>
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
              <div className="text-sm">{getContentType()}</div>
            </div>
          </div>

          {hasParameters && (
            <>
              <Separator />
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Parameters ({endpoint.parameters?.length})
                </div>
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
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Code Examples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={activeExampleTab === 'curl' ? 'default' : 'outline'}
                onClick={() => setActiveExampleTab('curl')}
              >
                <Terminal className="w-4 h-4 mr-2" />
                cURL
              </Button>
              <Button
                size="sm"
                variant={activeExampleTab === 'javascript' ? 'default' : 'outline'}
                onClick={() => setActiveExampleTab('javascript')}
              >
                <Code className="w-4 h-4 mr-2" />
                JavaScript
              </Button>
              <Button
                size="sm"
                variant={activeExampleTab === 'python' ? 'default' : 'outline'}
                onClick={() => setActiveExampleTab('python')}
              >
                <Play className="w-4 h-4 mr-2" />
                Python
              </Button>
            </div>

            <ScrollArea className="h-[300px]">
              <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-xs">
                <code>{generateExampleCode()}</code>
              </pre>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Example Response */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Example Response
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Status: {response.status}
              </Badge>
              <Badge variant="outline">
                Size: {response.size || 'Unknown'} bytes
              </Badge>
              {response.time && (
                <Badge variant="outline">
                  Time: {response.time}ms
                </Badge>
              )}
            </div>
          </div>

          <ScrollArea className="h-[300px]">
            <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-xs">
              <code>{formatResponseData()}</code>
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}