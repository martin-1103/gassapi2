# MCP Tools Usage Guide

## 🎯 Quick Reference

| Category | Tools | Required Parameters |
|----------|-------|-------------------|
| **Auth** | `get_project_context` | project_id (optional) |
| **Environment** | `list_environments` | project_id (optional) |
| | `get_environment_details` | environment_id |
| | `update_environment_variables` | environment_id, variables |
| **Collection** | `get_collections` | project_id (optional) |
| | `create_collection` | name |
| | `move_collection` | collection_id, new_parent_id |
| | `delete_collection` | collection_id |
| **Endpoint** | `list_endpoints` | project_id (optional) |
| | `get_endpoint_details` | endpoint_id |
| | `create_endpoint` | name, method, url, collection_id |
| | `update_endpoint` | endpoint_id |
| | `move_endpoint` | endpoint_id, new_collection_id |
| **Testing** | `test_endpoint` | endpoint_id, environment_id |
| **Flow** | `create_flow` | project_id, name |
| | `list_flows` | project_id |
| | `get_flow_detail` | flow_id |
| | `update_flow` | flow_id |
| | `delete_flow` | flow_id |
| | `execute_flow` | flow_id, environment_id |

## 🎯 User Intent → Tool Action

| User Request | Tool Action |
|--------------|------------|
| "Show my project" | `get_project_context` |
| "List environments" | `list_environments` |
| "Show collections" | `get_collections` |
| "Create collection" | `create_collection` |
| "Create endpoint" | `create_endpoint` |
| "Test endpoint" | `test_endpoint` |
| "Create flow" | `create_flow` |
| "Show flows" | `list_flows` |
| "Run flow" | `execute_flow` |
| "Update environment" | `update_environment_variables` |

## 📁 Tool Categories

- **[Auth Tools](tools/auth.md)** - Authentication & project context
- **[Environment Tools](tools/environment.md)** - Environment management
- **[Collection Tools](tools/collections.md)** - Collection management
- **[Endpoint Tools](tools/endpoints.md)** - Endpoint management
- **[Testing Tools](tools/testing.md)** - Endpoint testing
- **[Flow Tools](tools/flows.md)** - Flow creation & execution

## 🚀 Golden Rules

1. **Required Parameters** - Always provide required parameters
2. **Authentication** - Tools handle auth automatically via config
3. **Project Context** - Most tools use project_id from config if not provided
4. **Variable Interpolation** - Use `{{variableName}}` pattern
5. **No Manual Coding** - Direct tool calls, no programming needed