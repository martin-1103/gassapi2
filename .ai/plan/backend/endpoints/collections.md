# 📁 Collections API Endpoints

## Overview
Collection management endpoints untuk organize API endpoints dalam hierarchical structure.

---

## GET `/projects/:id/collections`
Get all collections dalam project dengan nested structure.

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "collections": [
    {
      "id": "col_abc123",
      "name": "User Management",
      "projectId": "proj_abc123",
      "parentId": null,
      "createdBy": "user_123",
      "createdAt": "2025-01-21T10:00:00Z",
      "updatedAt": "2025-01-21T10:00:00Z",
      "endpointsCount": 5,
      "subCollections": [
        {
          "id": "col_def456",
          "name": "Authentication",
          "parentId": "col_abc123",
          "endpointsCount": 2
        }
      ]
    }
  ]
}
```

### Error Responses
- `401` - Unauthorized
- `403` - Not a project member
- `404` - Project not found

---

## POST `/projects/:id/collections`
Create new collection dalam project.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request
```json
{
  "name": "New Collection",
  "parentId": "col_abc123"
}
```

### Validation Rules
- `name`: Required, max 255 characters
- `parentId`: Optional, must exist in same project

### Response
```json
{
  "success": true,
  "collection": {
    "id": "col_ghi789",
    "name": "New Collection",
    "projectId": "proj_abc123",
    "parentId": "col_abc123",
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
- `404` - Project or parent collection not found

---

## PUT `/collections/:id`
Update collection details.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request
```json
{
  "name": "Updated Collection Name"
}
```

### Validation Rules
- `name`: Required, max 255 characters

### Response
```json
{
  "success": true,
  "collection": {
    "id": "col_ghi789",
    "name": "Updated Collection Name",
    "projectId": "proj_abc123",
    "parentId": "col_abc123",
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
- `404` - Collection not found

---

## DELETE `/collections/:id`
Delete collection dan semua endpoints & sub-collections di dalamnya.

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "message": "Collection and all its contents deleted successfully"
}
```

### Cascade Delete
- Delete all endpoints in collection
- Delete all sub-collections recursively
- Delete audit logs for deleted resources

### Error Responses
- `401` - Unauthorized
- `403` - Not a project member
- `404` - Collection not found

---

## 🔧 Business Logic

### Permission Model
- **Create**: All project members
- **Read**: All project members
- **Update**: All project members
- **Delete**: All project members

### Hierarchy Rules
- Maximum depth: 5 levels
- Cannot move collection to its own descendant
- Root collections have `parentId: null`

### Audit Trail
All collection operations create audit logs:
- Action: `collection_created`, `collection_updated`, `collection_deleted`
- Resource type: `collection`
- Resource ID: Collection ID
- Old/New values: Changed fields

### Performance
- Index on `project_id` untuk fast project retrieval
- Index on `parent_id` untuk hierarchy queries
- Recursive query optimization untuk nested collections