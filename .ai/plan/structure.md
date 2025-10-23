# 📁 Directory Structure Blueprint

## 🎯 Organizational Principles

**Architecture:** 3 Standalone npm packages (MCP Client + Backend API + Frontend Web+Electron)
**Distribution:** All packages published to npm with independent installation
**Integration:** Self-hosted deployment with optional cloud components
**Philosophy:** Single source code, multiple deployment targets

**Structure Goals:**
- **Package Independence**: Each component installable and runnable separately
- **Code Reuse**: Frontend single source untuk web dan electron
- **Self-Hosted Ready**: Docker deployment untuk semua packages
- **AI-Native**: Claude Desktop integration dari ground up
- **Zero-Config**: Auto-detection dan natural AI interaction
- **Flexible Deployment**: Pilih packages yang diperlukan saja

> **Note**: This document has been reorganized. Individual package planning files are now in separate directories:
> - `plan/mcp-client/` - MCP client package planning
> - `plan/backend/` - Backend API package planning
> - `plan/frontend/` - Frontend package planning

---

## 🏗️ Complete Project Structure

```
gassapi/
├── 📁 plan/                     # 📋 Planning & Documentation
│   ├── index.md                 # 📖 Project overview & architecture
│   ├── structure.md             # 📁 This file - directory structure guide
│   ├── database-schema.md       # 🗄️ Database design & relationships
│   ├── api-endpoints.md         # 🔌 Backend API specifications
│   ├── authentication.md        # 🔐 Auth & security design
│   ├── mcp-client.md            # 🤖 Local MCP client architecture
│   └── mcp-integration.md       # ⚡ AI integration patterns
│
├── 📁 mcp-client/               # 🤖 Standalone MCP Client (Published to npm)
│   ├── 📁 src/
│   │   ├── 📁 tools/            # 🔧 MCP Tools (AI-callable functions)
│   │   ├── 📁 resources/        # 📚 MCP Resources (local data access)
│   │   ├── 📁 prompts/          # 💬 MCP Prompts (AI interaction templates)
│   │   ├── 📁 execution/        # 🚀 Local execution engine
│   │   ├── 📁 discovery/        # 🔍 Auto-discovery system
│   │   ├── 📁 analysis/         # 📊 Response analysis
│   │   ├── 📁 cli/              # 💻 Command line interface
│   │   ├── 📁 server/           # 🖥️ MCP Server implementation
│   │   ├── 📁 types/            # 📝 Type definitions
│   │   ├── 📁 utils/            # 🔧 Utilities
│   │   ├── config.ts            # ⚙️ MCP client configuration
│   │   ├── index.ts             # 📦 Package entry point
│   │   └── cli.ts               # 💻 CLI entry point
│   ├── 📁 tests/                # 🧪 Test files
│   │   ├── unit/                # 🔬 Unit tests
│   │   ├── integration/         # 🔗 Integration tests
│   │   └── e2e/                 # 🎭 End-to-end tests with Claude
│   ├── 📁 bin/                  # 📜 Executable scripts
│   │   └── gassapi-mcp          # 🚀 CLI entry point (executable)
│   ├── 📁 dist/                 # 📦 Built distribution
│   ├── package.json             # 📦 Dependencies & npm package config
│   ├── tsconfig.json            # ⚡ TypeScript config
│   ├── README.md                # 📖 MCP client documentation
│   └── CHANGELOG.md             # 📋 Version history
│
├── 📁 gassapi-backend/          # ☁️ Standalone Backend API (Published to npm)
│   ├── 📁 src/
│   │   ├── 📁 controllers/      # 🎮 Request handlers
│   │   ├── 📁 services/         # ⚙️ Business logic
│   │   ├── 📁 middleware/       # 🛡️ Request processing
│   │   ├── 📁 routes/           # 🛣️ API routes
│   │   ├── 📁 utils/            # 🔧 Helper functions
│   │   ├── 📁 types/            # 📝 TypeScript definitions
│   │   ├── app.ts               # 🚀 Fastify app setup
│   │   └── server.ts            # 🖥️ Server entry point
│   ├── 📁 prisma/               # 🗄️ Database schema
│   │   ├── schema.prisma        # 📊 Database definition
│   │   ├── migrations/          # 📜 Database migrations
│   │   └── seed.ts              # 🌱 Seed data
│   ├── 📁 tests/                # 🧪 Test files
│   │   ├── unit/                # 🔬 Unit tests
│   │   ├── integration/         # 🔗 Integration tests
│   │   └── e2e/                 # 🎭 End-to-end tests
│   ├── 📁 config/               # ⚙️ Configuration
│   │   ├── database.ts          # 🗄️ DB config
│   │   ├── auth.ts              # 🔐 Auth config
│   │   └── server.ts            # 🌐 Server config
│   ├── 📁 bin/                  # 📜 Executable scripts
│   │   └── gassapi-backend      # 🚀 CLI entry point (executable)
│   ├── 📁 dist/                 # 📦 Built distribution
│   ├── package.json             # 📦 Dependencies & npm package config
│   ├── tsconfig.json            # ⚡ TypeScript config
│   ├── Dockerfile               # 🐳 Container definition
│   ├── docker-compose.yml       # 🐳 Development containers
│   └── README.md                # 📖 Backend API documentation
│
├── 📁 gassapi-frontend/         # 🎨 Standalone Frontend (Web + Electron) (Published to npm)
│   ├── 📁 src/
│   │   ├── 📁 components/       # 🧩 React components
│   │   │   ├── common/          # 🔧 Shared components
│   │   │   ├── auth/            # 🔐 Authentication components
│   │   │   ├── project/         # 📋 Project management
│   │   │   └── flow/            # 🌊 Flow builder
│   │   ├── 📁 electron/         # 🖥️ Electron specific code
│   │   ├── 📁 hooks/            # 🎣 React hooks
│   │   ├── 📁 store/            # 🗄️ State management
│   │   ├── 📁 services/         # 🌐 API services
│   │   ├── 📁 utils/            # 🔧 Utilities
│   │   ├── 📁 types/            # 📝 TypeScript definitions
│   │   ├── App.tsx               # 🖥️ Main app component
│   │   ├── main.tsx             # 🚀 Web app entry point
│   │   └── index.css            # 🎨 Global styles
│   ├── 📁 public/               # 📂 Static assets
│   ├── 📁 tests/                # 🧪 Test files
│   │   ├── components/          # 🧩 Component tests
│   │   ├── hooks/               # 🎣 Hook tests
│   │   ├── services/            # 🌐 Service tests
│   │   └── utils/               # 🔧 Utility tests
│   ├── 📁 bin/                  # 📜 Executable scripts
│   │   └── gassapi-desktop      # 🚀 Electron CLI entry point (executable)
│   ├── 📁 dist/                 # 📦 Built distribution
│   ├── 📁 dist-web/             # 🌐 Web build output
│   ├── 📁 dist-electron/        # 🖥️ Electron build output
│   ├── package.json             # 📦 Dependencies & npm package config
│   ├── electron-builder.json    # 🖥️ Electron build configuration
│   ├── vite.config.ts           # ⚡ Vite config (web)
│   ├── vite.electron.config.ts  # ⚡ Vite config (electron)
│   ├── tsconfig.json            # ⚡ TypeScript config
│   └── README.md                # 📖 Frontend documentation
│
├── 📁 docs/                     # 📚 Additional Documentation
│   ├── README.md                # 📖 Project README
│   ├── CONTRIBUTING.md          # 🤝 Contribution guidelines
│   ├── CHANGELOG.md             # 📋 Version history
│   ├── DEPLOYMENT.md            # 🚀 Deployment guide
│   ├── DEVELOPMENT.md           # 👨‍💻 Development setup
│   ├── API.md                   # 📡 API documentation
│   ├── MCP-CLIENT.md            # 🤖 MCP client installation & usage
│   └── CLAUDE-DESKTOP.md        # 🤖 Claude Desktop integration guide
│
├── 📁 scripts/                  # 📜 Build & deployment scripts
│   ├── build.sh                 # 🔨 Build all packages
│   ├── deploy.sh                # 🚀 Deploy to production
│   ├── test.sh                  # 🧪 Run all tests
│   ├── setup.sh                 # ⚙️ Development setup
│   ├── publish-mcp-client.sh    # 📦 Publish MCP client to npm
│   └── clean.sh                 # 🧹 Clean build artifacts
│
├── 📁 tools/                    # 🔧 Development tools
│   ├── 📁 eslint-config/        # 📏 ESLint configuration
│   ├── 📁 prettier-config/      # 🎨 Prettier configuration
│   └── 📁 typescript-config/    # ⚡ TypeScript configuration
│
├── 📁 examples/                 # 📚 Example projects
│   ├── 📁 basic-api/            # 🔌 Simple API example
│   ├── 📁 complex-flow/         # 🌊 Complex flow example
│   ├── 📁 team-collab/          # 👥 Collaboration example
│   └── 📁 claude-desktop-config/ # 🤖 Claude Desktop setup examples
│
├── package.json                 # 📦 Root package.json (workspaces for dev)
├── pnpm-workspace.yaml          # 📦 Workspace configuration (dev only)
├── turbo.json                   # ⚡ Turbo build configuration
├── docker-compose.yml           # 🐳 Development containers
├── .gitignore                   # 🚫 Git ignore rules
├── .env.example                 # 📝 Environment template
└── README.md                    # 📖 Project overview
```

---

## 🏛️ Architectural Patterns

### 1. **Standalone Package Structure** (3 Independent npm packages)
```
gassapi-organization/
├── gassapi-mcp-client/          # 🤖 Global CLI tool
├── gassapi-backend/             # ☁️ API server npm package
└── gassapi-frontend/            # 🎨 Web + Electron npm package
```

### 2. **MCP Protocol Structure** (Standalone Client)
```
mcp-client/src/
├── tools/         # 🔧 AI-callable functions (MCP Tools)
├── resources/     # 📚 Local data access patterns (MCP Resources)
├── prompts/       # 💬 AI interaction templates (MCP Prompts)
├── server/        # 🖥️ MCP server implementation
└── execution/     # 🚀 Local execution engine
```

### 3. **Frontend Multi-Target Structure** (Single Source, Multiple Builds)
```
gassapi-frontend/src/
├── components/     # 🧩 React components (shared web + electron)
├── electron/       # 🖥️ Electron-specific code
├── hooks/          # 🎣 React hooks (shared)
├── services/       # 🌐 API services (shared)
├── types/          # 📝 TypeScript definitions (shared)
└── main.tsx        # 🚀 Web entry point
```

### 4. **Layered Architecture** (Backend)
```
gassapi-backend/src/
├── controllers/   # Request handling
├── services/      # Business logic
├── middleware/    # Request processing
├── routes/        # API routing
└── types/         # Type definitions
```

### 5. **Package Distribution Structure**
```
gassapi-mcp-client/               # npm: global CLI tool
├── dist/                        # Built JavaScript
├── bin/gassapi-mcp              # CLI executable

gassapi-backend/                 # npm: API server
├── dist/                        # Built server
├── bin/gassapi-backend          # CLI executable
├── Dockerfile                   # Container definition

gassapi-frontend/                # npm: Web + Electron app
├── dist-web/                    # Web build (static files)
├── dist-electron/               # Electron build (executables)
├── bin/gassapi-desktop          # Electron CLI
```

---

## 📝 Naming Conventions

### Files & Folders
- **Components**: `PascalCase` (e.g., `UserProfile.tsx`)
- **Utilities**: `camelCase` (e.g., `formatDate.ts`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_ENDPOINTS.ts`)
- **Types**: `camelCase.types.ts` (e.g., `user.types.ts`)
- **Tests**: `*.test.ts` or `*.spec.ts`
- **Stories**: `*.stories.tsx` (Storybook)

### Directory Structure Rules
1. **Index Files**: Every directory has `index.ts` for clean imports
2. **Barrel Exports**: Group related exports in index files
3. **Separation**: Keep test files separate from source
4. **Co-location**: Keep related files together
5. **Flat Structure**: Avoid deep nesting when possible

---

## 🚀 Development Workflow

### 1. **MCP Client Development** (Standalone Package)
```bash
# Development mode (local MCP client)
cd mcp-client
npm run dev

# Build MCP client for distribution
npm run build

# Test MCP client with Claude Desktop
npm run test:e2e

# Publish to npm
npm run publish
```

### 2. **Backend Development** (Standalone API Server)
```bash
# Development mode (backend only)
cd gassapi-backend
npm run dev

# Backend testing
npm run test

# Backend build
npm run build

# Run backend with database
npm run start

# Publish to npm
npm run publish
```

### 3. **Frontend Development** (Web + Electron)
```bash
# Development mode (web only)
cd gassapi-frontend
npm run dev

# Development mode (electron)
npm run dev:electron

# Frontend testing
npm run test

# Build for web deployment
npm run build:web

# Build for electron
npm run build:electron

# Package electron app
npm run package:electron

# Publish to npm
npm run publish
```

### 4. **Independent Package Development**
```bash
# Each package can be developed independently
cd mcp-client && npm run dev      # MCP client
cd gassapi-backend && npm run dev # Backend API
cd gassapi-frontend && npm run dev # Frontend web

# Or use root workspace for convenience
pnpm dev                          # All packages
pnpm --filter mcp-client dev     # Single package
pnpm --filter gassapi-backend dev # Single package
pnpm --filter gassapi-frontend dev # Single package
```

### 5. **Production Deployment**
```bash
# Build all packages
npm run build:all

# Docker deployment (self-hosted)
docker-compose up -d

# Individual package deployment
docker-compose up backend      # Backend only
docker-compose up frontend     # Frontend only
```

---

## 🎯 Best Practices

### 1. **Code Organization**
- **Single Responsibility**: Each file has one clear purpose
- **Dependency Direction**: Dependencies point inward, not outward
- **Import Paths**: Use absolute imports for shared modules
- **Barrel Exports**: Clean public APIs for each module

### 2. **File Management**
- **Index Files**: Use for clean imports and public APIs
- **Type Files**: Co-locate types with implementation
- **Test Files**: Mirror source structure in test directory
- **Asset Files**: Organize by type and usage context

### 3. **Scalability Considerations**
- **Feature Modules**: Group by feature, not file type
- **Shared Libraries**: Extract common functionality
- **Plugin Architecture**: Allow for future extensions
- **API Versioning**: Prepare for API evolution

---

## 🔄 Migration Strategy

### Phase 1: MCP Client Foundation (Primary Focus)
1. **Create standalone MCP client structure**
   - Implement MCP protocol (tools, resources, prompts)
   - Set up local execution engine
   - Add Claude Desktop integration
   - Create npm package configuration
2. **Development Setup**
   - TypeScript configuration
   - Build pipeline for npm distribution
   - Testing framework with Claude Desktop integration
   - CLI interface for global installation

### Phase 2: Backend API Package (Standalone Server)
1. **Create gassapi-backend npm package**
   - Fastify server with CLI interface
   - Authentication & project management
   - Configuration generation API (`POST /api/projects/:id/generate-config`)
   - Token validation for MCP client
2. **Backend Infrastructure**
   - Prisma database schema and migrations
   - Docker containerization
   - CLI commands: `gassapi-backend start/dev/build`

### Phase 3: Frontend Package (Web + Electron)
1. **Create gassapi-frontend npm package**
   - React + React Flow application
   - Multi-build configuration (Vite for web, Vite + Electron Builder for desktop)
   - Single source code, multiple deployment targets
2. **Frontend Features**
   - Visual flow builder interface
   - Project management dashboard
   - Electron desktop app packaging

### Phase 4: Package Integration & Distribution
1. **Publish all packages to npm**
   ```bash
   npm publish -g gassapi-mcp-client    # Global CLI tool
   npm publish gassapi-backend          # Server npm package
   npm publish gassapi-frontend         # Web + Electron package
   ```
2. **Self-hosted deployment setup**
   - Docker compose for development
   - Docker compose for production
   - Installation scripts for easy setup
   - Environment configuration templates

### Phase 5: Documentation & Examples
1. **Complete documentation suite**
   - Package-specific installation guides
   - Self-hosted deployment documentation
   - Claude Desktop integration guide
   - API documentation for backend
2. **Example projects & templates**
   - Sample API projects
   - Docker deployment examples
   - Claude Desktop configuration samples
   - Frontend integration examples

---

## 📊 Structure Benefits

### ✅ **3-Package Independence**
- **Modular Installation**: Install only what you need (`npm install gassapi-backend`)
- **Independent Development**: Each package can be developed separately
- **Flexible Deployment**: Use MCP client only, backend only, or full stack
- **Version Management**: Update packages independently without breaking others
- **Team Specialization**: Different teams can work on different packages

### ✅ **Frontend Code Reuse**
- **Single Source Code**: One React codebase untuk web dan electron
- **No Duplication**: Shared components, hooks, services, dan types
- **Consistent UX**: Identical experience antara web dan desktop
- **Maintenance Efficiency**: One codebase to maintain, debug, dan improve
- **Multi-Target Builds**: Automated builds untuk web static files dan electron executables

### ✅ **Self-Hosted Ready**
- **Docker Native**: Semua packages siap untuk containerization
- **Zero Cloud Dependency**: Complete local development dan deployment
- **Production Ready**: Docker compose untuk production deployment
- **Database Integration**: Prisma dengan MySQL untuk production database
- **Configuration Management**: Environment-based configuration system

### ✅ **AI-Native Architecture**
- **Claude Desktop First**: MCP client built specifically untuk Claude integration
- **Local Execution**: No server latency untuk API testing
- **Secure Local Access**: Controlled file system dan API access
- **Auto-Discovery**: Automatic project detection dan configuration
- **Natural Interaction**: Zero-configuration AI workflow

### 🎯 **Key Features**
- **Zero-Configuration**: Auto-detects project dan configuration
- **Package Independence**: Install, develop, dan deploy packages separately
- **Code Reuse**: Frontend single source untuk web + electron
- **Self-Hosted**: Complete local deployment capability
- **Modern Tooling**: TypeScript, Docker, Vite, Electron Builder
- **Developer Experience**: Smooth development workflow dengan pnpm workspace

---

## 🤖 MCP Client Installation & Usage

### 📦 Installation (Global Package)
```bash
# Install MCP client globally
npm install -g gassapi-mcp-client

# Verify installation
gassapi-mcp --version
```

### 🔧 Claude Desktop Configuration
```json
// ~/.claude/claude_desktop_config.json
{
  "mcpServers": {
    "gassapi-local": {
      "command": "gassapi-mcp"
    }
  }
}
```

### 🚀 Zero-Configuration Setup
```bash
# 1. Create project via web dashboard
# 2. Generate configuration: POST /api/projects/:id/generate-config
# 3. Save response as 'gassapi.json' in project root
# 4. Done! Claude Desktop auto-detects project context
```

### 💻 Daily Usage
```bash
# Auto project detection (no commands needed)
cd /path/to/your-project  # Contains gassapi.json
open Claude Desktop        # Auto-loads project context

# Manual project validation
gassapi-mcp validate-token

# Scan local endpoints
gassapi-mcp scan-endpoints --ports 3000,8000,8080
```

### 📁 Project Configuration (gassapi.json)
```json
{
  "project": {
    "id": "proj_abc123",
    "name": "E-commerce API"
  },
  "mcpClient": {
    "token": "permanent-mcp-token",
    "serverURL": "http://localhost:3000"
  },
  "environment": {
    "active": "development",
    "variables": {
      "API_BASE_URL": "http://localhost:3000"
    }
  }
}
```

### 🎯 Claude Desktop Interaction
```
User: "I need to test user registration flow"

Claude: [Auto-detects project context]
✅ Connected to E-commerce API project
🔍 Found endpoints: POST /api/users, POST /auth/login
🌊 Creating registration flow...

Claude: "I've created a test flow for user registration:
1. POST /api/users (create account)
2. GET /api/users/:id (verify creation)
3. POST /auth/login (test credentials)

Run with: run_flow('user-registration-flow')"
```

---

## 📦 Multi-Package Installation & Usage

### 🎯 Installation Options

**Option 1: MCP Client Only** (AI-powered local API testing)
```bash
# Install MCP client globally
npm install -g gassapi-mcp-client

# Claude Desktop configuration
{
  "mcpServers": {
    "gassapi-local": {
      "command": "gassapi-mcp"
    }
  }
}

# Usage: Local API testing dengan Claude Desktop
```

**Option 2: Backend Server Only** (API server for project management)
```bash
# Install backend package
npm install gassapi-backend

# Start development server
npx gassapi-backend dev

# Production deployment
npx gassapi-backend start
```

**Option 3: Frontend Only** (Web interface + Desktop app)
```bash
# Install frontend package
npm install gassapi-frontend

# Development server (web)
npx gassapi-frontend dev

# Build web version
npx gassapi-frontend build:web

# Build and run desktop app
npx gassapi-frontend package:electron
```

**Option 4: Complete Stack** (Self-hosted deployment)
```bash
# Install all packages
npm install -g gassapi-mcp-client
npm install gassapi-backend
npm install gassapi-frontend

# Docker deployment (recommended)
git clone gassapi-organization/docker-compose
docker-compose up -d
```

### 🚀 Self-Hosted Deployment

**Development Environment**
```bash
# Clone all repositories
git clone gassapi-organization/mcp-client
git clone gassapi-organization/gassapi-backend
git clone gassapi-organization/gassapi-frontend

# Start development stack
docker-compose -f docker-compose.dev.yml up
```

**Production Environment**
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Includes:
# - Backend API server with MySQL
# - Frontend web server (Nginx)
# - MCP client documentation
# - Database backups and monitoring
```

### 🎨 Frontend Multi-Target Builds

**Web Application**
```bash
# Development
cd gassapi-frontend
npm run dev                    # http://localhost:5173

# Production build
npm run build:web              # dist-web/
# Deploy ke Vercel, Netlify, atau static hosting
```

**Desktop Application**
```bash
# Electron development
npm run dev:electron           # Development electron window

# Production build
npm run build:electron         # dist-electron/
npm run package:electron       # .exe, .dmg, .AppImage files

# Distribute
npm run dist:electron          # Ready-to-distribute packages
```

### 🔗 Package Integration

**MCP Client + Backend**
```bash
# MCP client validates tokens dengan backend
curl -X POST http://localhost:3000/api/projects/:id/generate-config

# Save gassapi.json di project root
# MCP client auto-detects dan validates
```

**Frontend + Backend**
```bash
# Frontend connects ke backend API
VITE_API_URL=http://localhost:3000/api/v1
```

**Full Stack Integration**
```bash
# Complete local development environment
# 1. Backend: http://localhost:3000 (API + Database)
# 2. Frontend: http://localhost:5173 (Web app)
# 3. MCP Client: Claude Desktop integration
# 4. Desktop App: Electron packaged version
```