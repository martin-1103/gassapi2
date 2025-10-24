import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Copy, Trash2, Download, Shield, Clock, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Cookie {
  name: string
  value: string
  domain: string
  path: string
  expires?: Date
  httpOnly: boolean
  secure: boolean
  sameSite: 'Strict' | 'Lax' | 'None'
}

interface ResponseCookiesTabProps {
  cookies: Record<string, any>
}

export function ResponseCookiesTab({ cookies }: ResponseCookiesTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCookies, setExpandedCookies] = useState<Set<string>>(new Set())
  const [editMode, setEditMode] = useState(false)
  const [editCookie, setEditCookie] = useState<Partial<Cookie> | null>(null)
  const { toast } = useToast()

  const parseCookies = (cookieString: string): Cookie[] => {
    try {
      const cookies: Cookie[] = []
      
      cookieString.split(';').forEach(cookie => {
        const [nameValue, ...attributes] = cookie.trim().split('=')
        if (nameValue) {
          const [name, ...valueParts] = nameValue.split(':')
          if (name && valueParts.length > 0) {
            cookies.push({
              name: name.trim(),
              value: valueParts.join(':').trim(),
              domain: attributes.find(attr => attr.trim().toLowerCase().startsWith('domain='))?.split('=')[1]?.trim(),
              path: attributes.find(attr => attr.trim().toLowerCase().startsWith('path='))?.split('=')[1]?.trim(),
              expires: attributes.find(attr => attr.trim().toLowerCase().startsWith('expires=')) ? new Date(attr.split('=')[1]) : undefined,
              httpOnly: attributes.some(attr => attr.trim().toLowerCase() === 'httponly'),
              secure: attributes.some(attr => attr.trim().toLowerCase() === 'secure'),
              sameSite: 'Strict' as const
            })
          }
        }
      })
      
      return cookies
    } catch {
      return []
    }
  }

  const getCookiesList = (): Cookie[] => {
    const cookieList: Cookie[] = []
    
    // Parse from Set-Cookie headers
    const setCookieHeaders = Object.entries(cookies).filter(([key]) => 
      key.toLowerCase() === 'set-cookie'
    )
    
    setCookieHeaders.forEach(([, value]) => {
      if (typeof value === 'string') {
        cookieList.push(...parseCookies(value))
      }
    })
    
    // Parse from Cookie header
    const cookieHeader = cookies['cookie'] || cookies['Cookie']
    if (cookieHeader) {
      cookieList.push(...parseCookies(cookieHeader))
    }
    
    return cookieList
  }

  const cookiesList = getCookiesList()

  const filterCookies = cookiesList.filter(cookie =>
    cookie.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cookie.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cookie.domain && cookie.domain.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const updateCookie = (name: string, updates: Partial<Cookie>) => {
    // This would typically make an API call to update cookies
    // For now, just show toast
    toast({
      title: 'Cookie Update',
      description: `Cookie "${name}" would be updated: ${JSON.stringify(updates)}`,
    })
  }

  const deleteCookie = (name: string) => {
    toast({
      title: 'Cookie Delete',
      description: `Cookie "${name}" would be deleted`,
    })
  }

  const exportCookies = () => {
    const cookiesData = cookiesList.map(cookie => ({
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain || '',
      path: cookie.path || '',
      expires: cookie.expires ? cookie.expires.toISOString() : '',
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite
    }))
    
    const blob = new Blob([JSON.stringify(cookiesData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cookies_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Cookies Exported',
      description: `Exported ${cookiesList.length} cookies to file`,
    })
  }

  const importCookies = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      try {
        const text = await file.text()
        const importedCookies = JSON.parse(text)
        
        if (Array.isArray(importedCookies)) {
          toast({
            title: 'Cookies Imported',
            description: `Imported ${importedCookies.length} cookies`,
          })
        }
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

  const copyCookiesAsCurl = () => {
    const cookieHeaders = cookiesList
      .map(cookie => {
        let cookieString = `${cookie.name}=${encodeURIComponent(cookie.value)}`
        
        if (cookie.domain) cookieString += `; Domain=${cookie.domain}`
        if (cookie.path) cookieString += `; Path=${cookie.path}`
        if (cookie.expires) cookieString += `; Expires=${cookie.expires.toUTCString()}`
        if (cookie.httpOnly) cookieString += '; HttpOnly'
        if (cookie.secure) cookieString += '; Secure'
        if (cookie.sameSite && cookie.sameSite !== 'None') cookieString += `; SameSite=${cookie.sameSite}`
        
        return cookieString
      })
      .join('\n')
    
    navigator.clipboard.writeText(cookieHeaders)
    toast({
      title: 'Cookies Copied',
      description: 'Cookies copied to clipboard in cURL format',
    })
  }

  const toggleExpanded = (name: string) => {
    const newExpanded = new Set(expandedCookies)
    if (newExpanded.has(name)) {
      newExpanded.delete(name)
    } else {
      newExpanded.add(name)
    }
    setExpandedCookies(newExpanded)
  }

  const formatExpiry = (date?: Date): string => {
    if (!date) return 'Session'
    return date.toUTCString()
  }

  const getSecurityIcon = (cookie: Cookie) => {
    if (cookie.secure && cookie.httpOnly) {
      return <Shield className="w-4 h-4 text-green-600" />
    }
    if (cookie.secure) {
      return <Shield className="w-4 h-4 text-blue-600" />
    }
    if (cookie.httpOnly) {
      return <Shield className="w-4 h-4 text-yellow-600" />
    }
    return <Info className="w-4 h-4 text-gray-400" />
  }

  const isCookieExpired = (cookie: Cookie): boolean => {
    if (!cookie.expires) return false
    return cookie.expires.getTime() < Date.now()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">Cookies</h3>
          <Badge variant="outline">
            {cookiesList.length} total
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search cookies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 h-8"
          />
          <Button size="sm" variant="outline" onClick={() => setEditMode(!editMode)}>
            {editMode ? 'View Mode' : 'Edit Mode'}
          </Button>
          <Button size="sm" variant="outline" onClick={importCookies}>
            Import
          </Button>
          <Button size="sm" variant="outline" onClick={exportCookies}>
            Export
          </Button>
          <Button size="sm" variant="outline" onClick={copyCookiesAsCurl}>
            <Copy className="w-4 h-4 mr-2" />
            cURL
          </Button>
        </div>
      </div>

      {/* Cookies List */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        {cookiesList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Cookie className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-semibold mb-2">No Cookies</h4>
            <p className="text-sm">
              No cookies were received with this response. Cookies are typically set by the server for session management or tracking purposes.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filterCookies.map((cookie) => (
              <Card key={cookie.name} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Cookie Name and Value */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">{cookie.name}</span>
                      {getSecurityIcon(cookie)}
                      {isCookieExpired(cookie) && (
                        <Badge variant="destructive" className="text-xs">
                          Expired
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Input
                        value={editMode ? (editCookie?.name || cookie.name) : cookie.name}
                        onChange={(e) => setEditCookie({ ...editCookie, name: e.target.value })}
                        disabled={!editMode}
                        className="font-mono text-sm flex-1"
                        readOnly={!editMode}
                      />
                    </div>
                  </div>
                    
                    {/* Cookie Value */}
                    <div className="mb-2">
                      <Input
                        value={editMode ? (editCookie?.value || cookie.value) : cookie.value}
                        onChange={(e) => setEditCookie({ ...editCookie, value: e.target.value })}
                        disabled={!editMode}
                        className="font-mono text-sm w-full"
                        readOnly={!editMode}
                        placeholder="Cookie value"
                      />
                    </div>

                    {/* Cookie Details */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleExpanded(cookie.name)}
                      className="text-xs"
                    >
                      {expandedCookies.has(cookie.name) ? 'Hide Details' : 'Show Details'}
                    </Button>

                    {expandedCookies.has(cookie.name) && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <span className="text-muted-foreground">Domain:</span>
                          <span>{cookie.domain || 'Current'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <span className="text-muted-foreground">Path:</span>
                          <span>{cookie.path || '/'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <span className="text-muted-foreground">Expires:</span>
                          <span className={isCookieExpired(cookie) ? 'text-red-600' : ''}>
                            {formatExpiry(cookie.expires)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <span className="text-muted-foreground">HttpOnly:</span>
                          <span>{cookie.httpOnly ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <span className="text-muted-foreground">Secure:</span>
                          <span>{cookie.secure ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <span className="text-muted-foreground">SameSite:</span>
                          <span>{cookie.sameSite}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1">
                  {editMode ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (editCookie && editCookie.name && editCookie.value) {
                            updateCookie(cookie.name, {
                              value: editCookie.value
                            })
                            setEditCookie(null)
                          }
                        }}
                        className="text-green-600"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditCookie(null)}
                        className="text-gray-600"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="ghost">
                        <Clock className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteCookie(cookie.name)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/50">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Security Info:</span>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" /> Secure + HttpOnly
              <Shield className="w-4 h-4 text-blue-600" /> Secure only
              <Shield className="w-4 h-4 text-yellow-600" /> HttpOnly only
              <Info className="w-4 h-4 text-gray-400" /> No security
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span>Total: {cookiesList.length} cookies</span>
            <span>{filterCookies.length} filtered</span>
            <span>{cookiesList.filter(isCookieExpired).length} expired</span>
          </div>
        </div>
      </div>
    </div>
  )
}
