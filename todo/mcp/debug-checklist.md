# MCP Server Debug Checklist

**Purpose**: Systematic debugging approach to identify and fix GASSAPI MCP server startup issues

---

## 🔍 **Debugging Process**

### Phase 1: Environment Check ✅

- [x] **Node.js Version**: Check Node version compatibility
  ```bash
  node --version  # Should be v16+
  npm --version   # Should be compatible
  ```

- [x] **Dependencies**: Verify all dependencies installed
  ```bash
  npm list --depth=0
  npm ci  # Clean install
  ```

- [x] **Build Process**: Confirm TypeScript compilation works
  ```bash
  npm run build  # ✅ Success
  ```

### Phase 2: Basic Runtime Test ❌

- [ ] **Direct Execution**: Test server startup
  ```bash
  node dist/index.js  # ❌ No output
  ```

- [ ] **Error Detection**: Look for hidden errors
  ```bash
  node --trace-warnings dist/index.js
  node --trace-deprecation dist/index.js
  node --enable-source-maps dist/index.js
  ```

- [ ] **Module Loading**: Check individual modules
  ```bash
  node -e "console.log('Testing imports...'); import('./dist/index.js').then(() => console.log('OK')).catch(e => console.error('FAIL:', e))"
  ```

### Phase 3: Component Isolation

#### Test 3.1: Simple MCP Server
```bash
# Create and test simple-mcp.js
node simple-mcp.js  # Should show debug output
```

#### Test 3.2: GASSAPI Imports
```bash
# Test each import separately
node -e "
import('./dist/server/McpServer.js').then(() => console.log('✅ McpServer')).catch(e => console.error('❌ McpServer:', e))
import('./dist/config.js').then(() => console.log('✅ Config')).catch(e => console.error('❌ Config:', e))
import('./dist/utils/Logger.js').then(() => console.log('✅ Logger')).catch(e => console.error('❌ Logger:', e))
"
```

#### Test 3.3: Tool Imports
```bash
# Test tool modules
node -e "
import('./dist/tools/auth.js').then(() => console.log('✅ Auth tools')).catch(e => console.error('❌ Auth tools:', e))
import('./dist/tools/environment.js').then(() => console.log('✅ Env tools')).catch(e => console.error('❌ Env tools:', e))
"
```

---

## 🐛 **Common Issues & Solutions**

### Issue 1: Silent Failure
**Symptoms**: No output, immediate exit
**Possible Causes**:
- Unhandled promise rejection
- Synchronous error during import
- Process.exit() called somewhere

**Debug Steps**:
```bash
# Check for unhandled rejections
node --unhandled-rejections=strict dist/index.js

# Add global error handlers (in index.ts)
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});
```

### Issue 2: Import Resolution
**Symptoms**: Module not found errors
**Possible Causes**:
- Incorrect file extensions (.js vs .mjs)
- Module resolution issues
- TypeScript output configuration

**Debug Steps**:
```bash
# Check generated files
ls -la dist/
cat dist/index.js | head -20

# Verify import statements work
node -e "
import('./dist/server/McpServer.js').then(module => {
  console.log('✅ Module loaded:', Object.keys(module));
}).catch(e => {
  console.error('❌ Import failed:', e.message);
  console.error('Stack:', e.stack);
});
"
```

### Issue 3: Logger Initialization
**Symptoms**: Server starts but no output
**Possible Causes**:
- Logger configuration blocking
- Console output redirected
- Async initialization issues

**Debug Steps**:
```bash
# Test logger independently
node -e "
import('./dist/utils/Logger.js').then(({ logger }) => {
  console.log('Logger imported');
  logger.info('Test message');
  console.log('Logger test complete');
}).catch(e => console.error('Logger failed:', e));
"
```

### Issue 4: Configuration Loading
**Symptoms**: Server hangs during startup
**Possible Causes**:
- Config file not found
- Invalid JSON in config
- File permission issues

**Debug Steps**:
```bash
# Test config loading
node -e "
import('./dist/config.js').then(({ config }) => {
  console.log('Config imported');
  return config.loadProjectConfig();
}).then(() => {
  console.log('Config loaded successfully');
}).catch(e => console.error('Config failed:', e));
"
```

---

## 🔧 **Debug Scripts**

### Script 1: Module Test
```bash
#!/bin/bash
# test-modules.sh

echo "🔍 Testing GASSAPI MCP Server Modules..."

echo "1. Testing main import..."
timeout 5 node -e "
import('./dist/index.js').then(() => {
  console.log('✅ Main module loaded successfully');
}).catch(e => {
  console.error('❌ Main module failed:', e.message);
  console.error('Stack:', e.stack);
  process.exit(1);
});
" || echo "❌ Main module test timed out or failed"

echo "2. Testing individual components..."
components=("server/McpServer" "config" "utils/Logger" "tools/auth")

for component in "${components[@]}"; do
  echo "  Testing $component..."
  node -e "
  import('./dist/$component.js').then(() => {
    console.log('✅ $component loaded');
  }).catch(e => {
    console.error('❌ $component failed:', e.message);
  });
  "
done

echo "🔍 Module testing complete"
```

### Script 2: Runtime Test
```bash
#!/bin/bash
# test-runtime.sh

echo "🚀 Testing GASSAPI MCP Server Runtime..."

echo "1. Basic startup test (5 second timeout)..."
timeout 5 node dist/index.js &
PID=$!
sleep 2
if ps -p $PID > /dev/null; then
  echo "✅ Server process is running"
  kill $PID
  wait $PID 2>/dev/null
else
  echo "❌ Server process exited immediately"
fi

echo "2. MCP protocol test..."
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {"tools": {}}, "clientInfo": {"name": "test", "version": "1.0.0"}}}' | timeout 10 node dist/index.js || echo "❌ MCP protocol test failed"

echo "🚀 Runtime testing complete"
```

### Script 3: Debug Build
```bash
#!/bin/bash
# debug-build.sh

echo "🔧 Building debug version..."

# Create debug version with extra logging
cat > dist/debug-index.js << 'EOF'
#!/usr/bin/env node

console.error('DEBUG: Starting debug server...');

(async () => {
  try {
    console.error('DEBUG: Importing main module...');
    const { GassapiMcpClient } = await import('./index.js');
    console.error('DEBUG: Main module imported');

    console.error('DEBUG: Creating client...');
    const client = new GassapiMcpClient();
    console.error('DEBUG: Client created');

    console.error('DEBUG: Starting server...');
    await client.start();
    console.error('DEBUG: Server started successfully');

  } catch (error) {
    console.error('DEBUG: Error occurred:', error);
    console.error('DEBUG: Error stack:', error?.stack);
    process.exit(1);
  }
})();
EOF

echo "✅ Debug build created at dist/debug-index.js"
```

---

## 📊 **Debug Results Log**

### Test Run 1: Basic Startup
```
Date: 2025-10-24
Time: 15:30
Command: node dist/index.js
Result: ❌ Silent failure
Next Action: Add error handlers and debug logging
```

### Test Run 2: Module Loading
```
Date: 2025-10-24
Time: 15:35
Command: Individual module imports
Result:
Next Action:
```

### Test Run 3: MCP Protocol
```
Date: 2025-10-24
Time: 15:40
Command: MCP protocol test
Result:
Next Action:
```

---

## 🎯 **Decision Points**

### If Module Loading Fails:
- Fix TypeScript configuration
- Update import statements
- Check package.json exports

### If Server Starts But No MCP Response:
- Fix handler registration
- Check transport setup
- Verify MCP protocol implementation

### If Server Works in Debug But Not Normal:
- Identify what's different
- Fix initialization order
- Remove problematic dependencies

---

## 📝 **Next Steps**

1. **Run debug scripts** to identify failure point
2. **Fix root cause** based on findings
3. **Test incremental improvements**
4. **Verify full functionality** once basic works
5. **Document solution** for future reference