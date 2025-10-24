# Minimal MCP Server Implementation

**Purpose**: Create a minimal, working MCP server to isolate and fix runtime issues

---

## 🎯 **Goal**

Create the simplest possible MCP server that:
1. Starts successfully without errors
2. Responds to basic MCP protocol requests
3. Exposes at least one working tool
4. Can be used as a foundation for the full GASSAPI implementation

---

## 📋 **Current Issues to Address**

### Problem Analysis
```bash
# Current behavior
npm run build  # ✅ Success
node dist/index.js  # ❌ No output, silent failure

# Expected behavior
node dist/index.js  # ✅ Server starts, waits for MCP requests
```

### Root Cause Hypotheses
1. **Module Import Failures** - Circular dependencies or missing modules
2. **Logger Initialization** - Logger setup blocking server start
3. **Configuration Loading** - Config loading causing silent failures
4. **Unhandled Exceptions** - Errors being swallowed somewhere
5. **Dependency Conflicts** - npm packages conflicting at runtime

---

## 🔧 **Minimal Implementation Strategy**

### Step 1: Barebones MCP Server

Create `minimal-mcp-server.ts`:
```typescript
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  InitializeRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

console.error('DEBUG: Starting minimal MCP server...');

const server = new Server(
  {
    name: 'minimal-gassapi',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {
        listChanged: true
      }
    }
  }
);

// Initialize handler
server.setRequestHandler(InitializeRequestSchema, async (request) => {
  console.error('DEBUG: Initialize received');
  return {
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: {
        listChanged: true
      }
    },
    serverInfo: {
      name: 'minimal-gassapi',
      version: '1.0.0'
    }
  };
});

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('DEBUG: List tools received');
  return {
    tools: [
      {
        name: 'ping',
        description: 'Simple ping tool to test connectivity',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Message to echo back',
              default: 'pong'
            }
          }
        }
      }
    ]
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error('DEBUG: Call tool received:', request.params.name);

  if (request.params.name === 'ping') {
    const message = request.params.arguments?.message || 'pong';
    return {
      content: [
        {
          type: 'text',
          text: `Echo: ${message}`
        }
      ]
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

console.error('DEBUG: Connecting transport...');

const transport = new StdioServerTransport();
await server.connect(transport);

console.error('DEBUG: Minimal MCP server ready!');
```

### Step 2: Test Commands

```bash
# Build and test minimal server
npx tsc minimal-mcp-server.ts --outDir dist --module esnext --target es2020

# Test initialization
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {"tools": {}}, "clientInfo": {"name": "test", "version": "1.0.0"}}}' | node dist/minimal-mcp-server.js

# Test list tools
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}' | node dist/minimal-mcp-server.js

# Test tool call
echo '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "ping", "arguments": {"message": "hello"}}}' | node dist/minimal-mcp-server.js
```

### Step 3: Incremental Complexity

Once minimal server works, add complexity gradually:

1. **Add Logger Integration**
   ```typescript
   import { logger } from './utils/Logger.js';
   logger.info('Server starting...');
   ```

2. **Add Configuration Loading**
   ```typescript
   import { config } from './config.js';
   await config.loadProjectConfig();
   ```

3. **Add GASSAPI Tool Registration**
   ```typescript
   import { authTools } from './tools/auth.js';
   // Register one tool at a time
   ```

4. **Add Error Handling**
   ```typescript
   try {
     // Server operations
   } catch (error) {
     console.error('Server error:', error);
   }
   ```

---

## 🔍 **Debugging Techniques**

### 1. Add Console Error Logging
```typescript
console.error('DEBUG: About to create Server');
const server = new Server(...);
console.error('DEBUG: Server created');

console.error('DEBUG: About to set handlers');
server.setRequestHandler(...);
console.error('DEBUG: Handlers set');
```

### 2. Try-Catch Everything
```typescript
try {
  console.error('DEBUG: Starting server...');

  try {
    console.error('DEBUG: Creating transport...');
    const transport = new StdioServerTransport();
    console.error('DEBUG: Transport created');

    console.error('DEBUG: Connecting...');
    await server.connect(transport);
    console.error('DEBUG: Connected successfully');

  } catch (transportError) {
    console.error('DEBUG: Transport error:', transportError);
    throw transportError;
  }

} catch (error) {
  console.error('DEBUG: Server startup failed:', error);
  console.error('DEBUG: Error stack:', error?.stack);
  process.exit(1);
}
```

### 3. Node.js Debug Flags
```bash
# Enable all warnings and traces
node --trace-warnings --trace-deprecation --enable-source-maps dist/index.js

# Use Node.js inspector
node --inspect-brk dist/index.js
```

### 4. Module Resolution Debug
```bash
# Check if modules can be loaded
node -e "
try {
  require('@modelcontextprotocol/sdk/server/stdio.js');
  console.log('✅ stdio module loaded');
} catch (e) {
  console.log('❌ stdio module failed:', e.message);
}
"

# Check TypeScript compilation
npx tsc --noEmit --diagnostics src/index.ts
```

---

## 📋 **Implementation Tasks**

### Task 1: Create Minimal Server
- [ ] Write `minimal-mcp-server.ts`
- [ ] Test basic functionality
- [ ] Verify it responds to MCP requests

### Task 2: Debug Current Server
- [ ] Add debug logging to existing server
- [ ] Identify where it fails
- [ ] Compare with working minimal version

### Task 3: Fix Root Cause
- [ ] Apply fix based on findings
- [ ] Test fix with current server
- [ ] Verify all functionality works

### Task 4: Restore Full Functionality
- [ ] Add back GASSAPI tools
- [ ] Test all tool categories
- [ ] Verify integration points

---

## 🎯 **Success Criteria**

### Minimal Server Success
- [ ] Server starts without errors
- [ ] Responds to `initialize` request
- [ ] Lists at least one tool
- [ ] Executes tool calls successfully

### Full Server Success
- [ ] All GASSAPI tools are exposed
- [ ] Tools execute with proper GASSAPI backend calls
- [ ] Error handling works correctly
- [ ] Integration with MCP clients successful

---

## 📝 **Notes**

- Use `console.error()` for debug output (goes to stderr, doesn't interfere with MCP protocol)
- Focus on one failure mode at a time
- Keep changes minimal and testable
- Document what works and what doesn't at each step