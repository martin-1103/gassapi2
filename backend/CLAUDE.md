# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GASS API (Gas API Simulation System) is a PHP 8.2+ backend API built with Repository Pattern, JWT authentication, and modular architecture. The system provides API testing and automation capabilities with comprehensive database migrations and seeding.

## Development Commands

### Database Management
```bash
# Migration commands
php migrate.php                    # Run all pending migrations
php migrate.php --status           # Show migration status
php migrate.php --fresh            # Drop all tables and recreate
php migrate.php --seed            # Migrate + seed data (recommended for development)

# Seeding commands
php seed.php                       # Run all seeds
php seed.php --refresh            # Refresh seed data
php seed.php --status              # Show seeder status
php seed.php --class=UsersSeeder  # Run specific seeder
```

### Testing
```bash
php run_tests.php                  # Run all tests
php run_tests.php auth            # Run authentication tests only
php run_tests.php user            # Run user management tests only
php run_tests.php --list          # List available tests
php run_tests.php --debug         # Run with debug output
```

### Development Server
```bash
php -S localhost:8080              # Start PHP built-in server
# Access API: http://localhost:8080/gassapi/backend-php//?act=help
```

## Architecture

### Repository Pattern Structure
```
src/
├── repositories/           # Data access layer (CRUD operations)
│   ├── BaseRepository.php    # Abstract base with shared functionality
│   ├── UserRepository.php    # User data operations
│   └── RefreshTokenRepository.php # Token management
├── services/              # Business logic layer
│   └── AuthService.php     # Authentication and authorization logic
├── helpers/              # Utility functions
│   ├── DatabaseHelper.php # Database connection management
│   ├── JwtHelper.php     # JWT token operations
│   └── ResponseHelper.php # Standardized API responses
├── handlers/             # HTTP request handlers
│   ├── AuthHandler.php    # Authentication endpoints
│   └── UserHandler.php    # User management endpoints
└── Config/               # Configuration classes
    └── App.php          # Application configuration
```

### API Routing System
- Action-based routing via `?act=` parameter
- Method mapping: GET, POST, PUT, DELETE
- Security whitelist for allowed actions
- RESTful endpoints with consistent response format

### Database Migration System
- **Automated tracking**: `migrations` table tracks executed migrations
- **Sequential files**: Numbered migration files (000-999) ordered by dependencies
- **Fresh start support**: Drop and recreate all tables
- **Seeding integration**: Comprehensive sample data for development

## Authentication System

### JWT Token Flow
1. **Login**: Generate access token (15min) + refresh token (7days)
2. **API Calls**: Use access token in Authorization header
3. **Token Refresh**: Exchange refresh token for new access token
4. **Logout/Password Change**: Increment token_version to invalidate all tokens

### Security Features
- Bcrypt password hashing (12 rounds)
- Token versioning for secure invalidation
- Input validation and XSS prevention
- SQL injection prevention with prepared statements
- CORS protection

## Database Schema

### Core Tables
- **users**: Authentication and profile data
- **refresh_tokens**: Persistent refresh token storage
- **projects**: API project management
- **project_members**: Team membership with role-based access
- **folders, endpoints, flows**: API organization
- **environments**: Development/staging/production configs
- **audit_logs**: Activity tracking

### Sample Data
- **5 Test Users**: Various states (active/inactive, verified/unverified)
- **5 Sample Projects**: E-commerce, weather, user management, file storage, analytics
- **Complete API Folders**: Organized endpoints for each project
- **Test Flows**: Automated API testing scenarios

## API Endpoints

### Authentication
- `POST ?act=login` - User authentication
- `POST ?act=register` - User registration
- `POST ?act=logout` - Single session logout
- `POST ?act=refresh` - Token refresh

### User Management
- `GET ?act=users` - List users with pagination and search
- `GET ?act=users/stats` - User statistics
- `GET ?act=profile` - Current user profile (requires auth)
- `PUT ?act=user&id={id}` - Update user
- `DELETE ?act=user&id={id}` - Delete user

### System
- `GET ?act=health` - Health check
- `GET ?act=help` - API documentation

## Environment Configuration

### Required .env Variables
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=gassapi
DB_USERNAME=root

# Security
JWT_SECRET=development-super-secret-jwt-key
BCRYPT_ROUNDS=12

# Application
APP_ENV=development
APP_DEBUG=true
API_VERSION=v1
```

## Development Workflow

### First Time Setup
```bash
# 1. Create .env file with database configuration
# 2. Install dependencies: composer install
# 3. Setup database with sample data
php migrate.php --seed

# 4. Test authentication
curl -X POST "http://localhost:8080/?act=login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@gassapi.com", "password": "password"}'
```

### Testing Changes
```bash
# Run specific test category
php run_tests.php auth

# Test with debug output
php run_tests.php --debug

# Reset database if needed
php migrate.php --fresh
php seed.php --refresh
```

## Key Patterns

### Repository Pattern Usage
- All data operations go through repositories
- BaseRepository provides common CRUD functionality
- Separation of data access from business logic
- Easy testing and maintenance

### Error Handling
- Standardized JSON responses via ResponseHelper
- Consistent error codes and messages
- Input validation with clear error messages

### Security Practices
- All inputs sanitized and validated
- Prepared statements for database queries
- JWT tokens with proper expiration
- Password complexity requirements

## Important Notes

- **Testing Timeout**: Always use 1-second timeout for API tests
- **Database Connection**: Uses singleton pattern for connection reuse
- **File Organization**: Feature-based directory structure
- **Version Control**: Migration system supports rollback and version tracking
- **Sample Data**: Default password for all test users is "password"

## Development Standards

- Follow PSR-4 autoloading standards
- Use Repository Pattern for all data operations
- Implement proper input validation and sanitization
- Write clean, maintainable code under 300 lines per file
- Test authentication and user management thoroughly
- Use Indonesian casual language in comments and user-facing messages
- VERY IMPORTANT: Keep it simple and avoid over-engineering