# Authentication Tools

## Available Tools
- `get_project_context`

## get_project_context

**Purpose:** Get project context including environments and collections

### Parameters
- **Required:** None
- **Optional:** project_id (uses project from config if not provided)

### Usage Example
```
get_project_context()

get_project_context(
  project_id: "proj_123"
)
```

### Returns
- Project information
- Available environments
- Available collections
- Authentication status

### Common Mistakes
- ❌ Missing project_id when config doesn't have project
- ✅ Call without parameters to use default project