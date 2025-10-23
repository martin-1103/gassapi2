import { ProjectDetailsResponse, CollectionsResponse, EnvironmentsResponse, EnvironmentVariablesResponse, EndpointsResponse, EndpointDetailsResponse, TokenValidationResponse, TestExecutionResponse, EnvironmentSetVariableRequest, EnvironmentImportRequest, CollectionCreateRequest, EndpointCreateRequest, EndpointUpdateRequest } from '../types/api.types';
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
        project: any;
        environments: any[];
        collections?: any[];
        endpoints?: any[];
    }>;
    getProjectDetails(projectId: string): Promise<ProjectDetailsResponse>;
    getCollections(projectId: string): Promise<CollectionsResponse>;
    createCollection(collectionData: CollectionCreateRequest): Promise<any>;
    moveCollection(collectionId: string, newParentId: string): Promise<any>;
    deleteCollection(collectionId: string, force?: boolean): Promise<any>;
    getEnvironments(projectId: string): Promise<EnvironmentsResponse>;
    getEnvironmentVariables(environmentId: string): Promise<EnvironmentVariablesResponse>;
    setEnvironmentVariable(variableData: EnvironmentSetVariableRequest): Promise<any>;
    exportEnvironment(environmentId: string, format?: 'json' | 'env' | 'yaml'): Promise<any>;
    importEnvironment(importData: EnvironmentImportRequest): Promise<any>;
    getEndpoints(collectionId?: string, projectId?: string): Promise<EndpointsResponse>;
    getEndpointDetails(endpointId: string): Promise<EndpointDetailsResponse>;
    createEndpoint(endpointData: EndpointCreateRequest): Promise<any>;
    updateEndpoint(endpointId: string, updateData: EndpointUpdateRequest): Promise<any>;
    moveEndpoint(endpointId: string, newCollectionId: string): Promise<any>;
    testEndpoint(endpointId: string, environmentId: string, overrideVariables?: Record<string, string>): Promise<TestExecutionResponse>;
    private fetchWithTimeout;
    clearCache(): Promise<void>;
    getCacheStats(): Promise<any>;
    healthCheck(): Promise<{
        status: string;
        timestamp: number;
    }>;
}
//# sourceMappingURL=BackendClient.d.ts.map