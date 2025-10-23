import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
  FileText,
  FileJson,
  Globe,
  Monitor,
  Smartphone
} from 'lucide-react'
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
  const [lineNumbers, setLineNumbers] = useState(true)
  const [wrapLines, setWrapLines] = useState(false)
  const { resolvedTheme } = useTheme()
  const { toast } = useToast()

  const getContentType = () => {
    if (!response?.headers) return 'unknown'
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
    if (contentType.includes('sql')) return 'sql'
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

  const renderTreeView = (data: any, path: string = 'root', level: number = 0, searchTerm: string = '') => {
    if (data === null) return <span className="text-purple-600">null</span>
    if (data === undefined) return <span className="text-purple-600">undefined</span>
    
    if (typeof data === 'string') {
      return (
        <span className="text-green-600">
          "{searchTerm ? highlightSearch(data, searchTerm) : data}"
        </span>
      )
    }
    
    if (typeof data === 'number') {
      return <span className="text-blue-600">{data}</span>
    }
    
    if (typeof data === 'boolean') {
      return <span className="text-orange-600">{data.toString()}</span>
    }
    
    if (Array.isArray(data)) {
      const isExpanded = expandedPaths.has(path)
      const filteredData = searchTerm ? filterArray(data, searchTerm) : data
      
      return (
        <div className={`${level > 0 ? 'ml-4' : ''}`}>
          <span 
            className="cursor-pointer select-none hover:bg-muted/50 rounded p-1"
            onClick={() => togglePath(path)}
          >
            {isExpanded ? (
              <ChevronDown className="inline w-3 h-3 mr-1" />
            ) : (
              <ChevronRight className="inline w-3 h-3 mr-1" />
            )}
            <span className="text-gray-600">[{filteredData.length}]</span>
            {filteredData.length < data.length && (
              <span className="text-yellow-600 ml-2">
                ({data.length - filteredData.length} hidden)
              </span>
            )}
          </span>
          {isExpanded && filteredData.length > 0 && (
            <div className="mt-1 border-l-2 border-gray-200 ml-2">
              {filteredData.map((item, index) => (
                <div key={index} className="ml-4">
                  <span className="text-gray-500">{index}:</span>
                  {renderTreeView(item, `${path}[${index}]`, level + 1, searchTerm)}
                  {index < filteredData.length - 1 && <span className="text-gray-400">,</span>}
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
      const filteredKeys = searchTerm ? keys.filter(key => 
        key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof data[key] === 'string' && data[key].toLowerCase().includes(searchTerm.toLowerCase()))
      ) : keys
      
      return (
        <div className={`${level > 0 ? 'ml-4' : ''}`}>
          <span 
            className="cursor-pointer select-none hover:bg-muted/50 rounded p-1"
            onClick={() => togglePath(path)}
          >
            {isExpanded ? (
              <ChevronDown className="inline w-3 h-3 mr-1" />
            ) : (
              <ChevronRight className="inline w-3 h-3 mr-1" />
            )}
            <span className="text-gray-600">{'{' + filteredKeys.length + '}'}</span>
            {filteredKeys.length < keys.length && (
              <span className="text-yellow-600 ml-2">
                ({keys.length - filteredKeys.length} hidden)
              </span>
            )}
          </span>
          {isExpanded && filteredKeys.length > 0 && (
            <div className="mt-1 border-l-2 border-gray-200 ml-2">
              {filteredKeys.map((key) => (
                <div key={key} className="ml-4">
                  <span className="text-blue-600 font-mono">
                    "{searchTerm && key.toLowerCase().includes(searchTerm.toLowerCase()) ? 
                      highlightSearch(key, searchTerm) : key}":
                  </span>
                  {renderTreeView(data[key], `${path}.${key}`, level + 1, searchTerm)}
                  <span className="text-gray-400">,</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
    
    return null
  }

  const filterArray = (arr: any[], searchTerm: string) => {
    if (!searchTerm) return arr
    
    return arr.filter(item => {
      if (typeof item === 'string') {
        return item.toLowerCase().includes(searchTerm.toLowerCase())
      }
      if (typeof item === 'object' && item !== null) {
        return Object.values(item).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      return false
    })
  }

  const highlightSearch = (text: string, searchTerm: string) => {
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
      }
      return part
    })
  }

  const getSyntaxHighlighterClass = () => {
    const theme = resolvedTheme === 'dark' ? 'dark' : 'light'
    switch (getLanguage()) {
      case 'json':
        return theme === 'dark' ? 'hljs-json' : 'hljs-json-light'
      case 'javascript':
        return theme === 'dark' ? 'hljs-javascript' : 'hljs-javascript-light'
      case 'html':
        return theme === 'dark' ? 'hljs-html' : 'hljs-html-light'
      case 'xml':
        return theme === 'dark' ? 'hljs-xml' : 'hljs-xml-light'
      default:
        return theme === 'dark' ? 'hljs-default' : 'hljs-default-light'
    }
  }

  const language = getLanguage()
  const formattedBody = formatBody(response.data)
  const hasJsonData = language === 'json' && typeof response.data === 'object'

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-3">
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
          
          <Badge variant="outline" className="text-xs">
            {getContentType()}
          </Badge>
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
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {hasJsonData && formatMode === 'pretty' ? (
          <Tabs defaultValue="tree" className="h-full flex flex-col">
            <div className="px-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tree" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Tree
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Code
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 mt-4">
              <TabsContent value="tree" className="h-full mt-0">
                <ScrollArea className="h-full px-4">
                  <div className="font-mono text-sm">
                    {renderTreeView(response.data, 'root', 0, searchQuery)}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="code" className="h-full mt-0">
                <ScrollArea className="h-full px-4">
                  <pre className={`
                    ${getSyntaxHighlighterClass()}
                    ${lineNumbers ? 'line-numbers' : ''}
                    ${wrapLines ? 'wrap-lines' : ''}
                    text-xs
                    p-4
                    overflow-x-auto
                    bg-background
                    rounded
                  `}>
                    <code>{formattedBody}</code>
                  </pre>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        ) : (
          <ScrollArea className="h-full px-4">
            <pre className={`
              ${getSyntaxHighlighterClass()}
              ${lineNumbers ? 'line-numbers' : ''}
              ${wrapLines ? 'wrap-lines' : ''}
              text-xs
              p-4
              overflow-x-auto
              bg-background
              rounded
            `}>
              <code>{formattedBody}</code>
            </pre>
          </ScrollArea>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-t bg-muted/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Lines: {formattedBody.split('\n').length}</span>
            <span>Size: {response.size} bytes</span>
            <span>Time: {response.time}ms</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Language: {language}</span>
            <span>Encoding: UTF-8</span>
            {searchQuery && <span>Found: search results</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
