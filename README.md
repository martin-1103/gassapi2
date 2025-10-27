# GASS API 2 - Platform Testing API & Otomasi

Platform lengkap untuk testing dan otomasi API dengan semantic documentation untuk AI-assisted development.

## 🚀 Quick Start

### Prerequisites
- PHP 8.2+
- MySQL 5.7+
- Node.js 16+
- Composer
- npm/yarn

### Instalasi Cepat

```bash
# 1. Clone repository
git clone <repository-url>
cd gassapi2

# 2. Setup Backend PHP
cd backend
composer install
cp .env.example .env
# Edit .env dengan konfigurasi database Anda
php migrate.php --seed

# 3. Setup MCP Server
cd ../mcp2
npm install
npm run build

# 4. Start Development Servers
# Terminal 1: Backend PHP
cd ../backend
php -S localhost:8080

# Terminal 2: MCP Server
cd ../mcp2
npm run dev
```

## 📋 Architecture Overview

```
gassapi2/
├── backend/                    # PHP REST API dengan Repository Pattern
│   ├── src/
│   │   ├── repositories/       # Data Access Layer
│   │   ├── services/          # Business Logic
│   │   ├── handlers/          # HTTP Request Handlers
│   │   ├── helpers/           # Utilities
│   │   └── middleware/        # Request Processing
│   ├── migrations/            # Database Schema
│   ├── seeds/                # Sample Data
│   └── tests/                # Backend Tests
├── mcp2/                     # Node.js MCP Server
│   ├── src/
│   │   ├── tools/            # MCP Tools by Domain
│   │   │   ├── auth/         # Authentication
│   │   │   ├── endpoints/    # API Endpoint Management
│   │   │   ├── flows/        # Automation Workflows
│   │   │   ├── folders/      # Project Organization
│   │   │   ├── environment/  # Environment Variables
│   │   │   └── testing/      # API Testing Tools
│   │   └── types/            # TypeScript Definitions
│   ├── dist/                 # Compiled JavaScript
│   └── test/                 # MCP Tests
└── README.md                 # This file
```

## 🔧 Backend API

### Authentication System
- **JWT-based** dengan access token (15 menit) dan refresh token (7 hari)
- **Password Security** Bcrypt 12 rounds
- **Token Versioning** untuk secure logout/password change
- **Role-based Access Control**

### Core Endpoints
```bash
# Authentication
POST /gassapi2/backend/?act=login          # User login
POST /gassapi2/backend/?act=register       # User registration
POST /gassapi2/backend/?act=logout         # Logout
POST /gassapi2/backend/?act=refresh        # Token refresh

# User Management
GET  /gassapi2/backend/?act=users          # List users
GET  /gassapi2/backend/?act=profile        # Current user profile
PUT  /gassapi2/backend/?act=user&id={id}   # Update user

# System
GET  /gassapi2/backend/?act=health         # Health check
GET  /gassapi2/backend/?act=help          # API documentation
```

### Sample Test Users
Password untuk semua test users: `password`
- `admin@gassapi.com` - Admin user, verified, active
- `user1@gassapi.com` - Regular user, verified, active
- `user2@gassapi.com` - Regular user, unverified, active

## 🤖 MCP Server Integration

### Setup dengan Claude Code (Recommended)

```bash
# 1. Login ke Backend & Generate Config
curl -X POST "http://localhost:8080/gassapi2/backend/?act=login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@gassapi.com", "password": "password"}'

# 2. Generate MCP Configuration
curl -X POST "http://localhost:8080/gassapi2/backend/?act=mcp_generate_config&id=YOUR_PROJECT_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"

# 3. Simpan response sebagai gassapi.json di root project

# 4. Add MCP server ke Claude Code
claude mcp add --transport stdio gassapi-mcp2 -- node D:/xampp82/htdocs/gassapi2/mcp2/dist/index.js

# 5. Verify installation
claude mcp list
```

### gassapi.json Configuration
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
      "variables": {
        "baseUrl": "http://localhost:8080/gassapi2/backend",
        "apiKey": "dev-api-key"
      }
    }
  ]
}
```

## 🛠️ MCP Tools Overview (22 Total Tools)

### 📁 Project Organization
- **`get_project_context`** - Get project info with environments and folders
- **`list_folders`** - List project folders with tree view
- **`create_folder`** - Create new folder
- **`update_folder`** - Update folder details
- **`delete_folder`** - Delete folder and contents

### 🔗 Endpoint Documentation (🆕 Semantic Fields)
- **`list_endpoints`** - List all endpoints with filtering
- **`get_endpoint_details`** - Get detailed endpoint configuration
- **`create_endpoint`** - Document existing endpoint with semantic context
- **`update_endpoint`** - Update endpoint documentation

### 🌍 Environment Management
- **`list_environments`** - List all environments
- **`get_environment_details`** - Get detailed environment info
- **`create_environment`** - Create new environment
- **`update_environment_variables`** - Update environment variables
- **`set_default_environment`** - Set default environment
- **`delete_environment`** - Delete environment

### ⚡ Flow Automation
- **`create_flow`** - Create automation workflow
- **`execute_flow`** - Execute flow (sequential/parallel)
- **`get_flow_details`** - Get flow configuration and steps
- **`list_flows`** - List all flows
- **`delete_flow`** - Delete flow

### 🧪 Testing Tools
- **`test_endpoint`** - Test single endpoint with environment variables
- **`test_multiple_endpoints`** - Test multiple endpoints
- **`create_test_suite`** - Create test suite
- **`list_test_suites`** - List test suites

## 📝 Semantic Endpoint Documentation

### Concept
GASS API MCP tools digunakan untuk **mendokumentasikan endpoint yang sudah ada** di backend, bukan untuk membuat endpoint baru. Semantic fields membantu AI frontend workers memahami business context dan implementation requirements.

### Example: User Registration Documentation
```typescript
// Endpoint yang sudah ada di backend: /api/auth/register
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

  // Header documentation
  header_docs: {
    "Content-Type": "Application/JSON untuk request body",
    "Accept": "Application/JSON untuk response format"
  }
)
```

### Workflow: Backend → MCP Documentation → AI Frontend

**1. Backend Developer:**
```php
// Endpoint sudah ada di backend
public function register() {
  // Logic untuk registrasi user
  // Return user data atau error
}
```

**2. Documentation Team:**
```typescript
// Gunakan MCP tools untuk dokumentasi
create_endpoint(
  name: "User Registration",
  method: "POST",
  url: "/api/auth/register",
  // ... semantic context untuk AI understanding
)
```

**3. AI Frontend Team:**
```typescript
// AI dapat endpoint info dan generate UI yang appropriate
get_endpoint_details(endpoint_id: "ep_user_reg")
// AI understands purpose dan generate React components dengan validation
```

### Semantic Fields Benefits untuk AI

| Field | Type | Purpose | AI Benefit |
|-------|------|---------|------------|
| `purpose` | string (max 250) | Business purpose | AI generates appropriate UI flow dan validation |
| `request_params` | object | Parameter documentation | AI creates correct form fields dengan proper validation |
| `response_schema` | object | Response field documentation | AI handles response data correctly di frontend code |
| `header_docs` | object | Header documentation | AI includes proper headers di API calls |

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run semua tests
php run_tests.php

# Run specific category
php run_tests.php auth
php run_tests.php user
php run_tests.php --debug
php run_tests.php --list
```

### MCP Server Tests
```bash
cd mcp2

# Run semua tests
npm test

# Comprehensive test suite
node test/runners/run-all-tests.js

# Run specific category
node test/runners/run-category-tests.js endpoints

# Run semantic fields tests
node test/unit/endpoints/semantic-test-runner.js
```

### Test Coverage
- ✅ **Backend**: Authentication, User Management, Projects, Endpoints
- ✅ **MCP Tools**: All 22 tools with comprehensive scenarios
- ✅ **Semantic Fields**: Full test coverage for new functionality
- ✅ **Database**: Migration testing with rollback verification
- ✅ **Integration**: End-to-end workflow testing

## 🗄️ Database Schema

### Core Tables
- **users** - Authentication dan user management
- **refresh_tokens** - Token persistence
- **projects** - API project organization
- **project_members** - Team collaboration dengan roles
- **folders** - Hierarchical endpoint organization
- **endpoints** - API endpoint definitions dengan semantic fields
- **flows** - Automation workflows
- **environments** - Multi-environment configurations
- **audit_logs** - Activity tracking

### Migration System
```bash
cd backend

# Fresh migrate dengan sample data
php migrate.php --seed

# Run pending migrations only
php migrate.php

# Check migration status
php migrate.php --status
```

## 🔒 Security Features

- **Input Validation**: Comprehensive sanitization dan validation
- **XSS Protection**: Output encoding dan CSP
- **SQL Injection Prevention**: Prepared statements exclusively
- **CORS Protection**: Configurable origin restrictions
- **JWT Security**: Short-lived access tokens + refresh tokens
- **Password Security**: Bcrypt 12 rounds dengan complexity requirements

## 📊 Environment Configuration

### Required .env Variables
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=gassapi
DB_USERNAME=root
DB_PASSWORD=

# Security
JWT_SECRET=development-super-secret-jwt-key-min-32-chars
BCRYPT_ROUNDS=12

# Application
APP_ENV=development
APP_DEBUG=true
API_VERSION=v1
CORS_ORIGIN=http://localhost:3000

# Server
SERVER_PORT=8080
SERVER_HOST=0.0.0.0
```

## 🚀 Deployment

### Production Setup
```bash
# 1. Environment Setup
cp .env.example .env
# Edit .env dengan production credentials

# 2. Database Setup
php migrate.php  # No --seed in production

# 3. File Permissions
chmod -R 755 backend/
chmod -R 755 mcp2/

# 4. Build MCP Server
cd mcp2
npm run build

# 5. Start Services
# Backend: Gunakan production web server (Apache/Nginx)
# MCP: npm start
```

### Docker Support
```dockerfile
# Dockerfile untuk backend
FROM php:8.2-apache
COPY backend/ /var/www/html/
RUN docker-php-ext-install mysqli
RUN a2enmod rewrite
```

## 🔍 Development Guidelines

### Code Standards
- **PHP**: PSR-4 autoloading, strict typing, modern PHP 8.2+ features
- **TypeScript**: Strict configuration, comprehensive type checking
- **Repository Pattern**: Clean data access separation
- **Security First**: Never commit sensitive data
- **Simplicity**: Avoid over-engineering, straightforward solutions

### File Organization Rules
- Files under 300 lines
- Clean architecture with clear separation
- Logical directory structure
- Consistent naming conventions
- No TODO comments for core functionality

### Testing Requirements
- All new features must include tests
- Target 95%+ code coverage
- Test both happy path dan error scenarios
- Integration tests for critical workflows

## 📞 Usage Examples

### Basic Claude Code Workflow
```
User: "Show my project"
AI: Uses get_project_context tool

User: "Document the user registration endpoint"
AI: create_endpoint dengan semantic fields

User: "Test this endpoint with dev environment"
AI: test_endpoint dengan environment variables
```

### Advanced Workflow
```
User: "Create flow untuk user registration dengan email verification"
AI: create_flow dengan multiple steps dan validation

User: "List semua endpoints di folder Authentication"
AI: list_endpoints dengan filter folder_id
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Run tests: `php run_tests.php && npm test`
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details.

---

**🎯 Key Benefits:**
- ✅ Semantic endpoint documentation untuk AI understanding
- ✅ Complete API lifecycle management
- ✅ Automated flow creation dan testing
- ✅ Multi-environment support
- ✅ Seamless AI assistant integration dengan Claude Code/Cursor
- ✅ Enterprise-grade security dan scalability