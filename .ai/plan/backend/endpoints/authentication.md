# 🔐 Authentication API

## Overview
Authentication endpoints untuk user management, JWT token handling, dan session management.

---

## POST `/auth/register`
Register new user account.

### Headers
```
Content-Type: application/json
```

### Request
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Validation Rules
- `email`: Required, valid email format, unique
- `password`: Required, min 8 characters, max 128
- `name`: Required, min 2 characters, max 255

### Response
```json
{
  "success": true,
  "user": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "isActive": true,
    "emailVerified": false,
    "createdAt": "2025-01-21T10:00:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

### Error Responses
- `400` - Validation error
- `409` - Email already exists
- `422` - Invalid input data

---

## POST `/auth/login`
User login with email and password.

### Headers
```
Content-Type: application/json
```

### Request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Validation Rules
- `email`: Required, valid email format
- `password`: Required, non-empty

### Response
```json
{
  "success": true,
  "user": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "isActive": true,
    "emailVerified": true,
    "lastLoginAt": "2025-01-21T10:00:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

### Error Responses
- `400` - Validation error
- `401` - Invalid credentials
- `403` - Account inactive
- `422` - Invalid input data

---

## POST `/auth/logout`
User logout and invalidate tokens.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request (Optional)
```json
{
  "revokeAllTokens": true
}
```

### Response
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Error Responses
- `401` - Invalid or expired token
- `500` - Server error

---

## POST `/auth/refresh`
Refresh access token using refresh token.

### Headers
```
Authorization: Bearer <refresh_token>
Content-Type: application/json
```

### Response
```json
{
  "success": true,
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

### Error Responses
- `401` - Invalid or expired refresh token
- `403` - Token revoked
- `500` - Server error

---

## POST `/auth/verify-email`
Verify email address with verification code.

### Headers
```
Content-Type: application/json
```

### Request
```json
{
  "token": "email_verification_token_123"
}
```

### Response
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Error Responses
- `400` - Invalid token
- `410` - Token expired
- `422` - Invalid input data

---

## POST `/auth/forgot-password`
Request password reset email.

### Headers
```
Content-Type: application/json
```

### Request
```json
{
  "email": "user@example.com"
}
```

### Response
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Error Responses
- `400` - Validation error
- `404` - Email not found
- `429` - Too many requests

---

## POST `/auth/reset-password`
Reset password with reset token.

### Headers
```
Content-Type: application/json
```

### Request
```json
{
  "token": "reset_token_123",
  "password": "new_password123"
}
```

### Response
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Error Responses
- `400` - Validation error
- `410` - Token expired
- `422` - Invalid input data

---

## 🔧 Business Logic

### Token Management

#### Access Token (JWT)
- **Expiration**: 15 minutes (900 seconds)
- **Payload**: User ID, email, issued at, expiration
- **Algorithm**: HS256 with server secret
- **Usage**: API requests, authenticated endpoints

#### Refresh Token (JWT)
- **Expiration**: 7 days (604800 seconds)
- **Payload**: User ID, token ID, issued at, expiration
- **Storage**: Server-side token blacklist tracking
- **Usage**: Refresh access token

#### Token Security
- **Secret Rotation**: Rotate JWT secrets periodically
- **Token Blacklist**: Maintain revoked tokens list
- **IP Validation**: Validate token against user IP (optional)
- **User Agent**: Validate token against user agent (optional)

### Password Security

#### Password Hashing
- **Algorithm**: bcrypt with 12 rounds
- **Salt**: Automatically generated per password
- **Validation**: Compare hashed passwords on login
- **Reset**: Generate new hash on password change

#### Password Requirements
- **Minimum Length**: 8 characters
- **Maximum Length**: 128 characters
- **Complexity**: Recommended mix of letters, numbers, symbols
- **Common Passwords**: Check against common passwords list

### Email Verification

#### Verification Process
1. **Registration**: Send verification email with token
2. **Token Generation**: Create secure token with expiration
3. **Email Sending**: Send verification link/token
4. **Token Validation**: Validate token on verification
5. **Account Activation**: Mark email as verified

#### Token Security
- **Expiration**: 24 hours
- **Single Use**: Tokens invalidated after use
- **Secure Generation**: Cryptographically secure tokens
- **Rate Limiting**: Limit verification attempts

### Session Management

#### Active Sessions
- **Tracking**: Maintain active sessions per user
- **Limit**: Maximum sessions per user (configurable)
- **Cleanup**: Remove expired sessions
- **Security**: Monitor suspicious activity

#### Logout Behavior
- **Token Invalidation**: Invalidate specific token
- **All Tokens**: Option to invalidate all user tokens
- **Cleanup**: Remove session data
- **Audit**: Log logout events

### Security Measures

#### Rate Limiting
- **Login Attempts**: 5 attempts per 15 minutes
- **Registration**: 3 attempts per hour per IP
- **Password Reset**: 3 attempts per hour
- **Email Verification**: 10 attempts per hour

#### Account Security
- **Brute Force Protection**: Automatic account lockout
- **Suspicious Activity**: Monitor for unusual patterns
- **Account Recovery**: Secure account recovery process
- **Audit Logging**: Log all authentication events

#### Input Validation
- **Email Format**: Validate email syntax
- **Password Strength**: Check password requirements
- **Name Validation**: Validate user name format
- **SQL Injection**: Parameterized queries for database

### Performance Considerations

#### Database Optimization
- **Index**: Email field indexed for fast lookups
- **Query Optimization**: Efficient authentication queries
- **Connection Pooling**: Database connection management
- **Caching**: Cache user sessions and permissions

#### Token Processing
- **Fast Verification**: Efficient JWT verification
- **Token Refresh**: Minimal token refresh overhead
- **Concurrent Requests**: Handle concurrent auth requests
- **Memory Usage**: Optimize token storage

### Error Handling

#### Standardized Error Format
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid credentials",
    "details": {
      "field": "email",
      "reason": "Email or password incorrect"
    }
  }
}
```

#### Error Codes
- `AUTHENTICATION_ERROR` - Invalid credentials
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `VALIDATION_ERROR` - Input validation failed
- `RATE_LIMIT_ERROR` - Too many requests
- `ACCOUNT_LOCKED` - Account temporarily locked
- `TOKEN_EXPIRED` - Token has expired
- `TOKEN_INVALID` - Token is invalid

### Configuration

#### Environment Variables
```bash
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACCESS_EXPIRE=900
JWT_REFRESH_EXPIRE=604800
BCRYPT_ROUNDS=12
EMAIL_FROM=noreply@gassapi.com
EMAIL_VERIFICATION_EXPIRE=86400
PASSWORD_RESET_EXPIRE=3600
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_DURATION=900
```

#### Security Settings
- **JWT Secrets**: Strong, unique secrets
- **Token Expiration**: Appropriate expiration times
- **Rate Limits**: Configurable rate limits
- **Password Policy**: Configurable password requirements