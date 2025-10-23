// User dan Authentication Types
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
  expires_in: number
}

// Project Types
export interface Project {
  id: string
  name: string
  description: string
  owner_id: string
  is_public: boolean
  created_at: string
  updated_at?: string
}

// Collection Types
export interface Collection {
  id: string
  name: string
  description: string
  project_id: string
  parent_id: string | null
  headers: Record<string, string>
  variables: Record<string, string>
  is_default: boolean
  created_by: string
  created_at: string
  updated_at: string
}

// Endpoint Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

export interface Endpoint {
  id: string
  name: string
  method: HttpMethod
  url: string
  headers: Record<string, string>
  body: string | null
  collection_id: string
  created_by: string
  created_at: string
  updated_at: string
}

// Environment Types
export interface Environment {
  id: string
  name: string
  project_id: string
  is_default: boolean
  variables: Record<string, string>
  created_at: string
  updated_at?: string
}

// Flow Types
export interface FlowNode {
  id: string
  type: string
  data: any
  position: { x: number; y: number }
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface FlowData {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

export interface Flow {
  id: string
  name: string
  description: string
  project_id: string
  collection_id: string | null
  flow_data: FlowData
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

// API Response Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error'
  message: string
  data?: T
  code?: number
  timestamp?: string
}

export interface PaginatedResponse<T = any> {
  status: 'success'
  message: string
  data: T[]
  pagination?: {
    page: number
    limit: number
    total: number
  }
}

// Request/Response Testing Types
export interface EndpointResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  data: any
  time: number
}
