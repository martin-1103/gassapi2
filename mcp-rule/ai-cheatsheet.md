# MCP Tools AI Cheatsheet

## 🚀 Quick Start

### Authentication Check
```javascript
// ALWAYS check first
await get_session_state()
// If no token → "Please login first"
```

### Basic Flow Operation
```javascript
// 1. Create flow
await create_flow({
  project_id: "proj_id",
  name: "API Test",
  flow_data: {
    version: "1.0",
    steps: [{
      id: "step1",
      name: "Get Users",
      method: "GET",
      url: "{{env.baseUrl}}/users",
      outputs: { "users": "response.body.data" }
    }],
    config: { delay: 1000, retryCount: 2, parallel: false }
  }
})

// 2. Execute flow
await execute_flow({
  flow_id: "flow_id",
  environment_id: "env_id",
  debug_mode: true  // for troubleshooting
})
```

## 📋 Required Parameters Matrix

| Tool | Must Have | Optional |
|------|-----------|----------|
| `create_flow` | project_id, name | description, collection_id, flow_data |
| `execute_flow` | flow_id, environment_id | override_variables, debug_mode |
| `test_endpoint` | endpoint_id, environment_id | override_variables, timeout |
| `list_flows` | project_id | active_only, collection_id |
| `get_flow_detail` | flow_id | none |
| `update_flow` | flow_id | name, description, flow_data |
| `delete_flow` | flow_id | none |

## 🔄 Variable Patterns

### Environment Variables
```javascript
await set_environment_variables({
  baseUrl: "https://api.example.com",
  apiKey: "secret_key"
})

// Usage in flow: {{env.baseUrl}}, {{env.apiKey}}
```

### Flow Inputs
```javascript
await set_flow_inputs({
  userId: "123",
  limit: 10
})

// Usage in flow: {{input.userId}}, {{input.limit}}
```

### Step Outputs
```javascript
// Step 1 outputs: { "users": "response.body.data" }
// Step 2 can use: {{step1.users}}
```

## ❌ NEVER Do This

```javascript
// ❌ Missing required params
await execute_flow({ flow_id: "123" })

// ❌ Undefined variables
url: "{{undefinedVar}}/api"

// ❌ Empty flow
flow_data: { steps: [] }

// ❌ No environment check
await test_endpoint({ endpoint_id: "123" }) // Missing env_id
```

## ✅ ALWAYS Do This

```javascript
// ✅ Check auth first
if (!hasToken) {
  return "Please login first"
}

// ✅ Validate required params
if (!args.project_id) {
  throw new Error("Project ID required")
}

// ✅ Use debug mode for troubleshooting
await execute_flow({
  flow_id: "flow_123",
  environment_id: "env_456",
  debug_mode: true
})

// ✅ Handle errors gracefully
try {
  await create_flow(data)
} catch (error) {
  return `❌ Error: ${error.message}. Please check your project ID and permissions.`
}
```

## 🎯 Common Workflows

### 1. Test Existing Flow
```javascript
await get_flow_detail({ flow_id: "flow_123" })
await execute_flow({
  flow_id: "flow_123",
  environment_id: "env_456",
  debug_mode: true
})
```

### 2. Create & Test New Flow
```javascript
await set_environment_variables({ baseUrl: "https://api.test.com" })
await create_flow({ /* flow data */ })
await execute_flow({ /* execution params */ })
```

### 3. Debug Failed Flow
```javascript
await execute_flow({
  flow_id: "failed_flow",
  environment_id: "env_456",
  debug_mode: true,
  override_variables: { "debug": "true" }
})
await get_session_state() // Check variable values
```

## 🛡️ Safety Checks

Before calling ANY tool:
1. ✅ User is authenticated?
2. ✅ Required parameters provided?
3. ✅ Variable names are defined?
4. ✅ Flow structure is valid?

After tool execution:
1. ✅ Parse response for errors
2. ✅ Summarize results clearly
3. ✅ Suggest next steps
4. ✅ Clean up state if needed

## 🎨 Response Templates

### Success
```
✅ Flow executed successfully!

📊 Results:
- Status: Completed (3 steps)
- Time: 2.3s
- Users found: 25

🔍 Next: Test with different parameters?
```

### Error
```
❌ Flow execution failed

🚫 Issue: Environment variable "baseUrl" not found
💡 Solution: Set environment variables first with set_environment_variables()
🔄 Retry: Would you like me to set the missing variables?
```

## ⚡ Pro Tips

- **Debug mode = true** for troubleshooting
- **Check session state** before complex operations
- **Use descriptive step names** for better debugging
- **Set reasonable timeouts** (30s default)
- **Clean up state** between test scenarios