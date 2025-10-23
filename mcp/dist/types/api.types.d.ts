/**
 * API Response Type Definitions
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface ApiError {
    success: false;
    error: string;
    code?: string;
    details?: any;
}
export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface ValidationError {
    field: string;
    message: string;
    code?: string;
}
export interface ProjectListResponse {
    projects: Array<{
        id: string;
        name: string;
        description?: string;
        role: 'owner' | 'member' | 'admin';
        created_at: string;
        updated_at: string;
    }>;
}
export interface ProjectDetailsResponse {
    id: string;
    name: string;
    description?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    members?: Array<{
        id: string;
        email: string;
        name?: string;
        role: string;
    }>;
    stats?: {
        collections: number;
        endpoints: number;
        environments: number;
        members: number;
    };
}
export interface McpConfigResponse {
    project: {
        id: string;
        name: string;
    };
    mcpClient: {
        token: string;
        serverURL: string;
    };
    environment: {
        active: string;
        variables: Record<string, string>;
    };
    instructions?: string;
}
export interface TokenValidationResponse {
    valid: boolean;
    project?: {
        id: string;
        name: string;
    };
    environment?: {
        name: string;
        variables: Record<string, string>;
    };
    lastValidatedAt?: string;
}
export interface CollectionsResponse {
    collections: Array<{
        id: string;
        parent_id?: string;
        name: string;
        description?: string;
        endpoint_count: number;
        children?: string[];
        created_at: string;
        updated_at: string;
    }>;
}
export interface CollectionDetailsResponse {
    id: string;
    project_id: string;
    parent_id?: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    endpoints?: Array<{
        id: string;
        name: string;
        method: string;
        url: string;
        description?: string;
    }>;
    stats?: {
        endpoints: number;
        testRuns: number;
        successRate: number;
        avgResponseTime: number;
    };
}
export interface EnvironmentsResponse {
    environments: Array<{
        id: string;
        project_id: string;
        name: string;
        is_default: boolean;
        variable_count: number;
        created_at: string;
        updated_at: string;
    }>;
}
export interface EnvironmentVariablesResponse {
    environment: {
        id: string;
        project_id: string;
        name: string;
        is_default: boolean;
        created_at: string;
        updated_at: string;
    };
    variables: Array<{
        key: string;
        value: string;
        description?: string;
        enabled: boolean;
        created_at: string;
    }>;
}
export interface EndpointsResponse {
    endpoints: Array<{
        id: string;
        collection_id: string;
        name: string;
        method: string;
        url: string;
        description?: string;
        created_at: string;
        updated_at: string;
        collection?: {
            id: string;
            name: string;
        };
    }>;
}
export interface EndpointDetailsResponse {
    id: string;
    collection_id: string;
    name: string;
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: any;
    description?: string;
    created_at: string;
    updated_at: string;
    collection?: {
        id: string;
        name: string;
        parent_id?: string;
    };
    test_results?: Array<{
        id: string;
        status: number;
        response_time: number;
        created_at: string;
    }>;
}
export interface TestExecutionRequest {
    endpoint_id: string;
    environment_id: string;
    override_variables?: Record<string, string>;
    save_result?: boolean;
}
export interface TestExecutionResponse {
    id: string;
    endpoint_id: string;
    environment_id: string;
    status: number;
    response_time: number;
    response_body?: any;
    response_headers?: Record<string, string>;
    error?: string;
    created_at: string;
}
export interface EnvironmentSetVariableRequest {
    environment_id: string;
    key: string;
    value: string;
    description?: string;
    enabled?: boolean;
}
export interface EnvironmentImportRequest {
    environment_id: string;
    variables: Array<{
        key: string;
        value: string;
        description?: string;
        enabled?: boolean;
    }>;
    overwrite?: boolean;
}
export interface CollectionCreateRequest {
    name: string;
    project_id: string;
    parent_id?: string;
    description?: string;
}
export interface EndpointCreateRequest {
    name: string;
    collection_id: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
    url: string;
    headers?: Record<string, string>;
    body?: any;
    description?: string;
}
export interface EndpointUpdateRequest {
    name?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
    url?: string;
    headers?: Record<string, string>;
    body?: any;
    description?: string;
}
//# sourceMappingURL=api.types.d.ts.map