# AI Flow Creation Guidelines

## 🎯 Objective

Panduan lengkap untuk AI/LLM dalam membuat flow yang akurat, valid, dan siap digunakan dalam sistem GASS API.

## 📋 Mandatory Requirements

### 1. **Format Kewajiban**
Gunakan **Steps Format** untuk AI-generated flows:
```json
{
  "version": "1.0",
  "steps": [...],
  "config": {...}
}
```

### 2. **Struktur Step Wajib**
Setiap step WAJIB memiliki field ini:
```json
{
  "id": "unique_step_id",
  "name": "Descriptive Step Name",
  "method": "GET|POST|PUT|DELETE|PATCH",
  "url": "https://api.example.com/endpoint"
}
```

### 3. **Variable Reference Wajib**
Gunakan format `{{type.field}}`:
- ✅ `{{input.username}}`
- ✅ `{{env.API_URL}}`
- ✅ `{{stepName.outputField}}`
- ❌ `{{invalidreference}}` (tidak valid)
- ❌ `{{step.invalid-field}}` (tidak valid)

## 🔥 Critical Rules

### **Rule #1: ID Validation**
```javascript
// ✅ BENAR - Valid variable names
id: "register_user"
id: "getUserProfile"
id: "sendEmail"

// ❌ SALAH - Invalid characters
id: "register-user"  // dash tidak allowed
id: "register user"  // space tidak allowed
id: "123register"    // tidak boleh mulai angka
```

### **Rule #2: Variable References**
```javascript
// ✅ BENAR - Valid references
"url": "{{env.API_URL}}/users/{{input.userId}}"
"headers": {"Authorization": "Bearer {{input.token}}"}
"body": {"data": "{{step1.responseData}}"}

// ❌ SALAH - Invalid format
"url": "{{invalidreference}}"                    // tidak ada dot
"url": "{{step.invalid-field}}"                  // dash tidak valid
"url": "{{@invalid.type}}"                      // special char tidak valid
```

### **Rule #3: Flow Inputs Format**
```json
{
  "name": "username",
  "type": "string|email|password|number|boolean|object|array|file|date|json",
  "required": true|false,
  "validation": {
    // Hanya untuk tipe yang relevan
    "min_length": 3,
    "max_length": 50
  },
  "description": "Clear description for users"
}
```

### **Rule #4: HTTP Method & URL**
```json
{
  "method": "GET|POST|PUT|DELETE|PATCH",
  "url": "https://api.example.com/endpoint{{pathParams}}"
}
```

## 📚 Flow Templates

### Template 1: User Registration
```json
{
  "name": "User Registration Flow",
  "description": "Complete user registration with email verification",
  "flow_inputs": [
    {
      "name": "username",
      "type": "string",
      "required": true,
      "validation": {"min_length": 3, "max_length": 50},
      "description": "Username for registration"
    },
    {
      "name": "email",
      "type": "email",
      "required": true,
      "description": "User email address"
    },
    {
      "name": "password",
      "type": "password",
      "required": true,
      "validation": {"min_length": 8},
      "description": "User password"
    }
  ],
  "flow_data": {
    "version": "1.0",
    "steps": [
      {
        "id": "register",
        "name": "Register User",
        "method": "POST",
        "url": "{{env.API_URL}}/auth/register",
        "headers": {"Content-Type": "application/json"},
        "body": {
          "username": "{{input.username}}",
          "email": "{{input.email}}",
          "password": "{{input.password}}"
        },
        "outputs": {
          "userId": "response.body.user.id",
          "activationToken": "response.body.activation_token"
        }
      },
      {
        "id": "verify_email",
        "name": "Verify Email",
        "method": "POST",
        "url": "{{env.API_URL}}/auth/verify-email",
        "body": {
          "token": "{{register.activationToken}}"
        },
        "outputs": {
          "verificationStatus": "response.body.status"
        }
      }
    ],
    "config": {
      "delay": 0,
      "retryCount": 1,
      "parallel": false
    }
  }
}
```

### Template 2: API Data Fetch
```json
{
  "name": "Data Fetch Flow",
  "description": "Fetch and process data from API",
  "flow_inputs": [
    {
      "name": "apiUrl",
      "type": "string",
      "required": true,
      "validation": {"pattern": "^https?://.+"},
      "description": "Base API URL"
    },
    {
      "name": "authToken",
      "type": "string",
      "required": true,
      "description": "Authentication token"
    },
    {
      "name": "resourceId",
      "type": "string",
      "required": true,
      "description": "Resource ID to fetch"
    }
  ],
  "flow_data": {
    "version": "1.0",
    "steps": [
      {
        "id": "fetch_data",
        "name": "Fetch Resource Data",
        "method": "GET",
        "url": "{{input.apiUrl}}/resources/{{input.resourceId}}",
        "headers": {
          "Authorization": "Bearer {{input.authToken}}",
          "Accept": "application/json"
        },
        "outputs": {
          "resourceData": "response.body",
          "resourceStatus": "response.status"
        }
      },
      {
        "id": "process_data",
        "name": "Process Response Data",
        "method": "POST",
        "url": "{{env.API_URL}}/data/process",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Bearer {{input.authToken}}"
        },
        "body": {
          "data": "{{fetch_data.resourceData}}",
          "processedAt": "{{env.CURRENT_TIMESTAMP}}"
        },
        "outputs": {
          "processResult": "response.body.result",
          "processId": "response.body.id"
        }
      }
    ],
    "config": {
      "delay": 500,
      "retryCount": 2,
      "parallel": false
    }
  }
}
```

## 🚫 Common Mistakes to Avoid

### **Mistake #1: Invalid Field Names**
```json
// ❌ SALAH
{
  "id": "user-data",        // dash tidak valid
  "url": "{{user.info}}"   // step ID tidak ditemukan
}

// ✅ BENAR
{
  "id": "user_data",
  "url": "{{userData.info}}"
}
```

### **Mistake #2: Missing Required Fields**
```json
// ❌ SALAH - Missing method
{
  "id": "step1",
  "name": "Get User",
  "url": "/api/users/1"
}

// ✅ BENAR - Complete step
{
  "id": "step1",
  "name": "Get User",
  "method": "GET",
  "url": "/api/users/1"
}
```

### **Mistake #3: Invalid Variable References**
```json
// ❌ SALAH
{
  "url": "/users/{{user.id}}"  // step 'user' tidak ada
}

// ✅ BENAR
{
  "url": "/users/{{input.userId}}"  // valid input reference
}
```

## ✅ Validation Checklist

Before finalizing flow, verify:

### [ ] Structure Validation
- [ ] All steps have `id`, `name`, `method`, `url`
- [ ] `flow_inputs` array valid (optional but recommended)
- [ ] `flow_data.version` = "1.0"
- [ ] `flow_data.config` object exists

### [ ] Variable Reference Validation
- [ ] All references use `{{type.field}}` format
- [ ] Input references: `{{input.fieldName}}`
- [ ] Environment references: `{{env.VAR_NAME}}`
- [ ] Step references: `{{stepId.outputField}}`
- [ ] No invalid characters in references

### [ ] Field Name Validation
- [ ] Step IDs: `[a-zA-Z_][a-zA-Z0-9_]*`
- [ ] Input names: `[a-zA-Z_][a-zA-Z0-9_]*`
- [ ] No dashes, spaces, or special chars

### [ ] Data Type Validation
- [ ] HTTP method valid
- [ ] Input types from allowed list
- [ ] Validation rules appropriate for type

### [ ] Logic Validation
- [ ] Step dependencies make sense
- [ ] Variable references reference existing steps/inputs
- [ ] No circular dependencies

## 🎯 Best Practices

### 1. **Naming Conventions**
- **Step IDs**: `register_user`, `fetch_data`, `send_email`
- **Input Names**: `username`, `apiUrl`, `authToken`
- **Descriptive**: Make names self-explanatory

### 2. **Error Prevention**
- Always validate variable references
- Use clear descriptions for inputs
- Include appropriate validation rules

### 3. **Flow Logic**
- Keep steps simple and focused
- Use clear data flow from step to step
- Include outputs for data sharing between steps

### 4. **Security**
- Never hardcode sensitive data
- Use environment variables for API URLs
- Validate all input data types

## 🔧 Implementation Tips

### When Creating Flows:
1. **Start Simple**: Basic flow structure first
2. **Add Variables**: Input definitions clearly
3. **Connect Steps**: Use variable references properly
4. **Validate**: Check all references and syntax
5. **Test**: Ensure flow logic makes sense

### Common Patterns:
- **Authentication**: login → get data → process
- **Data Processing**: fetch → transform → store
- **User Actions**: validate → create → notify

---

**Follow these guidelines to create accurate, valid flows that work correctly in the GASS API system!**