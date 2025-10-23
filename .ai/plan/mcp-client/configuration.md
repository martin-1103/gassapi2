# ⚙️ Configuration Management

## 🎯 Zero-Configuration Philosophy

Auto-detection dan setup otomatis tanpa manual configuration.

---

## 📁 Project Configuration (gassapi.json)

### Auto-Detection
MCP client otomatis scan parent directories untuk `gassapi.json` file dan load project context.

### Configuration Structure
```json
{
  "project": {
    "id": "proj_abc123",
    "name": "E-commerce API",
    "description": "E-commerce backend API with user management"
  },
  "mcpClient": {
    "token": "permanent-mcp-token-here"
  },
  "environment": {
    "active": "development",
    "variables": {
      "API_BASE_URL": "http://localhost:3000",
      "DB_HOST": "localhost",
      "NODE_ENV": "development"
    }
  },
  "api": {
    "baseURL": "http://localhost:3000",
    "port": 3000,
    "paths": ["/api", "/v1"]
  },
  "discovery": {
    "autoScan": true,
    "ports": [3000, 8000, 8080]
  }
}
```

---

## 🔧 Configuration Generation

### Backend API Endpoint
```http
POST /api/projects/:id/generate-config
```

**Request:**
```json
{
  "environment": "development",
  "includeAuth": true,
  "customSettings": {
    "api": {
      "baseURL": "http://localhost:3000"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "config": {
    "project": {
      "id": "proj_abc123",
      "name": "E-commerce API"
    },
    "mcpClient": {
      "token": "permanent-mcp-token-here"
    },
    "environment": {
      "active": "development",
      "variables": {
        "API_BASE_URL": "http://localhost:3000"
      }
    }
  },
  "instructions": "Save this as 'gassapi.json' in your project root directory"
}
```

---

## 🔐 Token Management

### Permanent MCP Tokens
- **Scope:** Project-specific
- **Generation:** Available to all project members
- **Expiry:** No expiry (permanent)
- **Validation:** On MCP client startup
- **Storage:** Database hash only

### Token Validation Flow
1. MCP client startup → load gassapi.json
2. Validate token dengan backend API
3. Establish connection to Claude Desktop
4. Ready for AI-assisted testing

---

## 🛠️ Default Configuration

### MCP Client Defaults
```typescript
const defaultConfig = {
  discovery: {
    autoScan: true,
    ports: [3000, 8000, 8080, 5000],
    timeout: 5000
  },
  execution: {
    maxConcurrent: 5,
    timeout: 30000,
    retryAttempts: 3
  },
  cache: {
    ttl: 300000, // 5 minutes
    maxSize: '100MB'
  }
};
```

### Security Defaults
```typescript
const securityDefaults = {
  allowedPaths: [
    process.cwd(),
    path.join(os.homedir(), 'gassapi-data'),
    os.tmpdir()
  ],
  blockedPatterns: [
    'prod-', 'production',
    '.com:', '.org:',
    'aws.', 'azure.', 'gcp.'
  ]
};
```

---

## 🚀 Installation Configuration

### Claude Desktop Setup
```json
{
  "mcpServers": {
    "gassapi-local": {
      "command": "gassapi-mcp"
    }
  }
}
```

### Global Package Installation
```bash
npm install -g gassapi-mcp-client
```

### Post-Installation Check
```bash
gassapi-mcp --version
gassapi-mcp validate-token
gassapi-mcp scan-endpoints --ports 3000,8000
```