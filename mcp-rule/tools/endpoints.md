# Endpoint Tools

## Available Tools
- `list_endpoints`
- `get_endpoint_details`
- `create_endpoint`
- `update_endpoint`
- `move_endpoint`

## list_endpoints

**Purpose:** List all endpoints with optional filtering by project or collection

### Parameters
- **Required:** None
- **Optional:** project_id, collection_id, method

### Usage Example
```
list_endpoints()

list_endpoints(
  collection_id: "col_123"
)

list_endpoints(
  project_id: "proj_456",
  method: "GET"
)
```

### Common Mistakes
- ❌ Invalid collection_id
- ❌ Invalid method (must be HTTP method)
- ✅ Filter by collection for better organization

---

## get_endpoint_details

**Purpose:** Get detailed endpoint configuration with collection information

### Parameters
- **Required:** endpoint_id
- **Optional:** None

### Usage Example
```
get_endpoint_details(
  endpoint_id: "ep_789"
)
```

### Common Mistakes
- ❌ Invalid endpoint_id
- ❌ Missing endpoint_id parameter

---

## create_endpoint

**Purpose:** Create a new endpoint in a collection

### Parameters
- **Required:** name, method, url, collection_id
- **Optional:** description, headers, body

### Usage Example
```
create_endpoint(
  name: "Get Users",
  method: "GET",
  url: "{{baseUrl}}/api/users",
  collection_id: "col_123"
)

create_endpoint(
  name: "Create User",
  method: "POST",
  url: "{{baseUrl}}/api/users",
  collection_id: "col_123",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{apiKey}}"
  },
  body: '{"name": "{{userName}}", "email": "{{userEmail}}"}'
)
```

### Common Mistakes
- ❌ Invalid HTTP method
- ❌ Missing collection_id
- ❌ Body as object instead of JSON string
- ✅ Use {{variables}} in URL and body

---

## update_endpoint

**Purpose:** Update existing endpoint configuration

### Parameters
- **Required:** endpoint_id
- **Optional:** name, method, url, description, headers, body

### Usage Example
```
update_endpoint(
  endpoint_id: "ep_789",
  name: "Updated Get Users",
  headers: {
    "Authorization": "Bearer {{newApiKey}}"
  }
)
```

### Common Mistakes
- ❌ Invalid endpoint_id
- ❌ No fields to update
- ✅ At least one field must be provided

---

## move_endpoint

**Purpose:** Move endpoint to a different collection

### Parameters
- **Required:** endpoint_id, new_collection_id
- **Optional:** None

### Usage Example
```
move_endpoint(
  endpoint_id: "ep_789",
  new_collection_id: "col_456"
)
```

### Common Mistakes
- ❌ Invalid endpoint_id
- ❌ Invalid new_collection_id
- ❌ Moving to same collection