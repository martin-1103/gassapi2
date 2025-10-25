# MCP Tools Rules - Panduan Singkat Penggunaan

## 📋 Overview
MCP2 (Model Context Protocol v2) adalah sistem untuk automasi API testing dan flow management dengan endpoint-based testing.

## 🏗️ Struktur MCP Tools

### Core Components
- **flows.ts** - Flow management & execution
- **testing.ts** - Endpoint testing
- **endpoints.ts** - API endpoint management
- **environment.ts** - Environment variables
- **collections.ts** - Collection management
- **auth.ts** - Authentication management

## 🔧 Flow Tools

### 1. **create_flow**
**Gunakan untuk:** Membuat flow baru dengan steps format
```bash
Required: project_id, name
Optional: description, collection_id, flow_data, flow_inputs
```

### 2. **list_flows**
**Gunakan untuk:** List semua flows dalam project
```bash
Required: project_id
Optional: active_only, include_inactive, collection_id
```

### 3. **get_flow_detail**
**Gunakan untuk:** Detail informasi flow
```bash
Required: flow_id
```

### 4. **execute_flow**
**Gunakan untuk:** Eksekusi flow dengan dynamic variable interpolation
```bash
Required: flow_id, environment_id
Optional: override_variables, max_execution_time, debug_mode
```

### 5. **update_flow**
**Gunakan untuk:** Update flow configuration
```bash
Required: flow_id
Optional: name, description, collection_id, flow_data, is_active
```

### 6. **delete_flow**
**Gunakan untuk:** Hapus flow
```bash
Required: flow_id
```

## 🧪 Testing Tools

### test_endpoint
**Gunakan untuk:** Test individual endpoint
```bash
Required: endpoint_id, environment_id
Optional: override_variables, timeout
```

## 🔗 API Endpoint Patterns

### Flow Endpoints
- `flowCreate` → `/gassapi2/backend/?act=flow_create`
- `flowDetails` → `/gassapi2/backend/?act=flow&id={id}`
- `flowExecute` → `/gassapi2/backend/?act=flow_execute`
- `flowList` → `/gassapi2/backend/?act=flows&collection_id={collection_id}`

### Testing Endpoints
- `endpointTestDirect` → `/gassapi2/backend/?act=endpoint&id={id}`
- `environmentVariablesDirect` → `/gassapi2/backend/?act=environment_variables&id={id}`

## 💡 Variable Interpolation

### Supported Patterns
- `{{input.field}}` - Flow input variables
- `{{env.VARIABLE}}` - Environment variables
- `{{stepId.output_field}}` - Previous step outputs
- `{{runtime.variable}}` - Runtime variables

### Interpolation Order
1. Environment variables (base)
2. Override variables (merge)
3. Runtime variables (execution time)
4. Step outputs (dynamic)

## 🚀 Best Practices

### 1. **Flow Creation**
- Gunakan Steps format untuk flow configuration
- Define clear input validation
- Set proper timeout untuk setiap step
- Use descriptive step names dan IDs

### 2. **Variable Management**
- Set environment variables sebelum execution
- Gunakan override variables untuk testing
- Clear session state antar test sessions

### 3. **Error Handling**
- Enable debug_mode untuk troubleshooting
- Monitor execution time limits
- Validate flow structure sebelum execution

### 4. **Performance**
- Gunakan parallel execution untuk independent steps
- Set appropriate delay antar sequential steps
- Monitor response time patterns

## 📊 Response Format

### Success Response
- ✅ Status indicator
- 📊 Execution metrics
- 📋 Step-by-step results
- 🔧 Variable interpolation details

### Error Response
- ❌ Clear error messages
- 🔍 Debug information (if enabled)
- 💡 Resolution suggestions

## 🔄 Session Management

### State Types
- **environment** - Environment variables
- **flowInputs** - Flow input parameters
- **stepOutputs** - Step execution results
- **runtimeVars** - Runtime variables

### Management Tools
- `set_environment_variables`
- `set_flow_inputs`
- `set_runtime_variables`
- `get_session_state`
- `clear_session_state`

## 🎯 Use Case Examples

### 1. **API Testing Workflow**
```bash
1. set_environment_variables(vars)
2. create_flow(project_id, flow_data)
3. execute_flow(flow_id, environment_id)
4. get_session_state()
```

### 2. **Endpoint Validation**
```bash
1. test_endpoint(endpoint_id, environment_id)
2. analyze_response()
3. update_endpoint_config()
```

### 3. **Flow Debugging**
```bash
1. execute_flow(flow_id, env_id, debug_mode: true)
2. review_step_outputs()
3. clear_session_state()
4. retry_with_fixes()
```

## ⚠️ Important Notes

- **Authentication**: Diperlukan JWT token untuk semua API calls
- **Timeout**: Default 30 detik per request, 5 menit total execution
- **Rate Limits**: Monitor API call frequency
- **Error Recovery**: Gunakan retry logic untuk network issues
- **State Management**: Clear session state untuk clean testing

## 🔍 Debug Mode

Enable debug_mode untuk:
- Detailed request/response logging
- Variable interpolation tracking
- Step-by-step execution details
- Enhanced error diagnostics
- Performance metrics breakdown