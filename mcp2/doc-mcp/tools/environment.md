# Environment Tools

## Available Tools
- `list_environments`
- `get_environment_details`
- `update_environment_variables`

## list_environments

**Purpose:** List all environments for the current project

### Parameters
- **Required:** None
- **Optional:** project_id (uses project from config if not provided)

### Usage Example
```
list_environments()

list_environments(
  project_id: "proj_123"
)
```

### Common Mistakes
- ❌ No access to project
- ✅ Call without parameters for default project

---

## get_environment_details

**Purpose:** Get detailed environment information including variables

### Parameters
- **Required:** environment_id
- **Optional:** None

### Usage Example
```
get_environment_details(
  environment_id: "env_456"
)
```

### Common Mistakes
- ❌ Invalid environment_id
- ❌ Missing environment_id parameter

---

## update_environment_variables

**Purpose:** Update environment variables (add/update/remove variables)

### Parameters
- **Required:** environment_id
- **Optional:** variables, operation

### Usage Example
```
update_environment_variables(
  environment_id: "env_456",
  variables: {
    "baseUrl": "https://api.example.com",
    "apiKey": "secret_key"
  },
  operation: "merge"
)
```

### Common Mistakes
- ❌ Invalid environment_id
- ❌ Variables as string instead of object
- ✅ Use "merge" to add variables, "replace" to overwrite all