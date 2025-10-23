/**
 * API Response Type Definitions
 */
/**
 * Base interface for all API responses with generic data type
 * @template T - Type of the response data
 */
export interface ApiResponse<T = unknown> {
    /** Indicates if the request was successful */
    success: boolean;
    /** Response payload (if successful) */
    data?: T;
    /** Human-readable success message */
    message?: string;
    /** Error details (if unsuccessful) */
    error?: string;
}
/**
 * Standardized error response structure
 */
export interface ApiError {
    /** Always false for error responses */
    success: false;
    /** Error message describing what went wrong */
    error: string;
    /** Machine-readable error code for programmatic handling */
    code?: string;
    /** Additional error context or validation details */
    details?: ValidationError[] | Record<string, unknown>;
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
/**
 * Individual validation error detail
 */
export interface ValidationError {
    /** Field name that failed validation */
    field: string;
    /** Validation error message */
    message: string;
    /** Validation rule that failed (e.g., 'required', 'minLength', 'email') */
    code?: string;
}
/**
 * HTTP method types supported by the API
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
/**
 * Request body types that can be sent to the API
 */
export type RequestBody = Record<string, unknown> | unknown[] | string | number | boolean | null;
/**
 * API headers structure
 */
export interface ApiHeaders {
    [key: string]: string;
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
    environments?: Array<{
        id: string;
        name: string;
        description?: string;
        is_active: boolean;
        created_at: string;
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
/**
 * Detailed endpoint information with test results
 */
export interface EndpointDetailsResponse {
    /** Unique endpoint identifier */
    id: string;
    /** Parent collection identifier */
    collection_id: string;
    /** Human-readable endpoint name */
    name: string;
    /** HTTP method for this endpoint */
    method: HttpMethod;
    /** Endpoint URL path */
    url: string;
    /** Default headers for endpoint requests */
    headers?: ApiHeaders;
    /** Default request body template */
    body?: RequestBody;
    /** Optional description of endpoint purpose */
    description?: string;
    /** ISO timestamp when endpoint was created */
    created_at: string;
    /** ISO timestamp when endpoint was last updated */
    updated_at: string;
    /** Parent collection information */
    collection?: {
        /** Collection identifier */
        id: string;
        /** Collection name */
        name: string;
        /** Parent collection identifier (if nested) */
        parent_id?: string;
    };
    /** Recent test execution results */
    test_results?: Array<{
        /** Test result identifier */
        id: string;
        /** HTTP status code received */
        status: number;
        /** Response time in milliseconds */
        response_time: number;
        /** ISO timestamp when test was executed */
        created_at: string;
    }>;
}
export interface TestExecutionRequest {
    endpoint_id: string;
    environment_id: string;
    override_variables?: Record<string, string>;
    save_result?: boolean;
}
/**
 * Result of a test execution against an endpoint
 */
export interface TestExecutionResponse {
    /** Test execution identifier */
    id: string;
    /** Endpoint that was tested */
    endpoint_id: string;
    /** Environment used for testing */
    environment_id: string;
    /** HTTP status code received */
    status: number;
    /** Response time in milliseconds */
    response_time: number;
    /** Raw response body (parsed if JSON) */
    response_body?: RequestBody;
    /** Response headers received */
    response_headers?: ApiHeaders;
    /** Error message if test failed */
    error?: string;
    /** ISO timestamp when test was executed */
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
/**
 * Request payload for creating a new endpoint
 */
export interface EndpointCreateRequest {
    /** Human-readable endpoint name */
    name: string;
    /** Parent collection identifier */
    collection_id: string;
    /** HTTP method for this endpoint */
    method: HttpMethod;
    /** Endpoint URL path */
    url: string;
    /** Default headers for endpoint requests */
    headers?: ApiHeaders;
    /** Default request body template */
    body?: RequestBody;
    /** Optional description of endpoint purpose */
    description?: string;
}
/**
 * Request payload for updating an existing endpoint
 */
export interface EndpointUpdateRequest {
    /** Updated human-readable endpoint name */
    name?: string;
    /** Updated HTTP method for this endpoint */
    method?: HttpMethod;
    /** Updated endpoint URL path */
    url?: string;
    /** Updated default headers for endpoint requests */
    headers?: ApiHeaders;
    /** Updated default request body template */
    body?: RequestBody;
    /** Updated description of endpoint purpose */
    description?: string;
}
//# sourceMappingURL=api.types.d.ts.map