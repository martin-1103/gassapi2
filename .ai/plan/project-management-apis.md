# 🚀 Project Creation & Management APIs

## Overview

Berikut adalah daftar lengkap API yang diperlukan untuk create project dan manage project dalam sistem GassAPI, berdasarkan analisis dari plan directory yang ada.

---

## 🏗️ API untuk Project Creation

### 1. **Authentication APIs** - User Management
**Location**: `backend/endpoints/authentication.md`

#### Required APIs untuk Project Creation:
- **POST `/auth/register`** - Register new user
  - Membuat user account baru
  - Return JWT access & refresh tokens
  - Required untuk user authentication sebelum bisa buat project

- **POST `/auth/login`** - User login
  - Authenticate existing user
  - Return JWT tokens untuk API access
  - Required untuk authenticated project creation

- **POST `/auth/refresh`** - Refresh access token
  - Maintain session selama project creation process
  - 15 menit access token expiration

- **POST `/auth/verify-email`** - Email verification
  - Verify user email address
  - Optional untuk basic project creation

### 2. **Project Creation API** - Core Functionality
**Location**: `backend/endpoints/projects.md`

#### Primary API:
- **POST `/projects`** - Create new project
  - **Request**: `{name: string, description?: string}`
  - **Response**: Project object dengan ID, owner info
  - **Business Logic**: Creator automatically becomes project owner
  - **Features**:
    - Default project setup
    - Auto-create default environment
    - UUID-based project ID generation

### 3. **Initial Setup APIs** - Project Configuration
**Location**: `backend/endpoints/environments.md` & `backend/endpoints/collections.md`

#### Required APIs:
- **POST `/projects/:id/environments`** - Create default environment
  - Auto-create development environment
  - Store API base URLs dan initial variables
  - Required untuk MCP integration

- **POST `/projects/:id/collections`** - Create initial collections
  - Organize API endpoints dalam collections
  - Support hierarchical structure
  - Optional untuk basic project setup

---

## 🔧 API untuk Project Management

### 1. **Project CRUD Operations**
**Location**: `backend/endpoints/projects.md`

#### Core Management APIs:
- **GET `/projects`** - List user projects
  - Support pagination & search
  - Filter by role (owner/member)
  - Return project statistics

- **GET `/projects/:id`** - Get project details
  - Complete project information
  - Member counts & statistics
  - User role information

- **PUT `/projects/:id`** - Update project
  - Update name, description, settings
  - Change visibility (public/private)
  - Modify project configuration

- **DELETE `/projects/:id`** - Delete project
  - Owner-only operation
  - Cascade delete all related data
  - Confirmation required

### 2. **Member Management APIs**
**Location**: `backend/endpoints/projects.md`

#### Team Collaboration APIs:
- **POST `/projects/:id/members`** - Invite member
  - Email-based invitation
  - 7-day invitation expiration
  - All members can invite others

- **GET `/projects/:id/members`** - List members
  - All project members
  - Include roles & join dates
  - Member statistics

- **DELETE `/projects/:id/members/:memberId`** - Remove member
  - Owner-only operation
  - Cannot remove project owner
  - Self-removal allowed

### 3. **Environment Management APIs**
**Location**: `backend/endpoints/environments.md`

#### Configuration APIs:
- **GET `/projects/:id/environments`** - List environments
  - All project environments
  - Variable counts & settings
  - Default environment identification

- **POST `/projects/:id/environments`** - Create environment
  - Development/Staging/Production
  - Variable definitions
  - Default environment switching

- **PUT `/environments/:id`** - Update environment
  - Variable modifications
  - Environment settings
  - Default environment changes

- **DELETE `/environments/:id`** - Delete environment
  - Constraint validation
  - Last environment protection
  - Variable cleanup

### 4. **Collection Management APIs**
**Location**: `backend/endpoints/collections.md`

#### Organization APIs:
- **GET `/projects/:id/collections`** - List collections
  - Hierarchical structure
  - Endpoint counts
  - Nested collections

- **POST `/projects/:id/collections`** - Create collection
  - Parent-child relationships
  - Nested organization
  - Permission inheritance

- **PUT `/collections/:id`** - Update collection
  - Name modifications
  - Structure changes
  - Hierarchy adjustments

- **DELETE `/collections/:id`** - Delete collection
  - Cascade delete endpoints
  - Nested collections cleanup
  - Audit trail logging

---

## 🤖 MCP Integration APIs

### 1. **MCP Client Configuration**
**Location**: `backend/endpoints/mcp.md`

#### Core Integration APIs:
- **POST `/projects/:id/generate-config`** - Generate MCP config
  - Create `gassapi.json` configuration
  - Generate permanent MCP token
  - Include project context & environments

- **GET `/mcp/validate`** - Validate MCP token
  - Used by local MCP client
  - Return project context
  - Load active environments

- **POST `/mcp/revoke-token`** - Revoke compromised token
  - Token security management
  - Project owner privileges
  - Audit trail logging

- **GET `/mcp/tokens`** - List project MCP tokens
  - Token management interface
  - Creation tracking
  - Usage statistics

### 2. **Token Management APIs**
**Location**: `backend/endpoints/mcp.md`

#### Security APIs:
- **POST `/mcp/regenerate-token`** - Regenerate token
  - Replace compromised tokens
  - Maintain project access
  - Token rotation security

---

## 📊 Database Tables yang Diperlukan

### 1. **Core Tables**
**Location**: `backend/tables/`

#### User & Authentication:
- **users** - User accounts & profiles
- **project_members** - Project membership & invitations

#### Project Management:
- **projects** - Project definitions & settings
- **environments** - Environment variables & configurations
- **collections** - API endpoint organization
- **mcp_client_tokens** - MCP integration tokens
- **audit_logs** - Activity tracking & compliance

### 2. **Table Relationships**
```
users (1) -----> (N) projects (owners)
users (1) -----> (N) project_members (members)
projects (1) -> (N) collections (organization)
projects (1) -> (N) environments (configuration)
projects (1) -> (N) mcp_client_tokens (integration)
users (1) -----> (N) audit_logs (tracking)
```

---

## 🔐 Security & Access Control

### 1. **Permission Model**
- **Project Owners**: Full project control, can delete projects
- **Project Members**: Equal access rights, can invite others
- **Authentication Required**: JWT tokens for all operations
- **Project-Based Isolation**: Data isolation per project

### 2. **Token Management**
- **Web Access Tokens**: 15-minute JWT with refresh
- **MCP Client Tokens**: Permanent tokens for Claude Desktop
- **Token Security**: Hashed storage, revocation support
- **Audit Logging**: All token operations tracked

### 3. **Rate Limiting & Validation**
- **API Rate Limits**: Prevent abuse
- **Input Validation**: Comprehensive validation rules
- **Error Handling**: Standardized error responses
- **Audit Trail**: Complete activity logging

---

## 🎯 Implementation Priority

### Phase 1: Core APIs (MVP)
1. **Authentication APIs** - User management & JWT
2. **Project Creation API** - Basic CRUD operations
3. **Environment Management** - Default environment setup
4. **MCP Integration** - Token generation & validation

### Phase 2: Collaboration Features
1. **Member Management APIs** - Team collaboration
2. **Collection Management** - API organization
3. **Advanced Environment Features** - Multiple environments
4. **Enhanced MCP Integration** - Advanced token management

### Phase 3: Advanced Features
1. **Audit & Analytics** - Usage tracking
2. **Import/Export APIs** - Postman compatibility
3. **Webhook Integration** - External integrations
4. **Advanced Permissions** - Role-based access control

---

## 📝 API Summary

### Total APIs Required: **18 endpoints**

#### Authentication (4 APIs)
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/verify-email`

#### Project Management (7 APIs)
- `GET /projects`
- `POST /projects`
- `GET /projects/:id`
- `PUT /projects/:id`
- `DELETE /projects/:id`
- `POST /projects/:id/members`
- `GET /projects/:id/members`
- `DELETE /projects/:id/members/:memberId`

#### Environment Management (4 APIs)
- `GET /projects/:id/environments`
- `POST /projects/:id/environments`
- `GET /environments/:id`
- `PUT /environments/:id`
- `DELETE /environments/:id`

#### MCP Integration (5 APIs)
- `POST /projects/:id/generate-config`
- `GET /mcp/validate`
- `POST /mcp/revoke-token`
- `GET /mcp/tokens`
- `POST /mcp/regenerate-token`

#### Collection Management (4 APIs)
- `GET /projects/:id/collections`
- `POST /projects/:id/collections`
- `PUT /collections/:id`
- `DELETE /collections/:id`

**Note**: Beberapa APIs memiliki multiple HTTP methods, sehingga total endpoint count lebih tinggi dari 18.

---

## 🔄 Implementation Status Comparison

### ✅ **What's Already Implemented (Backend Reality)**

#### 1. **Authentication System** - 100% Complete
- **JWT Authentication**: Access token (15min) + refresh token (7days)
- **Security Features**: Bcrypt 12 rounds, token versioning, CORS protection
- **Endpoints**: `/login`, `/register`, `/logout`, `/refresh`, `/logout-all`
- **Password Management**: Change password, token invalidation on password change

#### 2. **User Management** - 100% Complete
- **CRUD Operations**: Create, Read, Update, Delete users
- **Profile Management**: Profile updates, statistics, search, pagination
- **Repository Pattern**: UserRepository extends BaseRepository
- **Route System**: Action-based routing via `?act=` parameter

#### 3. **Database Schema** - 90% Complete
- **Complete Migrations**: 13 migration files (000-999) with all tables
- **All Required Tables**: users, projects, environments, collections, mcp_client_tokens, etc.
- **Relationships**: Foreign keys and constraints properly defined
- **Indexing**: Performance optimization indexes in place

### ❌ **What's Missing (Implementation Gap = ~60%)**

#### 1. **Project Management APIs** - 0% Implemented
**Required Implementation**:
```php
// Missing: ProjectHandler.php
class ProjectHandler {
    public function create() { /* POST /projects */ }
    public function getAll() { /* GET /projects */ }
    public function getById($id) { /* GET /projects/:id */ }
    public function update($id) { /* PUT /projects/:id */ }
    public function delete($id) { /* DELETE /projects/:id */ }
    public function addMember($projectId) { /* POST /projects/:id/members */ }
    public function removeMember($projectId, $memberId) { /* DELETE /projects/:id/members/:memberId */ }
}

// Missing: ProjectRepository.php
class ProjectRepository extends BaseRepository {
    // Project-specific CRUD operations
    // Member management operations
    // Permission checking
}

// Missing: Route additions in ApiRoutes.php
'GET' => [
    '/projects' => ['handler' => 'projects_list', 'description' => 'List projects'],
    '/projects/{id}' => ['handler' => 'project_detail', 'description' => 'Get project'],
    // ... other project routes
]
```

#### 2. **Environment Management APIs** - 0% Implemented
**Required Implementation**:
```php
// Missing: EnvironmentHandler.php
class EnvironmentHandler {
    public function getAll($projectId) { /* GET /projects/:id/environments */ }
    public function create($projectId) { /* POST /projects/:id/environments */ }
    public function getById($id) { /* GET /environments/:id */ }
    public function update($id) { /* PUT /environments/:id */ }
    public function delete($id) { /* DELETE /environments/:id */ }
}

// Missing: EnvironmentRepository.php
class EnvironmentRepository extends BaseRepository {
    // Environment-specific operations
    // Variable management
    // Default environment logic
}
```

#### 3. **MCP Integration APIs** - 0% Implemented
**Required Implementation**:
```php
// Missing: McpHandler.php
class McpHandler {
    public function generateConfig($projectId) { /* POST /projects/:id/generate-config */ }
    public function validateToken() { /* GET /mcp/validate */ }
    public function revokeToken() { /* POST /mcp/revoke-token */ }
    public function listTokens() { /* GET /mcp/tokens */ }
}

// Missing: McpTokenRepository.php
class McpTokenRepository extends BaseRepository {
    // Token generation and validation
    // Permanent token management
    // Project-scoped access control
}
```

### 🔧 **Architecture Adjustments Needed**

#### 1. **Routing System Adaptation**
**Current**: Action-based (`?act=login`, `?act=users`)
**Planned**: RESTful (`/api/projects`, `/api/environments`)

**Solution**: Keep existing action-based system, add new actions:
```php
'GET' => [
    'projects' => ['handler' => 'projects_list', 'description' => 'List projects'],
    'project' => ['handler' => 'project_detail', 'description' => 'Get project'],
    'project_environments' => ['handler' => 'environments_list', 'description' => 'List environments'],
    'environment' => ['handler' => 'environment_detail', 'description' => 'Get environment'],
],
'POST' => [
    'projects' => ['handler' => 'project_create', 'description' => 'Create project'],
    'project_environments' => ['handler' => 'environment_create', 'description' => 'Create environment'],
    'project_mcp_config' => ['handler' => 'mcp_generate_config', 'description' => 'Generate MCP config'],
]
```

#### 2. **Database Field Mapping**
**Schema Differences**:
```sql
-- Plan vs Reality differences:
-- Plan: CHAR(36) vs Reality: VARCHAR(255) for IDs
-- Plan: BOOLEAN vs Reality: TINYINT(1) for flags
-- Plan: JSON vs Reality: LONGTEXT for variables
```

**Solution**: Keep existing MySQL VARCHAR(255) structure, update documentation accordingly.

### 📋 **Implementation Priority (Updated)**

#### Phase 1: Foundation (Week 1-2)
1. **ProjectHandler & ProjectRepository** - Core project CRUD
2. **Basic Project Routes** - Add to existing ApiRoutes.php
3. **Project Member Management** - Invitation system

#### Phase 2: Configuration (Week 3-4)
1. **EnvironmentHandler & Repository** - Environment management
2. **CollectionHandler & Repository** - API organization
3. **Variable Substitution** - Template system for environments

#### Phase 3: Integration (Week 5-6)
1. **MCP Handler & Repository** - Claude Desktop integration
2. **Token Generation** - Permanent MCP tokens
3. **Configuration Export** - gassapi.json generation

### 🛠️ **Development Recommendations**

#### 1. **Follow Existing Patterns**
```php
// Follow the established Repository Pattern
class ProjectRepository extends BaseRepository {
    protected string $table = 'projects';

    public function create(array $data): string {
        // Use BaseRepository's create method
        return $this->createRecord($data);
    }
}

// Follow the existing Handler Pattern
class ProjectHandler {
    private ProjectRepository $projectRepo;

    public function create() {
        $data = json_decode(file_get_contents('php://input'), true);
        $project = $this->projectRepo->create($data);
        ResponseHelper::success($project, 'Project created successfully');
    }
}
```

#### 2. **Extend Existing Architecture**
- **Use ResponseHelper**: Maintain consistent API responses
- **Follow Security Patterns**: Use existing JWT validation middleware
- **Maintain Database Standards**: Follow existing migration patterns
- **Keep Testing Approach**: Add comprehensive tests for new features

---

## ✅ Conclusion

Sistem GassAPI memerlukan **18+ endpoint APIs** untuk support lengkap project creation dan management functionality, dengan fokus pada:

1. **Zero-Configuration Setup** - Otomatis project detection
2. **AI Integration** - Seamless Claude Desktop integration
3. **Team Collaboration** - Multi-user project management
4. **Security** - Comprehensive access control & audit trail
5. **Scalability** - Efficient data management & performance

API ini dirancang untuk support architecture 3-package standalone (MCP Client, Backend API, Frontend) dengan emphasis pada local-first development dan cloud-based collaboration.