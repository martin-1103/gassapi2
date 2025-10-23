# ☁️ Backend API Package

**Package:** `gassapi-backend` (npm + standalone server)
**Purpose:** Cloud backend untuk authentication, project management, collaboration
**Focus:** Simple deployment, RESTful API

---

## 🏗️ Package Structure

```
backend/
├── src/
│   ├── controllers/     # 🎮 Request handlers
│   ├── services/        # ⚙️ Business logic
│   ├── middleware/      # 🛡️ Request processing
│   ├── routes/          # 🛣️ API routes
│   ├── utils/           # 🔧 Helper functions
│   ├── types/           # 📝 TypeScript definitions
│   ├── app.ts           # 🚀 Fastify app setup
│   └── server.ts        # 🖥️ Server entry point
├── prisma/              # 🗄️ Database schema
│   ├── schema.prisma    # 📊 Database definition
│   ├── migrations/      # 📜 Database migrations
│   └── seed.ts          # 🌱 Seed data
├── tests/               # 🧪 Test files
├── config/              # ⚙️ Configuration
├── bin/                 # 📜 Executable scripts
├── dist/                # 📦 Built distribution
├── package.json         # 📦 Dependencies & npm package config
└── README.md            # 📖 Backend API documentation
```

---

## 🎯 Core Features

### 1. Authentication
- JWT auth (15min access + 7day refresh)
- Permanent MCP client tokens
- User management
- Project-based access control

### 2. Project Management
- Unlimited projects untuk authenticated users
- Member invitation system
- Equal permissions (except deletion)
- Project settings & configurations

### 3. Collaboration
- Project sharing & member management
- Project-based access control
- Member invitation system
- Settings synchronization

### 4. MCP Integration
- Token generation & validation
- Configuration generation API
- Project context management

---

## 📋 Planning Files

- [API Endpoints](./endpoints/) - REST API specification
- [Database Schema](./database-schema.md) - Database design
- [Authentication](../authentication.md) - Auth & security

---

## 🚀 Deployment Options

### npm Package Installation
```bash
npm install gassapi-backend
npx gassapi-backend start
```

### Development Mode
```bash
npx gassapi-backend dev
```

---

## 📦 Package Distribution

**Target:** npm package
**Entry Point:** `bin/gassapi-backend`
**Dependencies:** Fastify, Prisma, MySQL
**Database:** MySQL 8.0+ (required)
**Port:** 3000 (default)

---

## 🔧 Quick Start

```bash
# Install package
npm install gassapi-backend

# Setup database
npx gassapi-backend setup

# Start server
npx gassapi-backend start
```

### API Base URL
```
Development: http://localhost:3000/api/v1
Production: https://api.gassapi.com/v1
```