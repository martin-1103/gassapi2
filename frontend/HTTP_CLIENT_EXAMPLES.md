# Direct HTTP Client - Examples & Integration Guide

## Quick Start Examples

### 1. Simple GET Request

```typescript
import { directApiClient } from '@/lib/api/direct-client'

// Quick GET request
const response = await directApiClient.quickRequest(
  'GET',
  'https://jsonplaceholder.typicode.com/users'
)

console.log('Status:', response.status)
console.log('Data:', response.data)
console.log('Time:', response.time, 'ms')
```

### 2. POST Request dengan JSON Body

```typescript
const response = await directApiClient.quickRequest(
  'POST',
  'https://jsonplaceholder.typicode.com/users',
  {
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe'
    }
  }
)
```

### 3. Request dengan Headers dan Variable Interpolation

```typescript
import { directApiClient } from '@/lib/api/direct-client'
import type { HttpRequestConfig } from '@/types/http-client'

// Set variable context
directApiClient.setVariableContext({
  environment: {
    id: 'dev',
    name: 'Development',
    variables: {
      base_url: 'http://localhost:3000',
      api_key: 'dev-key-123'
    },
    isActive: true
  }
})

// Send request dengan variables
const config: HttpRequestConfig = {
  method: 'GET',
  url: '{{base_url}}/api/users',
  headers: [
    { key: 'Authorization', value: 'Bearer {{api_key}}', enabled: true },
    { key: 'Content-Type', value: 'application/json', enabled: true }
  ]
}

const response = await directApiClient.sendRequest(config)
```

### 4. File Upload dengan Form Data

```typescript
const file = document.querySelector('input[type="file"]').files[0]

const config: HttpRequestConfig = {
  method: 'POST',
  url: 'https://api.example.com/upload',
  body: {
    type: 'form-data',
    formData: [
      { key: 'file', value: file, type: 'file', enabled: true },
      { key: 'title', value: 'My File', type: 'text', enabled: true },
      { key: 'description', value: 'File description', type: 'text', enabled: true }
    ]
  }
}

const response = await directApiClient.sendRequest(config)
```

### 5. URL Encoded Form

```typescript
const config: HttpRequestConfig = {
  method: 'POST',
  url: 'https://api.example.com/login',
  body: {
    type: 'x-www-form-urlencoded',
    urlEncoded: [
      { key: 'username', value: 'john@example.com', enabled: true },
      { key: 'password', value: 'secret123', enabled: true }
    ]
  }
}

const response = await directApiClient.sendRequest(config)
```

## React Hook Examples

### 1. Basic Hook Usage

```typescript
import { useDirectApi } from '@/hooks/use-direct-api'
import { Button } from '@/components/ui/button'

function UserList() {
  const { isLoading, response, error, sendRequest } = useDirectApi()

  const fetchUsers = async () => {
    await sendRequest({
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/users'
    })
  }

  return (
    <div>
      <Button onClick={fetchUsers} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Fetch Users'}
      </Button>

      {error && (
        <div className="text-red-500">
          Error: {error.message}
        </div>
      )}

      {response && (
        <div>
          <p>Status: {response.status}</p>
          <p>Time: {response.time}ms</p>
          <pre>{JSON.stringify(response.data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
```

### 2. Hook dengan Variable Context

```typescript
import { useDirectApi } from '@/hooks/use-direct-api'
import { useProjectStore } from '@/stores/projectStore'

function ApiTester() {
  const { currentProject } = useProjectStore()
  
  const { isLoading, response, error, sendRequest } = useDirectApi({
    environment: {
      id: 'prod',
      name: 'Production',
      variables: {
        base_url: 'https://api.production.com',
        api_key: currentProject?.apiKey || ''
      },
      isActive: true
    },
    collection: {
      timeout: '30000',
      retry: '3'
    }
  })

  const testEndpoint = async () => {
    await sendRequest({
      method: 'GET',
      url: '{{base_url}}/api/v1/users',
      headers: [
        { key: 'X-API-Key', value: '{{api_key}}', enabled: true }
      ],
      timeout: parseInt('{{timeout}}')
    })
  }

  return (
    <div>
      <button onClick={testEndpoint}>Test Endpoint</button>
      {/* Display response */}
    </div>
  )
}
```

### 3. Form dengan Dynamic Headers

```typescript
import { useState } from 'react'
import { useDirectApi } from '@/hooks/use-direct-api'
import type { HttpHeader } from '@/types/http-client'

function RequestBuilder() {
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState<'GET' | 'POST'>('GET')
  const [headers, setHeaders] = useState<HttpHeader[]>([])

  const { isLoading, response, sendRequest } = useDirectApi()

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }])
  }

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
  }

  const handleSubmit = async () => {
    await sendRequest({
      method,
      url,
      headers
    })
  }

  return (
    <div>
      <input value={url} onChange={e => setUrl(e.target.value)} />
      
      <select value={method} onChange={e => setMethod(e.target.value as any)}>
        <option value="GET">GET</option>
        <option value="POST">POST</option>
      </select>

      {headers.map((header, i) => (
        <div key={i}>
          <input
            placeholder="Key"
            value={header.key}
            onChange={e => updateHeader(i, 'key', e.target.value)}
          />
          <input
            placeholder="Value"
            value={header.value}
            onChange={e => updateHeader(i, 'value', e.target.value)}
          />
        </div>
      ))}

      <button onClick={addHeader}>Add Header</button>
      <button onClick={handleSubmit} disabled={isLoading}>
        Send Request
      </button>

      {response && <pre>{JSON.stringify(response.data, null, 2)}</pre>}
    </div>
  )
}
```

## Variable Interpolation Examples

### 1. Simple Variable Replacement

```typescript
import { interpolateString } from '@/lib/variables/variable-interpolator'

const result = interpolateString(
  'https://{{domain}}/api/{{version}}/users',
  {
    environment: {
      id: 'dev',
      name: 'Development',
      variables: {
        domain: 'localhost:3000',
        version: 'v1'
      },
      isActive: true
    }
  }
)

console.log(result) // "https://localhost:3000/api/v1/users"
```

### 2. Nested Variables

```typescript
import { VariableInterpolator } from '@/lib/variables/variable-interpolator'

const interpolator = new VariableInterpolator({
  environment: {
    id: 'prod',
    name: 'Production',
    variables: {
      api: {
        base: 'https://api.example.com',
        version: 'v2',
        key: 'prod-key-123'
      }
    },
    isActive: true
  }
})

const url = interpolator.interpolate('{{api.base}}/{{api.version}}/users')
console.log(url.value) // "https://api.example.com/v2/users"

const headers = interpolator.interpolateObject({
  'Authorization': 'Bearer {{api.key}}',
  'Content-Type': 'application/json'
})
```

### 3. Variable Priority

```typescript
// Environment variables override collection variables
const interpolator = new VariableInterpolator({
  global: {
    timeout: '10000'
  },
  collection: {
    timeout: '20000'
  },
  environment: {
    id: 'dev',
    name: 'Development',
    variables: {
      timeout: '30000' // This wins!
    },
    isActive: true
  }
})

const result = interpolator.interpolate('Timeout: {{timeout}}')
console.log(result.value) // "Timeout: 30000"
```

### 4. Variable Validation

```typescript
import { VariableInterpolator } from '@/lib/variables/variable-interpolator'

const interpolator = new VariableInterpolator({
  environment: {
    id: 'dev',
    name: 'Development',
    variables: {
      base_url: 'http://localhost:3000'
    },
    isActive: true
  }
})

// Validate before sending request
const validation = interpolator.validateString('{{base_url}}/api/{{version}}')

if (!validation.valid) {
  console.error('Missing variables:', validation.missingVariables)
  // ["version"]
}
```

## Request History Examples

### 1. Save and Retrieve History

```typescript
import { requestHistory } from '@/lib/history/request-history'

// Save request to history
await requestHistory.addItem({
  id: crypto.randomUUID(),
  timestamp: Date.now(),
  request: {
    method: 'GET',
    url: 'https://api.example.com/users'
  },
  response: {
    status: 200,
    statusText: 'OK',
    headers: {},
    data: { users: [] },
    time: 234,
    size: 1024
  },
  duration: 234,
  collectionId: 'col-123',
  endpointId: 'ep-456'
})

// Get recent history
const recent = await requestHistory.getItems(undefined, 10)

// Get filtered history
const filtered = await requestHistory.getItems({
  method: 'GET',
  status: 200,
  search: 'users',
  dateFrom: Date.now() - 86400000 // Last 24 hours
}, 50)
```

### 2. History Component

```typescript
import { useState, useEffect } from 'react'
import { requestHistory } from '@/lib/history/request-history'
import type { RequestHistoryItem } from '@/types/http-client'

function RequestHistory() {
  const [items, setItems] = useState<RequestHistoryItem[]>([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    loadHistory()
  }, [filter])

  const loadHistory = async () => {
    const history = await requestHistory.getItems(
      filter ? { search: filter } : undefined,
      50
    )
    setItems(history)
  }

  const clearHistory = async () => {
    await requestHistory.clearAll()
    setItems([])
  }

  const exportHistory = async () => {
    const json = await requestHistory.exportHistory()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'request-history.json'
    a.click()
  }

  return (
    <div>
      <input
        placeholder="Search history..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />

      <button onClick={exportHistory}>Export</button>
      <button onClick={clearHistory}>Clear All</button>

      {items.map(item => (
        <div key={item.id}>
          <span>{item.request.method}</span>
          <span>{item.request.url}</span>
          <span>{item.response?.status}</span>
          <span>{item.duration}ms</span>
        </div>
      ))}
    </div>
  )
}
```

### 3. Export/Import History

```typescript
import { requestHistory } from '@/lib/history/request-history'

// Export
const exportData = async () => {
  const json = await requestHistory.exportHistory()
  
  // Save to file
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `history-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Import
const importData = async (file: File) => {
  const text = await file.text()
  const result = await requestHistory.importHistory(text)
  
  console.log(`Imported: ${result.imported}, Failed: ${result.failed}`)
}
```

## CORS Handling Examples

### 1. Enable CORS Proxy

```typescript
import { corsHandler } from '@/lib/api/cors-handler'

// Enable proxy
corsHandler.setCorsProxyEnabled(true)
corsHandler.setCorsProxyUrl('https://cors-anywhere.herokuapp.com')

// Now requests akan automatically di-route through proxy
const response = await directApiClient.quickRequest(
  'GET',
  'http://localhost:3000/api/users'
)
```

### 2. Handle CORS Errors

```typescript
import { corsHandler } from '@/lib/api/cors-handler'

try {
  const response = await directApiClient.quickRequest(
    'GET',
    'http://localhost:3000/api/users'
  )
} catch (error) {
  if (corsHandler.isCorsError(error)) {
    const corsMessage = corsHandler.getCorsErrorMessage(
      'http://localhost:3000/api/users'
    )
    
    console.log(corsMessage.title)
    console.log(corsMessage.message)
    console.log('Solutions:', corsMessage.solutions)
    
    // Show user-friendly error
    alert(`${corsMessage.title}\n\n${corsMessage.message}\n\nSolutions:\n${corsMessage.solutions.join('\n')}`)
  }
}
```

### 3. Environment Detection

```typescript
import { corsHandler } from '@/lib/api/cors-handler'

const env = corsHandler.getEnvironment()

if (env.type === 'electron') {
  console.log('Running in Electron, CORS is bypassed')
} else if (env.corsMode === 'proxy') {
  console.log('Using CORS proxy:', env.corsProxyConfig?.url)
} else {
  console.log('Direct requests (no CORS handling)')
}
```

## Integration dengan Existing Components

### 1. Update EndpointBuilder

```typescript
// src/features/endpoints/EndpointBuilder.tsx
import { useState } from 'react'
import { useDirectApi } from '@/hooks/use-direct-api'
import type { Endpoint } from '@/types/api'

export function EndpointBuilder({ endpoint }: { endpoint: Endpoint }) {
  const [url, setUrl] = useState(endpoint.url)
  const [method, setMethod] = useState(endpoint.method)
  
  const { isLoading, response, error, sendRequest } = useDirectApi()

  const handleTest = async () => {
    await sendRequest({
      method,
      url,
      headers: Object.entries(endpoint.headers).map(([key, value]) => ({
        key,
        value,
        enabled: true
      })),
      body: endpoint.body ? {
        type: 'json',
        json: JSON.parse(endpoint.body)
      } : undefined
    })
  }

  return (
    <div>
      {/* Existing UI */}
      <input value={url} onChange={e => setUrl(e.target.value)} />
      <select value={method} onChange={e => setMethod(e.target.value as any)}>
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        {/* ... */}
      </select>

      <button onClick={handleTest} disabled={isLoading}>
        {isLoading ? 'Testing...' : 'Test Endpoint'}
      </button>

      {error && (
        <div className="text-red-500">
          {error.type}: {error.message}
        </div>
      )}

      {response && (
        <div>
          <div>Status: {response.status} {response.statusText}</div>
          <div>Time: {response.time}ms</div>
          <div>Size: {response.size} bytes</div>
          <pre>{JSON.stringify(response.data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
```

### 2. Add to Workspace Tabs

```typescript
// src/stores/workspaceStore.ts
// Add new tab type untuk request tester

interface Tab {
  id: string
  type: 'endpoint' | 'flow' | 'collection' | 'request-tester' // Add new type
  title: string
  data?: any
}

// Usage
import { useWorkspaceStore } from '@/stores/workspaceStore'

const { openTab } = useWorkspaceStore()

openTab({
  id: 'tester-1',
  type: 'request-tester',
  title: 'Request Tester',
  data: {
    method: 'GET',
    url: 'https://api.example.com/users'
  }
})
```

### 3. Add History Sidebar

```typescript
// src/features/history/HistorySidebar.tsx
import { useState, useEffect } from 'react'
import { requestHistory } from '@/lib/history/request-history'
import { useWorkspaceStore } from '@/stores/workspaceStore'

export function HistorySidebar() {
  const [items, setItems] = useState([])
  const { openTab } = useWorkspaceStore()

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    const history = await requestHistory.getItems(undefined, 20)
    setItems(history)
  }

  const openRequest = (item) => {
    openTab({
      id: `history-${item.id}`,
      type: 'request-tester',
      title: `${item.request.method} ${item.request.url}`,
      data: item.request
    })
  }

  return (
    <div>
      <h3>Recent Requests</h3>
      {items.map(item => (
        <div key={item.id} onClick={() => openRequest(item)}>
          <span>{item.request.method}</span>
          <span>{item.request.url}</span>
          <span>{item.response?.status}</span>
        </div>
      ))}
    </div>
  )
}
```

## Testing Examples

### 1. Unit Test untuk DirectApiClient

```typescript
// src/lib/api/__tests__/direct-client.test.ts
import { describe, it, expect, vi } from 'vitest'
import { DirectApiClient } from '../direct-client'
import axios from 'axios'

vi.mock('axios')

describe('DirectApiClient', () => {
  it('should send GET request', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: { users: [] }
    }

    vi.mocked(axios.create).mockReturnValue({
      request: vi.fn().mockResolvedValue(mockResponse)
    } as any)

    const client = new DirectApiClient()
    const response = await client.quickRequest('GET', 'https://api.test.com/users')

    expect(response.status).toBe(200)
    expect(response.data).toEqual({ users: [] })
  })

  // More tests...
})
```

### 2. Unit Test untuk Variable Interpolator

```typescript
// src/lib/variables/__tests__/variable-interpolator.test.ts
import { describe, it, expect } from 'vitest'
import { VariableInterpolator } from '../variable-interpolator'

describe('VariableInterpolator', () => {
  it('should interpolate simple variables', () => {
    const interpolator = new VariableInterpolator({
      global: { name: 'John' }
    })

    const result = interpolator.interpolate('Hello {{name}}')
    expect(result.value).toBe('Hello John')
  })

  it('should handle nested variables', () => {
    const interpolator = new VariableInterpolator({
      global: {
        user: {
          name: 'John',
          age: '30'
        }
      }
    })

    const result = interpolator.interpolate('{{user.name}} is {{user.age}} years old')
    expect(result.value).toBe('John is 30 years old')
  })

  // More tests...
})
```

## Best Practices

### 1. Error Handling

```typescript
import { useDirectApi } from '@/hooks/use-direct-api'
import { corsHandler } from '@/lib/api/cors-handler'
import { toast } from 'sonner'

function ApiComponent() {
  const { sendRequest } = useDirectApi()

  const handleRequest = async () => {
    try {
      const response = await sendRequest(config)
      toast.success(`Request successful: ${response.status}`)
    } catch (error) {
      // Handle CORS error
      if (corsHandler.isCorsError(error)) {
        const message = corsHandler.getCorsErrorMessage(config.url)
        toast.error(message.title, {
          description: message.solutions.join('\n')
        })
        return
      }

      // Handle other errors
      if (error.type === 'timeout') {
        toast.error('Request timeout', {
          description: 'Server tidak merespon dalam waktu yang ditentukan'
        })
      } else if (error.type === 'network') {
        toast.error('Network error', {
          description: 'Pastikan koneksi internet dan server target berjalan'
        })
      } else {
        toast.error('Request failed', {
          description: error.message
        })
      }
    }
  }

  return <button onClick={handleRequest}>Send Request</button>
}
```

### 2. Loading States

```typescript
import { useDirectApi } from '@/hooks/use-direct-api'
import { Loader2 } from 'lucide-react'

function ApiTester() {
  const { isLoading, sendRequest } = useDirectApi()

  return (
    <button onClick={() => sendRequest(config)} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        'Send Request'
      )}
    </button>
  )
}
```

### 3. Variable Management

```typescript
// Create custom hook untuk manage variables
import { useMemo } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import type { VariableContext } from '@/types/http-client'

export function useVariableContext(): VariableContext {
  const { currentProject, activeEnvironment } = useProjectStore()

  return useMemo(() => ({
    environment: activeEnvironment ? {
      id: activeEnvironment.id,
      name: activeEnvironment.name,
      variables: activeEnvironment.variables,
      isActive: true
    } : undefined,
    collection: currentProject?.defaultCollection?.variables,
    global: {
      app_version: '1.0.0',
      timestamp: Date.now().toString()
    }
  }), [activeEnvironment, currentProject])
}

// Usage
function ApiComponent() {
  const variableContext = useVariableContext()
  const { sendRequest } = useDirectApi(variableContext)

  // Variables akan automatically di-interpolate
}
```

Semua examples di atas siap untuk digunakan dan di-integrate ke aplikasi!
