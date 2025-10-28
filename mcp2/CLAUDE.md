# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the GASSAPI MCP server codebase.

## Project Overview

GASSAPI MCP v2 is a Node.js/TypeScript MCP (Model Context Protocol) server that provides AI assistant tools for API testing and automation. This server connects to the GASSAPI backend to enable AI-powered API management workflows.

## Development Commands

```bash
# Setup
npm install                                        # Install dependencies
npm run build                                      # Build TypeScript to JavaScript
npm run clean                                      # Clean build output

# Development
npm run dev                                        # Development mode with hot reload
npm run start                                      # Start production server
npm run typecheck                                  # Type checking without compilation

# Testing
npm test                                           # Run basic MCP test
node test/runners/run-all-tests.js                # Comprehensive test suite
node test/runners/run-category-tests.js [category] # Run specific test category
```

## Architecture Overview

### MCP Server Structure
```
mcp2/
├── src/
│   ├── index.ts           # Main MCP server entry point
│   ├── server.ts          # Core MCP server implementation
│   ├── tools/             # MCP tools organized by domain
│   │   ├── auth.ts        # Authentication & project context tools
│   │   ├── endpoints/     # API endpoint management tools
│   │   ├── environment/   # Environment variable tools
│   │   ├── folders/       # Project organization tools
│   │   ├── flows/         # API automation workflow tools
│   │   ├── testing/       # API testing tools
│   │   └── index.ts       # Tool registry and handlers
│   ├── types/             # TypeScript type definitions
│   └── helpers/           # Utility functions
├── dist/                  # Compiled JavaScript output
├── test/                  # Test files and runners
└── docs/                  # Documentation
```

### Tool Organization

The MCP server provides 25+ specialized tools organized into 6 main domains:

1. **Authentication Tools** (auth.ts)
   - Project context validation
   - Health check system status

2. **Endpoint Management Tools** (endpoints/)
   - CRUD operations for API endpoints
   - Individual endpoint testing
   - Semantic documentation support

3. **Environment Management Tools** (environment/)
   - Multi-environment configuration
   - Environment variable handling
   - Context switching

4. **Folder Organization Tools** (folders/)
   - Project folder management
   - Hierarchical organization

5. **Flow Automation Tools** (flows/)
   - Multi-step API workflow creation
   - Sequential and parallel execution
   - Variable interpolation

6. **Testing Tools** (testing/)
   - Endpoint validation
   - Flow testing
   - Integration testing

## Key Technologies

- **Node.js 16+** with ES modules
- **TypeScript** with strict configuration
- **MCP SDK v1.20.1** for Model Context Protocol integration
- **tsx** for development hot-reload and compilation

## Flow Steps Format

The flow automation system uses a powerful Steps format for creating API testing workflows:

### Basic Flow Structure
```json
{
  "name": "Flow Name",
  "description": "Flow description",
  "folderId": "optional_folder_id",
  "flow_data": {
    "version": "1.0",
    "steps": [
      {
        "id": "unique_step_id",
        "name": "Step Name",
        "method": "POST",
        "url": "{{baseUrl}}/api/endpoint",
        "headers": {"Content-Type": "application/json"},
        "body": "{\"key\": \"{{input.value}}\"}",
        "expectedStatus": 200,
        "outputs": {"result": "response.body.data"}
      }
    ],
    "config": {
      "delay": 1000,
      "retryCount": 2,
      "parallel": false
    }
  },
  "flow_inputs": [
    {
      "name": "baseUrl",
      "type": "string",
      "required": true,
      "description": "Base API URL"
    }
  ]
}
```

### Variable Interpolation
- `{{input.var}}`: Reference flow input parameters
- `{{step.output}}`: Chain data between steps (e.g., `{{create_user.userId}}`)
- Environment variables automatically available during execution

## Tool Implementation Pattern

Each tool follows this structure:

```typescript
// Tool definition
export const toolName: McpTool = {
  name: 'tool_name',
  description: 'Tool description',
  inputSchema: {
    type: 'object',
    properties: {
      // Input parameters
    }
  }
};

// Handler implementation
export async function handleTool(args: any): Promise<McpToolResponse> {
  try {
    // Tool logic here
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

## Backend Integration

The MCP server connects to the GASSAPI backend through HTTP requests:

- **Base URL**: Hardcoded to `http://mapi.gass.web.id`
- **Authentication**: JWT token-based authentication from gassapi.json
- **Project Context**: Required for most operations
- **Error Handling**: Consistent error response format

## Testing

### Test Structure
- Unit tests for individual tools
- Integration tests for tool workflows
- Mock backend for isolated testing
- Comprehensive test runners by category

### Running Tests
```bash
# All tests
node test/runners/run-all-tests.js

# Specific category
node test/runners/run-category-tests.js endpoints
node test/runners/run-category-tests.js flows
node test/runners/run-category-tests.js environment
```

## Configuration

### Environment Variables
The MCP server uses hardcoded base URL and requires these settings:

```env
# Project Configuration (required)
GASSAPI_PROJECT_ID=your_project_id
GASSAPI_TOKEN=your_jwt_token

# MCP Server (optional)
MCP_SERVER_PORT=3000
MCP_SERVER_HOST=localhost
```

**Note:** Base URL is hardcoded to `http://mapi.gass.web.id` and does not require configuration.

## Important Development Notes

- **TypeScript Strict Mode**: All code must pass strict type checking
- **Error Handling**: Consistent error response format across all tools
- **Input Validation**: Validate all input parameters before processing
- **Backend Communication**: All backend operations go through proper handlers
- **Tool Naming**: Use snake_case for tool names (e.g., `create_endpoint`)
- **Documentation**: Include comprehensive descriptions for all tools
- **Testing**: Write tests for all new tools and functionality

## Adding New Tools

1. Create tool definition in appropriate domain file
2. Implement handler function with proper error handling
3. Add tool to exports in `tools/index.ts`
4. Write comprehensive tests
5. Update documentation

Example:
```typescript
// In appropriate domain file
export const newTool: McpTool = {
  name: 'new_tool',
  description: 'Description of what the tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'Parameter description' }
    },
    required: ['param1']
  }
};

// Handler implementation
export async function handleNewTool(args: any): Promise<McpToolResponse> {
  // Implementation
}
```

## AI Integration Features

The MCP server enables AI assistants to:

- **Automate API Testing**: Create and execute complex API test flows
- **Manage Projects**: Organize endpoints and folders
- **Handle Environments**: Switch between different configurations
- **Document APIs**: Work with semantic endpoint documentation
- **Execute Workflows**: Run multi-step API operations with variable interpolation

Semantic documentation fields (`purpose`, `request_params`, `response_schema`, `header_docs`) enhance AI understanding of API context and enable more accurate assistance.