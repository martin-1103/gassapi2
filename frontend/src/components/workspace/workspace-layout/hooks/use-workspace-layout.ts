import { useState } from 'react'
import { directApiClient } from '@/lib/api/direct-client'
import { requestHistory } from '@/lib/history/request-history'
import { QueryParam } from '../../request-tabs/params-tab'
import { RequestHeader } from '../../request-tabs/headers-tab'
import { BodyData } from '../../request-tabs/body-tab'

// Mock data untuk development
const mockCollections = [
  {
    id: 'col1',
    name: 'User Management',
    description: 'API endpoints for user operations',
    endpoints: [
      { id: 'ep1', name: 'Get Users', method: 'GET', url: '/api/users' },
      { id: 'ep2', name: 'Create User', method: 'POST', url: '/api/users' },
      { id: 'ep3', name: 'Update User', method: 'PUT', url: '/api/users/:id' }
    ]
  },
  {
    id: 'col2',
    name: 'Authentication',
    description: 'Login and authentication endpoints',
    endpoints: [
      { id: 'ep4', name: 'Login', method: 'POST', url: '/api/auth/login' },
      { id: 'ep5', name: 'Logout', method: 'POST', url: '/api/auth/logout' }
    ]
  }
]

const mockEnvironments = [
  { id: 'dev', name: 'Development', base_url: 'http://localhost:3000', is_default: true },
  { id: 'staging', name: 'Staging', base_url: 'https://staging-api.example.com', is_default: false },
  { id: 'prod', name: 'Production', base_url: 'https://api.example.com', is_default: false }
]

export interface WorkspaceLayoutState {
  // UI State
  sidebarCollapsed: boolean
  searchTerm: string
  expandedCollections: Set<string>
  selectedEndpoint: string | null

  // Request State
  method: string
  url: string
  selectedEnvironment: any
  params: QueryParam[]
  headers: RequestHeader[]
  bodyData: BodyData
  isSending: boolean
  response: any

  // Data
  collections: any[]
  environments: any[]
}

export interface WorkspaceLayoutActions {
  // UI Actions
  setSidebarCollapsed: (collapsed: boolean) => void
  setSearchTerm: (term: string) => void
  toggleCollection: (collectionId: string) => void
  setSelectedEndpoint: (endpointId: string | null) => void

  // Request Actions
  setMethod: (method: string) => void
  setUrl: (url: string) => void
  setSelectedEnvironment: (env: any) => void
  setParams: (params: QueryParam[]) => void
  setHeaders: (headers: RequestHeader[]) => void
  setBodyData: (bodyData: BodyData) => void
  sendRequest: () => Promise<void>

  // Computed
  filteredCollections: any[]
}

export function useWorkspaceLayout(): WorkspaceLayoutState & WorkspaceLayoutActions {
  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set(['col1', 'col2']))
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)

  // Request State
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('')
  const [selectedEnvironment, setSelectedEnvironment] = useState(mockEnvironments[0])
  const [params, setParams] = useState<QueryParam[]>([
    { id: '1', key: 'page', value: '1', enabled: true },
    { id: '2', key: 'limit', value: '10', enabled: true }
  ])
  const [headers, setHeaders] = useState<RequestHeader[]>([
    { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
    { id: '2', key: 'Accept', value: 'application/json', enabled: true }
  ])
  const [bodyData, setBodyData] = useState<BodyData>({
    type: 'raw',
    rawType: 'json',
    formData: [],
    rawContent: '{\n  "key": "value"\n}',
    graphqlQuery: '',
    graphqlVariables: ''
  })
  const [isSending, setIsSending] = useState(false)
  const [response, setResponse] = useState<any>(null)

  const toggleCollection = (collectionId: string) => {
    const newExpanded = new Set(expandedCollections)
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId)
    } else {
      newExpanded.add(collectionId)
    }
    setExpandedCollections(newExpanded)
  }

  const filteredCollections = mockCollections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sendRequest = async () => {
    if (!url.trim()) return

    setIsSending(true)

    try {
      // Build request configuration
      const enabledHeaders = headers
        .filter(h => h.enabled && h.key)
        .reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {})

      const enabledParams = params
        .filter(p => p.enabled && p.key && p.value)
        .reduce((acc, p) => ({ ...acc, [p.key]: p.value }), {})

      // Build URL with params
      let finalUrl = url
      if (Object.keys(enabledParams).length > 0) {
        const searchParams = new URLSearchParams(enabledParams)
        finalUrl += (url.includes('?') ? '&' : '?') + searchParams.toString()
      }

      // Get body based on type
      let requestBody: any = undefined
      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        switch (bodyData.type) {
          case 'raw':
            if (bodyData.rawType === 'json' && bodyData.rawContent.trim()) {
              try {
                requestBody = JSON.parse(bodyData.rawContent)
              } catch {
                requestBody = bodyData.rawContent
              }
            } else {
              requestBody = bodyData.rawContent
            }
            break
          case 'form-data':
            // Handle form data
            break
          case 'x-www-form-urlencoded':
            // Handle URL encoded
            break
          case 'graphql':
            requestBody = {
              query: bodyData.graphqlQuery,
              variables: bodyData.graphqlVariables ? JSON.parse(bodyData.graphqlVariables) : {}
            }
            break
        }
      }

      // Send request
      const response = await directApiClient.sendRequest({
        method,
        url: finalUrl,
        headers: enabledHeaders,
        body: requestBody,
        timeout: 30000
      })

      setResponse(response)

      // Save to history
      await requestHistory.addToHistory({
        method,
        url: finalUrl,
        headers: enabledHeaders,
        body: requestBody,
        response,
        duration: response.time,
        status: response.status >= 200 && response.status < 300 ? 'success' : 'error'
      })

    } catch (error) {
      console.error('Request failed:', error)
      setResponse({
        status: 0,
        statusText: 'Request Failed',
        time: 0,
        size: 0,
        error: { message: error instanceof Error ? error.message : 'Unknown error' }
      })
    } finally {
      setIsSending(false)
    }
  }

  return {
    // State
    sidebarCollapsed,
    searchTerm,
    expandedCollections,
    selectedEndpoint,
    method,
    url,
    selectedEnvironment,
    params,
    headers,
    bodyData,
    isSending,
    response,
    collections: mockCollections,
    environments: mockEnvironments,

    // Actions
    setSidebarCollapsed,
    setSearchTerm,
    toggleCollection,
    setSelectedEndpoint,
    setMethod,
    setUrl,
    setSelectedEnvironment,
    setParams,
    setHeaders,
    setBodyData,
    sendRequest,

    // Computed
    filteredCollections
  }
}