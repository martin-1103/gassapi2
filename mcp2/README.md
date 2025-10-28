# GASSAPI MCP v2

Model Context Protocol (MCP) server untuk integrasi GASSAPI dengan AI assistants.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm atau yarn
- Akses ke GASSAPI backend

## 📦 Installation

### Install Package
```bash
# Install from NPM registry
npm install -g gassapi-mcp2

# Test installation
gassapi-mcp2 --help

# Add to Claude Code
# Linux/macOS/WSL
claude mcp add --transport stdio gassapi -- npx -y gassapi-mcp2

# Windows
claude mcp add --transport stdio gassapi -- cmd /c npx -y gassapi-mcp2

```

## 📋 Simple Setup (3 Steps)

### Step 1: Login ke GASSAPI Backend
Login ke backend GASSAPI untuk mendapatkan access token:
```bash
curl -X POST "http://mapi.gass.web.id/?act=login" \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "password": "YourPassword"}'
```

### Step 2: Dapatkan Project ID
List projects untuk mendapatkan project ID:
```bash
curl -X GET "http://mapi.gass.web.id/?act=projects" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 3: Buat gassapi.json File
Buat file `gassapi.json` di working directory Anda dengan template:

```json
{
  "project": {
    "id": "YOUR_PROJECT_ID_HERE",
    "name": "Your Project Name",
    "description": "Your project description"
  },
  "mcpClient": {
    "token": "YOUR_TOKEN_HERE"
  }
}
```

**Ganti dengan:**
- `YOUR_PROJECT_ID_HERE` → Project ID dari Step 2
- `YOUR_TOKEN_HERE` → Token dari Step 1

**Note:** Base URL sudah hardcoded ke `http://mapi.gass.web.id` - tidak perlu konfigurasi API URL.

## ✅ Verification

### Test MCP Server
```bash
# Test help command
gassapi-mcp2 --help

# Test version
gassapi-mcp2 --version

# Test status
gassapi-mcp2 --status
```

### Claude Code Integration
```bash
# List MCP servers
claude mcp list

# Test connection
# Restart Claude Code dan coba gunakan GASSAPI tools
```

## 🛠️ Development

### Local Development
```bash
# Clone repository
git clone <repository-url>
cd gassapi-mcp2

# Install dependencies
npm install

# Build
npm run build

# Development mode
npm run dev

# Type checking
npm run typecheck
```

## 🔧 Configuration Format

### gassapi.json Structure
```json
{
  "project": {
    "id": "proj_abc123def456",
    "name": "Project Name",
    "description": "Project description"
  },
  "mcpClient": {
    "token": "plain_text_mcp_token_here"
  }
}
```

**Note:** Base URL sudah hardcoded ke `http://mapi.gass.web.id` - tidak perlu `api_base_url` configuration.

### Auto-Detection
MCP server akan otomatis mencari `gassapi.json` di:
- Current working directory
- Parent directories (hingga 5 levels up)

## 🛠️ Available MCP Tools

### Authentication & Project Context
- `get_project_context` - Get project info with environments and folders
- `health_check` - Check MCP server status

### Environment Management
- `list_environments` - List all environments
- `get_environment_details` - Get detailed environment info
- `create_environment` - Create new environment
- `update_environment_variables` - Update environment variables
- `set_default_environment` - Set default environment
- `delete_environment` - Delete environment

### Folder Management
- `list_folders` - List project folders
- `create_folder` - Create new folder
- `update_folder` - Update folder details
- `move_folder` - Move folder to different parent
- `delete_folder` - Delete folder
- `get_folder_details` - Get folder details

### Endpoint Management
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
  "project": {
    "id": "proj_abc123def456",
    "name": "Project Name",
    "description": "Project description"
  },
  "mcpClient": {
    "token": "plain_text_mcp_token_here"
  }
}
```

**Note:** Base URL sudah hardcoded ke `http://mapi.gass.web.id` - tidak perlu `api_base_url` configuration.

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
- Login kembali ke backend untuk dapat token baru
- Pastikan token belum expired

**3. "Backend unavailable"**
- Pastikan backend server sudah berjalan di `http://mapi.gass.web.id`
- Check koneksi internet dan firewall settings

**4. MCP server not found**
- Install globally: `npm install -g gassapi-mcp2`
- Atau gunakan npx: `npx gassapi-mcp2`

### Debug Commands
```bash
# Check MCP server status
gassapi-mcp2 --status

# Test help
gassapi-mcp2 --help

# Test version
gassapi-mcp2 --version

# Test backend connectivity
curl "http://mapi.gass.web.id/?act=health"
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