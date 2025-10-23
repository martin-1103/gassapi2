# Database Seeds

This directory contains SQL seed files for populating the GASS API database with sample data for development environment.

## Available Seed Files

### Core Data Seeds (ordered by dependencies)
1. `001_seed_users.sql` - Sample users (admin, test users, regular users)
2. `002_seed_projects.sql` - Sample API projects (e-commerce, weather, user management, etc.)
3. `003_seed_collections.sql` - API collections for organizing endpoints
4. `004_seed_endpoints.sql` - Sample API endpoints with various methods
5. `005_seed_environments.sql` - Environment configurations (dev, staging, prod)
6. `006_seed_flows.sql` - Sample API automation flows
7. `007_seed_project_members.sql` - Project membership assignments
8. `008_seed_test_flows.sql` - Automated test scenarios with execution history
9. `009_seed_mcp_client_tokens.sql` - MCP client tokens for API testing

## Usage

### Running Seeds

```bash
# Run all pending seeds
php seed.php

# Run specific seeder class
php seed.php --class=UsersSeeder

# Refresh all seed data (delete and re-insert)
php seed.php --refresh

# Rollback last seed batch
php seed.php --rollback

# Show seed status
php seed.php --status
```

### Available Seeder Classes

- `UsersSeeder` - Creates admin and test users
- `ProjectsSeeder` - Creates sample API projects
- `CollectionsSeeder` - Creates API collections
- `EndpointsSeeder` - Creates sample API endpoints
- `EnvironmentsSeeder` - Creates environment configurations
- `FlowsSeeder` - Creates API automation flows
- `ProjectMembersSeeder` - Creates project membership relationships
- `TestFlowsSeeder` - Creates automated test scenarios
- `McpClientTokensSeeder` - Creates MCP client tokens

## Sample Data Overview

### Users
- **Admin User**: `admin@gassapi.com` (password: `password`)
- **Test Users**: 5 users with various statuses (active, inactive, verified, unverified)
- Different user roles and authentication states for testing

### Projects
- **E-Commerce API**: Product management, orders, payments
- **Weather Service API**: Weather data and forecasts
- **User Management System**: Authentication and authorization
- **File Storage API**: File upload/download functionality
- **Analytics Dashboard API**: Business analytics and reporting

### Collections & Endpoints
- Organized by project and functionality
- Sample endpoints for CRUD operations
- Authentication workflows
- File handling operations
- Analytics and reporting endpoints

### Environments
- **Development**: Local development configurations
- **Staging**: Testing environment settings
- **Production**: Production-ready configurations

### Test Flows
- Comprehensive test suites for each API
- Authentication flow testing
- CRUD operation testing
- Error handling validation
- File upload/download testing
- Analytics data testing

## Features

### Tracking System
- Seeds table tracks executed seed files
- Batch execution grouping
- Execution timestamps
- Rollback support by batch

### Idempotent Operations
- Seeds can be run multiple times safely
- Automatic cleanup of existing seed data on refresh
- Prevents duplicate data insertion

### Environment Detection
- Different data for development vs production
- Safe default configurations
- Environment-specific settings

### Integration with Migrations
- `php migrate.php --seed` runs migrations then seeds
- Proper dependency ordering
- Seamless setup workflow

## Development Workflow

### First Time Setup
```bash
# Run migrations and seeds together
php migrate.php --seed

# Or run separately
php migrate.php
php seed.php
```

### Development Reset
```bash
# Refresh database with migrations and seeds
php migrate.php --fresh
php seed.php --refresh
```

### Testing Specific Scenarios
```bash
# Run only user-related seeds
php seed.php --class=UsersSeeder

# Check current seed status
php seed.php --status
```

## Data Relationships

The seed data creates realistic relationships between entities:
- Users own projects and are project members
- Projects contain collections, endpoints, and environments
- Collections organize related endpoints
- Test flows and automation flows reference real endpoints
- MCP tokens are associated with projects and creators

## Security Notes

⚠️ **Development Only**: These seeds are intended for development environments only.
- Default passwords are simple (`password`)
- API keys are sample values
- Some test data includes inactive/unverified states
- Never use these credentials in production

## Customization

To customize seed data for your specific needs:
1. Modify the SQL files directly
2. Add new seed files following the naming convention
3. Update the seeder class mapping in `seed.php`
4. Test with `php seed.php --refresh`

The seed system is designed to be easily extensible and customizable for different development scenarios.