# Flow Tools

## Available Tools
- `create_flow`
- `list_flows`
- `get_flow_detail`
- `update_flow`
- `delete_flow`
- `execute_flow`
- `set_environment_variables`
- `set_flow_inputs`
- `set_runtime_variables`
- `get_session_state`
- `clear_session_state`

## create_flow

**Purpose:** Create a new flow in the project using Steps format for API automation

### Parameters
- **Required:** project_id, name
- **Optional:** description, collection_id, flow_data, flow_inputs, is_active

### Usage Example
```
create_flow(
  project_id: "proj_123",
  name: "User API Test"
)

create_flow(
  project_id: "proj_123",
  name: "Complete User Flow",
  description: "Test user management API",
  collection_id: "col_456",
  flow_data: {
    version: "1.0",
    steps: [{
      id: "get_users",
      name: "Get Users",
      method: "GET",
      url: "{{baseUrl}}/api/users",
      outputs: {
        "users": "response.body.data"
      }
    }, {
      id: "create_user",
      name: "Create User",
      method: "POST",
      url: "{{baseUrl}}/api/users",
      headers: {
        "Content-Type": "application/json"
      },
      body: '{"name": "{{userName}}", "email": "{{userEmail}}"}',
      outputs: {
        "userId": "response.body.id"
      }
    }],
    config: {
      delay: 1000,
      retryCount: 2,
      parallel: false
    }
  }
)
```

### Common Mistakes
- ❌ Empty steps array
- ❌ Missing required step fields (id, name, method, url)
- ❌ Invalid flow_data structure
- ✅ Use {{variables}} in step URLs and body

---

## list_flows

**Purpose:** List all flows in a project with filtering options

### Parameters
- **Required:** project_id
- **Optional:** active_only, include_inactive, collection_id

### Usage Example
```
list_flows(
  project_id: "proj_123"
)

list_flows(
  project_id: "proj_123",
  active_only: true,
  collection_id: "col_456"
)
```

### Common Mistakes
- ❌ Missing project_id
- ❌ Invalid project_id

---

## get_flow_detail

**Purpose:** Get detailed information about a specific flow

### Parameters
- **Required:** flow_id
- **Optional:** None

### Usage Example
```
get_flow_detail(
  flow_id: "flow_789"
)
```

### Common Mistakes
- ❌ Invalid flow_id
- ❌ Missing flow_id parameter

---

## update_flow

**Purpose:** Update an existing flow configuration

### Parameters
- **Required:** flow_id
- **Optional:** name, description, collection_id, flow_data, is_active

### Usage Example
```
update_flow(
  flow_id: "flow_789",
  name: "Updated Flow Name",
  is_active: false
)
```

### Common Mistakes
- ❌ Invalid flow_id
- ❌ No fields to update
- ✅ At least one field must be provided

---

## delete_flow

**Purpose:** Delete a flow from the project

### Parameters
- **Required:** flow_id
- **Optional:** None

### Usage Example
```
delete_flow(
  flow_id: "flow_789"
)
```

### Common Mistakes
- ❌ Invalid flow_id
- ❌ Missing flow_id parameter

---

## execute_flow

**Purpose:** Execute a simple flow with sequential endpoint testing

### Parameters
- **Required:** flow_id, environment_id
- **Optional:** override_variables, max_execution_time, debug_mode

### Usage Example
```
execute_flow(
  flow_id: "flow_789",
  environment_id: "env_456"
)

execute_flow(
  flow_id: "flow_789",
  environment_id: "env_456",
  override_variables: {
    "baseUrl": "https://api.test.com"
  },
  debug_mode: true
)
```

### Common Mistakes
- ❌ Invalid flow_id
- ❌ Invalid environment_id
- ❌ Missing environment variables
- ✅ Use debug_mode for troubleshooting

---

## set_environment_variables

**Purpose:** Set environment variables for flow execution

### Parameters
- **Required:** variables
- **Optional:** None

### Usage Example
```
set_environment_variables({
  "baseUrl": "https://api.example.com",
  "apiKey": "secret_key"
})
```

### Common Mistakes
- ❌ Variables as string instead of object
- ✅ Use object format for variables

---

## set_flow_inputs

**Purpose:** Set flow inputs for variable interpolation

### Parameters
- **Required:** inputs
- **Optional:** None

### Usage Example
```
set_flow_inputs({
  "userId": "123",
  "userName": "John Doe"
})
```

### Common Mistakes
- ❌ Inputs as string instead of object
- ✅ Use object format for inputs

---

## set_runtime_variables

**Purpose:** Set runtime variables for flow execution

### Parameters
- **Required:** variables
- **Optional:** None

### Usage Example
```
set_runtime_variables({
  "testMode": "true",
  "debugLevel": "verbose"
})
```

### Common Mistakes
- ❌ Variables as string instead of object
- ✅ Use object format for variables

---

## get_session_state

**Purpose:** Get current session state for debugging

### Parameters
- **Required:** None
- **Optional:** None

### Usage Example
```
get_session_state()
```

---

## clear_session_state

**Purpose:** Clear specific session state type

### Parameters
- **Required:** state_type
- **Optional:** None

### Usage Example
```
clear_session_state(
  state_type: "environment"
)

clear_session_state(
  state_type: "flowInputs"
)
```

### Common Mistakes
- ❌ Invalid state_type
- ✅ Valid types: environment, flowInputs, stepOutputs, runtimeVars