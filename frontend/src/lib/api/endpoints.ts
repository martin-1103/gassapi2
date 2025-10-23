import { apiClient, buildQuery } from './client'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ApiResponse,
  Project,
  Collection,
  Endpoint,
  Environment,
  Flow,
  User,
} from '@/types/api'

// ==================== AUTH ====================
export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>(buildQuery('login'), data),

  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>(buildQuery('register'), data),

  logout: () =>
    apiClient.post<ApiResponse>(buildQuery('logout')),

  logoutAll: () =>
    apiClient.post<ApiResponse>(buildQuery('logout_all')),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthResponse>>(buildQuery('refresh'), { refresh_token: refreshToken }),

  changePassword: (data: { old_password: string; new_password: string }) =>
    apiClient.post<ApiResponse>(buildQuery('change_password'), data),
}

// ==================== PROFILE ====================
export const profileApi = {
  get: () =>
    apiClient.get<ApiResponse<User>>(buildQuery('profile')),

  update: (data: Partial<User>) =>
    apiClient.post<ApiResponse<User>>(buildQuery('profile_update'), data),
}

// ==================== PROJECTS ====================
export const projectsApi = {
  list: () =>
    apiClient.get<ApiResponse<Project[]>>(buildQuery('projects')),

  create: (data: { name: string; description?: string; is_public?: boolean }) =>
    apiClient.post<ApiResponse<Project>>(buildQuery('projects'), data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Project>>(buildQuery('project_detail', id)),

  update: (id: string, data: Partial<Project>) =>
    apiClient.put<ApiResponse<Project>>(buildQuery('project_update', id), data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse>(buildQuery('project_delete', id)),

  addMember: (id: string, data: { user_id: string; role?: string }) =>
    apiClient.post<ApiResponse>(buildQuery('project_add_member', id), data),
}

// ==================== COLLECTIONS ====================
export const collectionsApi = {
  list: (projectId: string) =>
    apiClient.get<ApiResponse<Collection[]>>(buildQuery('collections_list', projectId)),

  create: (projectId: string, data: { 
    name: string
    description?: string
    parent_id?: string
    headers?: Record<string, string>
    variables?: Record<string, string>
  }) =>
    apiClient.post<ApiResponse<Collection>>(buildQuery('collection_create', projectId), data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Collection>>(buildQuery('collection_detail', id)),

  update: (id: string, data: Partial<Collection>) =>
    apiClient.put<ApiResponse<Collection>>(buildQuery('collection_update', id), data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse>(buildQuery('collection_delete', id)),
}

// ==================== ENDPOINTS ====================
export const endpointsApi = {
  list: (collectionId: string) =>
    apiClient.get<ApiResponse<Endpoint[]>>(buildQuery('endpoints_list', collectionId)),

  create: (collectionId: string, data: {
    name: string
    method: string
    url: string
    headers?: Record<string, string>
    body?: string | null
  }) =>
    apiClient.post<ApiResponse<Endpoint>>(buildQuery('endpoint_create', collectionId), data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Endpoint>>(buildQuery('endpoint_detail', id)),

  update: (id: string, data: Partial<Endpoint>) =>
    apiClient.put<ApiResponse<Endpoint>>(buildQuery('endpoint_update', id), data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse>(buildQuery('endpoint_delete', id)),
}

// ==================== ENVIRONMENTS ====================
export const environmentsApi = {
  list: (projectId: string) =>
    apiClient.get<ApiResponse<Environment[]>>(buildQuery('environments_list', projectId)),

  create: (projectId: string, data: {
    name: string
    variables?: Record<string, string>
    is_default?: boolean
  }) =>
    apiClient.post<ApiResponse<Environment>>(buildQuery('environment_create', projectId), data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Environment>>(buildQuery('environment_detail', id)),

  update: (id: string, data: Partial<Environment>) =>
    apiClient.put<ApiResponse<Environment>>(buildQuery('environment_update', id), data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse>(buildQuery('environment_delete', id)),
}

// ==================== FLOWS ====================
export const flowsApi = {
  list: (projectId: string) =>
    apiClient.get<ApiResponse<Flow[]>>(buildQuery('flows_list', projectId)),

  listActive: (projectId: string) =>
    apiClient.get<ApiResponse<Flow[]>>(buildQuery('flows_active_list', projectId)),

  create: (projectId: string, data: {
    name: string
    description?: string
    collection_id?: string
    flow_data?: any
    is_active?: boolean
  }) =>
    apiClient.post<ApiResponse<Flow>>(buildQuery('flow_create', projectId), data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Flow>>(buildQuery('flow_detail', id)),

  update: (id: string, data: Partial<Flow>) =>
    apiClient.put<ApiResponse<Flow>>(buildQuery('flow_update', id), data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse>(buildQuery('flow_delete', id)),

  toggleActive: (id: string) =>
    apiClient.put<ApiResponse<Flow>>(buildQuery('flow_toggle_active', id)),

  duplicate: (id: string) =>
    apiClient.post<ApiResponse<Flow>>(buildQuery('flow_duplicate', id)),
}
