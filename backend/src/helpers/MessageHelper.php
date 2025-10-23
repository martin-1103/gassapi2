<?php
namespace App\Helpers;

/**
 * Centralized message standardization for consistent English API responses
 */
class MessageHelper {

    // Success Messages
    const SUCCESS_LOGIN = 'Login successful';
    const SUCCESS_REGISTER = 'User registered successfully';
    const SUCCESS_LOGOUT = 'Logout successful';
    const SUCCESS_LOGOUT_ALL = 'Logged out from all devices';
    const SUCCESS_PROFILE_RETRIEVED = 'Profile retrieved successfully';
    const SUCCESS_PROFILE_UPDATED = 'Profile updated successfully';
    const SUCCESS_USER_RETRIEVED = 'User retrieved successfully';
    const SUCCESS_USER_UPDATED = 'User updated successfully';
    const SUCCESS_USER_DELETED = 'User deleted successfully';
    const SUCCESS_USER_STATUS_UPDATED = 'User status updated successfully';
    const SUCCESS_TOKEN_REFRESHED = 'Token refreshed successfully';
    const SUCCESS_PASSWORD_CHANGED = 'Password changed successfully';
    const SUCCESS_PASSWORD_RESET = 'Password reset successfully';
    const SUCCESS_PASSWORD_RESET_SENT = 'Password reset instructions sent to email';
    const SUCCESS_GENERIC = 'Operation completed successfully';

    // Error Messages
    const ERROR_AUTH_REQUIRED = 'Authentication required';
    const ERROR_INVALID_TOKEN = 'Invalid access token';
    const ERROR_TOKEN_NOT_FOUND = 'No access token provided';
    const ERROR_LOGIN_FAILED = 'Login failed';
    const ERROR_REGISTRATION_FAILED = 'Registration failed';
    const ERROR_LOGOUT_FAILED = 'Logout failed';
    const ERROR_LOGOUT_ALL_FAILED = 'Logout from all devices failed';
    const ERROR_TOKEN_REFRESH_FAILED = 'Token refresh failed';
    const ERROR_PASSWORD_CHANGE_FAILED = 'Password change failed';
    const ERROR_PASSWORD_RESET_FAILED = 'Password reset failed';
    const ERROR_PASSWORD_RESET_REQUEST_FAILED = 'Failed to process password reset request';

    // User Management Errors
    const ERROR_USER_NOT_FOUND = 'User not found';
    const ERROR_USER_ID_REQUIRED = 'User ID is required';
    const ERROR_ID_REQUIRED = 'ID is required';
    const ERROR_NO_DATA_TO_UPDATE = 'No data to update';
    const ERROR_PROFILE_RETRIEVAL_FAILED = 'Failed to retrieve profile';
    const ERROR_PROFILE_UPDATE_FAILED = 'Failed to update profile';
    const ERROR_USER_RETRIEVAL_FAILED = 'Failed to retrieve user';
    const ERROR_USER_UPDATE_FAILED = 'Failed to update user';
    const ERROR_USER_DELETE_FAILED = 'Failed to delete user';
    const ERROR_USER_STATUS_UPDATE_FAILED = 'Failed to update user status';
    const ERROR_STATS_RETRIEVAL_FAILED = 'Failed to retrieve statistics';

    // Validation Error Messages
    const VALIDATION_REQUIRED_FIELD = 'Required field: %s';
    const VALIDATION_INVALID_JSON = 'Invalid JSON format';
    const VALIDATION_INPUT_TOO_LARGE = 'Input too large';
    const VALIDATION_INVALID_EMAIL = 'Invalid email format';
    const VALIDATION_EMAIL_CONTAINS_INVALID_CHARS = 'Email contains invalid characters';
    const VALIDATION_EMAIL_TOO_LONG = 'Email too long (max 254 characters)';
    const VALIDATION_PASSWORD_REQUIRED = 'Password is required';
    const VALIDATION_PASSWORD_TOO_SHORT = 'Password should be at least 8 characters';
    const VALIDATION_PASSWORD_TOO_LONG = 'Password too long (max 128 characters)';
    const VALIDATION_PASSWORD_MISSING_COMPLEXITY = 'Password must contain uppercase, lowercase, and numbers';
    const VALIDATION_PASSWORD_TOO_COMMON = 'Password cannot use common words';
    const VALIDATION_NAME_REQUIRED = 'Name is required';
    const VALIDATION_NAME_TOO_SHORT = 'Name must be at least 2 characters';
    const VALIDATION_INVALID_NUMBER = 'Input must be a number';
    const VALIDATION_INVALID_INTEGER = 'Input must be an integer';
    const VALIDATION_MIN_VALUE = 'Minimum value is %s';
    const VALIDATION_MAX_VALUE = 'Maximum value is %s';
    const VALIDATION_INVALID_URL = 'Invalid URL format';
    const VALIDATION_INVALID_URL_SCHEME = 'Only HTTP/HTTPS URLs are allowed';
    const VALIDATION_TEXT_TOO_SHORT = 'Text must be at least %s characters';
    const VALIDATION_TEXT_TOO_LONG = 'Text too long (max %s characters)';
    const VALIDATION_INVALID_ARRAY = 'Input must be an array';
    const VALIDATION_ARRAY_TOO_MANY_ITEMS = 'Array too large (max %s items)';
    const VALIDATION_INPUT_TOO_LONG = 'Input too long (max %s characters)';
    const VALIDATION_CONTAINS_INVALID_CONTENT = 'Input contains invalid content';
    const VALIDATION_CONTAINS_INVALID_PATTERN = 'Input contains invalid pattern';
    const VALIDATION_PASSWORDS_DO_NOT_MATCH = 'New password and confirmation do not match';
    const VALIDATION_INVALID_CSRF_TOKEN = 'Invalid CSRF token';

    // Generic Error Messages
    const ERROR_BAD_REQUEST = 'Bad request';
    const ERROR_FORBIDDEN = 'Access denied';
    const ERROR_NOT_FOUND = 'Resource not found';
    const ERROR_VALIDATION_FAILED = 'Validation failed';
    const ERROR_RATE_LIMIT = 'Too many requests';
    const ERROR_SERVER_ERROR = 'Internal server error';

    // HTTP Error Context Messages (to replace Indonesian prefixes)
    const HTTP_CONTEXT_BAD_REQUEST = 'Invalid request: %s';
    const HTTP_CONTEXT_UNAUTHORIZED = 'Authentication failed: %s';
    const HTTP_CONTEXT_FORBIDDEN = 'Access denied: %s';
    const HTTP_CONTEXT_NOT_FOUND = 'Not found: %s';
    const HTTP_CONTEXT_VALIDATION_FAILED = 'Validation failed: %s';

    /**
     * Get formatted required field error message
     */
    public static function requiredField($field) {
        return sprintf(self::VALIDATION_REQUIRED_FIELD, ucfirst(str_replace('_', ' ', $field)));
    }

    /**
     * Get formatted min value error message
     */
    public static function minValue($value) {
        return sprintf(self::VALIDATION_MIN_VALUE, $value);
    }

    /**
     * Get formatted max value error message
     */
    public static function maxValue($value) {
        return sprintf(self::VALIDATION_MAX_VALUE, $value);
    }

    /**
     * Get formatted text length error message
     */
    public static function textTooShort($length) {
        return sprintf(self::VALIDATION_TEXT_TOO_SHORT, $length);
    }

    /**
     * Get formatted text length error message
     */
    public static function textTooLong($length) {
        return sprintf(self::VALIDATION_TEXT_TOO_LONG, $length);
    }

    /**
     * Get formatted array size error message
     */
    public static function arrayTooManyItems($maxItems) {
        return sprintf(self::VALIDATION_ARRAY_TOO_MANY_ITEMS, $maxItems);
    }

    /**
     * Get formatted input length error message
     */
    public static function inputTooLong($maxLength) {
        return sprintf(self::VALIDATION_INPUT_TOO_LONG, $maxLength);
    }

    /**
     * Get formatted HTTP context error message
     */
    public static function httpContext($status, $message) {
        switch ($status) {
            case 400:
                return sprintf(self::HTTP_CONTEXT_BAD_REQUEST, $message);
            case 401:
                return sprintf(self::HTTP_CONTEXT_UNAUTHORIZED, $message);
            case 403:
                return sprintf(self::HTTP_CONTEXT_FORBIDDEN, $message);
            case 404:
                return sprintf(self::HTTP_CONTEXT_NOT_FOUND, $message);
            case 422:
                return sprintf(self::HTTP_CONTEXT_VALIDATION_FAILED, $message);
            default:
                return $message;
        }
    }

    /**
     * Get user status message based on is_active flag
     */
    public static function userStatusMessage($isActive) {
        return $isActive ? 'User activated successfully' : 'User deactivated successfully';
    }
}