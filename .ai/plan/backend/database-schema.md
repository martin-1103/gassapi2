# 🗄️ Database Schema Design

## 🏗️ Database Overview

**Engine:** MySQL 8.0+
**ORM:** Prisma
**Charset:** utf8mb4
**Collation:** utf8mb4_unicode_ci

---

## 📊 Entity Relationships

```
Users ──┐
        │
        ├─ ProjectMembers ── Projects (owner_id)
        │                     │
        └─ OwnedProjects ─────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
Environments  McpClientTokens  Collections            AuditLogs
                                   │                   │
                                   └─ Endpoints        Flows
```

---

## 📋 Table Overview

### Core Tables
| Table | Description | Detail |
|-------|-------------|--------|
| `users` | User accounts and authentication | → [tables/users.md](./tables/users.md) |
| `projects` | Project management and organization | → [tables/projects.md](./tables/projects.md) |
| `project_members` | User-project relationships | → [tables/project_members.md](./tables/project_members.md) |

### Flow Management Tables
| Table | Description | Detail |
|-------|-------------|--------|
| `flows` | Flow definitions and configurations | → [tables/flows.md](./tables/flows.md) |

### API Management Tables
| Table | Description | Detail |
|-------|-------------|--------|
| `collections` | API endpoint collections & folders | → [tables/collections.md](./tables/collections.md) |
| `endpoints` | Individual API endpoint definitions | → [tables/endpoints.md](./tables/endpoints.md) |
| `environments` | Environment variables & configurations | → [tables/environments.md](./tables/environments.md) |

### Integration Tables
| Table | Description | Detail |
|-------|-------------|--------|
| `mcp_client_tokens` | MCP client authentication tokens | → [tables/mcp_client_tokens.md](./tables/mcp_client_tokens.md) |
| `audit_logs` | System audit trail and logging | → [tables/audit_logs.md](./tables/audit_logs.md) |

---

## 🔧 Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String   @map("password_hash")
  name          String
  avatarUrl     String?  @map("avatar_url")
  isActive      Boolean  @default(true) @map("is_active")
  emailVerified Boolean  @default(false) @map("email_verified")
  lastLoginAt   DateTime? @map("last_login_at")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  ownedProjects    Project[]         @relation("ProjectOwner")
  projectMembers   ProjectMember[]
  collections      Collection[]       @relation("CollectionCreator")
  endpoints        Endpoint[]         @relation("EndpointCreator")
  flows            Flow[]             @relation("FlowCreator")
  mcpClientTokens  McpClientToken[]
  auditLogs        AuditLog[]

  @@map("users")
}

model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  ownerId     String   @map("owner_id")
  isPublic    Boolean  @default(false) @map("is_public")
  settings    Json     @default("{}")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  owner            User              @relation("ProjectOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  members          ProjectMember[]
  collections      Collection[]
  environments     Environment[]
  flows            Flow[]
  mcpClientTokens  McpClientToken[]
  auditLogs        AuditLog[]

  @@map("projects")
}

model ProjectMember {
  id        String   @id @default(uuid())
  projectId String   @map("project_id")
  userId    String   @map("user_id")
  invitedBy String   @map("invited_by")
  joinedAt  DateTime @default(now()) @map("joined_at")
  createdAt DateTime @default(now()) @map("created_at")

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@map("project_members")
}

model Collection {
  id        String   @id @default(uuid())
  name      String
  projectId String   @map("project_id")
  parentId  String?  @map("parent_id")
  createdBy String   @map("created_by")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  project   Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  parent    Collection?  @relation("CollectionHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children  Collection[] @relation("CollectionHierarchy")
  endpoints Endpoint[]
  flows     Flow[]
  creator   User        @relation("CollectionCreator", fields: [createdBy], references: [id], onDelete: Cascade)

  @@map("collections")
}

model Endpoint {
  id           String   @id @default(uuid())
  name         String
  method       String
  url          String
  headers      Json     @default("{}")
  body         Json?
  collectionId String   @map("collection_id")
  createdBy    String   @map("created_by")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  creator   User       @relation("EndpointCreator", fields: [createdBy], references: [id], onDelete: Cascade)

  @@map("endpoints")
}

model Environment {
  id          String   @id @default(uuid())
  projectId   String   @map("project_id")
  name        String
  description String?
  variables   Json     @default("[]")
  isDefault   Boolean  @default(false) @map("is_default")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@map("environments")
}

model Flow {
  id           String   @id @default(uuid())
  name         String
  description  String?
  projectId    String   @map("project_id")
  collectionId String?  @map("collection_id")
  flowData     Json     @map("flow_data")
  createdBy    String   @map("created_by")
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  project     Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  collection  Collection? @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  creator     User        @relation(fields: [createdBy], references: [id], onDelete: Cascade)

  @@map("flows")
}

model McpClientToken {
  id             String   @id @default(uuid())
  projectId      String   @map("project_id")
  tokenHash      String   @unique @map("token_hash")
  lastValidatedAt DateTime? @map("last_validated_at")
  createdBy      String   @map("created_by")
  createdAt      DateTime @default(now()) @map("created_at")
  isActive       Boolean  @default(true) @map("is_active")

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  creator User    @relation(fields: [createdBy], references: [id])

  @@map("mcp_client_tokens")
}

model AuditLog {
  id           String   @id @default(uuid())
  userId       String?  @map("user_id")
  projectId    String?  @map("project_id")
  action       String
  resourceType String   @map("resource_type")
  resourceId   String?  @map("resource_id")
  oldValues    Json?    @map("old_values")
  newValues    Json?    @map("new_values")
  ipAddress    String?  @map("ip_address")
  userAgent    String?  @map("user_agent")
  createdAt    DateTime @default(now()) @map("created_at")

  user    User?    @relation(fields: [userId], references: [id])
  project Project? @relation(fields: [projectId], references: [id])

  @@map("audit_logs")
}
```

---

## 🔒 Permission Model

### User Permissions
- **Project Creation**: All authenticated users
- **Project Access**: Project members only
- **MCP Token Generation**: All project members
- **Project Deletion**: Project owners only

### Token Management
- **Permanent Tokens**: For MCP client integration
- **No Expiry**: Tokens are permanent until revoked
- **Project Scope**: Each token is project-specific
- **Multiple Tokens**: One token per member per project

### Security Features
- Password hashing with bcrypt (12 rounds)
- JWT tokens with rotation
- Audit trail for all modifications
- Rate limiting on sensitive operations

---

## 📁 Detailed Table Documentation

For complete table definitions, field specifications, and business rules, see:

- **[./tables/](./tables/)** - Directory containing detailed table documentation
- **[./tables/collections.md](./tables/collections.md)** - Collections table schema
- **[./tables/endpoints.md](./tables/endpoints.md)** - Endpoints table schema
- **[./tables/environments.md](./tables/environments.md)** - Environments table schema