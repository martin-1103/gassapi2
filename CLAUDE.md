# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GASS API 2 is a comprehensive API testing and automation platform consisting of:
- **Backend**: PHP 8.2+ REST API with Repository Pattern architecture
- **MCP Server**: Node.js/TypeScript server providing AI assistant tools via Model Context Protocol
- **Database**: MySQL with migration system and comprehensive seeding
- **Testing**: Full test coverage for both backend and MCP components

## Development Commands

### Backend (PHP)
```bash
# Setup and Database
cd backend
composer install                                    # Install PHP dependencies
php migrate.php --seed                            # Fresh migrate with sample data (recommended)
php migrate.php                                    # Run pending migrations only
php migrate.php --status                           # Check migration status

# Development Server
php -S localhost:8080                              # Start PHP built-in server
# Access API: http://localhost:8080/gassapi2/backend/?act=help

# Testing
php run_tests.php                                  # Run all backend tests
php run_tests.php auth                            # Run authentication tests only
php run_tests.php user                            # Run user management tests
php run_tests.php --debug                         # Run tests with debug output
php run_tests.php --list                          # List available test categories
```

### MCP Server (Node.js)
```bash
# Setup and Development
cd mcp2
npm install                                        # Install Node.js dependencies
npm run build                                      # Build TypeScript to JavaScript
npm run dev                                        # Development mode with hot reload
npm run start                                      # Start production server
npm run typecheck                                  # Type checking without compilation

# Testing
npm test                                           # Run MCP server tests
node test/runners/run-all-tests.js                # Comprehensive test suite
node test/runners/run-category-tests.js [category] # Run specific test category
```

## Architecture Overview

### Backend Structure (Repository Pattern)
```
backend/
├── src/
│   ├── repositories/          # Data access layer
│   │   ├── BaseRepository.php     # Abstract base with shared CRUD
│   │   ├── UserRepository.php     # User operations
│   │   └── RefreshTokenRepository.php # Token management
│   ├── services/             # Business logic
│   │   └── AuthService.php        # Authentication & authorization
│   ├── handlers/             # HTTP request handlers
│   │   ├── AuthHandler.php         # Authentication endpoints
│   │   └── UserHandler.php         # User management
│   ├── helpers/              # Utilities
│   │   ├── DatabaseHelper.php      # Database connection
│   │   ├── JwtHelper.php          # JWT operations
│   │   └── ResponseHelper.php     # API responses
│   ├── middleware/           # Request processing
│   ├── models/              # Data models
│   └── Config/              # Configuration
├── migrations/              # Database schema migrations
├── seeds/                  # Sample data generation
└── tests/                  # Comprehensive test suite
```

### MCP Server Structure
```
mcp2/
├── src/
│   ├── server.ts           # Main MCP server implementation
│   ├── tools/              # MCP tools organized by domain
│   │   ├── auth/           # Authentication & project context
│   │   ├── endpoints/      # API endpoint management
│   │   ├── flows/          # API automation workflows
│   │   ├── folders/        # Project organization
│   │   ├── environment/    # Environment variables
│   │   └── testing/        # API testing tools
│   └── types/              # TypeScript definitions
├── dist/                   # Compiled JavaScript output
└── test/                   # MCP tool tests
```

## Key Technologies

### Backend Stack
- **PHP 8.2+** with modern features and strict typing
- **Composer** dependency management with PSR-4 autoloading
- **MySQLi** with prepared statements for security
- **JWT Authentication** (Firebase/php-jwt)
- **Repository Pattern** for clean data access separation
- **Bcrypt** password hashing (12 rounds)

### MCP Server Stack
- **Node.js 16+** with ES modules
- **TypeScript** with strict configuration and comprehensive type checking
- **MCP SDK v1.20.1** for Model Context Protocol integration
- **tsx** for development hot-reload and compilation

## Database Schema & Migration System

### Core Tables
- **users**: Authentication, profiles, and user management
- **refresh_tokens**: Persistent refresh token storage
- **projects**: API project organization and management
- **project_members**: Team collaboration with role-based access
- **folders**: Hierarchical organization of API endpoints
- **endpoints**: Individual API endpoint definitions
- **flows**: Automated API testing workflows
- **environments**: Development/staging/production configurations
- **audit_logs**: Activity tracking and audit trail

### Migration System Features
- **Automated tracking**: `migrations` table tracks execution history
- **Sequential execution**: Numbered files (000-999) with dependency ordering
- **Fresh start support**: Drop and recreate all tables cleanly
- **Comprehensive seeding**: Rich sample data for development

## Authentication & Security

### JWT Token Implementation
- **Access tokens**: 15-minute expiration for API operations
- **Refresh tokens**: 7-day expiration for token renewal
- **Token versioning**: Secure invalidation on password change/logout
- **Bearer token**: Authorization header format

### Security Features
- **Input validation**: Comprehensive sanitization and validation
- **XSS protection**: Output encoding and content security
- **SQL injection prevention**: Prepared statements exclusively
- **CORS protection**: Configurable origin restrictions
- **Password security**: Bcrypt with 12-round complexity

## API Endpoints Structure

### Routing System
- **Action-based**: `?act=` parameter routing pattern
- **Method mapping**: Support for GET, POST, PUT, DELETE
- **Security whitelist**: Allowed actions configuration
- **RESTful design**: Consistent response structure

### Core Endpoints
```
Authentication:
POST ?act=login          # User authentication
POST ?act=register       # User registration
POST ?act=logout         # Session termination
POST ?act=refresh        # Token renewal

User Management:
GET ?act=users          # List users with pagination
GET ?act=users/stats    # User statistics
GET ?act=profile        # Current user profile
PUT ?act=user&id={id}   # Update user
DELETE ?act=user&id={id} # Delete user

System:
GET ?act=health         # Health check
GET ?act=help          # API documentation
```

## MCP Tools Overview

The MCP server provides 22 specialized tools for API management:

### Authentication Tools
- **Project Context**: Validate and manage project access
- **Health Check**: System status and connectivity

### Organization Tools
- **Folders**: Create, read, update, delete project folders
- **Hierarchy management**: Tree view and nested organization

### API Endpoint Tools
- **CRUD Operations**: Complete endpoint lifecycle management
- **Testing**: Individual endpoint validation and testing
- **Organization**: Folder-based categorization

### Environment Management
- **Multi-environment**: Dev/staging/production configurations
- **Variable management**: Secure environment variable handling
- **Context switching**: Environment-aware operations

### Flow Automation
- **Workflow creation**: Multi-step API testing sequences
- **Execution engine**: Sequential and parallel flow execution
- **Result tracking**: Comprehensive flow execution reporting

### Testing Tools
- **Endpoint testing**: Automated API validation
- **Flow testing**: Complex workflow testing
- **Integration testing**: Cross-system validation

## Environment Configuration

### Required .env Variables
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=gassapi
DB_USERNAME=root
DB_PASSWORD=

# Security Configuration
JWT_SECRET=development-super-secret-jwt-key-min-32-chars
BCRYPT_ROUNDS=12

# Application Configuration
APP_ENV=development
APP_DEBUG=true
API_VERSION=v1
CORS_ORIGIN=http://localhost:3000

# Server Configuration
SERVER_PORT=8080
SERVER_HOST=0.0.0.0
```

## Development Workflow

### First Time Setup
```bash
# 1. Backend Setup
cd backend
composer install
cp .env.example .env  # Configure database settings
php migrate.php --seed

# 2. MCP Server Setup
cd ../mcp2
npm install
npm run build

# 3. Start Development Servers
# Terminal 1: Backend
cd ../backend
php -S localhost:8080

# Terminal 2: MCP Server
cd ../mcp2
npm run dev
```

### Testing Authentication Flow
```bash
# Test login (default admin user)
curl -X POST "http://localhost:8080/gassapi2/backend/?act=login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@gassapi.com", "password": "password"}'

# Use returned access token for authenticated requests
curl -X GET "http://localhost:8080/gassapi2/backend/?act=profile" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Running Tests
```bash
# Backend Tests
cd backend
php run_tests.php                    # All tests
php run_tests.php auth              # Authentication tests
php run_tests.php --debug           # With debug output

# MCP Server Tests
cd mcp2
npm test                            # All MCP tests
node test/runners/run-category-tests.js environment # Specific category
```

## Sample Data

### Default Test Users
All test users use password: "password"
- **admin@gassapi.com**: Admin user, verified, active
- **user1@gassapi.com**: Regular user, verified, active
- **user2@gassapi.com**: Regular user, unverified, active
- **inactive@gassapi.com**: Inactive user, verified
- **suspended@gassapi.com**: Suspended user, verified

### Sample Projects
- **E-commerce API**: Complete e-commerce endpoints
- **Weather Service**: Weather data API endpoints
- **User Management**: User CRUD operations
- **File Storage**: File upload/download API
- **Analytics Dashboard**: Analytics data endpoints

## Important Development Notes

- **Repository Pattern**: All data operations must go through repositories
- **Authentication**: Most endpoints require valid JWT token
- **Testing Timeout**: API tests should use 1-second timeout
- **Database Connection**: Singleton pattern for connection reuse
- **Security**: Never commit sensitive data or tokens
- **Code Standards**: Keep files under 300 lines, maintain clean architecture
- **Language**: Use Indonesian casual language in comments and user messages
- **Simplicity**: Avoid over-engineering, keep solutions straightforward

## MCP Integration

The MCP server enables AI assistant integration for:
- **Automated API testing**: Flow creation and execution
- **Project management**: Organization and context validation
- **Environment switching**: Multi-environment workflow support
- **Endpoint management**: CRUD operations with folder organization
- **Testing automation**: Comprehensive API validation tools

MCP tools are organized by domain and provide complete API lifecycle management capabilities through AI-powered interactions.