# Phase 2: Direct HTTP Client Architecture

## Overview
Implementasi direct HTTP client dari frontend yang bypass backend, memungkinkan testing localhost dan API endpoints lainnya tanpa CORS restrictions.

## 2.1 Dual Mode System

### Architecture Overview
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Management    │───▶│   Backend PHP    │    │   Database      │
│   Mode          │    │ (Collections,     │    │ (Projects,      │
│                 │    │  Endpoints,       │    │  Collections)   │
│ • CRUD          │    │  Environments)    │    │                 │
│ • Auth          │    └──────────────────┘    └─────────────────┘
│ • Projects      │
└─────────────────┘

┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Testing       │───▶│  Direct HTTP     │───▶│   Target API    │
│   Mode          │    │  Client          │    │ (localhost,     │
│                 │    │                  │    │  staging,       │
│ • API Requests  │    └──────────────────┘    │  production)    │
│ • Responses     │                             │                 │
│ • Testing       │                             └─────────────────┘
│ • History       │
└─────────────────┘
```

### Data Flow Strategy
- **Configurations**: Backend database (collections, endpoints, environments)
- **Testing**: Direct frontend requests ke target APIs
- **History**: Local storage/IndexedDB (client-side)
- **Results**: IndexedDB untuk large response data
- **Cache**: Service worker untuk offline capability

## 2.2 Direct HTTP Client Implementation

### Core HTTP Client Class
```typescript
// src/lib/api/direct-client.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

export interface DirectRequestConfig {
  method: string
  url: string
  headers?: Record<string, string>
  body?: any
  timeout?: number
  followRedirects?: boolean
  validateSSL?: boolean
}

export interface DirectResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  data: any
  time: number
  size: number
  redirected?: boolean
  redirectUrl?: string
}

export class DirectApiClient {
  private startTime: number = 0

  async sendRequest(config: DirectRequestConfig): Promise<DirectResponse> {
    this.startTime = Date.now()
    
    try {
      const axiosConfig: AxiosRequestConfig = {
        method: config.method,
        url: config.url,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        data: config.body,
        timeout: config.timeout || 30000,
        maxRedirects: config.followRedirects ? 5 : 0,
        validateStatus: () => true, // Don't throw on HTTP errors
      }

      // Handle CORS untuk Electron vs Web
      if (this.isElectron()) {
        return this.sendElectronRequest(axiosConfig)
      } else {
        return this.sendWebRequest(axiosConfig)
      }

    } catch (error) {
      return this.handleError(error)
    }
  }

  private async sendWebRequest(config: AxiosRequestConfig): Promise<DirectResponse> {
    try {
      const response: AxiosResponse = await axios(config)
      const endTime = Date.now()
      
      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        data: response.data,
        time: endTime - this.startTime,
        size: JSON.stringify(response.data).length,
        redirected: response.request?.res?.responseUrl !== config.url,
        redirectUrl: response.request?.res?.responseUrl
      }
    } catch (error: any) {
      return this.handleWebError(error)
    }
  }

  private async sendElectronRequest(config: AxiosRequestConfig): Promise<DirectResponse> {
    // Electron-specific implementation dengan native HTTP client
    if (window.electronAPI?.httpClient) {
      return await window.electronAPI.httpClient.sendRequest(config)
    }
    
    // Fallback ke axios
    return this.sendWebRequest(config)
  }

  private handleError(error: any): DirectResponse {
    const endTime = Date.now()
    
    return {
      status: 0,
      statusText: 'Network Error',
      headers: {},
      data: null,
      time: endTime - this.startTime,
      size: 0,
      error: {
        message: error.message,
        type: this.getErrorType(error),
        corsError: this.isCorsError(error)
      }
    }
  }

  private getErrorType(error: any): string {
    if (error.code === 'ECONNREFUSED') return 'CONNECTION_REFUSED'
    if (error.code === 'ENOTFOUND') return 'DNS_ERROR'
    if (error.code === 'ETIMEDOUT') return 'TIMEOUT'
    if (this.isCorsError(error)) return 'CORS_ERROR'
    return 'NETWORK_ERROR'
  }

  private isCorsError(error: any): boolean {
    return error.message?.includes('CORS') || 
           error.message?.includes('Cross-Origin') ||
           error.message?.includes('Access-Control')
  }

  private isElectron(): boolean {
    return window && window.process && window.process.type === 'renderer'
  }
}
```

### Request History Management
```typescript
// src/lib/history/request-history.ts
export interface RequestHistoryItem {
  id: string
  name?: string
  method: string
  url: string
  headers: Record<string, string>
  body?: any
  response?: DirectResponse
  timestamp: number
  duration: number
  status: 'success' | 'error' | 'pending'
  projectId?: string
  collectionId?: string
  endpointId?: string
}

export class RequestHistory {
  private storageKey = 'gass-api-request-history'
  private maxHistoryItems = 1000

  async addToHistory(item: Omit<RequestHistoryItem, 'id' | 'timestamp'>): Promise<void> {
    const history = await this.getHistory()
    const newItem: RequestHistoryItem = {
      ...item,
      id: this.generateId(),
      timestamp: Date.now()
    }

    // Add to beginning
    history.unshift(newItem)
    
    // Limit history size
    if (history.length > this.maxHistoryItems) {
      history.splice(this.maxHistoryItems)
    }

    await this.saveHistory(history)
  }

  async getHistory(limit?: number): Promise<RequestHistoryItem[]> {
    try {
      const stored = localStorage.getItem(this.storageKey)
      const history = stored ? JSON.parse(stored) : []
      return limit ? history.slice(0, limit) : history
    } catch {
      return []
    }
  }

  async searchHistory(query: string): Promise<RequestHistoryItem[]> {
    const history = await this.getHistory()
    const lowerQuery = query.toLowerCase()
    
    return history.filter(item => 
      item.url.toLowerCase().includes(lowerQuery) ||
      item.method.toLowerCase().includes(lowerQuery) ||
      (item.name && item.name.toLowerCase().includes(lowerQuery))
    )
  }

  async clearHistory(): Promise<void> {
    localStorage.removeItem(this.storageKey)
  }

  private async saveHistory(history: RequestHistoryItem[]): Promise<void> {
    localStorage.setItem(this.storageKey, JSON.stringify(history))
  }

  private generateId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
```

## 2.3 CORS Handling Strategy

### Web Environment CORS Solutions
```typescript
// src/lib/cors/cors-handler.ts
export class CorsHandler {
  private corsProxyUrls = [
    'https://cors-anywhere.herokuapp.com/',
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?'
  ]

  async handleCorsError(originalConfig: any): Promise<DirectResponse> {
    // Try CORS proxy
    for (const proxyUrl of this.corsProxyUrls) {
      try {
        const proxyConfig = {
          ...originalConfig,
          url: proxyUrl + originalConfig.url
        }
        
        const response = await axios(proxyConfig)
        return this.formatResponse(response)
      } catch {
        continue
      }
    }

    // Fallback: Show user instructions
    return {
      status: 0,
      statusText: 'CORS Error',
      headers: {},
      data: null,
      time: 0,
      size: 0,
      corsError: true,
      error: {
        message: 'CORS Error: Cannot make request to this URL from browser. Use desktop app or enable CORS.',
        solutions: [
          'Use desktop app (Electron) for local API testing',
          'Enable CORS on target server',
          'Use browser CORS extension for development'
        ]
      }
    }
  }

  private formatResponse(response: any): DirectResponse {
    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      time: 0,
      size: JSON.stringify(response.data).length
    }
  }
}
```

### Electron Native HTTP Client
```typescript
// electron/ipc/http-client.ts
import { ipcMain } from 'electron'
import axios from 'axios'

ipcMain.handle('http:sendRequest', async (_, config) => {
  try {
    // Electron-specific configurations
    const electronConfig = {
      ...config,
      // Bypass CORS di Electron
      headers: {
        'User-Agent': 'GASS-API-Desktop/1.0',
        ...config.headers
      }
    }

    const response = await axios(electronConfig)
    
    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      time: 0 // Will be calculated in renderer
    }
  } catch (error) {
    return {
      status: 0,
      statusText: error.message,
      headers: {},
      data: null,
      error: error.message
    }
  }
})
```

## 2.4 Environment Variable Interpolation

### Variable Processing
```typescript
// src/lib/variables/variable-interpolator.ts
export class VariableInterpolator {
  interpolate(str: string, variables: Record<string, string>): string {
    if (!str || !variables) return str
    
    return str.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim()
      return variables[trimmedKey] !== undefined ? variables[trimmedKey] : match
    })
  }

  interpolateHeaders(headers: Record<string, string>, variables: Record<string, string>): Record<string, string> {
    const interpolated: Record<string, string> = {}
    
    for (const [key, value] of Object.entries(headers)) {
      interpolated[key] = this.interpolate(value, variables)
    }
    
    return interpolated
  }

  interpolateBody(body: any, variables: Record<string, string>): any {
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body)
        const interpolated = this.interpolateObject(parsed, variables)
        return JSON.stringify(interpolated)
      } catch {
        return this.interpolate(body, variables)
      }
    } else if (typeof body === 'object' && body !== null) {
      return this.interpolateObject(body, variables)
    }
    
    return body
  }

  private interpolateObject(obj: any, variables: Record<string, string>): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.interpolateObject(item, variables))
    } else if (typeof obj === 'object' && obj !== null) {
      const result: any = {}
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          result[key] = this.interpolate(value, variables)
        } else {
          result[key] = this.interpolateObject(value, variables)
        }
      }
      return result
    }
    
    return obj
  }
}
```

## Deliverables
- ✅ DirectApiClient class dengan web + Electron support
- ✅ RequestHistory management system
- ✅ CORS handling dengan multiple strategies
- ✅ Environment variable interpolation
- ✅ Error handling untuk network issues
- ✅ Response formatting dan timing

## Next Steps
Lanjut ke Phase 3: Modern UI Implementation dengan shadcn/ui components untuk workspace layout, request builder, dan response viewer.
