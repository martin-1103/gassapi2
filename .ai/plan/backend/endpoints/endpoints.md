# 🔗 Endpoints API

## Overview
Endpoint management untuk store dan manage API request configurations dalam collections.

---

## GET `/collections/:id/endpoints`
Get all endpoints dalam collection.

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
- `search` - Filter endpoints by name or URL
- `method` - Filter by HTTP method (GET, POST, etc.)
- `limit` - Pagination limit (default: 50)
- `offset` - Pagination offset (default: 0)

### Response
```json
{
  "success": true,
  "endpoints": [
    {
      "id": "ep_abc123",
      "name": "Create User",
      "method": "POST",
      "url": "{{API_BASE_URL}}/users",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": "Bearer {{API_TOKEN}}"
      },
      "body": {
        "name": "{{name}}",
        "email": "{{email}}"
      },
      "collectionId": "col_abc123",
      "createdBy": "user_123",
      "createdAt": "2025-01-21T10:00:00Z",
      "updatedAt": "2025-01-21T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

### Error Responses
- `401` - Unauthorized
- `403` - Not a project member
- `404` - Collection not found

---

## POST `/collections/:id/endpoints`
Create new endpoint dalam collection.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request
```json
{
  "name": "Get User Details",
  "method": "GET",
  "url": "{{API_BASE_URL}}/users/{{userId}}",
  "headers": {
    "Authorization": "Bearer {{API_TOKEN}}"
  },
  "body": null
}
```

### Validation Rules
- `name`: Required, max 255 characters
- `method`: Required, enum [GET,POST,PUT,DELETE,PATCH,HEAD,OPTIONS]
- `url`: Required, max 2000 characters
- `headers`: Optional, object (max 50 keys, 10KB total)
- `body`: Optional, JSON (max 100KB)

### Response
```json
{
  "success": true,
  "endpoint": {
    "id": "ep_def456",
    "name": "Get User Details",
    "method": "GET",
    "url": "{{API_BASE_URL}}/users/{{userId}}",
    "headers": {
      "Authorization": "Bearer {{API_TOKEN}}"
    },
    "body": null,
    "collectionId": "col_abc123",
    "createdBy": "user_123",
    "createdAt": "2025-01-21T10:00:00Z",
    "updatedAt": "2025-01-21T10:00:00Z"
  }
}
```

### Error Responses
- `400` - Validation error
- `401` - Unauthorized
- `403` - Not a project member
- `404` - Collection not found

---

## GET `/endpoints/:id`
Get endpoint details.

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "endpoint": {
    "id": "ep_abc123",
    "name": "Create User",
    "method": "POST",
    "url": "{{API_BASE_URL}}/users",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{API_TOKEN}}"
    },
    "body": {
      "name": "{{name}}",
      "email": "{{email}}"
    },
    "collectionId": "col_abc123",
    "createdBy": "user_123",
    "createdAt": "2025-01-21T10:00:00Z",
    "updatedAt": "2025-01-21T10:00:00Z",
    "collection": {
      "id": "col_abc123",
      "name": "User Management"
    }
  }
}
```

### Error Responses
- `401` - Unauthorized
- `403` - Not a project member
- `404` - Endpoint not found

---

## PUT `/endpoints/:id`
Update endpoint configuration.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request
```json
{
  "name": "Updated Endpoint Name",
  "method": "POST",
  "url": "{{API_BASE_URL}}/users",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Validation Rules
Same as POST endpoint validation.

### Response
```json
{
  "success": true,
  "endpoint": {
    "id": "ep_abc123",
    "name": "Updated Endpoint Name",
    "method": "POST",
    "url": "{{API_BASE_URL}}/users",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "collectionId": "col_abc123",
    "createdBy": "user_123",
    "createdAt": "2025-01-21T10:00:00Z",
    "updatedAt": "2025-01-21T10:05:00Z"
  }
}
```

### Error Responses
- `400` - Validation error
- `401` - Unauthorized
- `403` - Not a project member
- `404` - Endpoint not found

---

## DELETE `/endpoints/:id`
Delete endpoint.

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "message": "Endpoint deleted successfully"
}
```

### Error Responses
- `401` - Unauthorized
- `403` - Not a project member
- `404` - Endpoint not found

---

## 🔧 Business Logic

### Variable Substitution
Endpoints support variable substitution dalam URL, headers, dan body:
- `{{VARIABLE_NAME}}` format
- Variables resolved dari environment yang aktif
- Fallback ke default values jika variable tidak ada

### HTTP Methods Support
- **GET**: Body should be null
- **POST**: Body required for form data or JSON
- **PUT**: Body required for updates
- **DELETE**: Body optional
- **PATCH**: Body required for partial updates
- **HEAD**: Body should be null
- **OPTIONS**: Body should be null

### Headers Management
- Headers stored as JSON object
- Duplicate keys automatically merged
- Common headers auto-suggested:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
  - `Accept: application/json`

### Body Types Support
- **JSON**: Validated JSON objects/arrays
- **Form Data**: URL-encoded form data
- **Raw Text**: Plain text content
- **Binary**: Base64 encoded data (future feature)

### Audit Trail
All endpoint operations create audit logs:
- Action: `endpoint_created`, `endpoint_updated`, `endpoint_deleted`
- Resource type: `endpoint`
- Resource ID: Endpoint ID
- Old/New values: Changed fields

### Performance
- Index on `collection_id` untuk fast collection retrieval
- Index on `method` untuk filtering
- Text search on `name` dan `url` fields
- JSON field validation pada headers dan body