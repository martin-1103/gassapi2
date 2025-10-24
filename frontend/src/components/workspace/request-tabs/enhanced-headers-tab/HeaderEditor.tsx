import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { BookOpen, Zap, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { RequestHeader } from './index'
import { COMMON_HEADERS, HEADER_PRESETS, parseHeadersFromJson, parseHeadersFromCurl } from './utils/header-utils'

interface HeaderEditorProps {
  headers: RequestHeader[]
  onAddHeader: (header: RequestHeader) => void
  onAddMultipleHeaders: (headers: RequestHeader[]) => void
}

export default function HeaderEditor({
  headers,
  onAddHeader,
  onAddMultipleHeaders
}: HeaderEditorProps) {
  const { toast } = useToast()
  const [bulkEditText, setBulkEditText] = useState('')

  const addCommonHeader = (template: {
    key: string
    value: string
    description: string
  }) => {
    const newHeader: RequestHeader = {
      id: Date.now().toString(),
      key: template.key,
      value: template.value,
      enabled: true,
      description: template.description
    }
    onAddHeader(newHeader)
  }

  const addPreset = (presetName: string) => {
    const preset = HEADER_PRESETS[presetName as keyof typeof HEADER_PRESETS]
    if (preset) {
      const newHeaders = preset.map(header => ({
        ...header,
        id: Date.now().toString() + Math.random(),
        enabled: true
      }))
      onAddMultipleHeaders(newHeaders)
      toast({
        title: 'Preset Added',
        description: `Added ${preset.length} headers from ${presetName} preset`
      })
    }
  }

  const parseCurlHeaders = () => {
    const curlCommand = prompt('Paste cURL command to extract headers:')
    if (!curlCommand) return

    try {
      const newHeaders = parseHeadersFromCurl(curlCommand)

      if (newHeaders.length === 0) {
        toast({
          title: 'No Headers Found',
          description: 'Could not find headers in cURL command',
          variant: 'destructive'
        })
        return
      }

      onAddMultipleHeaders(newHeaders)
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

  const importHeaders = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const newHeaders = parseHeadersFromJson(text)
        onAddMultipleHeaders(newHeaders)
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

  const bulkEdit = () => {
    const headersObj = headers.reduce((acc, header) => {
      if (header.enabled && header.key) {
        acc[header.key] = header.value
      }
      return acc
    }, {} as Record<string, string>)

    const bulkText = JSON.stringify(headersObj, null, 2)
    const editText = prompt('Edit headers in JSON format:', bulkText)

    if (editText !== null) {
      try {
        const editedHeaders = parseHeadersFromJson(editText)
        onAddMultipleHeaders(editedHeaders)
        toast({
          title: 'Bulk Edit Success',
          description: `Updated ${editedHeaders.length} headers`
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

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant="outline" onClick={parseCurlHeaders}>
          Import cURL
        </Button>
        <Button size="sm" variant="outline" onClick={importHeaders}>
          Import File
        </Button>
        <Button size="sm" variant="outline" onClick={bulkEdit}>
          Bulk Edit
        </Button>
        <Button size="sm" onClick={() => onAddHeader({
          id: Date.now().toString(),
          key: '',
          value: '',
          enabled: true
        })}>
          <Plus className="w-4 h-4 mr-2" />
          Add Header
        </Button>
      </div>

      {/* Common Headers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Common Headers
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 max-h-64 overflow-y-auto">
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

      {/* Header Presets */}
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
  )
}