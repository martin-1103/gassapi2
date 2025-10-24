import { ProjectDetailsResponse, CollectionsResponse, EnvironmentsResponse, EnvironmentVariablesResponse, EndpointsResponse, EndpointDetailsResponse, TokenValidationResponse, TestExecutionResponse, EnvironmentSetVariableRequest, EnvironmentImportRequest, CollectionCreateRequest, EndpointCreateRequest, EndpointUpdateRequest, CollectionDetailsResponse } from '../types/api.types.js';
export type UnifiedEnvironment = {
    id: string;
    name: string;
    description?: string;
    is_active?: boolean;
    is_default?: boolean;
    project_id?: string;
    variable_count?: number;
    created_at: string;
    updated_at?: string;
};
/**
 * Backend API Client with integrated caching
 * Handles all communication with GASSAPI backend
 */
export declare class BackendClient {
    private baseUrl;
    private token;
    private cacheManager;
    private defaultHeaders;
    constructor(baseUrl: string, token: string);
    validateToken(): Promise<TokenValidationResponse>;
    getProjectContext(projectId: string): Promise<{
        project: ProjectDetailsResponse;
        environments: UnifiedEnvironment[];
        collections?: CollectionsResponse['collections'];
        endpoints?: EndpointsResponse['endpoints'];
    }>;
    getProjectDetails(projectId: string): Promise<ProjectDetailsResponse>;
    getCollections(projectId: string): Promise<CollectionsResponse>;
    createCollection(collectionData: CollectionCreateRequest): Promise<CollectionDetailsResponse>;
    moveCollection(collectionId: string, newParentId: string): Promise<CollectionDetailsResponse>;
    deleteCollection(collectionId: string, force?: boolean): Promise<{
        success: boolean;
        message?: string;
    }>;
    getEnvironments(projectId: string): Promise<EnvironmentsResponse>;
    getEnvironmentVariables(environmentId: string): Promise<EnvironmentVariablesResponse>;
    setEnvironmentVariable(variableData: EnvironmentSetVariableRequest): Promise<{
        success: boolean;
        variable?: {
            key: string;
            value: string;
            description?: string;
            enabled: boolean;
        };
    }>;
    exportEnvironment(environmentId: string, format?: 'json' | 'env' | 'yaml'): Promise<{
        content: string;
        format: string;
    }>;
    importEnvironment(importData: EnvironmentImportRequest): Promise<{
        success: boolean;
        imported?: number;
    }>;
    getEndpoints(collectionId?: string, projectId?: string): Promise<EndpointsResponse>;
    getEndpointDetails(endpointId: string): Promise<EndpointDetailsResponse>;
    createEndpoint(endpointData: EndpointCreateRequest): Promise<EndpointDetailsResponse>;
    updateEndpoint(endpointId: string, updateData: EndpointUpdateRequest): Promise<EndpointDetailsResponse>;
    moveEndpoint(endpointId: string, newCollectionId: string): Promise<EndpointDetailsResponse>;
    testEndpoint(endpointId: string, environmentId: string, overrideVariables?: Record<string, string>): Promise<TestExecutionResponse>;
    private fetchWithTimeout;
    clearCache(): Promise<void>;
    getCacheStats(): Promise<{
        projects: number;
        tokens: number;
        totalFiles: number;
        totalSize: number;
    }>;
    healthCheck(): Promise<{
        status: string;
        timestamp: number;
        error?: string;
    }>;
}
//# sourceMappingURL=BackendClient.d.ts.map