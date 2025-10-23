# Direct HTTP Client Documentation

## Overview

Direct HTTP Client adalah sistem yang memungkinkan aplikasi untuk melakukan request langsung ke target API tanpa melalui backend PHP proxy. Ini memberikan kemampuan testing API yang mirip dengan Postman/Apidog, dengan support untuk localhost, staging, dan production environments.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Application                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐     ┌──────────────────────────┐     │
│  │  React Component │────▶│  useDirectApi Hook       │     │
│  └──────────────────┘     └──────────────────────────┘     │
│            │                         │                       │
│            ▼                         ▼                       │
│  ┌──────────────────────────────────────────────┐          │
│  │         DirectApiClient                       │          │
│  │  - HTTP Request handling                      │          │
│  │  - Variable interpolation                     │          │
│  │  - Request/Response timing                    │          │
│  │  - File upload support                        │          │
│  └──────────────────────────────────────────────┘          │
│            │                                                  │
│            ▼                                                  │
│  ┌──────────────────┐     ┌──────────────────────────┐     │
│  │  CORS Handler    │     │  Request History         │     │
│  │  - Web/Electron  │     │  - IndexedDB/localStorage│     │
│  │  - Proxy support │     │  - Search/Filter         │     │
│  └──────────────────┘     └──────────────────────────┘     │
│            │                         │                       │
└────────────┼─────────────────────────┼───────────────────────┘
             │                         │
             ▼                         ▼
    ┌────────────────┐       ┌────────────────┐
    │  Target API    │       │  IndexedDB     │
    │  (Direct)      │       │  Storage       │
    └────────────────┘       └────────────────┘
```

## Core Components

### 1. DirectApiClient (`src/lib/api/direct-client.ts`)

Main class untuk mengirim HTTP requests.

**Features:**
- Support semua HTTP methods (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)
- Variable interpolation dengan `{{variable}}` syntax
- Request/response timing measurements
- File upload support (multipart/form-data)
- Multiple body types (JSON, form-data, x-www-form-urlencoded, raw, binary)
- Cookie handling
- Automatic response size calculation

**Usage:**

```typescript
import { directApiClient } from '@/lib/api/direct-client'
import type { HttpRequestConfig } from '@/types/http-client'

// Basic request
const response = await directApiClient.quickRequest(
  'GET',
  'https://api.example.com/users'
)

// Advanced request dengan full config
const config: HttpRequestConfig = {
  method: 'POST',
  url: 'https://api.example.com/users',
  headers: [
    { key: 'Content-Type', value: 'application/json', enabled: true },
    { key: 'Authorization', value: 'Bearer {{token}}', enabled: true }
  ],
  body: {
    type: 'json',
    json: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  },
  timeout: 30000
}

const response = await directApiClient.sendRequest(config)
```

### 2. Variable Interpolator (`src/lib/variables/variable-interpolator.ts`)

Engine untuk interpolasi variable dengan syntax `{{variable}}`.

**Features:**
- Support nested properties: `{{user.name}}`, `{{api.base_url}}`
- Variable priority: environment > collection > global
- Validation untuk missing variables
- Interpolation untuk strings, objects, dan arrays

**Usage:**

```typescript
import { VariableInterpolator } from '@/lib/variables/variable-interpolator'

const interpolator = new VariableInterpolator({
  environment: {
    id: 'prod',
    name: 'Production',
    variables: {
      base_url: 'https://api.production.com',
      api_key: 'prod-key-123'
    },
    isActive: true
  },
  collection: {
    timeout: '30000'
  },
  global: {
    version: 'v1'
  }
})

// Interpolate string
const result = interpolator.interpolate('{{base_url}}/{{version}}/users')
console.log(result.value) // "https://api.production.com/v1/users"

// Interpolate object
const config = interpolator.interpolateObject({
  url: '{{base_url}}/users',
  headers: {
    'X-API-Key': '{{api_key}}'
  }
})
```

### 3. CORS Handler (`src/lib/api/cors-handler.ts`)

Handle CORS issues di berbagai environment (web vs Electron).

**Features:**
- Auto-detect environment (web/Electron)
- CORS proxy support untuk web environment
- Bypass domains (localhost, 127.0.0.1, etc)
- User-friendly error messages dengan solutions

**Usage:**

```typescript
import { corsHandler } from '@/lib/api/cors-handler'

// Get environment info
const env = corsHandler.getEnvironment()
console.log(env.type) // 'web' atau 'electron'
console.log(env.corsMode) // 'direct', 'proxy', atau 'electron-bypass'

// Transform URL kalau perlu proxy
const finalUrl = corsHandler.transformUrl('http://localhost:3000/api')

// Enable CORS proxy
corsHandler.setCorsProxyEnabled(true)
corsHandler.setCorsProxyUrl('https://cors-anywhere.herokuapp.com')

// Check CORS error
if (corsHandler.isCorsError(error)) {
  const message = corsHandler.getCorsErrorMessage(url)
  console.log(message.title, message.message, message.solutions)
}
```

### 4. Request History (`src/lib/history/request-history.ts`)

Manage request history dengan IndexedDB/localStorage.

**Features:**
- Store request dan response data
- Search dan filter functionality
- Export/import history sebagai JSON
- Automatic cleanup (max 1000 items)
- Support untuk IndexedDB dengan fallback ke localStorage

**Usage:**

```typescript
import { requestHistory } from '@/lib/history/request-history'

// Add request to history
await requestHistory.addItem({
  id: crypto.randomUUID(),
  timestamp: Date.now(),
  request: config,
  response: responseData,
  duration: 1234,
  collectionId: 'col-123',
  endpointId: 'ep-456'
})

// Get history dengan filter
const items = await requestHistory.getItems({
  method: 'GET',
  status: 200,
  search: 'users',
  dateFrom: Date.now() - 86400000, // Last 24 hours
  collectionId: 'col-123'
}, 50)

// Export history
const json = await requestHistory.exportHistory()

// Import history
const result = await requestHistory.importHistory(json)
console.log(`Imported: ${result.imported}, Failed: ${result.failed}`)

// Clear all history
await requestHistory.clearAll()
```

### 5. React Hook (`src/hooks/use-direct-api.ts`)

Custom hook untuk easy integration dengan React components.

**Usage:**

```typescript
import { useDirectApi } from '@/hooks/use-direct-api'

function MyComponent() {
  const { isLoading, response, error, sendRequest, clearResponse } = useDirectApi({
    environment: {
      id: 'dev',
      name: 'Development',
      variables: {
        base_url: 'http://localhost:3000'
      },
      isActive: true
    }
  })

  const handleSend = async () => {
    await sendRequest({
      method: 'GET',
      url: '{{base_url}}/api/users'
    })
  }

  return (
    <div>
      <button onClick={handleSend} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Send Request'}
      </button>
      
      {error && <div>Error: {error.message}</div>}
      
      {response && (
        <div>
          <div>Status: {response.status}</div>
          <div>Time: {response.time}ms</div>
          <pre>{JSON.stringify(response.data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
```

## Type Definitions

All type definitions berada di `src/types/http-client.ts`:

- `HttpRequestConfig` - Configuration untuk HTTP request
- `HttpResponseData` - Response data dari API
- `HttpError` - Error object dengan type dan message
- `RequestHistoryItem` - Item di request history
- `VariableContext` - Context untuk variable interpolation
- `RuntimeEnvironment` - Info tentang runtime environment (web/electron)

## Utility Functions

Helper functions di `src/lib/utils/http-utils.ts`:

- `formatResponseTime(ms)` - Format response time
- `formatResponseSize(bytes)` - Format response size
- `getStatusColor(status)` - Get color untuk status code
- `prettyPrintJson(data)` - Format JSON dengan indentation
- `formatResponseBody(response)` - Format response berdasarkan content-type
- `parseHeaders(headers)` - Parse headers dari berbagai format
- `isValidUrl(url)` - Validate URL format
- `generateCurlCommand(config)` - Generate cURL command dari config
- `copyToClipboard(text)` - Copy text ke clipboard
- `downloadResponse(response)` - Download response sebagai file

## Store Management

HTTP Client settings store di `src/stores/httpClientStore.ts`:

```typescript
import { useHttpClientStore } from '@/stores/httpClientStore'

function SettingsComponent() {
  const {
    corsProxyEnabled,
    setCorsProxyEnabled,
    defaultTimeout,
    setDefaultTimeout,
    prettyPrintJson,
    setPrettyPrintJson
  } = useHttpClientStore()

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={corsProxyEnabled}
          onChange={(e) => setCorsProxyEnabled(e.target.checked)}
        />
        Enable CORS Proxy
      </label>
      
      <input
        type="number"
        value={defaultTimeout}
        onChange={(e) => setDefaultTimeout(parseInt(e.target.value))}
      />
    </div>
  )
}
```

## Example Component

Contoh lengkap implementasi ada di `src/features/request/RequestTester.tsx`.

Component ini menunjukkan:
- Form untuk input URL, method, headers, dan body
- Send request dengan loading state
- Display response dengan tabs (body, headers, cookies)
- Copy response dan download functionality
- Generate cURL command
- Error handling dengan user-friendly messages

## Integration dengan Existing System

### Update Endpoint Builder

```typescript
import { useDirectApi } from '@/hooks/use-direct-api'
import type { Endpoint } from '@/types/api'

function EndpointBuilder({ endpoint }: { endpoint: Endpoint }) {
  const { isLoading, response, error, sendRequest } = useDirectApi()

  const handleTest = async () => {
    await sendRequest({
      method: endpoint.method,
      url: endpoint.url,
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
      {/* Existing endpoint builder UI */}
      <button onClick={handleTest}>Test Endpoint</button>
      
      {response && (
        <div>
          <div>Status: {response.status}</div>
          <pre>{JSON.stringify(response.data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
```

## CORS Handling Strategies

### Web Environment

Di web environment, CORS bisa jadi issue kalau target API tidak mengizinkan requests dari frontend origin.

**Solutions:**

1. **Backend API enable CORS** (Recommended)
   ```php
   // Backend harus set CORS headers
   header('Access-Control-Allow-Origin: *');
   header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
   header('Access-Control-Allow-Headers: Content-Type, Authorization');
   ```

2. **CORS Proxy** (Untuk testing)
   ```typescript
   corsHandler.setCorsProxyEnabled(true)
   corsHandler.setCorsProxyUrl('https://cors-anywhere.herokuapp.com')
   ```

3. **Desktop App (Electron)** (Best solution)
   - Electron app bisa bypass CORS dengan webRequest API
   - Automatic detection kalau running di Electron

### Electron Environment

Kalau app jalan di Electron, CORS automatically di-bypass.

```typescript
// Electron main process (future implementation)
import { session } from 'electron'

session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
  callback({ requestHeaders: details.requestHeaders })
})

session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Access-Control-Allow-Origin': ['*']
    }
  })
})
```

## Security Considerations

1. **Variable Interpolation**
   - Jangan store sensitive data (API keys, passwords) di global variables
   - Gunakan environment-specific variables untuk credentials
   - Consider encryption untuk sensitive data di localStorage

2. **Request History**
   - Request history bisa contain sensitive data (tokens, passwords)
   - User harus bisa clear history
   - Consider automatic cleanup after N days

3. **CORS Proxy**
   - CORS proxy bisa lihat semua request data
   - Jangan gunakan public proxy untuk production/sensitive data
   - Self-hosted proxy adalah recommended

## Performance Optimization

1. **Request History**
   - Use IndexedDB untuk better performance
   - Automatic cleanup untuk limit storage usage
   - Lazy loading untuk history list

2. **Variable Interpolation**
   - Cache interpolated values kalau context tidak berubah
   - Validate variables sebelum send request

3. **Response Display**
   - Lazy render untuk large responses
   - Virtual scrolling untuk large lists
   - Syntax highlighting on-demand

## Future Enhancements

1. **Pre-request Scripts**
   - JavaScript execution before request
   - Dynamic variable generation

2. **Test Assertions**
   - Automated response validation
   - Status code assertions
   - Response body assertions

3. **Request Chaining**
   - Link multiple requests
   - Pass response data ke next request

4. **Mock Servers**
   - Local mock server untuk testing
   - Response templates

5. **Collaboration**
   - Share requests dengan team
   - Cloud sync untuk history

## Troubleshooting

### CORS Error

**Problem:** Request failed dengan CORS error

**Solutions:**
1. Enable CORS proxy di settings
2. Gunakan Desktop app (Electron)
3. Minta backend team untuk enable CORS

### Timeout Error

**Problem:** Request timeout after 30s

**Solutions:**
1. Increase timeout di settings
2. Check network connection
3. Check target server status

### Variable Not Found

**Problem:** `{{variable}}` tidak di-replace

**Solutions:**
1. Check variable name spelling
2. Verify variable exists di environment/collection/global
3. Check variable priority (environment > collection > global)

## Testing

```bash
# Unit tests untuk core functionality
npm test src/lib/api/direct-client.test.ts
npm test src/lib/variables/variable-interpolator.test.ts
npm test src/lib/history/request-history.test.ts

# Integration tests
npm test src/features/request/RequestTester.test.tsx
```

## Support

Untuk questions atau issues, silakan buka issue di repository atau contact development team.
