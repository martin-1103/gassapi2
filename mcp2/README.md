# GASSAPI MCP v2

Model Context Protocol (MCP) server untuk integrasi GASSAPI dengan AI assistants.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm atau yarn
- Backend PHP server berjalan di `localhost:8080`

### Installation
```bash
# Clone atau download MCP2 server
cd mcp2

# Install dependencies
npm install

# Build the server
npm run build
```

## 📋 Complete Setup Workflow

### Step 1: Login ke Backend
```bash
# Login dengan user credentials
curl -X POST "http://localhost:8080/gassapi2/backend/?act=login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "YourPassword123"}'
```

### Step 2: Generate MCP Configuration
```bash
# Dapatkan project ID terlebih dahulu
curl -X GET "http://localhost:8080/gassapi2/backend/?act=projects"

# Generate MCP config untuk project
curl -X POST "http://localhost:8080/gassapi2/backend/?act=mcp_generate_config&id=YOUR_PROJECT_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Step 3: Buat gassapi.json File
Copy response dari Step 2 dan simpan sebagai `gassapi.json` di root project Anda:

```json
{
  "name": "Your Project Name",
  "project_id": "proj_abc123def456",
  "api_base_url": "http://localhost:8080/gassapi2/backend/",
  "mcp_validate_endpoint": "/mcp/validate",
  "token": "plain_text_mcp_token_here",
  "environments": [
    {
      "id": "env_dev123",
      "name": "development",
      "is_default": true,
      "variables": {}
    }
  ]
}
```

### Step 4: Setup MCP Server

**Method 1: Claude Code (Recommended)**
```bash
# Add MCP server ke Claude Code
claude mcp add --transport stdio gassapi-mcp2 -- node D:/xampp82/htdocs/gassapi2/mcp2/dist/index.js

# List MCP servers
claude mcp list

# Remove MCP server
claude mcp remove gassapi-mcp2
```

**Method 2: Manual Configuration**
1. **Create/edit `.claude/settings.json`**
   ```json
   {
     "mcpServers": {
       "gassapi-mcp2": {
         "command": "node",
         "args": ["D:/xampp82/htdocs/gassapi2/mcp2/dist/index.js"],
         "cwd": "D:/xampp82/htdocs/gassapi2/mcp2"
       }
     }
   }
   ```

2. **Restart Claude Code**

**Method 3: Cursor**
1. **Edit Cursor settings.json**
   ```json
   {
     "mcp.mcpServers": {
       "gassapi-mcp2": {
         "command": "node",
         "args": ["D:/xampp82/htdocs/gassapi2/mcp2/dist/index.js"],
         "cwd": "D:/xampp82/htdocs/gassapi2/mcp2"
       }
     }
   }
   ```

2. **Restart Cursor**

### Step 5: Verify Setup
```bash
# Test MCP server
npm start

# Di Claude Code, cek MCP status:
/mcp
```

## 🛠️ MCP Tools Overview

### Available Tools (23 total)

#### Authentication & Project Context
- `get_project_context` - Get project info with environments and folders

#### Environment Management
- `list_environments` - List all environments
- `get_environment_details` - Get detailed environment info
- `create_environment` - Create new environment
- `update_environment_variables` - Update environment variables
- `set_default_environment` - Set default environment
- `duplicate_environment` - Duplicate existing environment
- `delete_environment` - Delete environment

#### Folder Management
- `list_folders` - List project folders
- `create_folder` - Create new folder
- `update_folder` - Update folder details
- `move_folder` - Move folder to different parent
- `delete_folder` - Delete folder
- `get_folder_details` - Get folder details

#### Endpoint Management (🆕 dengan Semantic Fields)
- `list_endpoints` - List all endpoints
- `get_endpoint_details` - Get detailed endpoint configuration
- `create_endpoint` - Create endpoint with semantic context
- `update_endpoint` - Update endpoint configuration

#### Flow Management
- `create_flow` - Create automation flow
- `execute_flow` - Execute flow
- `get_flow_details` - Get flow details
- `list_flows` - List all flows
- `delete_flow` - Delete flow

#### Testing Tools
- `test_endpoint` - Test single endpoint
- `test_multiple_endpoints` - Test multiple endpoints
- `create_test_suite` - Create test suite
- `list_test_suites` - List test suites

## 📝 Endpoint Documentation & Cataloging

### Mencatat Endpoint yang Sudah Ada
```typescript
create_endpoint(
  name: "User Registration",
  method: "POST",
  url: "/api/auth/register",
  folder_id: "folder_authentication",
  description: "Endpoint untuk registrasi user baru dengan email verification",
  purpose: "Public user registration dengan email verification required",
  headers: {
    "Content-Type": "application/json"
  },
  body: '{"name": "{{userName}}", "email": "{{userEmail}}", "password": "{{password}}"}',
  request_params: {
    "name": "Full name untuk display",
    "email": "Email address untuk login dan communication",
    "password": "User password (min 8 chars, include uppercase, lowercase, numbers)"
  },
  response_schema: {
    "user_id": "Unique user identifier",
    "name": "User display name",
    "email": "User email address",
    "status": "Account status (active|inactive|suspended)",
    "verification_required": "Whether email verification needed"
  }
)
```

### Workflow: Backend → MCP Documentation → AI Frontend

**1. Backend Developer:**
```php
// Di PHP code (sudah ada)
public function register() {
  // Logic untuk registrasi user
  // Return user data atau error
}
```

**2. Documentation Team:**
```typescript
// Gunakan MCP tools untuk catat
create_endpoint(
  name: "User Registration",
  method: "POST",
  url: "/api/auth/register",
  // ... semantic context untuk AI understanding
)
```

**3. AI Frontend Team:**
```typescript
// AI dapat endpoint info dan generate UI
get_endpoint_details(endpoint_id: "ep_user_reg")
// AI understands purpose dan generate appropriate React components
```

### Contoh Endpoint User Registration dengan Semantic Context
```typescript
create_endpoint(
  name: "User Registration",
  method: "POST",
  url: "/api/auth/register",
  folder_id: "folder_authentication",
  description: "Public user registration endpoint dengan email verification",
  purpose: "New user account creation dengan email verification untuk security",

  // Request parameters documentation
  request_params: {
    "name": "User's full name for display purposes",
    "email": "User's email address for login and communication",
    "password": "Password with security requirements (8+ chars, mixed case, numbers)",
    "confirm_password": "Password confirmation untuk prevent typos"
  },

  // Response schema documentation
  response_schema: {
    "user_id": "Unique system identifier untuk user record",
    "name": "User display name untuk UI",
    "email": "User email address untuk authentication",
    "status": "Account status: active|inactive|suspended|pending_verification",
    "email_verified": "Email verification status flag",
    "verification_token": "Email verification token (if required)",
    "created_at": "Account creation timestamp"
  },

  // Important implementation notes
  header_docs: {
    "Content-Type": "Application/JSON untuk request body",
    "Accept": "Application/JSON untuk response format"
  }
)
```

### Semantic Fields untuk AI Understanding

| Field | Type | Purpose | Example | AI Benefit |
|-------|------|---------|---------|-------------|
| `purpose` | string | Business purpose (max 250 chars) | "User registration with email verification" | AI understands use case and generates appropriate UI flow |
| `request_params` | object | Parameter documentation | `{"name": "User's full name for display"}` | AI generates correct form fields with validation |
| `response_schema` | object | Response field documentation | `{"user_id": "Unique user identifier"}` | AI handles response data correctly in frontend code |
| `header_docs` | object | Header documentation | `{"Content-Type": "Application/JSON"}` | AI includes proper headers in API calls |

## 🔧 Development

### Build & Run
```bash
# Build project
npm run build

# Run development server
npm run dev

# Run production server
npm start

# Type checking
npm run typecheck

# Clean build
npm run clean
```

### Testing
```bash
# Run basic test
npm test

# Run all tests
node test/runners/run-all-tests.js

# Run specific category
node test/runners/run-category-tests.js endpoints

# Run semantic fields tests
node test/unit/endpoints/semantic-test-runner.js
```

## 🔍 Configuration Format

### gassapi.json Structure
```json
{
  "name": "Project Name",
  "project_id": "proj_abc123def456",
  "api_base_url": "http://localhost:8080/gassapi2/backend/",
  "mcp_validate_endpoint": "/mcp/validate",
  "token": "plain_text_mcp_token_here",
  "environments": [
    {
      "id": "env_dev123",
      "name": "development",
      "is_default": true,
      "variables": {
        "baseUrl": "http://localhost:8080/gassapi2/backend",
        "apiKey": "dev-api-key"
      }
    }
  ]
}
```

### Auto-Detection
MCP server akan otomatis mencari `gassapi.json` di:
- Current working directory
- Parent directories (hingga 5 levels up)

## 🚨 Troubleshooting

### Common Issues

**1. "No configuration found"**
- Pastikan `gassapi.json` ada di working directory atau parent directory
- Cek format JSON valid

**2. "Invalid token"**
- Generate ulang MCP config dengan `mcp_generate_config`
- Pastikan token masih valid

**3. "Backend unavailable"**
- Start backend server: `cd backend && php -S localhost:8080`
- Check database migration: `php migrate.php --status`

**4. MCP server not found**
- Build MCP server: `npm run build`
- Verify file path di Claude/Cursor configuration

### Debug Commands
```bash
# Check MCP server status
npm start -- --status

# Check configuration detection
node -e "console.log(require('./src/config.js').ConfigManager)"

# Test backend connectivity
curl "http://localhost:8080/gassapi2/backend/?act=health"
```

## 📞 Usage Examples

### Basic Usage in Claude Code
```
User: "Show my project"
AI: Uses get_project_context tool

User: "Create endpoint for user registration"
AI: create_endpoint dengan semantic fields

User: "Test this endpoint"
AI: test_endpoint dengan environment variables
```

### Advanced Usage
```
User: "Create flow untuk user registration dengan email verification"
AI: create_flow dengan multiple steps dan validation

User: "List semua endpoints di folder Authentication"
AI: list_endpoints dengan filter folder_id
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Run tests: `npm test`
4. Submit pull request

## 📄 License

MIT License

---

**🎯 Key Benefits:**
- ✅ Semantic context untuk AI understanding
- ✅ Real-time endpoint management
- ✅ Automated flow creation
- ✅ Comprehensive testing tools
- ✅ Easy integration dengan Claude Code/Cursor