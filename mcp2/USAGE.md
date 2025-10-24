# GASSAPI MCP Server v2 - Usage Guide

## Quick Start

### 1. Installation
```bash
cd mcp2
npm install
npm run build
```

### 2. Initialize Configuration
```bash
# Create sample configuration
node dist/index.js --init --project "My API Project"

# This creates gassapi-mcp.json with your project settings
```

### 3. Configure Authentication
Edit `gassapi-mcp.json` and add your GASSAPI API token:
```json
{
  "auth": {
    "token": "your_actual_gassapi_token_here"
  }
}
```

### 4. Start Server
```bash
# Start with default configuration
node dist/index.js

# Or with specific config file
node dist/index.js --config ./my-config.json
```

## Claude Desktop Integration

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "gassapi": {
      "command": "node",
      "args": ["/full/path/to/mcp2/dist/index.js"],
      "env": {}
    }
  }
}
```

## Available Commands

```bash
# Show help
node dist/index.js --help

# Create sample configuration
node dist/index.js --init --project "Project Name"

# Check server and configuration status
node dist/index.js --status

# Start server (default)
node dist/index.js
```

## Available Tools

### Basic Tools
- **echo**: Echo back messages for testing
- **health_check**: Check server health status
- **test_api**: Test basic HTTP API functionality

### GASSAPI Tools
- **gassapi_auth**: Authenticate with GASSAPI backend
- **gassapi_validate_token**: Validate GASSAPI token
- **gassapi_list_collections**: List API collections
- **gassapi_get_collection**: Get collection details
- **gassapi_send_request**: Send HTTP requests with auth

## Configuration Options

```json
{
  "server": {
    "url": "https://api.gassapi.com",
    "timeout": 30000
  },
  "auth": {
    "token": "your_token_here",
    "expires_at": "2025-10-25T00:00:00Z"
  },
  "collections": {
    "default_collection": "default",
    "auto_save": true
  },
  "logging": {
    "level": "info",
    "file": "optional-log-file.log"
  }
}
```

## Testing

```bash
# Run MCP protocol test
node test-mcp-protocol.js

# Check server status
node dist/index.js --status
```

## Troubleshooting

### Server Won't Start
1. Check Node.js version: `node --version` (should be 16+)
2. Verify build: `npm run build`
3. Check configuration: `node dist/index.js --status`

### Tools Not Working
1. Verify configuration file exists and is valid
2. Check GASSAPI token is properly configured
3. Test with echo tool first: `node test-mcp-protocol.js`

### Authentication Issues
1. Verify token format (should be a string, not empty)
2. Check token expiration if configured
3. Test token validity with `gassapi_validate_token` tool

## Examples

### Basic Usage in Claude Desktop
```
Please list all my GASSAPI collections
```
- Uses: `gassapi_list_collections` tool

```
Send a GET request to https://api.example.com/users
```
- Uses: `gassapi_send_request` tool

```
Check if my GASSAPI token is still valid
```
- Uses: `gassapi_validate_token` tool

### Advanced Configuration
```bash
# Create project with specific ID
node dist/index.js --init --project "My Project" --project-id "proj_123"

# Use custom configuration file
node dist/index.js --config ./production-config.json
```

## File Locations

- **Configuration**: `gassapi-mcp.json`, `gassapi.json`, or `.gassapi.json`
- **Server Code**: `src/` directory
- **Built Code**: `dist/` directory
- **Tests**: `test-mcp-protocol.js`, `test-suite.cjs`

## Support

For issues and questions:
1. Check server status: `node dist/index.js --status`
2. Run tests: `node test-mcp-protocol.js`
3. Verify configuration format and content
4. Check Node.js and npm versions