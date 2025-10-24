import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Plus, Upload } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import HeaderList from './HeaderList'
import HeaderEditor from './HeaderEditor'
import {
  copyHeadersToClipboard,
  exportHeadersToFile,
  createHeader,
  getHeaderStats
} from './utils/header-utils'

export interface RequestHeader {
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

export default function EnhancedHeadersTab({ headers, onChange }: EnhancedHeadersTabProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const { toast } = useToast()
  const { enabledCount, totalCount } = getHeaderStats(headers)

  const addHeader = () => {
    onChange([...headers, createHeader()])
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

  const addMultipleHeaders = (newHeaders: RequestHeader[]) => {
    onChange([...headers, ...newHeaders])
  }

  const copyHeaders = async () => {
    const success = await copyHeadersToClipboard(headers)
    if (success) {
      toast({
        title: 'Headers Copied',
        description: 'Headers copied to clipboard'
      })
    } else {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy headers to clipboard',
        variant: 'destructive'
      })
    }
  }

  const exportHeaders = () => {
    exportHeadersToFile(headers)
    toast({
      title: 'Headers Exported',
      description: 'Headers saved to file'
    })
  }

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
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 mt-4">
          <TabsContent value="basic" className="h-full mt-0">
            <div className="px-4">
              <HeaderList
                headers={headers}
                onUpdateHeader={updateHeader}
                onDeleteHeader={deleteHeader}
                onDuplicateHeader={duplicateHeader}
                onAddHeader={addHeader}
              />
            </div>
          </TabsContent>

          <TabsContent value="editor" className="h-full mt-0">
            <div className="px-4">
              <HeaderEditor
                headers={headers}
                onAddHeader={(header) => onChange([...headers, header])}
                onAddMultipleHeaders={addMultipleHeaders}
              />
            </div>
          </TabsContent>

          <TabsContent value="templates" className="h-full mt-0">
            <div className="px-4">
              <div className="space-y-6">
                <div className="text-center text-muted-foreground">
                  <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h4 className="font-medium mb-2">Header Templates</h4>
                  <p className="text-sm mb-4">
                    Gunakan tab Editor untuk mengakses templates dan presets headers
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('editor')}
                  >
                    Open Editor
                  </Button>
                </div>
              </div>
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