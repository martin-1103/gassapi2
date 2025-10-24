import { RequestHeader } from '../index'

// Common headers templates
export const COMMON_HEADERS = [
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
] as const

// Header presets untuk berbagai API types
export const HEADER_PRESETS = {
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
} as const

// Utility functions for header management
export const createHeader = (key: string = '', value: string = ''): RequestHeader => ({
  id: Date.now().toString(),
  key,
  value,
  enabled: true
})

export const getHeadersObject = (headers: RequestHeader[]): Record<string, string> => {
  const enabledHeaders = headers.filter(header => header.enabled && header.key)
  return enabledHeaders.reduce((acc, header) => {
    acc[header.key] = header.value
    return acc
  }, {} as Record<string, string>)
}

export const copyHeadersToClipboard = async (headers: RequestHeader[]): Promise<boolean> => {
  try {
    const headersObj = getHeadersObject(headers)
    const headersText = Object.entries(headersObj)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')
    await navigator.clipboard.writeText(headersText)
    return true
  } catch (error) {
    console.error('Failed to copy headers:', error)
    return false
  }
}

export const exportHeadersToFile = (headers: RequestHeader[]): void => {
  const headersObj = getHeadersObject(headers)
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
}

export const parseHeadersFromJson = (jsonText: string): RequestHeader[] => {
  const importedHeaders = JSON.parse(jsonText)
  return Object.entries(importedHeaders).map(([key, value], index) => ({
    id: Date.now().toString() + index,
    key,
    value: String(value),
    enabled: true
  }))
}

export const parseHeadersFromCurl = (curlCommand: string): RequestHeader[] => {
  const headerRegex = /-H\s+['"`]([^'"`]+):\s*([^'"`]+)['"`]/g
  const matches: RegExpExecArray[] = []
  let match: RegExpExecArray | null

  while ((match = headerRegex.exec(curlCommand)) !== null) {
    matches.push(match)
  }

  return matches.map((match, index) => ({
    id: Date.now().toString() + index,
    key: match[1].trim(),
    value: match[2].trim(),
    enabled: true
  }))
}

export const validateHeaderKey = (key: string): boolean => {
  if (!key.trim()) return false
  // Basic HTTP header validation
  const headerNameRegex = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/
  return headerNameRegex.test(key.trim())
}

export const validateHeaderValue = (value: string): boolean => {
  // Basic validation - non-empty after trim
  return value.trim().length > 0
}

export const getHeaderStats = (headers: RequestHeader[]) => {
  const enabledCount = headers.filter(header => header.enabled).length
  const totalCount = headers.length
  return { enabledCount, totalCount }
}