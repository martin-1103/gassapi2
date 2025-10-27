# Endpoint Tools

## Available Tools
- `list_endpoints`
- `get_endpoint_details`
- `create_endpoint`
- `update_endpoint`
- `move_endpoint`

## list_endpoints

**Purpose:** List all endpoints with optional filtering by project or folder

### Parameters
- **Required:** None
- **Optional:** project_id, folder_id, method

### Usage Example
```
list_endpoints()

list_endpoints(
  folder_id: "fld_123"
)

list_endpoints(
  project_id: "proj_456",
  method: "GET"
)
```

### Common Mistakes
- ❌ Invalid folder_id
- ❌ Invalid method (must be HTTP method)
- ✅ Filter by folder for better organization

---

## get_endpoint_details

**Purpose:** Get detailed endpoint configuration with folder information

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

**Purpose:** Create a new endpoint in a folder

### Parameters
- **Required:** name, method, url, folder_id
- **Optional:** description, purpose, headers, body, request_params, response_schema, header_docs

### Usage Example
```
create_endpoint(
  name: "Get Users",
  method: "GET",
  url: "{{baseUrl}}/api/users",
  folder_id: "fld_123"
)

create_endpoint(
  name: "Send Chat Message",
  method: "POST",
  url: "{{baseUrl}}/api/chat/send",
  folder_id: "fld_123",
  description: "Kirim pesan chat dari sales ke customer",
  purpose: "Real-time customer communication untuk sales support",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{apiKey}}"
  },
  body: '{"message_text": "{{message}}", "customer_id": "{{customerId}}"}',
  request_params: {
    "message_text": "Pesan yang akan dikirim",
    "customer_id": "ID customer penerima",
    "conversation_id": "ID conversation (optional)"
  },
  response_schema: {
    "message_id": "Unique message identifier",
    "timestamp": "Waktu pengiriman",
    "status": "Status: sent|delivered|read|failed"
  },
  header_docs: {
    "Authorization": "Bearer token untuk authentication",
    "Content-Type": "application/json untuk request body"
  }
)
```

### Common Mistakes
- ❌ Invalid HTTP method
- ❌ Missing folder_id
- ❌ Body as object instead of JSON string
- ❌ Semantic fields as complex objects (use simple key-value pairs)
- ✅ Use {{variables}} in URL and body
- ✅ Keep purpose concise (max 250 characters)
- ✅ Use simple descriptions for parameters

---

## update_endpoint

**Purpose:** Update existing endpoint configuration

### Parameters
- **Required:** endpoint_id
- **Optional:** name, method, url, description, purpose, headers, body, request_params, response_schema, header_docs

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

**Purpose:** Move endpoint to a different folder

### Parameters
- **Required:** endpoint_id, new_folder_id
- **Optional:** None

### Usage Example
```
move_endpoint(
  endpoint_id: "ep_789",
  new_folder_id: "fld_456"
)
```

### Common Mistakes
- ❌ Invalid endpoint_id
- ❌ Invalid new_folder_id
- ❌ Moving to same folder