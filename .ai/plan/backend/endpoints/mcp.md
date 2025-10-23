# 🤖 MCP Integration API

## Overview
MCP (Model Context Protocol) integration endpoints untuk Claude Desktop dan AI assistant integration.

---

## POST `/projects/:id/generate-config`
Generate gassapi.json configuration dengan permanent MCP token.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request
```json
{
  "environment": "development",
  "includeAuth": true,
  "customSettings": {
    "api": {
      "baseURL": "http://localhost:3000"
    }
  }
}
```

### Validation Rules
- `environment`: Optional, valid environment name in project
- `includeAuth`: Optional, boolean (default: true)
- `customSettings`: Optional, JSON object (max 10KB)

### Response
```json
{
  "success": true,
  "config": {
    "project": {
      "id": "proj_abc123",
      "name": "E-commerce API"
    },
    "mcpClient": {
      "token": "permanent_mcp_token_123456789",
      "serverURL": "http://localhost:3000"
    },
    "environment": {
      "active": "development",
      "variables": {
        "API_BASE_URL": "http://localhost:3000",
        "API_TOKEN": "dev_token_123"
      }
    }
  },
  "instructions": "Save this as 'gassapi.json' in your project root directory"
}
```

### Configuration Features
- **Permanent Token**: Long-lived MCP client token
- **Project Context**: Project identification and metadata
- **Environment Variables**: Active environment variables
- **Custom Settings**: User-defined configuration options
- **Server URL**: Backend server URL for MCP client

### Error Responses
- `400` - Validation error
- `401` - Unauthorized
- `403` - Not a project member
- `404` - Project or environment not found

---

## GET `/mcp/validate`
Validate MCP client token (used by local MCP client).

### Headers
```
X-MCP-Token: <permanent_mcp_token>
```

### Response
```json
{
  "success": true,
  "valid": true,
  "project": {
    "id": "proj_abc123",
    "name": "E-commerce API",
    "serverURL": "http://localhost:3000"
  },
  "environment": {
    "name": "development",
    "variables": {
      "API_BASE_URL": "http://localhost:3000",
      "API_TOKEN": "dev_token_123"
    }
  },
  "lastValidatedAt": "2025-01-21T10:00:00Z"
}
```

### Validation Process
1. **Token Lookup**: Find token in database
2. **Token Status**: Check if token is active
3. **Project Access**: Verify project accessibility
4. **Environment Load**: Load active environment variables
5. **Update Timestamp**: Update last validated timestamp

### Error Responses
- `400` - Missing MCP token header
- `401` - Invalid or expired token
- `403` - Token inactive or project inaccessible
- `404` - Token not found
- `500` - Server error

---

## POST `/mcp/revoke-token`
Revoke compromised MCP client token.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request
```json
{
  "projectId": "proj_abc123",
  "tokenId": "token_def456",
  "reason": "compromised"
}
```

### Validation Rules
- `projectId`: Required, valid project ID
- `tokenId`: Optional, specific token to revoke
- `reason`: Optional, revocation reason

### Response
```json
{
  "success": true,
  "message": "Token revoked successfully",
  "revokedCount": 1
}
```

### Revocation Options
- **Specific Token**: Revoke specific token by ID
- **All Project Tokens**: Revoke all tokens for project
- **User Tokens**: Revoke all tokens created by user
- **Compromised Tokens**: Revoke tokens marked as compromised

### Error Responses
- `400` - Validation error
- `401` - Unauthorized
- `403` - Not a project member or owner
- `404` - Project or token not found

---

## GET `/mcp/tokens`
List all MCP tokens for project.

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
- `projectId` - Required, project ID
- `status` - Filter by status: `active|revoked`
- `createdBy` - Filter by creator user ID

### Response
```json
{
  "success": true,
  "tokens": [
    {
      "id": "token_abc123",
      "projectId": "proj_def456",
      "tokenHash": "hashed_token_value",
      "lastValidatedAt": "2025-01-21T09:30:00Z",
      "createdBy": "user_ghi789",
      "createdByUser": {
        "id": "user_ghi789",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2025-01-20T10:00:00Z",
      "isActive": true,
      "validationCount": 25
    }
  ]
}
```

### Error Responses
- `401` - Unauthorized
- `403` - Not a project member
- `404` - Project not found

---

## POST `/mcp/regenerate-token`
Regenerate MCP token for project.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request
```json
{
  "projectId": "proj_abc123",
  "tokenId": "token_def456"
}
```

### Response
```json
{
  "success": true,
  "token": {
    "id": "token_new789",
    "token": "new_permanent_mcp_token_987654321",
    "projectId": "proj_abc123",
    "createdAt": "2025-01-21T10:15:00Z"
  },
  "message": "New token generated successfully"
}
```

### Regeneration Process
1. **Token Creation**: Generate new permanent token
2. **Old Token Revocation**: Revoke previous token
3. **Database Update**: Update token records
4. **Audit Log**: Log token regeneration
5. **Response**: Return new token information

### Error Responses
- `400` - Validation error
- `401` - Unauthorized
- `403` - Not a project member
- `404` - Project or token not found

---

## 🔧 Business Logic

### Token Management

#### Token Characteristics
- **Permanent**: No automatic expiration
- **Project-Specific**: Tokens bound to specific project
- **User-Specific**: Tokens created by specific user
- **Revocable**: Can be revoked manually

#### Token Security
- **Cryptographic Generation**: Use secure random generation
- **Hash Storage**: Store token hashes, not plain tokens
- **Token Length**: Minimum 32 characters
- **Character Set**: Alphanumeric with special characters

#### Token Validation
- **Hash Verification**: Compare token hashes
- **Status Check**: Verify token is active
- **Project Access**: Confirm project membership
- **Rate Limiting**: Prevent token validation abuse

### Configuration Generation

#### gassapi.json Format
```json
{
  "project": {
    "id": "proj_abc123",
    "name": "E-commerce API"
  },
  "mcpClient": {
    "token": "permanent_mcp_token",
    "serverURL": "http://localhost:3000"
  },
  "environment": {
    "active": "development",
    "variables": {
      "API_BASE_URL": "http://localhost:3000"
    }
  }
}
```

#### Configuration Features
- **Project Context**: Project identification for MCP client
- **Token Storage**: Permanent token for API access
- **Environment Variables**: Active environment configuration
- **Server URL**: Backend server connection details

### MCP Client Integration

#### Auto-Detection Process
1. **File Detection**: Look for gassapi.json in project root
2. **Token Validation**: Validate stored token with backend
3. **Project Loading**: Load project context and environments
4. **Variable Injection**: Inject environment variables
5. **Ready State**: Signal ready status to Claude Desktop

#### Zero-Configuration Setup
- **No Commands Required**: Automatic project detection
- **File-Based Configuration**: Simple JSON configuration file
- **Environment Variables**: Automatic variable loading
- **Error Handling**: Graceful handling of missing configuration

### Security Considerations

#### Token Security
- **Secure Generation**: Cryptographically secure token generation
- **Hash Storage**: Store only token hashes in database
- **Transmission Security**: Use HTTPS for all token operations
- **Access Logging**: Log all token access and validation

#### Access Control
- **Project Membership**: Verify project membership for token operations
- **Token Ownership**: Users can only manage their own tokens
- **Owner Privileges**: Project owners can manage all project tokens
- **Audit Trail**: Complete audit trail for token operations

#### Data Protection
- **Token Masking**: Never return full tokens in API responses
- **Sensitive Data**: Protect sensitive project data
- **Environment Variables**: Mask sensitive variables in responses
- **Configuration Security**: Secure configuration generation

### Performance Considerations

#### Token Validation
- **Database Indexing**: Efficient token lookup by hash
- **Validation Caching**: Cache validation results temporarily
- **Concurrent Validation**: Handle multiple concurrent validations
- **Rate Limiting**: Prevent validation abuse

#### Configuration Generation
- **Environment Loading**: Efficient environment variable loading
- **JSON Serialization**: Fast JSON configuration generation
- **Template Processing**: Efficient template processing
- **Response Caching**: Cache configuration responses

### Monitoring and Analytics

#### Token Usage
- **Validation Frequency**: Track how often tokens are validated
- **Active Tokens**: Monitor active token count
- **Geographic Distribution**: Track token usage by location
- **Usage Patterns**: Analyze token usage patterns

#### Security Monitoring
- **Failed Validations**: Monitor failed validation attempts
- **Suspicious Activity**: Detect unusual token usage patterns
- **Revocation Events**: Track token revocation events
- **Access Anomalies**: Identify potential security issues

### Error Handling

#### Token Errors
- **Invalid Token**: Token not found or invalid format
- **Expired Token**: Token has expired (if applicable)
- **Revoked Token**: Token has been revoked
- **Inactive Token**: Token is marked as inactive

#### Configuration Errors
- **Missing Configuration**: gassapi.json file not found
- **Invalid Configuration**: Malformed JSON configuration
- **Environment Not Found**: Specified environment doesn't exist
- **Permission Denied**: Insufficient permissions

### Integration Points

#### Claude Desktop Integration
- **MCP Server Protocol**: Standard MCP server implementation
- **Tool Registration**: Register available MCP tools
- **Resource Access**: Provide access to project resources
- **Prompt Templates**: Provide prompt templates for Claude

#### Future Integrations
- **AI Platform Support**: Support for other AI platforms
- **Advanced Tools**: Additional MCP tools and resources
- **Workflow Integration**: Integration with workflow systems
- **API Extensions**: Extended API capabilities