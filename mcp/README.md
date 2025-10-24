# GASSAPI MCP Server

MCP (Model Context Protocol) server untuk GASSAPI - AI-powered API testing dan automation.

## 🎯 Quick Start

### Untuk Augment Code (VSCode Extension)

1. **Import konfigurasi:**
   - Buka Augment Settings (klik gear icon)
   - Klik "Import from JSON" di bagian MCP
   - Copy-paste dari `augment-mcp-config.json`
   - Save & restart VSCode

2. **Atau manual:**
   - Name: `gassapi`
   - Command: `node`
   - Args: `d:\xampp82\htdocs\gassapi2\mcp\dist\index.js`
   - Env: `NODE_ENV=production`

📖 **Dokumentasi lengkap:** [AUGMENT_SETUP.md](./AUGMENT_SETUP.md)

### Untuk Claude Desktop

Konfigurasi sudah ada di `C:\Users\bngkim\.claude\mcp_config.json`

📖 **Dokumentasi lengkap:** [CLAUDE_CODE_SETUP.md](./CLAUDE_CODE_SETUP.md)

---

## 🛠️ Development

### Build
```bash
npm run build
```

### Test
```bash
npm test
```

### Run Locally
```bash
npm run dev
```

---

## 📦 Tools Available (17)

- **Auth:** login, logout, verify_token
- **Environment:** list, set, get
- **Collection:** list, get, create
- **Endpoint:** list, get, test
- **Testing:** run, create, results
- **Flow:** execute, create

---

## 📁 Structure

```
mcp/
├── src/              # TypeScript source
│   ├── server/      # MCP server implementation
│   ├── tools/       # 6 tool categories
│   ├── utils/       # Logger & utilities
│   └── types/       # TypeScript definitions
├── dist/            # Compiled JavaScript
├── bin/             # Executable binary
└── gassapi.json    # Configuration
```

---

## 🔗 Links

- [Augment Setup Guide](./AUGMENT_SETUP.md)
- [Claude Code Setup Guide](./CLAUDE_CODE_SETUP.md)
- [MCP Protocol Docs](https://modelcontextprotocol.io/)
- [Augment MCP Docs](https://docs.augmentcode.com/setup-augment/mcp)

---

**Version:** 1.0.0  
**License:** MIT  
**Author:** GASSAPI Team

