# 🔐 Authentication & Authorization System

## 🏗️ Authentication Overview

**Dual Strategy:** Web User JWT + MCP Client Permanent Token
**Password Hashing:** bcrypt (12 rounds)
**Token Storage:** HttpOnly cookies + localStorage fallback
**Session Management:** JWT with rotation for web users

---

## 🔑 Token Types

### 1. Web User Token (Human Access)
- **Access Token:** JWT (15 minutes expiry)
- **Refresh Token:** JWT (7 days expiry)
- **Payload:** User ID, email
- **Storage:** HttpOnly cookie or Authorization header
- **Usage:** Web dashboard authentication

### 2. MCP Client Token (AI Assistant Access)
- **Type:** Permanent token (no expiry)
- **Scope:** Project-specific (all project members can generate)
- **Storage:** Database hash only
- **Usage:** Local MCP client for Claude Desktop integration
- **Validation:** Every MCP client startup (auto-validation)
- **Generation:** Available to all project members

---

## 🚀 Authentication Flow

### User Registration
```
1. POST /auth/register
   ├─ Validate input (email, password, name)
   ├─ Hash password with bcrypt
   ├─ Create user record
   ├─ Generate email verification token
   ├─ Send verification email
   └─ Return success response

2. Email Verification
   ├─ GET /auth/verify/:token
   ├─ Validate token signature
   ├─ Update user.email_verified = true
   └─ Redirect to login page
```

### Web User Login (Human Access)
```
1. POST /auth/login
   ├─ Validate credentials
   ├─ Compare password hash
   ├─ Check account status
   ├─ Generate access + refresh tokens
   ├─ Set HttpOnly cookies
   ├─ Update last_login_at
   └─ Return user data + permissions

2. Token Storage
   ├─ Access token: HttpOnly cookie (15min) + memory
   ├─ Refresh token: HttpOnly cookie (7days)
   └─ Fallback: localStorage for SPA compatibility
```

### Web User Token Refresh
```
1. POST /auth/refresh
   ├─ Validate refresh token
   ├─ Check token version
   ├─ Generate new access token
   ├─ Optional: Rotate refresh token
   └─ Return new access token

2. Token Rotation (Security)
   ├─ Generate new refresh token
   ├─ Invalidate old refresh token
   ├─ Update token version in database
   └─ Prevent refresh token replay
```

### MCP Client Setup (AI Assistant Access)
```
1. POST /api/projects/:id/generate-config
   ├─ Validate web user token
   ├─ Check user is project member
   ├─ Generate permanent MCP client token
   ├─ Create gassapi.json configuration
   └─ Return configuration for local setup

2. MCP Client Validation
   ├─ Load gassapi.json from project directory
   ├─ Validate permanent token with backend
   ├─ Establish connection to Claude Desktop
   └─ Ready for AI-assisted API testing
```

**Permission Rules:**
- **Project Creation**: All authenticated users can create projects
- **Project Access**: Only project members can view/access projects
- **MCP Token Generation**: All project members can generate tokens
- **Project Deletion**: Only project owner can delete projects

---

## 🛡️ Authorization System

### Simple Access Control

#### User Access
- **All authenticated users can create projects** - No restrictions
- **Project membership** - Users can only access projects they're members of
- **Equal member permissions** - All project members have equal rights within project

#### Permission Matrix

| Resource | Project Owner | All Project Members |
|----------|-----------------|---------------------|
| Create Projects | ✅ | ✅ |
| View Project | ✅ | ✅ |
| Project Settings | ✅ | ✅ |
| Member Management | ✅ | ✅ |
| Endpoints CRUD | ✅ | ✅ |
| Flows CRUD | ✅ | ✅ |
| Generate MCP Token | ✅ | ✅ |
| Delete Project | ✅ | ❌ |
| Execute Tests | ✅ | ✅ |

### Permission Checking
```javascript
// Simple project membership check
const requireProjectAccess = () => {
  return async (request, reply) => {
    const { projectId } = request.params;
    const userId = request.user.id;

    // Check if user is a project member
    const membership = await prisma.projectMember.findFirst({
      where: { projectId, userId }
    });

    if (!membership) {
      return reply.code(403).send({ error: 'Access denied - not a project member' });
    }
  };
};
```

---

## 🔒 Security Measures

### Password Security
```javascript
// Password hashing
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Password verification
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Password validation
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  return password.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial;
};
```

### Token Security
```javascript
// JWT configuration
const jwtConfig = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: '15m',
    algorithm: 'HS256'
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d',
    algorithm: 'HS256'
  }
};

// Token generation
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      sub: user.id,
      email: user.email
    },
    jwtConfig.accessToken.secret,
    { expiresIn: jwtConfig.accessToken.expiresIn }
  );

  const refreshToken = jwt.sign(
    {
      sub: user.id,
      version: user.tokenVersion
    },
    jwtConfig.refreshToken.secret,
    { expiresIn: jwtConfig.refreshToken.expiresIn }
  );

  return { accessToken, refreshToken };
};
```

### Rate Limiting
```javascript
// Authentication rate limiting
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts',
  standardHeaders: true,
  legacyHeaders: false,
});

// API rate limiting
const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  keyGenerator: (request) => request.user?.id || request.ip
});
```

---

## 📱 Session Management

### Session Storage
```javascript
// Redis session store (optional)
const sessionStore = {
  set: async (key, value, ttl) => {
    await redis.setex(key, ttl, JSON.stringify(value));
  },

  get: async (key) => {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },

  del: async (key) => {
    await redis.del(key);
  }
};
```

### Session Events
- **Login** - Create session, update last login
- **Logout** - Invalidate refresh token, clear cookies
- **Token Refresh** - Update session expiry
- **Password Change** - Invalidate all user sessions
- **Role Change** - Update user permissions cache

---

## 🔐 API Token System

### Project API Tokens
```javascript
// Token generation
const generateApiToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Token storage (hashed)
const storeApiToken = async (projectId, name, permissions) => {
  const token = generateApiToken();
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  await prisma.apiToken.create({
    data: {
      projectId,
      name,
      tokenHash,
      permissions,
      expiresAt: null // or set expiry
    }
  });

  return token; // Return only once
};
```

### Token Validation
```javascript
// API token middleware
const validateApiToken = async (request, reply) => {
  const token = request.headers['x-api-token'];

  if (!token) {
    return reply.code(401).send({ error: 'API token required' });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const apiToken = await prisma.apiToken.findFirst({
    where: {
      tokenHash,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    },
    include: {
      project: true
    }
  });

  if (!apiToken) {
    return reply.code(401).send({ error: 'Invalid API token' });
  }

  // Update last used timestamp
  await prisma.apiToken.update({
    where: { id: apiToken.id },
    data: { lastUsedAt: new Date() }
  });

  request.apiToken = apiToken;
  request.project = apiToken.project;
};
```

---

## 🚨 Security Headers

```javascript
// Security middleware
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

---

## 📊 Audit Logging

```javascript
// Audit log middleware
const auditLog = async (request, reply, payload) => {
  const { user, ip, userAgent } = request;

  await prisma.auditLog.create({
    data: {
      userId: user?.id,
      projectId: request.projectId,
      action: `${request.method} ${request.routeOptions.url}`,
      resourceType: getResourceType(request),
      resourceId: getResourceId(request),
      ip_address: ip,
      user_agent: userAgent,
      createdAt: new Date()
    }
  });
};
```

---

## ⚡ Performance Optimization

### JWT Validation
- Use async JWT verification
- Cache user permissions in memory
- Implement token blacklisting for logout

### Database Optimization
- Index user.email for fast lookups
- Cache user sessions in Redis
- Batch permission checks

### Security vs Performance
- Balance security measures with response times
- Use efficient hashing algorithms
- Implement proper connection pooling