# AI MCP Tools Usage Rules

## 🎯 Purpose
Guide for AI (Claude) on using GASSAPI MCP2 tools correctly and efficiently.

## 🚀 Golden Rules

### 1. **Authentication First**
- **ALWAYS** ensure user is authenticated before using any MCP tool
- Check for valid JWT token via `get_session_state()` or context
- If auth fails → instruct user to login first

### 2. **Required Parameters**
- **NEVER** call tools without required parameters
- Flow tools: `project_id`, `flow_id`, `environment_id` are mandatory
- Endpoint tools: `endpoint_id`, `environment_id` are mandatory
- Ask user for missing required values, don't guess

### 3. **Sequential Logic**
Follow this order for flow operations:
1. `set_environment_variables()` (if needed)
2. `create_flow()` or `get_flow_detail()`
3. `execute_flow()`
4. Analyze results
5. `update_flow()` or `delete_flow()` (if needed)

### 4. **Variable Interpolation Rules**
- Use `{{env.VARIABLE_NAME}}` for environment variables
- Use `{{input.field_name}}` for flow inputs
- Use `{{stepId.output_field}}` for step outputs
- **NEVER** use undefined variables in flow steps

## 📋 Tool-Specific Rules

### Flow Management Tools

#### `create_flow`
```javascript
// ✅ CORRECT
{
  project_id: "valid_project_id",
  name: "Descriptive flow name",
  flow_data: {
    version: "1.0",
    steps: [
      {
        id: "unique_step_id",
        name: "Step description",
        method: "GET",
        url: "{{env.baseUrl}}/api/users",
        outputs: {
          "users": "response.body.data"
        }
      }
    ],
    config: {
      delay: 1000,
      retryCount: 2,
      parallel: false
    }
  }
}

// ❌ WRONG
create_flow({ name: "test" }) // Missing project_id
```

#### `execute_flow`
```javascript
// ✅ CORRECT
{
  flow_id: "valid_flow_id",
  environment_id: "valid_env_id",
  debug_mode: true, // Use for troubleshooting
  override_variables: {
    "envVar": "override_value"
  }
}

// ❌ WRONG
execute_flow({ flow_id: "123" }) // Missing environment_id
```

### Testing Tools

#### `test_endpoint`
```javascript
// ✅ CORRECT
{
  endpoint_id: "valid_endpoint_id",
  environment_id: "valid_env_id",
  override_variables: {
    "api_key": "test_key"
  }
}
```

## 🔄 Session Management Rules

### State Management
1. **Set variables before execution**
   ```javascript
   await set_environment_variables({ baseUrl: "https://api.example.com" })
   await set_flow_inputs({ userId: "123" })
   ```

2. **Use session state for interpolation**
   - AI can access previous outputs via step results
   - Use `get_session_state()` to debug

3. **Clean up after testing**
   ```javascript
   await clear_session_state({ state_type: "environment" })
   ```

## 🛡️ Safety Rules

### 1. **Input Validation**
- Validate project_id, flow_id, environment_id exist
- Check endpoint configuration before execution
- Don't execute malformed flow steps

### 2. **Error Handling**
- **ALWAYS** handle tool errors gracefully
- Parse error messages for actionable feedback
- Suggest next steps when tools fail

### 3. **Timeout Management**
- Set reasonable timeouts (30s default, 5min max for flows)
- Monitor execution time
- Abort long-running operations

## 🎨 Best Practices

### 1. **Flow Design**
- Use descriptive step IDs and names
- Define clear input/output mappings
- Set appropriate delays between steps
- Use parallel execution for independent steps

### 2. **Variable Usage**
- Prefer environment variables over hardcoded values
- Use consistent variable naming
- Document variable purposes in flow descriptions

### 3. **Debugging**
- Enable `debug_mode: true` for troubleshooting
- Review step-by-step execution logs
- Check variable interpolation results

## ❌ Common Mistakes to Avoid

### 1. **Missing Required Parameters**
```javascript
// ❌ WRONG
await execute_flow({ flow_id: "123" })

// ✅ CORRECT
await execute_flow({
  flow_id: "123",
  environment_id: "env_456"
})
```

### 2. **Undefined Variables**
```javascript
// ❌ WRONG
url: "{{undefined_var}}/api/users"

// ✅ CORRECT
url: "{{env.baseUrl}}/api/users"
```

### 3. **Invalid Flow Structure**
```javascript
// ❌ WRONG
flow_data: {
  steps: [] // Empty steps
}

// ✅ CORRECT
flow_data: {
  version: "1.0",
  steps: [/* valid steps */],
  config: {
    delay: 1000,
    retryCount: 2,
    parallel: false
  }
}
```

## 🎯 Response Handling Rules

### Success Responses
1. **Acknowledge completion** with ✅ emoji
2. **Summarize key results** (execution time, status)
3. **Highlight important outputs** or errors
4. **Suggest next actions** if applicable

### Error Responses
1. **Clearly explain the error** with ❌ emoji
2. **Provide specific solution** if known
3. **Guide user to fix the issue**
4. **Offer retry with corrections**

## 🔄 Tool Combination Patterns

### Pattern 1: Create & Execute Flow
```javascript
// 1. Set up environment
await set_environment_variables({ baseUrl: "https://api.example.com" })

// 2. Create flow
await create_flow({
  project_id: "proj_123",
  name: "User API Test",
  flow_data: { /* valid flow structure */ }
})

// 3. Execute flow
await execute_flow({
  flow_id: "flow_456",
  environment_id: "env_789"
})
```

### Pattern 2: Debug Existing Flow
```javascript
// 1. Get flow details
await get_flow_detail({ flow_id: "flow_123" })

// 2. Execute with debug mode
await execute_flow({
  flow_id: "flow_123",
  environment_id: "env_456",
  debug_mode: true
})

// 3. Analyze and fix issues
```

### Pattern 3: Test Single Endpoint
```javascript
// 1. Set environment
await set_environment_variables({ apiKey: "test_key" })

// 2. Test endpoint
await test_endpoint({
  endpoint_id: "endpoint_123",
  environment_id: "env_456",
  override_variables: { "testMode": "true" }
})
```

## 🎯 Quick Reference

| Tool | Required Params | Common Use Case |
|------|----------------|-----------------|
| `create_flow` | project_id, name | Create new API test flow |
| `execute_flow` | flow_id, environment_id | Run automated API tests |
| `test_endpoint` | endpoint_id, environment_id | Test single API endpoint |
| `list_flows` | project_id | Browse existing flows |
| `get_flow_detail` | flow_id | Inspect flow configuration |

## ⚡ Pro Tips

1. **Use debug mode** when flow execution fails
2. **Check session state** before complex operations
3. **Validate flow structure** before execution
4. **Clean up state** between different test scenarios
5. **Document variables** for better maintainability