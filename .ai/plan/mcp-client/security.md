# 🛡️ Security Model

## 🎯 Local Access Security

Controlled file system, database, dan API access untuk AI assistant.

---

## 🔒 Access Control

### File Access Restrictions
```typescript
const allowedPaths = [
  process.cwd(), // Current working directory
  path.join(os.homedir(), 'gassapi-data'), // App data directory
  os.tmpdir() // System temp directory
];

const fileAccessRules = {
  maxFileSize: '100MB',
  allowedExtensions: ['.json', '.txt', '.csv', '.sql', '.md'],
  blockedFiles: ['.env', '.key', '.pem', 'passwords.txt'],
  maxPathDepth: 10
};
```

### Database Connection Validation
```typescript
const validateConnectionString = (connectionString: string) => {
  const blockedPatterns = [
    'prod-', 'production',
    '.com:', '.org:',
    'aws.', 'azure.', 'gcp.'
  ];

  return !blockedPatterns.some(pattern =>
    connectionString.includes(pattern)
  );
};
```

### API Access Rules
```typescript
const apiAccessRules = {
  allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0'],
  allowedPorts: [3000, 8000, 8080, 5000, 4000, 9000],
  blockedOrigins: ['prod-', 'production'],
  maxResponseSize: '10MB'
};
```

---

## ⚡ Execution Limits

### Tool Execution Limits
```typescript
const executionLimits = {
  maxRequestsPerMinute: 60,
  maxConcurrentRequests: 5,
  maxResponseSize: '10MB',
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  timeout: 30000
};
```

### Resource Limits
```typescript
const resourceLimits = {
  maxMemoryUsage: '512MB',
  maxCpuTime: 60000, // 60 seconds
  maxFileSize: '100MB',
  maxConcurrentFlows: 5
};
```

---

## 🔐 Claude Integration Security

### Tool Call Validation
```typescript
const validateToolCall = (toolName: string, params: any) => {
  // Validate tool permissions
  // Check parameter safety
  // Apply rate limiting
  // Log access attempt
};
```

### Input Sanitization
```typescript
const sanitizeInput = {
  filePath: (path: string) => path.normalize(path).replace(/\.\./g, ''),
  sqlQuery: (query: string) => query.replace(/;.*$/, '').trim(),
  url: (url: string) => new URL(url, 'http://localhost')
};
```

---

## 🚫 Blocked Operations

### Prohibited Patterns
```typescript
const blockedOperations = [
  'rm -rf',
  'DELETE FROM users',
  'DROP TABLE',
  'format disk',
  'systemctl',
  'sudo',
  'chmod 777'
];
```

### Sensitive File Protection
```typescript
const protectedFiles = [
  '/etc/passwd',
  '/etc/shadow',
  '~/.ssh/',
  '~/.aws/',
  '*.key',
  '*.pem',
  '.env'
];
```

---

## 📊 Security Monitoring

### Audit Logging
```typescript
interface AuditLog {
  userId?: string;
  toolName: string;
  parameters: any;
  result: 'success' | 'blocked' | 'error';
  timestamp: Date;
  resourceAccessed?: string;
}
```

### Rate Limiting
```typescript
const rateLimitConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: 60,
  blockDuration: 300000, // 5 minutes
  skipSuccessfulRequests: false
};
```

---

## 🔒 Token Security

### Permanent Token Validation
```typescript
const validateMcpToken = async (token: string) => {
  // Hash token for comparison
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Validate token locally for offline usage
  const isValidFormat = token && token.length > 20;

  return { valid: isValidFormat, hash: tokenHash };
};
```

### Token Storage
```typescript
const tokenStorage = {
  // Never log raw tokens
  // Store only hashes in logs
  // Rotate tokens on compromise
  // Invalidate on project access change
};
```

---

## 🛡️ Security Best Practices

1. **Principle of Least Privilege**: Minimal access required
2. **Fail Securely**: Default to deny, explicit allow
3. **Audit Everything**: Log all tool calls and access
4. **Rate Limit**: Prevent abuse and resource exhaustion
5. **Input Validation**: Sanitize all user inputs
6. **Error Handling**: Don't leak sensitive information