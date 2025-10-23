# HTTP Client Integration Guide

## Quick Integration Steps

### Step 1: Import the Client

```typescript
import { directApiClient } from '@/lib/api/direct-client'
import { useDirectApi } from '@/hooks/use-direct-api'
```

### Step 2: Basic Usage in Component

```typescript
function MyApiTester() {
  const { isLoading, response, error, sendRequest } = useDirectApi()

  const testApi = async () => {
    await sendRequest({
      method: 'GET',
      url: 'https://api.example.com/users'
    })
  }

  return (
    <div>
      <button onClick={testApi} disabled={isLoading}>
        Test API
      </button>
      {response && <pre>{JSON.stringify(response.data, null, 2)}</pre>}
      {error && <div>Error: {error.message}</div>}
    </div>
  )
}
```

### Step 3: Add to Workspace Tab System

```typescript
// In WorkspaceTabs.tsx or similar
import { RequestTester } from '@/features/request/RequestTester'

// Add to tab rendering
{activeTab?.type === 'request-tester' && (
  <RequestTester />
)}
```

### Step 4: Add Menu Item

```typescript
// In sidebar or menubar
import { useWorkspaceStore } from '@/stores/workspaceStore'

function Sidebar() {
  const { openTab } = useWorkspaceStore()

  const openRequestTester = () => {
    openTab({
      id: crypto.randomUUID(),
      type: 'request-tester',
      title: 'API Tester',
      data: null
    })
  }

  return (
    <button onClick={openRequestTester}>
      New Request
    </button>
  )
}
```

### Step 5: Integrate with Endpoint Testing

```typescript
// In EndpointBuilder.tsx
import { useDirectApi } from '@/hooks/use-direct-api'

function EndpointBuilder({ endpoint }) {
  const { sendRequest, response } = useDirectApi()

  const testEndpoint = async () => {
    await sendRequest({
      method: endpoint.method,
      url: endpoint.url,
      headers: Object.entries(endpoint.headers).map(([key, value]) => ({
        key, value, enabled: true
      })),
      body: endpoint.body ? { type: 'json', json: JSON.parse(endpoint.body) } : undefined
    })
  }

  return (
    <div>
      {/* Existing endpoint UI */}
      <button onClick={testEndpoint}>Test</button>
      {response && <ResponseViewer response={response} />}
    </div>
  )
}
```

## Common Use Cases

### 1. Test Localhost API

```typescript
const response = await directApiClient.quickRequest(
  'GET',
  'http://localhost:3000/api/users'
)
```

### 2. With Variables

```typescript
directApiClient.setVariableContext({
  environment: {
    id: 'dev',
    name: 'Development',
    variables: { base_url: 'http://localhost:3000' },
    isActive: true
  }
})

await directApiClient.sendRequest({
  method: 'GET',
  url: '{{base_url}}/api/users'
})
```

### 3. With Authentication

```typescript
await directApiClient.sendRequest({
  method: 'GET',
  url: 'https://api.example.com/protected',
  headers: [
    { key: 'Authorization', value: 'Bearer token123', enabled: true }
  ]
})
```

### 4. File Upload

```typescript
const file = document.querySelector('input[type="file"]').files[0]

await directApiClient.sendRequest({
  method: 'POST',
  url: 'https://api.example.com/upload',
  body: {
    type: 'form-data',
    formData: [
      { key: 'file', value: file, type: 'file', enabled: true }
    ]
  }
})
```

## CORS Setup

### Enable CORS Proxy (if needed)

```typescript
import { corsHandler } from '@/lib/api/cors-handler'

// In settings component
corsHandler.setCorsProxyEnabled(true)
corsHandler.setCorsProxyUrl('https://cors-anywhere.herokuapp.com')
```

### Check Environment

```typescript
const env = corsHandler.getEnvironment()
console.log(env.type) // 'web' or 'electron'
```

## Request History

### View Recent Requests

```typescript
import { requestHistory } from '@/lib/history/request-history'

const recent = await requestHistory.getItems(undefined, 10)
```

### Search History

```typescript
const filtered = await requestHistory.getItems({
  method: 'GET',
  status: 200,
  search: 'users'
}, 50)
```

## Utility Functions

```typescript
import {
  formatResponseTime,
  formatResponseSize,
  prettyPrintJson,
  generateCurlCommand,
  copyToClipboard
} from '@/lib/utils/http-utils'

// Format display
console.log(formatResponseTime(234)) // "234ms"
console.log(formatResponseSize(1024)) // "1.00KB"

// Generate cURL
const curl = generateCurlCommand({
  method: 'POST',
  url: 'https://api.example.com/users',
  headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
  body: { name: 'John' }
})

// Copy to clipboard
await copyToClipboard(curl)
```

## TypeScript Types

All types are available from `@/types/http-client`:

```typescript
import type {
  HttpRequestConfig,
  HttpResponseData,
  HttpError,
  HttpMethod,
  HttpHeader,
  VariableContext
} from '@/types/http-client'
```

## Next Steps

1. **Add to Navigation:** Add menu item to open RequestTester
2. **Integrate with Endpoints:** Add test button to existing endpoint builder
3. **Add History Sidebar:** Show recent requests in sidebar
4. **Configure Settings:** Add CORS and timeout settings to app settings
5. **Add Keyboard Shortcuts:** Cmd+Enter to send request

## Support

For detailed documentation, see:
- `HTTP_CLIENT_DOCUMENTATION.md` - Technical details
- `HTTP_CLIENT_EXAMPLES.md` - Code examples
- `HTTP_CLIENT_SUMMARY.md` - Implementation summary
