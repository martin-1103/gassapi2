# GASSAPI MCP v2

Model Context Protocol (MCP) server untuk integrasi GASSAPI dengan AI assistants.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm atau yarn

### Installation
```bash
# Clone atau download MCP2 server
cd mcp2

# Install dependencies
npm install

# Build the server
npm run build
```

## 📋 MCP Setup Guides

### Claude Code Setup

**Method 1: Using claude mcp command (Recommended)**

```bash
# Add stdio MCP server to Claude Code
claude mcp add --transport stdio gassapi-mcp2 -- node D:/xampp82/htdocs/gassapi2/mcp2/dist/index.js

# Add with working directory
claude mcp add --transport stdio gassapi-mcp2 --cwd D:/xampp82/htdocs/gassapi2/mcp2 -- node dist/index.js

# List all MCP servers
claude mcp list

# Remove MCP server
claude mcp remove gassapi-mcp2
```

**Method 2: Manual configuration file**

1. **Create/edit `.claude/settings.json`**
   ```json
   {
     "mcpServers": {
       "gassapi-mcp2": {
         "command": "node",
         "args": ["D:/xampp82/htdocs/gassapi2/mcp2/dist/index.js"],
         "cwd": "D:/xampp82/htdocs/gassapi2/mcp2"
       }
     }
   }
   ```

2. **Restart Claude Code**

3. **Check MCP status in Claude Code:**
   ```
   /mcp
   ```

### Project-Scoped Configuration

Untuk team collaboration, add ke project scope:

```bash
# Add project-scoped MCP server (creates .mcp.json)
claude mcp add --transport stdio gassapi-mcp2 --scope project -- node D:/xampp82/htdocs/gassapi2/mcp2/dist/index.js
```

### Claude Desktop Setup

```json
{
  "mcpServers": {
    "gassapi-mcp2": {
      "command": "node",
      "args": ["D:/xampp82/htdocs/gassapi2/mcp2/dist/index.js"],
      "cwd": "D:/xampp82/htdocs/gassapi2/mcp2"
    }
  }
}
```

### Cursor Setup

1. **Edit Cursor settings.json**
   ```json
   {
     "mcp.mcpServers": {
       "gassapi-mcp2": {
         "command": "node",
         "args": ["D:/xampp82/htdocs/gassapi2/mcp2/dist/index.js"],
         "cwd": "D:/xampp82/htdocs/gassapi2/mcp2"
       }
     }
   }
   ```

2. **Restart Cursor**

### Generic MCP Client Setup

Untuk testing manual:

```bash
# Run server manual
npm start

# Atau development mode
npm run dev
```

## ⚙️ Configuration

### Environment Variables
- Tidak diperlukan untuk basic setup
- Server menggunakan deteksi konfigurasi otomatis

### Project Structure
```
mcp2/
├── src/              # Source code
│   ├── server.ts    # Main server
│   ├── tools/       # MCP tools
│   └── ...          # Other modules
├── dist/            # Built files
├── package.json     # Dependencies
└── README.md        # This file
```

## 🛠️ Development

### Build & Run
```bash
# Build project
npm run build

# Run development server
npm run dev

# Run production server
npm start

# Type checking
npm run typecheck

# Clean build
npm run clean
```

### Testing
```bash
# Run basic test
npm test
```

## 📚 Available Tools

### Core Categories
- **Authentication** - Project context & validation
- **Environment** - Environment management
- **Collection** - Collection management
- **Endpoint** - Endpoint management
- **Testing** - Endpoint testing
- **Flow** - Flow creation & execution

### Quick Reference
| Tool | Purpose | Required |
|------|---------|----------|
| `get_project_context` | Get project info | - |
| `list_environments` | List environments | - |
| `create_endpoint` | Create endpoint | name, method, url, collection_id |
| `test_endpoint` | Test endpoint | endpoint_id, environment_id |
| `create_flow` | Create flow | project_id, name |
| `execute_flow` | Run flow | flow_id, environment_id |

Lihat `../mcp-rule/` untuk dokumentasi lengkap tools.

## 🔧 Troubleshooting

### Common Issues

1. **"Server failed to start"**
   ```bash
   # Check Node.js version
   node --version  # Should be >= 16.0.0

   # Rebuild
   npm run clean && npm run build
   ```

2. **"Command not found" (claude command)**
   ```bash
   # Install Claude Code first
   curl -fsSL https://claude.ai/install.sh | bash

   # Atau on Windows
   curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
   ```

3. **"MCP server not found"**
   ```bash
   # Check MCP server list
   claude mcp list

   # Check server status in Claude Code
   /mcp
   ```

4. **"Permission denied"**
   ```bash
   # Fix permissions (Unix/Linux/macOS)
   chmod +x dist/index.js
   ```

5. **MCP Client cannot connect**
   - Check path in configuration
   - Ensure server is built (`npm run build`)
   - Restart MCP client
   - Verify working directory (cwd) is correct

### Debug Mode
```bash
# Check server status
node dist/index.js --status

# Test server manually
npm start

# Development mode with logs
npm run dev
```

## 📄 MCP Command Reference

### Claude Code MCP Commands
```bash
# Add MCP server
claude mcp add --transport stdio gassapi-mcp2 -- node D:/xampp82/htdocs/gassapi2/mcp2/dist/index.js

# List MCP servers
claude mcp list

# Get server details
claude mcp get gassapi-mcp2

# Remove MCP server
claude mcp remove gassapi-mcp2

# Import from Claude Desktop (macOS/WSL)
claude mcp add-from-claude-desktop

# Add HTTP server (example)
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

### Configuration Files

**Claude Code (.claude/settings.json):**
```json
{
  "mcpServers": {
    "gassapi-mcp2": {
      "command": "node",
      "args": ["D:/xampp82/htdocs/gassapi2/mcp2/dist/index.js"],
      "cwd": "D:/xampp82/htdocs/gassapi2/mcp2"
    }
  }
}
```

**Project-scoped (.mcp.json):**
```json
{
  "mcpServers": {
    "gassapi-mcp2": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {}
    }
  }
}
```

**Claude Desktop:**
```json
{
  "mcpServers": {
    "gassapi-mcp2": {
      "command": "node",
      "args": ["D:/xampp82/htdocs/gassapi2/mcp2/dist/index.js"],
      "cwd": "D:/xampp82/htdocs/gassapi2/mcp2"
    }
  }
}
```

**Cursor:**
```json
{
  "mcp.mcpServers": {
    "gassapi-mcp2": {
      "command": "node",
      "args": ["D:/xampp82/htdocs/gassapi2/mcp2/dist/index.js"],
      "cwd": "D:/xampp82/htdocs/gassapi2/mcp2"
    }
  }
}
```

## 🤝 Usage

Setelah setup, MCP tools akan tersedia di AI assistant Anda:

1. **"Show my project"** → `get_project_context`
2. **"List environments"** → `list_environments`
3. **"Create endpoint"** → `create_endpoint`
4. **"Test this endpoint"** → `test_endpoint`
5. **"Create flow"** → `create_flow`
6. **"Run flow"** → `execute_flow`

## 📞 Support

Lihat dokumentasi lengkap di `doc-mcp/` untuk:
- Tool documentation
- Usage examples
- Best practices
- Common mistakes