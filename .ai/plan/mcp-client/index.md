# 🤖 MCP Client Package

**Package:** `gassapi-mcp-client` (Global npm CLI)
**Purpose:** AI-powered API testing dengan Claude Desktop integration
**Focus:** Local execution, zero-configuration, natural AI interaction

---

## 🏗️ Package Structure

```
mcp-client/
├── src/
│   ├── tools/           # 🔧 MCP Tools (AI-callable functions)
│   ├── resources/       # 📚 MCP Resources (local data access)
│   ├── prompts/         # 💬 MCP Prompts (AI interaction templates)
│   ├── execution/       # 🚀 Local execution engine
│   ├── discovery/       # 🔍 Auto-discovery system
│   ├── analysis/        # 📊 Response analysis
│   ├── cli/            # 💻 Command line interface
│   ├── server/         # 🖥️ MCP Server implementation
│   ├── types/          # 📝 Type definitions
│   ├── utils/          # 🔧 Utilities
│   ├── config.ts       # ⚙️ MCP client configuration
│   ├── index.ts        # 📦 Package entry point
│   └── cli.ts          # 💻 CLI entry point
├── tests/              # 🧪 Test files
├── bin/                # 📜 Executable scripts
├── dist/               # 📦 Built distribution
├── package.json        # 📦 Dependencies & npm package config
└── README.md           # 📖 MCP client documentation
```

---

## 🎯 Core Features

### 1. **Zero-Configuration Setup**
```bash
npm install -g gassapi-mcp-client
# Add to Claude Desktop config
# Done! Auto-detects project context
```

### 2. AI-Native Testing
- Claude Desktop integration
- Natural flow generation
- Intelligent endpoint discovery
- Real-time execution & analysis

### 3. Local-First Architecture
- Direct localhost API access
- Local file system access
- No server latency
- Offline capability

---

## 📋 Planning Files

- [Tools Specification](./tools.md) - MCP tools definition
- [Configuration](./configuration.md) - Setup & config management
- [Security Model](./security.md) - Local access security

---

## 🚀 Installation & Usage

### Global Installation
```bash
npm install -g gassapi-mcp-client
```

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

### Zero-Configuration Usage
```bash
cd /path/to/project  # Contains gassapi.json
open Claude Desktop  # Auto-loads project context
```

---

## 📦 Package Distribution

**Target:** npm global package
**Entry Point:** `bin/gassapi-mcp`
**Dependencies:** Minimal, fast startup
**Size:** < 50MB total