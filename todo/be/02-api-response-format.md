# Priority 2: API Response Format Standardization

## Dependency Level: HIGH (Affects test reliability)

### Parallel Tasks (Can be done simultaneously)

#### Task 2.1: Missing 'data' Field in Success Responses
**Files**: All handler files in `backend/src/handlers/`
**Problems**:
- Multiple tests expect `data` field but get "MISSING"
- User registration, profile updates missing structured response
- Inconsistent response format across endpoints

**Root Cause**: Response helpers not adding `data` field consistently

**Fixes Needed**:
- Standardize response structure: `{status, message, data, timestamp}`
- Update all success responses to include `data` field (even if empty)
- Ensure ResponseHelper adds `data: null` when no data present

**Affected Endpoints**:
- `profile` update - missing success data
- `register` - missing user data in response
- `user` operations - inconsistent data structure

#### Task 2.2: Error Message Standardization
**Files**: Same handlers, error response handling
**Problems**:
- Error messages don't match test expectations
- "User already exists" vs "MISSING"
- "Token expired" vs "Invalid token"

**Fixes Needed**:
- Create standardized error message constants
- Update error response messages to match test expectations
- Ensure consistent error message format across all endpoints

### Sequential Tasks (Must follow Task 2.1 completion)

#### Task 2.3: Response Validation Helper
**Files**: `backend/src/helpers/ResponseHelper.php` (create if missing)
**Dependencies**: Task 2.1 complete
**Purpose**:
- Centralize response format validation
- Ensure all responses follow same structure
- Add helper methods for different response types

**Estimated Time**: 1-2 hours
**Parallel Execution**: Tasks 2.1 and 2.2 can be done simultaneously