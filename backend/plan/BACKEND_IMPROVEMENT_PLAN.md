# Backend API Improvement Plan

## 📊 Current Status Analysis

### ✅ **SUCCESSFULLY FIXED**
- **Authentication System**: 100% functional
- **Token Management**: Login → Get token → Use in protected endpoints works
- **Authorization Header**: Apache + PHP configuration resolved
- **Test Structure**: No more skipped tests due to authentication

### ❌ **CURRENT ISSUES**
- **Missing Endpoints**: `change-password`, `logout-all`, `user/{id}` variants
- **Backend Errors**: 500 errors on user management endpoints
- **TestConfig Problems**: Undefined endpoint routes
- **Response Structure**: Inconsistent API response formats

## 🎯 Improvement Roadmap

### Phase 1: Critical Infrastructure Fixes
**Priority: 🔴 HIGH - Estimated: 2-3 hours**

#### 1.1 TestConfig Endpoint Definitions
- [ ] Fix `user_by_id` endpoint configuration
- [ ] Add missing endpoint definitions in TestConfig.php
- [ ] Verify all endpoint URLs match actual API routes

#### 1.2 Response Structure Standardization
- [ ] Audit current API response formats
- [ ] Standardize all endpoints to use consistent structure
- [ ] Update test assertions to match actual responses

### Phase 2: Missing User Management Endpoints
**Priority: 🟡 MEDIUM - Estimated: 4-6 hours**

#### 2.1 Authentication Extensions
```php
// POST ?act=change-password
- Current password verification
- New password validation
- Token invalidation (increment version)
- Response: {"status": "success", "message": "Password changed successfully"}

// POST ?act=logout-all
- Get current user from token
- Increment user token_version
- Deactivate all refresh tokens
- Response: {"status": "success", "message": "Logged out from all devices"}
```

#### 2.2 User CRUD Operations
```php
// GET ?act=user&id={id}
- Get user by ID (admin only or own profile)
- Response: {"status": "success", "data": {"user": {...}}}

// PUT ?act=user&id={id}
- Update user profile (admin only or own profile)
- Fields allowed: name, email, role, status
- Response: {"status": "success", "message": "User updated successfully", "data": {"user": {...}}}

// DELETE ?act=user&id={id}
- Soft delete user (admin only)
- Deactivate user account
- Response: {"status": "success", "message": "User deleted successfully"}
```

### Phase 3: Backend Bug Fixes
**Priority: 🟡 MEDIUM - Estimated: 3-4 hours**

#### 3.1 User Repository Issues
- [ ] Fix `getUsers()` method causing 500 errors
- [ ] Debug user listing pagination and search
- [ ] Resolve user role/permission checks

#### 3.2 Database Query Optimization
- [ ] Review SQL queries in UserHandler
- [ ] Add proper error handling for database operations
- [ ] Implement connection error recovery

### Phase 4: Enhanced User Management
**Priority: 🟢 LOW - Estimated: 2-3 hours**

#### 4.1 User Status Management
```php
// PUT ?act=user&id={id}/toggle-status
- Activate/deactivate user accounts
- Update is_active flag
- Response: {"status": "success", "message": "User status updated successfully"}
```

#### 4.2 User Statistics
```php
// GET ?act=users/stats
- Total users count
- Active vs inactive users
- Recent registrations
- Response: {"status": "success", "data": {"stats": {...}}}
```

## 📋 Detailed Implementation Tasks

### Task 1: Fix TestConfig.php
```php
// Add missing endpoints
'user_by_id' => '?act=user&id=',  // Currently missing
'user_toggle_status' => '?act=user&id={id}/toggle-status',
'change_password' => '?act=change-password',
'logout_all' => '?act=logout-all',
'users_stats' => '?act=users_stats'
```

### Task 2: Extend AuthHandler.php
```php
// Add missing authentication methods
public function changePassword() {
    // Implementation for password change
}

public function logoutAll() {
    // Implementation for logout from all devices
}
```

### Task 3: Enhance UserHandler.php
```php
// Fix existing methods and add missing ones
public function getUserById($id) {
    // Fix implementation
}

public function updateUser($id, $data) {
    // Fix implementation
}

public function deleteUser($id) {
    // Fix implementation
}

public function toggleUserStatus($id) {
    // Add implementation
}

public function getUserStats() {
    // Add implementation
}
```

### Task 4: Fix Repository Layer
```php
// UserRepository.php fixes
public function getAll($limit = 50, $offset = 0, $search = '') {
    // Fix current 500 error
}

public function findById($id) {
    // Ensure proper error handling
}

public function update($id, $data) {
    // Fix update implementation
}
```

## 🔧 Technical Implementation Notes

### Error Handling Standards
```php
// All endpoints should follow this pattern:
try {
    // Business logic
    ResponseHelper::success($data, $message);
} catch (Exception $e) {
    error_log("Endpoint error: " . $e->getMessage());
    ResponseHelper::error("Operation failed", 500);
}
```

### Response Structure Standard
```php
// Success Response
{
    "status": "success",
    "message": "Operation completed successfully",
    "data": {...},
    "timestamp": "2025-10-23 11:44:00"
}

// Error Response
{
    "status": "error",
    "message": "Error description",
    "data": null,
    "timestamp": "2025-10-23 11:44:00"
}
```

### Authentication Middleware Integration
```php
// All protected endpoints should:
1. Validate JWT token using AuthService::validateAccessToken()
2. Check user permissions for operations
3. Return consistent error responses
```

## 📈 Expected Outcomes

### After Phase 1 Completion
- ✅ All UserTest endpoints properly configured
- ✅ No more TestConfig undefined warnings
- ✅ Consistent API response structures

### After Phase 2 Completion
- ✅ All user management endpoints functional
- ✅ UserTest success rate: 80%+ (from current 52.9%)
- ✅ Full CRUD operations for user management

### After Phase 3 Completion
- ✅ No more 500 errors on user endpoints
- ✅ Stable database operations
- ✅ UserTest success rate: 90%+

### After Phase 4 Completion
- ✅ Complete user management system
- ✅ UserTest success rate: 100%
- ✅ Production-ready user management API

## 🎯 Success Metrics

1. **Test Success Rate**: Target 100% UserTest pass rate
2. **Endpoint Coverage**: All documented endpoints implemented
3. **Response Time**: <200ms for user operations
4. **Error Rate**: <1% for normal operations
5. **Code Quality**: All methods have proper error handling

## 🚀 Next Steps

1. **Immediate**: Start with Phase 1 - TestConfig fixes
2. **Parallel**: Work on Phase 2 and 3 simultaneously
3. **Final**: Phase 4 enhancements and documentation updates

This plan will transform the current 52.9% test success rate to 100% while building a robust, production-ready user management API.