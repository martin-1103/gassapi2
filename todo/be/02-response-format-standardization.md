# 📝 Phase 2: Response Format Standardization (Parallel Execution)

## Priority: 🟡 IMPORTANT - Message Format Consistency
## Estimated Time: 1-2 hours

### Issue Summary:
Tests expect English messages but API returns Indonesian messages with "Permintaan tidak valid:" prefix.

## Tasks (Can be executed in parallel):

### Task 2.1: Standardize Success Messages ⚡
**Files:**
- `backend/src/handlers/UserHandler.php`
- `backend/src/handlers/AuthHandler.php`
- `backend/src/helpers/ResponseHelper.php`

**Problem:** Indonesian success messages vs English test expectations
**Impact:** UserProfileTest, PasswordTest, UserManagementTest
**Examples:**
- API: "Profile berhasil diperbarui" vs Test: "Profile updated successfully"
- API: "User deactivated successfully" vs Test: "User status updated successfully"

**Solution:**
- [ ] Update all success messages to English
- [ ] Create message constants for consistency
- [ ] Fix profile update responses
- [ ] Fix user status toggle responses

### Task 2.2: Standardize Error Messages ⚡
**Files:**
- `backend/src/helpers/ValidationHelper.php`
- `backend/src/handlers/AuthHandler.php`
- `backend/src/helpers/ResponseHelper.php`

**Problem:** "Permintaan tidak valid:" prefix not expected by tests
**Impact:** Almost all validation error tests
**Examples:**
- API: "Permintaan tidak valid: Email already exists" vs Test: "Email already exists"
- API: "Permintaan tidak valid: Name cannot be empty" vs Test: "Name cannot be empty"

**Solution:**
- [ ] Remove "Permintaan tidak valid:" prefix from error messages
- [ ] Update validation error messages to English
- [ ] Ensure consistency across all error responses
- [ ] Fix password validation messages

### Task 2.3: Create Message Helper ⚡
**File:** `backend/src/helpers/MessageHelper.php` (new)
**Problem:** No centralized message management
**Impact:** Maintenance and consistency issues
**Solution:**
- [ ] Create MessageHelper class for centralized messages
- [ ] Define message constants for all responses
- [ ] Implement getSuccessMessage() and getErrorMessage() methods
- [ ] Update all handlers to use MessageHelper

## Dependencies:
- ⬇️ Can run in parallel with Phase 1
- ⬆️ Phase 3 depends on consistent message format

## Success Criteria:
- [ ] All validation error messages match test expectations
- [ ] All success messages match test expectations
- [ ] No "Permintaan tidak valid:" prefixes in error responses
- [ ] Consistent English message format across API
- [ ] Centralized message management system

## Testing:
```bash
php backend/tests/run_tests.php AuthTest
php backend/tests/run_tests.php UserProfileTest
php backend/tests/run_tests.php PasswordTest
php backend/tests/run_tests.php UserManagementTest
```

## Expected Impact:
- AuthTest: 11/12 → 12/12 passed (+1)
- UserProfileTest: 11/16 → 14/16 passed (+3)
- PasswordTest: 12/13 → 13/13 passed (+1)
- UserManagementTest: 9/14 → 12/14 passed (+3)