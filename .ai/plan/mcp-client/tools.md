# 🔧 MCP Tools Specification

## 🎯 Overview

AI-callable functions untuk complete API testing workflow dengan Claude Desktop + GassAPI Backend Integration.

---

## 📋 Complete API Integration Tools (41 Tools)

### 1. **🔐 Authentication & Token Management (5 tools)**

#### generate_mcp_key
```json
{
  "name": "generate_mcp_key",
  "description": "Generate new MCP API key untuk project access",
  "inputSchema": {
    "type": "object",
    "properties": {
      "projectId": { "type": "string", "description": "Project UUID" },
      "description": { "type": "string", "description": "Token description" }
    },
    "required": ["projectId"]
  }
}
```

#### validate_mcp_token
```json
{
  "name": "validate_mcp_token",
  "description": "Validate MCP token dan get project info",
  "inputSchema": {
    "type": "object",
    "properties": {
      "token": { "type": "string", "description": "MCP token to validate" }
    },
    "required": ["token"]
  }
}
```

#### list_mcp_tokens
```json
{
  "name": "list_mcp_tokens",
  "description": "List semua MCP tokens untuk project",
  "inputSchema": {
    "type": "object",
    "properties": {
      "projectId": { "type": "string", "description": "Project UUID" }
    },
    "required": ["projectId"]
  }
}
```

#### get_mcp_stats
```json
{
  "name": "get_mcp_stats",
  "description": "Get token usage statistics",
  "inputSchema": {
    "type": "object",
    "properties": {
      "projectId": { "type": "string", "description": "Project UUID" }
    },
    "required": ["projectId"]
  }
}
```

#### revoke_mcp_token
```json
{
  "name": "revoke_mcp_token",
  "description": "Revoke MCP token access",
  "inputSchema": {
    "type": "object",
    "properties": {
      "tokenId": { "type": "string", "description": "Token UUID to revoke" }
    },
    "required": ["tokenId"]
  }
}
```

### 2. **🏗️ Project Context & Configuration (4 tools)**

#### get_project_context
```json
{
  "name": "get_project_context",
  "description": "Load complete project context (collections, endpoints, environments)",
  "inputSchema": {
    "type": "object",
    "properties": {
      "projectId": { "type": "string", "description": "Project UUID" },
      "includeCollections": { "type": "boolean", "default": true },
      "includeEndpoints": { "type": "boolean", "default": true },
      "includeEnvironments": { "type": "boolean", "default": true }
    },
    "required": ["projectId"]
  }
}
```

#### get_mcp_config
```json
{
  "name": "get_mcp_config",
  "description": "Get MCP configuration untuk project",
  "inputSchema": {
    "type": "object",
    "properties": {
      "projectId": { "type": "string", "description": "Project UUID" },
      "environmentId": { "type": "string", "description": "Environment UUID" }
    },
    "required": ["projectId"]
  }
}
```

#### generate_project_config
```json
{
  "name": "generate_project_config",
  "description": "Generate gassapi.json config file",
  "inputSchema": {
    "type": "object",
    "properties": {
      "projectId": { "type": "string", "description": "Project UUID" },
      "environment": { "type": "string", "description": "Target environment" },
      "includeAuth": { "type": "boolean", "default": true }
    },
    "required": ["projectId"]
  }
}
```

#### test_mcp_connection
```json
{
  "name": "test_mcp_connection",
  "description": "Test MCP connection ke backend API",
  "inputSchema": {
    "type": "object",
    "properties": {
      "baseUrl": { "type": "string", "description": "Backend API base URL" },
      "token": { "type": "string", "description": "MCP token" }
    },
    "required": ["baseUrl", "token"]
  }
}
```

### 3. **🧪 Endpoint Testing & Execution (6 tools)**

#### test_endpoint
```json
{
  "name": "test_endpoint",
  "description": "Execute single endpoint test dengan environment variables",
  "inputSchema": {
    "type": "object",
    "properties": {
      "endpointId": { "type": "string", "description": "Endpoint UUID" },
      "environmentId": { "type": "string", "description": "Environment UUID" },
      "overrideVariables": { "type": "object", "description": "Override environment variables" },
      "saveResult": { "type": "boolean", "default": true }
    },
    "required": ["endpointId", "environmentId"]
  }
}
```

#### test_endpoint_batch
```json
{
  "name": "test_endpoint_batch",
  "description": "Batch endpoint testing untuk multiple endpoints",
  "inputSchema": {
    "type": "object",
    "properties": {
      "endpointIds": { "type": "array", "items": { "type": "string" }, "description": "Array of Endpoint UUIDs" },
      "environmentId": { "type": "string", "description": "Environment UUID" },
      "parallel": { "type": "boolean", "default": false },
      "delay": { "type": "number", "description": "Delay between requests in ms" }
    },
    "required": ["endpointIds", "environmentId"]
  }
}
```

#### get_execution_history
```json
{
  "name": "get_execution_history",
  "description": "Get test execution history untuk endpoint",
  "inputSchema": {
    "type": "object",
    "properties": {
      "endpointId": { "type": "string", "description": "Endpoint UUID" },
      "fromDate": { "type": "string", "description": "ISO date string" },
      "toDate": { "type": "string", "description": "ISO date string" },
      "limit": { "type": "number", "default": 20 }
    },
    "required": ["endpointId"]
  }
}
```

#### analyze_execution_result
```json
{
  "name": "analyze_execution_result",
  "description": "AI analysis dari test execution results",
  "inputSchema": {
    "type": "object",
    "properties": {
      "executionId": { "type": "string", "description": "Execution UUID" },
      "focus": { "type": "array", "items": { "type": "string" }, "description": "Analysis focus: performance, security, errors" }
    },
    "required": ["executionId"]
  }
}
```

#### create_test_flow
```json
{
  "name": "create_test_flow",
  "description": "Create automated test flow dengan AI assistance",
  "inputSchema": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "description": "Flow name" },
      "description": { "type": "string", "description": "Flow description" },
      "collectionId": { "type": "string", "description": "Collection UUID" },
      "environmentId": { "type": "string", "description": "Environment UUID" },
      "testType": { "type": "string", "enum": ["smoke", "regression", "integration"] }
    },
    "required": ["name", "collectionId", "environmentId"]
  }
}
```

#### run_test_suite
```json
{
  "name": "run_test_suite",
  "description": "Execute comprehensive test suite untuk collection",
  "inputSchema": {
    "type": "object",
    "properties": {
      "collectionId": { "type": "string", "description": "Collection UUID" },
      "environmentId": { "type": "string", "description": "Environment UUID" },
      "testType": { "type": "string", "enum": ["all", "failed-only", "modified-only"] },
      "parallel": { "type": "boolean", "default": true }
    },
    "required": ["collectionId", "environmentId"]
  }
}
```

### 4. **🌍 Environment Management (8 tools)**

#### list_environments
```json
{
  "name": "list_environments",
  "description": "Get all project environments",
  "inputSchema": {
    "type": "object",
    "properties": {
      "projectId": { "type": "string", "description": "Project UUID" },
      "includeVariables": { "type": "boolean", "default": false }
    },
    "required": ["projectId"]
  }
}
```

#### get_environment_variables
```json
{
  "name": "get_environment_variables",
  "description": "Get environment variables untuk testing",
  "inputSchema": {
    "type": "object",
    "properties": {
      "environmentId": { "type": "string", "description": "Environment UUID" },
      "includeDisabled": { "type": "boolean", "default": false }
    },
    "required": ["environmentId"]
  }
}
```

#### set_environment_variable
```json
{
  "name": "set_environment_variable",
  "description": "Update/add environment variable",
  "inputSchema": {
    "type": "object",
    "properties": {
      "environmentId": { "type": "string", "description": "Environment UUID" },
      "key": { "type": "string", "description": "Variable key" },
      "value": { "type": "string", "description": "Variable value" },
      "description": { "type": "string", "description": "Variable description" },
      "enabled": { "type": "boolean", "default": true }
    },
    "required": ["environmentId", "key", "value"]
  }
}
```

#### export_environment
```json
{
  "name": "export_environment",
  "description": "Export environment configuration",
  "inputSchema": {
    "type": "object",
    "properties": {
      "environmentId": { "type": "string", "description": "Environment UUID" },
      "format": { "type": "string", "enum": ["json", "env", "yaml"], "default": "json" },
      "includeDisabled": { "type": "boolean", "default": false }
    },
    "required": ["environmentId"]
  }
}
```

#### import_environment
```json
{
  "name": "import_environment",
  "description": "Import environment variables",
  "inputSchema": {
    "type": "object",
    "properties": {
      "environmentId": { "type": "string", "description": "Environment UUID" },
      "variables": { "type": "array", "items": { "type": "object" }, "description": "Array of variables" },
      "overwrite": { "type": "boolean", "default": false }
    },
    "required": ["environmentId", "variables"]
  }
}
```

#### duplicate_environment
```json
{
  "name": "duplicate_environment",
  "description": "Clone environment dengan variables",
  "inputSchema": {
    "type": "object",
    "properties": {
      "environmentId": { "type": "string", "description": "Environment UUID to clone" },
      "name": { "type": "string", "description": "New environment name" },
      "includeVariables": { "type": "boolean", "default": true }
    },
    "required": ["environmentId", "name"]
  }
}
```

#### set_default_environment
```json
{
  "name": "set_default_environment",
  "description": "Set active environment untuk project",
  "inputSchema": {
    "type": "object",
    "properties": {
      "environmentId": { "type": "string", "description": "Environment UUID" }
    },
    "required": ["environmentId"]
  }
}
```

#### validate_environment
```json
{
  "name": "validate_environment",
  "description": "Validate environment configuration",
  "inputSchema": {
    "type": "object",
    "properties": {
      "environmentId": { "type": "string", "description": "Environment UUID" },
      "testConnection": { "type": "boolean", "default": true }
    },
    "required": ["environmentId"]
  }
}
```

### 5. **📁 Project Management (7 tools)**

#### get_projects
```json
{
  "name": "get_projects",
  "description": "List user projects dengan role info",
  "inputSchema": {
    "type": "object",
    "properties": {
      "role": { "type": "string", "enum": ["owner", "member", "all"], "default": "all" },
      "search": { "type": "string", "description": "Search term" },
      "limit": { "type": "number", "default": 20 }
    }
  }
}
```

#### create_project
```json
{
  "name": "create_project",
  "description": "Create new project",
  "inputSchema": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "description": "Project name" },
      "description": { "type": "string", "description": "Project description" }
    },
    "required": ["name"]
  }
}
```

#### get_project_details
```json
{
  "name": "get_project_details",
  "description": "Get detailed project information",
  "inputSchema": {
    "type": "object",
    "properties": {
      "projectId": { "type": "string", "description": "Project UUID" },
      "includeStats": { "type": "boolean", "default": true }
    },
    "required": ["projectId"]
  }
}
```

#### get_project_stats
```json
{
  "name": "get_project_stats",
  "description": "Get comprehensive project statistics",
  "inputSchema": {
    "type": "object",
    "properties": {
      "projectId": { "type": "string", "description": "Project UUID" },
      "period": { "type": "string", "enum": ["7d", "30d", "90d"], "default": "30d" }
    },
    "required": ["projectId"]
  }
}
```

#### invite_project_member
```json
{
  "name": "invite_project_member",
  "description": "Add team member ke project",
  "inputSchema": {
    "type": "object",
    "properties": {
      "projectId": { "type": "string", "description": "Project UUID" },
      "email": { "type": "string", "description": "Member email" },
      "role": { "type": "string", "enum": ["member", "admin"], "default": "member" }
    },
    "required": ["projectId", "email"]
  }
}
```

#### export_project_data
```json
{
  "name": "export_project_data",
  "description": "Export complete project data",
  "inputSchema": {
    "type": "object",
    "properties": {
      "projectId": { "type": "string", "description": "Project UUID" },
      "format": { "type": "string", "enum": ["json", "yaml", "csv"], "default": "json" },
      "includeCollections": { "type": "boolean", "default": true },
      "includeEndpoints": { "type": "boolean", "default": true },
      "includeEnvironments": { "type": "boolean", "default": true }
    },
    "required": ["projectId"]
  }
}
```

#### generate_claude_desktop_config
```json
{
  "name": "generate_claude_desktop_config",
  "description": "Generate Claude Desktop MCP configuration",
  "inputSchema": {
    "type": "object",
    "properties": {
      "projectId": { "type": "string", "description": "Project UUID" },
      "environment": { "type": "string", "description": "Environment name" },
      "installGlobally": { "type": "boolean", "default": true }
    },
    "required": ["projectId"]
  }
}
```

### 6. **📚 Collection Management (6 tools)**

#### get_collections
```json
{
  "name": "get_collections",
  "description": "List project collections dengan hierarchy",
  "inputSchema": {
    "type": "object",
    "properties": {
      "projectId": { "type": "string", "description": "Project UUID" },
      "includeEndpointCount": { "type": "boolean", "default": true },
      "flatten": { "type": "boolean", "default": false }
    },
    "required": ["projectId"]
  }
}
```

#### create_collection
```json
{
  "name": "create_collection",
  "description": "Create new collection",
  "inputSchema": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "description": "Collection name" },
      "projectId": { "type": "string", "description": "Project UUID" },
      "parentId": { "type": "string", "description": "Parent collection UUID" },
      "description": { "type": "string", "description": "Collection description" }
    },
    "required": ["name", "projectId"]
  }
}
```

#### move_collection
```json
{
  "name": "move_collection",
  "description": "Reorganize collection hierarchy",
  "inputSchema": {
    "type": "object",
    "properties": {
      "collectionId": { "type": "string", "description": "Collection UUID" },
      "newParentId": { "type": "string", "description": "New parent UUID" }
    },
    "required": ["collectionId"]
  }
}
```

#### get_collection_stats
```json
{
  "name": "get_collection_stats",
  "description": "Get collection statistics dan metrics",
  "inputSchema": {
    "type": "object",
    "properties": {
      "collectionId": { "type": "string", "description": "Collection UUID" },
      "period": { "type": "string", "enum": ["7d", "30d", "90d"], "default": "30d" }
    },
    "required": ["collectionId"]
  }
}
```

#### duplicate_collection
```json
{
  "name": "duplicate_collection",
  "description": "Clone collection dengan endpoints",
  "inputSchema": {
    "type": "object",
    "properties": {
      "collectionId": { "type": "string", "description": "Collection UUID" },
      "name": { "type": "string", "description": "New collection name" },
      "projectId": { "type": "string", "description": "Target project UUID" },
      "includeEndpoints": { "type": "boolean", "default": true }
    },
    "required": ["collectionId", "name"]
  }
}
```

#### delete_collection
```json
{
  "name": "delete_collection",
  "description": "Remove collection dengan safety checks",
  "inputSchema": {
    "type": "object",
    "properties": {
      "collectionId": { "type": "string", "description": "Collection UUID" },
      "force": { "type": "boolean", "default": false }
    },
    "required": ["collectionId"]
  }
}
```

### 7. **🔧 Endpoint Management (5 tools)**

#### get_endpoint_details
```json
{
  "name": "get_endpoint_details",
  "description": "Get detailed endpoint configuration",
  "inputSchema": {
    "type": "object",
    "properties": {
      "endpointId": { "type": "string", "description": "Endpoint UUID" },
      "includeCollection": { "type": "boolean", "default": true }
    },
    "required": ["endpointId"]
  }
}
```

#### create_endpoint
```json
{
  "name": "create_endpoint",
  "description": "Create new endpoint",
  "inputSchema": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "description": "Endpoint name" },
      "method": { "type": "string", "enum": ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] },
      "url": { "type": "string", "description": "Endpoint URL" },
      "headers": { "type": "object", "description": "Request headers" },
      "body": { "type": "object", "description": "Request body" },
      "collectionId": { "type": "string", "description": "Collection UUID" }
    },
    "required": ["name", "method", "url", "collectionId"]
  }
}
```

#### update_endpoint
```json
{
  "name": "update_endpoint",
  "description": "Update endpoint configuration",
  "inputSchema": {
    "type": "object",
    "properties": {
      "endpointId": { "type": "string", "description": "Endpoint UUID" },
      "name": { "type": "string", "description": "Endpoint name" },
      "method": { "type": "string", "enum": ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] },
      "url": { "type": "string", "description": "Endpoint URL" },
      "headers": { "type": "object", "description": "Request headers" },
      "body": { "type": "object", "description": "Request body" }
    },
    "required": ["endpointId"]
  }
}
```

#### duplicate_endpoint
```json
{
  "name": "duplicate_endpoint",
  "description": "Clone endpoint ke collection",
  "inputSchema": {
    "type": "object",
    "properties": {
      "endpointId": { "type": "string", "description": "Endpoint UUID" },
      "name": { "type": "string", "description": "New endpoint name" },
      "collectionId": { "type": "string", "description": "Target collection UUID" }
    },
    "required": ["endpointId"]
  }
}
```

#### move_endpoint
```json
{
  "name": "move_endpoint",
  "description": "Move endpoint ke collection lain",
  "inputSchema": {
    "type": "object",
    "properties": {
      "endpointId": { "type": "string", "description": "Endpoint UUID" },
      "newCollectionId": { "type": "string", "description": "Target collection UUID" }
    },
    "required": ["endpointId", "newCollectionId"]
  }
}
```

### 8. **💊 Health & Monitoring (5 tools)**

#### check_api_health
```json
{
  "name": "check_api_health",
  "description": "Basic API health check",
  "inputSchema": {
    "type": "object",
    "properties": {
      "baseUrl": { "type": "string", "description": "API base URL" },
      "timeout": { "type": "number", "default": 5000 }
    },
    "required": ["baseUrl"]
  }
}
```

#### get_system_metrics
```json
{
  "name": "get_system_metrics",
  "description": "Get system performance metrics",
  "inputSchema": {
    "type": "object",
    "properties": {
      "format": { "type": "string", "enum": ["json", "prometheus"], "default": "json" },
      "includeDatabase": { "type": "boolean", "default": true }
    }
  }
}
```

#### get_database_status
```json
{
  "name": "get_database_status",
  "description": "Database health dan performance check",
  "inputSchema": {
    "type": "object",
    "properties": {}
  }
}
```

#### monitor_execution
```json
{
  "name": "monitor_execution",
  "description": "Real-time execution monitoring",
  "inputSchema": {
    "type": "object",
    "properties": {
      "executionId": { "type": "string", "description": "Execution UUID" },
      "timeout": { "type": "number", "default": 30000 }
    },
    "required": ["executionId"]
  }
}
```

#### get_performance_report
```json
{
  "name": "get_performance_report",
  "description": "Generate performance analysis report",
  "inputSchema": {
    "type": "object",
    "properties": {
      "period": { "type": "string", "enum": ["1h", "24h", "7d", "30d"], "default": "24h" },
      "includeEndpoints": { "type": "boolean", "default": true },
      "includeErrors": { "type": "boolean", "default": true }
    }
  }
}
```

---

## 🏗️ **Tool Registration & Security**

### Complete Tool Registry
```typescript
export const mcpTools = {
  // Authentication & Token Management
  generate_mcp_key,
  validate_mcp_token,
  list_mcp_tokens,
  get_mcp_stats,
  revoke_mcp_token,

  // Project Context & Configuration
  get_project_context,
  get_mcp_config,
  generate_project_config,
  test_mcp_connection,

  // Endpoint Testing & Execution
  test_endpoint,
  test_endpoint_batch,
  get_execution_history,
  analyze_execution_result,
  create_test_flow,
  run_test_suite,

  // Environment Management
  list_environments,
  get_environment_variables,
  set_environment_variable,
  export_environment,
  import_environment,
  duplicate_environment,
  set_default_environment,
  validate_environment,

  // Project Management
  get_projects,
  create_project,
  get_project_details,
  get_project_stats,
  invite_project_member,
  export_project_data,
  generate_claude_desktop_config,

  // Collection Management
  get_collections,
  create_collection,
  move_collection,
  get_collection_stats,
  duplicate_collection,
  delete_collection,

  // Endpoint Management
  get_endpoint_details,
  create_endpoint,
  update_endpoint,
  duplicate_endpoint,
  move_endpoint,

  // Health & Monitoring
  check_api_health,
  get_system_metrics,
  get_database_status,
  monitor_execution,
  get_performance_report
};
```

### Enhanced Security Configuration
```typescript
const enhancedSecurityConfig = {
  authentication: {
    required: true,
    mcpTokenValidation: true,
    projectMemberValidation: true
  },
  rateLimiting: {
    maxRequestsPerMinute: 100,
    maxConcurrentRequests: 10,
    burstLimit: 20
  },
  dataAccess: {
    allowedOperations: ['read', 'create', 'update'],
    projectScope: true,
    auditLogging: true
  },
  security: {
    validateProjectAccess: true,
    sanitizeInputs: true,
    encryptSensitiveData: true
  }
};
```

---

## 📊 **Usage Patterns & Workflows**

### **Complete API Testing Workflow**
1. **Setup**: `test_mcp_connection` → `get_project_context` → `get_mcp_config`
2. **Configuration**: `list_environments` → `get_environment_variables`
3. **Testing**: `test_endpoint` → `analyze_execution_result` → `get_execution_history`
4. **Management**: `create_collection` → `create_endpoint` → `run_test_suite`
5. **Monitoring**: `check_api_health` → `get_performance_report`

### **AI-Powered Features**
- **Smart Test Generation**: Automatic test case creation from API specs
- **Performance Analysis**: Real-time performance monitoring and optimization
- **Error Detection**: Pattern recognition and prevention strategies
- **Environment Management**: Intelligent variable substitution and validation

### **Integration Benefits**
- **Zero Configuration**: Auto-discovery of project context and settings
- **Complete Coverage**: Full CRUD access to all backend APIs
- **Real-time Collaboration**: Multi-user project management
- **Comprehensive Monitoring**: Health checks and performance metrics
- **Enhanced Security**: Token-based authentication with project scope validation
```

---

## 🔧 Implementation Details

### Tool Registration
```typescript
export const mcpTools = {
  create_flow,
  run_flow,
  save_flow,
  scan_local_endpoints,
  read_local_file,
  access_local_database,
  analyze_response,
  suggest_tests
};
```

### Security Limits
```typescript
const toolLimits = {
  maxRequestsPerMinute: 60,
  maxConcurrentRequests: 5,
  maxResponseSize: '10MB',
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
};
```

---

## 📊 Usage Patterns

### Flow Creation Workflow
1. Claude: `scan_local_endpoints()` → discover APIs
2. Claude: `create_flow()` → generate flow structure
3. Claude: `save_flow()` → store locally + optional cloud sync

### Local Testing Workflow
1. Claude: `run_flow()` → execute locally
2. MCP Client: Direct API calls to localhost
3. Claude: `analyze_response()` → AI analysis
4. Claude: `suggest_tests()` → improve coverage