# 🚀 GassAPI - AI-Powered API Testing Tool

## 📋 Overview

Postman-like dengan AI-assisted API testing dan real-time collaboration. 3-package standalone architecture untuk maximum flexibility.

**Architecture:** 3 Standalone npm packages

**Tech Stack:**
- **MCP Client:** Node.js + TypeScript + Claude Desktop
- **Backend:** Fastify + MySQL + Prisma
- **Frontend:** React + React Flow + Electron
- **AI Integration:** Claude Desktop + MCP
- **Distribution:** npm packages, independent installation

**Permission Model:**
- Semua user bisa buat project
- Project-based access control (invitation-only)
- Equal permissions kecuali deletion
- Semua member bisa generate MCP tokens

---

## 🏗️ Architecture Components

### 1. MCP Client Package (Standalone)
```
gassapi-mcp-client/
├── src/
│   ├── tools/          # AI-callable functions (MCP Tools)
│   ├── resources/      # Local data access patterns (MCP Resources)
│   ├── prompts/        # AI interaction templates (MCP Prompts)
│   ├── execution/      # Local API execution engine
│   ├── discovery/      # Auto-discovery system
│   ├── analysis/       # Response analysis
│   ├── cli/            # Command line interface
│   └── server/         # MCP Server implementation
├── dist/               # Built distribution
├── bin/                # Executable scripts
└── package.json        # npm package configuration
```

### 2. Backend API Package (Standalone)
```
gassapi-backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic
│   ├── middleware/     # Request processing
│   ├── routes/         # API routes
│   └── utils/          # Helper functions
│   └── types/          # TypeScript definitions
├── prisma/             # Database schema & migrations
├── config/             # Configuration management
├── dist/               # Built distribution
├── bin/                # Executable scripts
└── package.json        # npm package configuration
```

### 3. Frontend Package (Standalone)
```
gassapi-frontend/
├── src/
│   ├── components/     # React components (shared web + electron)
│   ├── electron/       # Electron-specific code
│   ├── hooks/          # React hooks (shared)
│   ├── store/          # State management
│   ├── services/       # API services (shared)
│   ├── types/          # TypeScript definitions (shared)
│   └── utils/          # Utilities (shared)
├── dist-web/           # Web build output
├── dist-electron/      # Electron build output
├── bin/                # Electron executable
└── package.json        # npm package configuration
```

---

## 📁 Planning Files

1. **[MCP Client](./mcp-client/)** - Local MCP client architecture & tools
2. **[Backend API](./backend/)** - REST API endpoints & database schema
3. **[Frontend Web](./frontend/)** - React Flow interface & Electron app
4. **[Authentication](./authentication.md)** - Auth & access control system

---

## 🎯 Core Features

### 1. Local MCP Client (AI-Powered)
- **AI Flow Generation:** Claude Desktop integration
- **Local API Access:** Direct localhost, containers access
- **Local File Access:** Test data & config dari local files
- **Real-time Execution:** No server latency
- **Offline Capability:** Jalan tanpa internet
- **No Storage:** Real-time display only

### 2. Visual Flow Builder
- **React Flow:** Drag-and-drop flow creation
- **Flow Validation:** Real-time syntax & logic checking
- **Local Storage:** Flow configurations save to project

### 3. Cloud Backend
- **Authentication:** User management & access control
- **Storage:** Flow configurations & project data
- **Permission Management:** Project-based equal rights
- **Optional Sync:** Local-first + cloud backup

### 4. Project Collaboration
- **Project Sharing:** Invite team members
- **Member Management:** All members can manage membership
- **Flow Sharing:** Share flow configurations

### 5. Local API Discovery
- **Auto-discovery:** Scan local ports untuk endpoints
- **Documentation:** Auto-generate docs dari discovered APIs
- **Environment Management:** Local, staging, production
- **Test Data:** Local file access untuk scenarios

---

## 🔧 Requirements

### Performance
- **Local Execution:** Direct localhost API calls (no latency)
- **AI Integration:** Claude Desktop response < 2s
- **File Access:** Local reads < 50ms
- **Flow Loading:** Configs load < 100ms

### Security
- **Local File Access:** Restricted ke project directories
- **API Access:** Only localhost & allowed origins
- **Authentication:** JWT token validation
- **Input Sanitization:** MCP tool validation
- **Rate Limiting:** Tool execution limiting

### Environment
- **Node.js:** v18+ untuk MCP client
- **Claude Desktop:** Required untuk AI integration
- **Browser:** Modern browser ES6+ support
- **Optional:** Local database (MySQL, PostgreSQL, SQLite)

---

## 📦 Dependencies

### Local MCP Client (Minimal)
```json
{
  "@modelcontextprotocol/sdk": "^0.4.0",
  "typescript": "^5.0.0"
}
```

### Cloud Backend (Minimal)
```json
{
  "fastify": "^4.0.0",
  "prisma": "^5.0.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3"
}
```

### Frontend
```json
{
  "react": "^18.0.0",
  "reactflow": "^11.0.0",
  "axios": "^1.5.0",
  "@types/react": "^18.0.0"
}
```

---

## 🚀 Implementation Priority

### Phase 1: Backend + MCP Client
1. **Config Generation API** - `POST /api/projects/:id/generate-config`
2. **Permanent Tokens** - Long-lived tanpa expiry
3. **Auto-Detection** - Scan gassapi.json directories
4. **Backend Integration** - MCP client validates tokens
5. **Simple MCP Tools** - get_project_info, scan_endpoints, create_flow, run_flow

### Phase 2: Cloud Backend
1. **Authentication** - User management
2. **Flow Storage** - Save & sync configurations
3. **Project Sharing** - Team collaboration endpoints

### Phase 3: Frontend UI
1. **Flow Builder** - React Flow interface
2. **Project Management** - Simple project switching

**Key Philosophy:** Zero-configuration, auto-detection, natural AI interaction.

---

## 🎯 User Experience (Zero-Configuration)

### Setup Process:
```bash
# 1. Create account & login to web dashboard
# All authenticated users can create projects

# 2. Create new project via web dashboard
# User automatically becomes project owner

# 3. Install MCP client
npm install -g gassapi-mcp-client

# 4. Add to Claude Desktop
# {
#   "mcpServers": {
#     "gassapi-local": {
#       "command": "gassapi-mcp"
#     }
#   }
# }

# 5. Generate gassapi.json via backend API
# POST /api/projects/:id/generate-config
# Available to all project members
# Save response as 'gassapi.json' in project root

# 6. Done! Ready to use
```

### Daily Usage:
```
1. cd project directory (dengan gassapi.json)
2. Open Claude Desktop
3. MCP client auto-detects gassapi.json
4. Validates token dengan backend
5. Claude: "✅ Connected to project, ready!"
6. User: "Create test flow for registration"
7. Claude knows project, environment, endpoints
```

### Project Management:
- **Create Projects**: Unlimited untuk authenticated users
- **Share Projects**: All members bisa invite via email
- **Generate Tokens**: All members bisa generate MCP tokens
- **Delete Projects**: Hanya owners bisa delete

### Project Switching:
- No commands needed
- cd ke directory berbeda (dengan gassapi.json berbeda)
- Auto-detects project context
- Claude auto-knows current project

### Token Management:
#### Web User Token
- JWT access: 15 menit expiry
- JWT refresh: 7 hari expiry
- Web dashboard authentication
- Auto refresh di frontend
- Payload: user ID dan email

#### MCP Client Token
- Permanent token (no expiry)
- Generated via `/api/projects/:id/generate-config`
- Available untuk semua members
- Used oleh MCP client untuk Claude Desktop
- Validated sekali di startup
- No auto refresh
- One project = multiple active tokens