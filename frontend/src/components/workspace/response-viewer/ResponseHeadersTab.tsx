import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Copy, Filter } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ResponseHeadersTabProps {
  headers: Record<string, string>
}

interface HeaderCategory {
  name: string
  headers: Array<{ key: string; value: string; description?: string }>
}

export function ResponseHeadersTab({ headers }: ResponseHeadersTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyEssential, setShowOnlyEssential] = useState(false)
  const { toast } = useToast()

  const categorizeHeader = (key: string): string => {
    const keyLower = key.toLowerCase()
    
    // Content related headers
    if (keyLower.startsWith('content-')) return 'Content'
    
    // Cache related headers  
    if (keyLower.startsWith('cache-') || keyLower === 'etag') return 'Cache'
    
    // Authentication headers
    if (keyLower.includes('auth') || keyLower.includes('authorization') || keyLower === 'www-authenticate') return 'Authentication'
    
    // CORS headers
    if (keyLower.includes('cors') || keyLower.includes('access-control')) return 'CORS'
    
    // Cookie headers
    if (keyLower.includes('cookie') || keyLower === 'set-cookie') return 'Cookies'
    
    // Location/Redirect headers
    if (keyLower === 'location' || keyLower === 'referrer') return 'Navigation'
    
    // Security headers
    if (keyLower.startsWith('x-') || keyLower.startsWith('strict-transport-security') || keyLower === 'content-security-policy') return 'Security'
    
    // Performance headers
    if (keyLower.includes('timing') || keyLower.includes('age') || keyLower.includes('expires')) return 'Performance'
    
    // Server info headers
    if (keyLower.includes('server') || keyLower.includes('x-powered-by') || keyLower === 'via') return 'Server'
    
    // Encoding headers
    if (keyLower.includes('encoding') || keyLower.includes('compression')) return 'Encoding'
    
    return 'General'
  }

  const getHeaderDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      'content-type': 'Media type of the resource',
      'content-length': 'Length of the response body in bytes',
      'content-encoding': 'Encoding used for the response body',
      'cache-control': 'Directives for caching mechanisms',
      'etag': 'Entity tag for cache validation',
      'expires': 'Expiration date for caching',
      'last-modified': 'Last modification date of the resource',
      'authorization': 'Authentication credentials',
      'www-authenticate': 'Authentication challenge',
      'access-control-allow-origin': 'Allowed origins for CORS',
      'access-control-allow-methods': 'Allowed HTTP methods for CORS',
      'access-control-allow-headers': 'Allowed headers for CORS',
      'access-control-max-age': 'Maximum age for preflight requests',
      'set-cookie': 'HTTP cookie to be stored by client',
      'location': 'URL for redirection',
      'referrer': 'Referring URL of the request',
      'x-frame-options': 'Clickjacking protection',
      'x-content-type-options': 'MIME type sniffing protection',
      'x-xss-protection': 'Cross-site scripting protection',
      'strict-transport-security': 'HTTPS enforcement',
      'content-security-policy': 'Content security policy',
      'server': 'Server software information',
      'x-powered-by': 'Server technology stack',
      'via': 'Proxy servers used',
      'connection': 'Connection management'
    }
    
    return descriptions[key.toLowerCase()] || ''
  }

  const isEssentialHeader = (key: string): boolean => {
    const essentialHeaders = [
      'content-type',
      'content-length',
      'cache-control',
      'etag',
      'authorization',
      'set-cookie',
      'location',
      'access-control-allow-origin',
      'last-modified',
      'expires'
    ]
    
    return essentialHeaders.includes(key.toLowerCase())
  }

  const filteredHeaders = Object.entries(headers).filter(([key, value]) => {
    const matchesSearch = key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         value.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesEssential = !showOnlyEssential || isEssentialHeader(key)
    
    return matchesSearch && matchesEssential
  })

  const groupedHeaders: HeaderCategory[] = []
  const categories = new Set<string>()
  
  filteredHeaders.forEach(([key, value]) => {
    const category = categorizeHeader(key)
    categories.add(category)
  })
  
  categories.forEach(category => {
    const categoryHeaders = filteredHeaders.filter(([key]) => categorizeHeader(key) === category)
    if (categoryHeaders.length > 0) {
      groupedHeaders.push({
        name: category,
        headers: categoryHeaders.map(([key, value]) => ({
          key,
          value,
          description: getHeaderDescription(key)
        }))
    }
  })

  const copyHeaders = () => {
    const headersText = Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')
    navigator.clipboard.writeText(headersText)
    toast({
      title: 'Headers Copied',
      description: 'Response headers copied to clipboard'
    })
  }

  const copyCategoryHeaders = (category: string) => {
    const categoryHeaders = groupedHeaders.find(cat => cat.name === category)
    if (!category) return
    
    const headersText = category.headers
      .map(({ key, value }) => `${key}: ${value}`)
      .join('\n')
    navigator.clipboard.writeText(headersText)
    toast({
      title: 'Headers Copied',
      description: `${category} headers copied to clipboard`
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <h4 className="font-medium">Response Headers</h4>
          <Badge variant="outline">
            {Object.keys(headers).length} total
          </Badge>
          <Badge variant="outline">
            {filteredHeaders.length} shown
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search headers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-8"
            />
          </div>
          
          <div className="flex items-center gap-1">
            <input
              type="checkbox"
              id="essential-only"
              checked={showOnlyEssential}
              onChange={(e) => setShowOnlyEssential(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="essential-only" className="text-sm">
              Essential only
            </label>
          </div>
          
          <Button size="sm" variant="outline" onClick={copyHeaders}>
            <Copy className="w-4 h-4 mr-2" />
            Copy All
          </Button>
        </div>
      </div>

      {/* Headers Content */}
      <div className="flex-1 overflow-auto">
        {groupedHeaders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No headers found</p>
            {searchQuery && (
              <p className="text-sm mt-1">
                Try adjusting your search filter
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {groupedHeaders.map((category) => (
              <div key={category.name} className="bg-muted/30">
                {/* Category Header */}
                <div className="px-4 py-2 flex items-center justify-between bg-muted/50">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium text-sm">{category.name}</h5>
                    <Badge variant="outline" className="text-xs">
                      {category.headers.length}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {category.headers.map(h => h.key).join(', ')}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => copyCategoryHeaders(category.name)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                {/* Headers Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3 font-medium text-xs">Header Name</TableHead>
                      <TableHead className="w-2/3 font-medium text-xs">Value</TableHead>
                      <TableHead className="w-auto font-medium text-xs">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.headers.map(({ key, value, description }) => (
                      <TableRow key={key}>
                        <TableCell className="font-mono text-xs py-2">
                          {key}
                        </TableCell>
                        <TableCell className="font-mono text-xs py-2 break-all">
                          <div className="max-w-md overflow-x-auto">
                            {value}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs py-2">
                          <div className="text-muted-foreground max-w-xs">
                            {description || '-'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Total headers: {Object.keys(headers).length}</span>
            <span>Showing: {filteredHeaders.length}</span>
            {showOnlyEssential && <span>Essential only</span>}
          </div>
          <div className="flex items-center gap-4">
            <span>Essential headers: {Object.keys(headers).filter(isEssentialHeader).length}</span>
            {searchQuery && <span>Filtered by: "{searchQuery}"</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
