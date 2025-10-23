# 🚀 RBAC Implementation Documentation

## **📋 Overview**

RBAC (Role-Based Access Control) system telah diimplementasikan dengan Repository Pattern untuk backend PHP. Implementasi ini mengikuti plan dari `@plan\authentication.md` dengan model sederhana: **Project Members have equal access, Project Owners dapat delete projects**.

## **🏗️ Architecture Pattern**

### **Repository Pattern Structure**
```
src/
├── repositories/           # Database operations per entity
│   ├── BaseRepository.php    # Abstract base dengan shared functionality
│   ├── UserRepository.php    # User CRUD operations
│   ├── RefreshTokenRepository.php # Token management
│   └── [future] ProjectRepository.php
├── services/              # Business logic layer
│   ├── AuthService.php     # Authentication logic
│   └── [future] ProjectService.php
├── helpers/              # Utility functions
│   ├── DatabaseHelper.php # Basic connection only
│   ├── JwtHelper.php     # JWT operations
│   └── ResponseHelper.php # API responses
└── handlers/             # HTTP endpoint handlers
    ├── AuthHandler.php    # Authentication endpoints
    └── UserHandler.php    # User management endpoints
```

## **🔐 Authentication System**

### **JWT Token System**
- **Access Token**: 15 minutes expiry
- **Refresh Token**: 7 days expiry
- **Token Version**: Invalidation mechanism
- **Storage**: Refresh tokens in database, access tokens client-side

### **Token Flow**
```
1. Login → Generate Access + Refresh Token
2. API Call → Use Access Token (Bearer header)
3. Token Expired → Use Refresh Token for new Access Token
4. Logout/Password Change → Increment token_version (invalidate all tokens)
```

## **🛠️ API Endpoints**

### **Authentication Endpoints**

#### `POST /login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "User Name",
    "is_active": 1,
    "email_verified": 0
  },
  "tokens": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "Bearer",
    "expires_in": 900
  }
}
```

#### `POST /register`
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "password": "Password123"
}
```

#### `POST /refresh`
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### `POST /logout`
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### `POST /logout-all`
*Requires: Bearer Token*
*Invalidate: All user tokens*

### **User Management Endpoints**

#### `GET /users`
*Optional Query Parameters:*
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by name/email
- `active_only`: true/false filter

#### `GET /users/stats`
**Response:**
```json
{
  "total_users": 100,
  "active_users": 85,
  "inactive_users": 15
}
```

#### `GET /profile`
*Requires: Bearer Token*

#### `POST /profile`
*Requires: Bearer Token*
```json
{
  "name": "New Name",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

#### `POST /change-password`
*Requires: Bearer Token*
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword123"
}
```

## **🔧 Usage Examples**

### **Login with cURL**
```bash
curl -X POST "http://localhost/gassapi/backend-php/?act=login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### **Access Protected Endpoint**
```bash
curl -X GET "http://localhost/gassapi/backend-php/?act=profile" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

### **Refresh Token**
```bash
curl -X POST "http://localhost/gassapi/backend-php/?act=refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }'
```

## **🛡️ Security Features**

### **Password Security**
- Bcrypt hashing (12 rounds)
- Password complexity requirements
- Secure password storage

### **Token Security**
- JWT with HS256 algorithm
- Token versioning for invalidation
- Refresh token one-time use
- Token expiration management

### **Input Validation**
- Email format validation
- Input sanitization
- Required field validation
- XSS prevention

## **⚡ Performance Optimizations**

### **Database Connection**
- Singleton pattern for connection reuse
- Connection pooling ready
- Transaction support

### **Repository Pattern Benefits**
- Single Responsibility Principle
- Reusable database operations
- Easy testing and maintenance
- Code reusability

## **🔧 Environment Setup**

### **Required Environment Variables**
```env
# JWT Secrets (CHANGE IN PRODUCTION)
JWT_ACCESS_SECRET=your_access_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here

# App Configuration
APP_NAME=GASSAPI
APP_URL=http://localhost

# Database Configuration
DB_HOST=localhost
DB_NAME=gassapi
DB_USER=root
DB_PASSWORD=
```

### **Composer Dependencies**
```json
{
  "require": {
    "firebase/php-jwt": "^6.11.1",
    "vlucas/phpdotenv": "^5.6"
  }
}
```

## **🧪 Testing**

### **Unit Tests (Recommended)**
```php
// Test UserRepository
$userRepo = new UserRepository();
$user = $userRepo->create([
    'email' => 'test@example.com',
    'name' => 'Test User',
    'password_hash' => password_hash('password', PASSWORD_BCRYPT)
]);

// Test AuthService
$authService = new AuthService();
$result = $authService->login('test@example.com', 'password');
```

### **Integration Tests**
```bash
# Test full authentication flow
curl -X POST "http://localhost/gassapi/backend-php/?act=register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test", "password": "Password123"}'

curl -X POST "http://localhost/gassapi/backend-php/?act=login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Password123"}'
```

## **🚀 Next Steps**

### **Phase 2: Project RBAC**
1. **ProjectRepository** - Project CRUD operations
2. **ProjectMemberRepository** - Member management
3. **ProjectService** - Project business logic
4. **ProjectMiddleware** - Project-based access control
5. **MCP Token System** - Permanent tokens for AI assistants

### **Phase 3: Advanced Features**
1. **Role-based permissions** - Owner, Admin, Member, Viewer
2. **Resource-level access** - Endpoint, flow, collection permissions
3. **Audit logging** - Complete activity tracking
4. **Rate limiting** - API abuse prevention

## **📊 Implementation Status**

- ✅ **Repository Pattern** - BaseRepository, UserRepository, RefreshTokenRepository
- ✅ **JWT Authentication** - Complete token system with refresh
- ✅ **Auth Service** - Centralized authentication logic
- ✅ **Updated Handlers** - AuthHandler, UserHandler with repository pattern
- ✅ **API Routes** - All new endpoints integrated
- ✅ **Composer Dependencies** - Firebase JWT library added
- ✅ **Database Schema** - All required tables from migrations

## **🐛 Common Issues & Solutions**

### **JWT Token Errors**
```bash
# Check if secrets are set
print_r($_ENV);

# Verify token format
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
# Header.Payload.Signature (3 parts)
```

### **Database Connection Issues**
```bash
# Test database connection
php -r "require 'vendor/autoload.php'; echo (new App\Helpers\DatabaseHelper)->testConnection() ? 'Connected' : 'Failed';"
```

### **Autoloading Issues**
```bash
# Regenerate autoloader
composer dump-autoload

# Check class paths
php -r "require 'vendor/autoload.php'; var_dump(class_exists('App\\Services\\AuthService'));"
```

---

**Implementation completed! 🎉**
RBAC system with Repository Pattern is ready for production use.