# Variable References

## Konsep

**Variable References** memungkinkan flow untuk mengakses data dari:
- **Flow Inputs**: Parameter yang diberikan saat flow dijalankan
- **Step Outputs**: Hasil dari step sebelumnya dalam flow
- **Environment Variables**: Konfigurasi environment
- **Headers**: HTTP headers dari request

## Syntax

Variable references menggunakan double curly braces:

```
{{type.fieldName}}
```

## Reference Types

### 1. **Input References** - `{{input.fieldName}}`

Reference ke flow inputs yang didefinisikan dalam `flow_inputs`.

```json
{
  "flow_inputs": [
    {
      "name": "username",
      "type": "string",
      "required": true
    },
    {
      "name": "authToken",
      "type": "string",
      "required": true
    }
  ]
}
```

**Usage:**
```json
{
  "url": "https://api.example.com/users/{{input.username}}",
  "headers": {
    "Authorization": "Bearer {{input.authToken}}"
  }
}
```

### 2. **Step Output References** - `{{stepId.outputName}}`

Reference ke output dari step sebelumnya dalam flow.

```json
{
  "steps": [
    {
      "id": "login",
      "method": "POST",
      "url": "/auth/login",
      "body": {
        "username": "{{input.username}}",
        "password": "{{input.password}}"
      },
      "outputs": {
        "userId": "response.body.user.id",
        "sessionToken": "response.body.token"
      }
    },
    {
      "id": "getProfile",
      "method": "GET",
      "url": "/users/{{login.userId}}/profile",
      "headers": {
        "Authorization": "Bearer {{login.sessionToken}}"
      }
    }
  ]
}
```

### 3. **Environment References** - `{{env.variableName}}`

Reference ke environment variables sistem.

```json
{
  "url": "https://{{env.API_DOMAIN}}/users",
  "headers": {
    "X-API-Key": "{{env.API_KEY}}"
  }
}
```

### 4. **Header References** - `{{headers.headerName}}`

Reference ke HTTP headers dari request saat ini.

```json
{
  "headers": {
    "X-Request-ID": "{{headers.X-Request-ID}}",
    "X-User-Agent": "{{headers.User-Agent}}"
  }
}
```

## Validation Rules

### Format Validation
- **Required**: Variable reference harus memiliki format `type.field`
- **Type Validation**: `type` harus valid (`input`, `env`, `headers`, atau step ID yang valid)
- **Field Validation**: `field` harus valid variable name

### Step ID Validation
Step ID reference harus:
- Mengikuti pattern: `[a-zA-Z_][a-zA-Z0-9_]*`
- Merujuk ke step yang ada dalam flow
- Tidak boleh mengandung karakter spesial

### Field Name Validation
Field name harus:
- Mengikuti pattern: `[a-zA-Z_][a-zA-Z0-9_]*`
- Tidak boleh kosong
- Tidak boleh mengandung karakter spesial (`-`, ` `, dll)

## Error Examples

### Invalid Format (No Dot)
```json
{
  "url": "/test/{{invalidreference}}"
}
```
**Error**: `Invalid variable reference format 'invalidreference'. Expected format: type.field`

### Invalid Field Name
```json
{
  "url": "/test/{{step.invalid-field}}"
}
```
**Error**: `Invalid field name 'invalid-field' in reference 'step.invalid-field'`

### Invalid Type
```json
{
  "url": "/test/{{@invalid.type}}"
}
```
**Error**: `Invalid reference type '@invalid.type'. Must be one of: input, env, headers or a valid step ID`

## Real-World Examples

### E-commerce Order Processing
```json
{
  "flow_inputs": [
    {
      "name": "customerId",
      "type": "string",
      "required": true
    },
    {
      "name": "productId",
      "type": "string",
      "required": true
    },
    {
      "name": "quantity",
      "type": "number",
      "required": true,
      "validation": {"min": 1, "max": 10}
    }
  ],
  "steps": [
    {
      "id": "getProduct",
      "method": "GET",
      "url": "{{env.API_BASE_URL}}/products/{{input.productId}}",
      "outputs": {
        "productPrice": "response.body.price",
        "productStock": "response.body.stock"
      }
    },
    {
      "id": "checkStock",
      "method": "POST",
      "url": "{{env.API_BASE_URL}}/inventory/check",
      "body": {
        "productId": "{{input.productId}}",
        "quantity": "{{input.quantity}}"
      },
      "outputs": {
        "available": "response.body.available"
      }
    },
    {
      "id": "createOrder",
      "method": "POST",
      "url": "{{env.API_BASE_URL}}/orders",
      "headers": {
        "Authorization": "Bearer {{headers.Authorization}}",
        "X-Request-ID": "{{headers.X-Request-ID}}"
      },
      "body": {
        "customerId": "{{input.customerId}}",
        "productId": "{{input.productId}}",
        "quantity": "{{input.quantity}}",
        "unitPrice": "{{getProduct.productPrice}}",
        "totalAmount": "{{getProduct.productPrice}} * {{input.quantity}}"
      },
      "outputs": {
        "orderId": "response.body.id",
        "orderStatus": "response.body.status"
      }
    }
  ]
}
```

### User Authentication Flow
```json
{
  "flow_inputs": [
    {
      "name": "username",
      "type": "string",
      "required": true
    },
    {
      "name": "password",
      "type": "password",
      "required": true
    }
  ],
  "steps": [
    {
      "id": "login",
      "method": "POST",
      "url": "{{env.AUTH_URL}}/login",
      "body": {
        "username": "{{input.username}}",
        "password": "{{input.password}}"
      },
      "outputs": {
        "accessToken": "response.body.access_token",
        "refreshToken": "response.body.refresh_token",
        "userId": "response.body.user.id"
      }
    },
    {
      "id": "getUserProfile",
      "method": "GET",
      "url": "{{env.API_URL}}/users/{{login.userId}}",
      "headers": {
        "Authorization": "Bearer {{login.accessToken}}"
      },
      "outputs": {
        "userRole": "response.body.role",
        "permissions": "response.body.permissions"
      }
    },
    {
      "id": "logActivity",
      "method": "POST",
      "url": "{{env.LOG_URL}}/activities",
      "headers": {
        "Authorization": "Bearer {{env.LOG_API_KEY}}"
      },
      "body": {
        "userId": "{{login.userId}}",
        "action": "login",
        "userAgent": "{{headers.User-Agent}}",
        "ipAddress": "{{headers.X-Forwarded-For}}"
      }
    }
  ]
}
```

## React Flow Format Examples

### Node with Variable References
```json
{
  "id": "api_call_node",
  "type": "apiCall",
  "position": {"x": 100, "y": 100},
  "data": {
    "name": "Get User Data",
    "method": "GET",
    "url": "{{env.API_URL}}/users/{{input.userId}}",
    "headers": {
      "Authorization": "Bearer {{input.authToken}}",
      "X-Request-ID": "{{headers.X-Request-ID}}"
    },
    "outputs": {
      "userData": "response.body",
      "userRole": "response.body.role"
    }
  }
}
```

### Edge with Variable References
```json
{
  "id": "edge_with_condition",
  "source": "node_1",
  "target": "node_2",
  "type": "smoothstep",
  "data": {
    "condition": "{{node_1.userRole}} === 'admin'"
  }
}
```

## Best Practices

### 1. **Use Descriptive Names**
```json
// ✅ Good
"{{login.accessToken}}"
"{{getUserData.userId}}"

// ❌ Avoid
"{{step1.token}}"
"{{node2.id}}"
```

### 2. **Validate Dependencies**
Pastikan step yang direferensi sudah ada:
```json
// ✅ Correct order
[
  {"id": "login", ...},
  {"id": "getUserData", "url": "/users/{{login.userId}}", ...}
]

// ❌ Wrong order (login not defined yet)
[
  {"id": "getUserData", "url": "/users/{{login.userId}}", ...},
  {"id": "login", ...}
]
```

### 3. **Handle Missing Variables**
System akan validasi referensi dan error jika variable tidak ditemukan.

### 4. **Use Environment for Configuration**
```json
// ✅ Good for config
"{{env.API_URL}}"

// ✅ Good for user data
"{{input.userId}}"

// ✅ Good for step outputs
"{{login.accessToken}}"
```

### 5. **Complex References**
Untuk complex transformations, gunakan step intermediate:
```json
{
  "id": "calculateTotal",
  "method": "POST",
  "url": "{{env.API_URL}}/calculate",
  "body": {
    "price": "{{getProduct.price}}",
    "quantity": "{{input.quantity}}"
  },
  "outputs": {
    "total": "response.body.total"
  }
}
```

## Error Handling

System akan memberikan error yang jelas jika:
- Variable reference format tidak valid
- Step ID tidak ditemukan dalam flow
- Field name tidak valid
- Circular dependencies terdeteksi

Error response:
```json
{
  "status": "error",
  "message": "Invalid variable references: Step 0: Invalid field name 'invalid-field' in reference 'step.invalid-field'"
}
```