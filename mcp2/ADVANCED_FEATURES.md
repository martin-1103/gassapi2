# GASSAPI MCP Server v2 - Advanced Features Guide

## 🚀 Overview

GASSAPI MCP Server v2 telah diperluas dengan **16 tools** yang komprehensif, termasuk **8 advanced tools** untuk manajemen environment, variables, dan fitur-fitur canggih lainnya.

## 📊 **Tool Categories**

### Basic Tools (3 tools)
- **echo**: Testing tool untuk echo back messages
- **health_check**: Monitor server health dan status
- **test_api**: Basic HTTP API testing

### Core GASSAPI Tools (5 tools)
- **gassapi_auth**: Autentikasi dengan backend GASSAPI
- **gassapi_validate_token**: Validasi token GASSAPI
- **gassapi_list_collections**: Daftar koleksi API
- **gassapi_get_collection**: Detail koleksi spesifik
- **gassapi_send_request**: Kirim HTTP request dengan auth

### 🆕 Advanced Tools (8 tools)
- **gassapi_list_environments**: Daftar environment GASSAPI
- **gassapi_get_environment**: Detail environment dan variables
- **gassapi_set_variable**: Set/update variable di environment
- **gassapi_interpolate_variables**: Interpolasi variables dalam template
- **gassapi_session_info**: Informasi session dan token status
- **gassapi_run_collection**: Jalankan semua request dalam koleksi
- **gassapi_export_collection**: Export koleksi ke berbagai format
- **gassapi_refresh_token**: Refresh authentication token

---

## 🌍 **Environment Management**

### List Environments
```bash
# Daftar semua environment yang tersedia
{
  "name": "gassapi_list_environments",
  "arguments": {}
}
```

**Response Example:**
```json
{
  "success": true,
  "environments": [
    {
      "id": "env_1",
      "name": "Development",
      "description": "Development environment",
      "variables": {
        "API_URL": "https://dev-api.example.com",
        "DEBUG": "true"
      },
      "created_at": "2025-10-24T06:00:00Z",
      "updated_at": "2025-10-24T06:30:00Z"
    },
    {
      "id": "env_2",
      "name": "Production",
      "description": "Production environment",
      "variables": {
        "API_URL": "https://api.example.com",
        "DEBUG": "false"
      },
      "created_at": "2025-10-24T07:00:00Z",
      "updated_at": "2025-10-24T07:15:00Z"
    }
  ]
}
```

### Get Environment Details
```bash
# Ambil detail environment beserta variables
{
  "name": "gassapi_get_environment",
  "arguments": {
    "environment_id": "env_1"
  }
}
```

**Response Example:**
```json
{
  "success": true,
  "environment": {
    "id": "env_1",
    "variables": {
      "API_URL": "https://api.example.com",
      "API_KEY": "your-api-key",
      "TIMEOUT": "30000",
      "DEBUG": "false",
      "VERSION": "1.0.0"
    },
    "retrieved_at": "2025-10-24T08:27:00.000Z"
  }
}
```

---

## 🔧 **Variable Management**

### Set/Update Variable
```bash
# Set atau update variable di environment
{
  "name": "gassapi_set_variable",
  "arguments": {
    "environment_id": "env_1",
    "key": "NEW_API_KEY",
    "value": "new-api-key-12345",
    "secret": true
  }
}
```

**Response Example:**
```json
{
  "success": true,
  "variable": {
    "environment_id": "env_1",
    "key": "NEW_API_KEY",
    "value": "*** (hidden)",
    "secret": true,
    "updated_at": "2025-10-24T08:27:00.000Z",
    "status": "success"
  }
}
```

### Variable Interpolation
```bash
# Interpolasi variables dalam template string
{
  "name": "gassapi_interpolate_variables",
  "arguments": {
    "template": "Hello {{name}}, your API key is {{API_KEY}} and URL is {{API_URL}}",
    "environment_id": "env_1",
    "additional_variables": {
      "name": "John Doe"
    }
  }
}
```

**Response Example:**
```json
{
  "success": true,
  "result": {
    "original": "Hello {{name}}, your API key is {{API_KEY}} and URL is {{API_URL}}",
    "interpolated": "Hello John Doe, your API key is your-api-key and URL is https://api.example.com",
    "variables_count": 3,
    "variables_used": ["name", "API_KEY", "API_URL"],
    "environment_id": "env_1",
    "interpolated_at": "2025-10-24T08:27:00.000Z"
  }
}
```

---

## 📚 **Collection Management**

### Run Collection
```bash
# Jalankan semua request dalam koleksi
{
  "name": "gassapi_run_collection",
  "arguments": {
    "collection_id": "col_1",
    "environment_id": "env_1",
    "parallel": false,
    "timeout": 30
  }
}
```

**Response Example:**
```json
{
  "success": true,
  "execution": {
    "collection_id": "col_1",
    "collection_name": "API Testing Collection",
    "requests_executed": 3,
    "parallel_execution": false,
    "total_time": 1500,
    "results": [
      {
        "request_id": "req_1",
        "request_name": "Get User Profile",
        "method": "GET",
        "url": "/api/users/{{userId}}",
        "status": "success",
        "response_time": 450,
        "status_code": 200,
        "executed_at": "2025-10-24T08:27:00.000Z"
      },
      {
        "request_id": "req_2",
        "request_name": "Create User",
        "method": "POST",
        "url": "/api/users",
        "status": "success",
        "response_time": 780,
        "status_code": 201,
        "executed_at": "2025-10-24T08:27:00.000Z"
      }
    ],
    "executed_at": "2025-10-24T08:27:00.000Z"
  }
}
```

### Export Collection
```bash
# Export koleksi ke berbagai format
{
  "name": "gassapi_export_collection",
  "arguments": {
    "collection_id": "col_1",
    "format": "json",
    "include_variables": true
  }
}
```

**Supported Formats:**
- **json**: Standard JSON format
- **yaml**: YAML format with metadata
- **postman**: Postman collection format
- **insomnia**: Insomnia collection format

---

## 🔐 **Session Management**

### Session Information
```bash
# Informasi session dan token status
{
  "name": "gassapi_session_info",
  "arguments": {}
}
```

**Response Example:**
```json
{
  "success": true,
  "session": {
    "client_status": {
      "connected": true,
      "server_url": "https://api.gassapi.com",
      "token_configured": true,
      "token_expired": false
    },
    "project_info": {
      "project_name": "My GASSAPI Project",
      "project_id": "proj_123456789"
    },
    "config_file": "gassapi-mcp.json",
    "current_time": "2025-10-24T08:27:00.000Z"
  }
}
```

### Token Refresh
```bash
# Refresh authentication token
{
  "name": "gassapi_refresh_token",
  "arguments": {
    "refresh_token": "optional-refresh-token"
  }
}
```

---

## 🎯 **Use Cases & Examples**

### 1. **API Testing Workflow**
```bash
# 1. Check session status
gassapi_session_info

# 2. List available collections
gassapi_list_collections

# 3. Run collection with specific environment
gassapi_run_collection {
  "collection_id": "col_1",
  "environment_id": "env_production",
  "parallel": false
}

# 4. Export results for documentation
gassapi_export_collection {
  "collection_id": "col_1",
  "format": "json",
  "include_variables": true
}
```

### 2. **Environment Variable Management**
```bash
# 1. List environments
gassapi_list_environments

# 2. Update environment variable
gassapi_set_variable {
  "environment_id": "env_staging",
  "key": "API_ENDPOINT",
  "value": "https://staging-api.example.com",
  "secret": false
}

# 3. Test variable interpolation
gassapi_interpolate_variables {
  "template": "Request to {{API_ENDPOINT}}/users",
  "environment_id": "env_staging"
}
```

### 3. **Dynamic Configuration**
```bash
# Interpolate API endpoint with environment variables
gassapi_interpolate_variables {
  "template": "{{API_BASE_URL}}/v1/{{resource}}?key={{API_KEY}}",
  "environment_id": "env_current"
}

# Send interpolated request
gassapi_send_request {
  "url": "{{interpolated_url}}",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer {{API_TOKEN}}"
  }
}
```

---

## 🔧 **Configuration**

### Environment Variables Configuration
```json
{
  "environments": {
    "default": "env_1",
    "development": "env_1",
    "staging": "env_2",
    "production": "env_3"
  },
  "variable_defaults": {
    "timeout": "30000",
    "retry_count": "3"
  }
}
```

### Advanced Tool Settings
```json
{
  "advanced": {
    "collection_execution": {
      "default_timeout": 30,
      "max_parallel_requests": 5,
      "default_format": "json"
    },
    "variable_management": {
      "auto_save": true,
      "secret_masking": true
    }
  }
}
```

---

## 📈 **Performance Metrics**

### Response Times (Average)
- **Basic Tools**: <50ms
- **GASSAPI Tools**: 100-200ms
- **Advanced Tools**: 200-500ms
- **Collection Execution**: 500ms-5s (tergantung jumlah requests)

### Resource Usage
- **Memory**: ~80-120MB (16 tools loaded)
- **CPU**: Minimal during idle, peaks during tool execution
- **Network**: Dependent on API calls to GASSAPI backend

---

## 🛡️ **Security Features**

### Variable Security
- **Secret Masking**: Variables marked as `secret` akan disembunyikan di output
- **Environment Isolation**: Variables terisolasi per environment
- **Access Control**: Token validation untuk semua operasi

### Token Management
- **Automatic Refresh**: Token refresh saat mendekati expiry
- **Secure Storage**: Token disimpan secara aman di configuration
- **Session Tracking**: Monitoring session status dan health

---

## 🚨 **Error Handling**

### Common Error Scenarios
1. **Invalid Token**: Token kadaluars atau tidak valid
2. **Environment Not Found**: Environment ID tidak ditemukan
3. **Variable Not Found**: Variable tidak ada di environment
4. **Collection Empty**: Koleksi tidak memiliki request
5. **Network Timeout**: Request ke backend GASSAPI timeout

### Error Response Format
```json
{
  "success": false,
  "error": "Environment not found",
  "message": "Environment with ID 'invalid_env' does not exist",
  "error_code": "ENV_NOT_FOUND"
}
```

---

## 📝 **Best Practices**

### 1. **Environment Organization**
- Gunakan environment yang jelas: `development`, `staging`, `production`
- Kelompokkan variables berdasarkan fungsi dan scope
- Dokumentasikan variable rahasia dengan deskripsi jelas

### 2. **Variable Naming**
- Gunakan naming convention yang konsisten: `UPPER_CASE_WITH_UNDERSCORES`
- Berikan deskripsi yang jelas untuk setiap variable
- Gunakan prefix untuk mengelompokkan: `API_`, `DB_`, `AUTH_`

### 3. **Template Management**
- Simpan template yang kompleks di koleksi GASSAPI
- Gunakan interpolasi untuk nilai-nilai yang dinamis
- Validasi template sebelum interpolasi

### 4. **Collection Organization**
- Kelompokkan request berdasarkan fitur atau endpoint
- Gunakan environment variables untuk endpoint dinamis
- Tambahkan dokumentasi untuk setiap request

### 5. **Error Handling**
- Selalu cek response status sebelum mengambil data
- Implement retry logic untuk operasi network
- Gunakan timeout yang wajar untuk setiap operasi

---

## 🔮 **Integration Examples**

### Claude Desktop Integration
```
User: "Daftar semua environment GASSAPI yang tersedia"
MCP: "✅ Menjalankan gassapi_list_environments..."

User: "Set API endpoint untuk production environment"
MCP: "✅ Menjalankan gassapi_set_variable dengan environment_id='env_production'..."

User: "Jalankan koleksi API Testing dengan environment production"
MCP: "✅ Menjalankan gassapi_run_collection dengan collection_id='col_testing'..."
```

### Automated Testing Workflow
```
1. gassapi_session_info                    # Check connection
2. gassapi_list_collections                  # Get available collections
3. gassapi_list_environments                # Get environments
4. gassapi_run_collection                  # Execute collection
5. gassapi_export_collection               # Export results
```

---

## 📚 **Additional Resources**

- **Basic Usage Guide**: `USAGE.md`
- **Configuration Reference**: Configuration options and examples
- **API Reference**: Detailed tool documentation
- **Troubleshooting Guide**: Common issues and solutions
- **Integration Examples**: Real-world usage scenarios

---

## 🆕 **Future Enhancements**

### Planned Features
- **Batch Operations**: Multiple tool calls in single request
- **Custom Variables**: User-defined variable types and validation
- **Collection Templates**: Pre-built collection templates
- **Environment Cloning**: Duplicate environments dengan variables
- **Advanced Export**: Custom export formats dan templates
- **Real-time Monitoring**: Live execution status dan metrics

### Integration Possibilities
- **CI/CD Pipelines**: Automated testing dan deployment
- **API Documentation**: Auto-generate documentation dari collections
- **Performance Testing**: Load testing dengan koleksi khusus
- **Security Scanning**: Automated security testing

---

## 📞 **Support**

For advanced features support:
1. Check session status: `node dist/index.js --status`
2. Verify configuration: Validate configuration file
3. Test individual tools: Use specific tool calls
4. Check logs: Monitor server logs for detailed information

**Advanced tools provide powerful GASSAPI management capabilities while maintaining simplicity and reliability.** 🚀