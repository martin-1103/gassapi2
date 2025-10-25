# AI Validation Rules for Flow Creation

## 🛡️ Validation Mandat

AI/LLM WAJIB melakukan validasi berikut sebelum menghasilkan flow:

### **Level 1: Struktur Wajib**

#### 1.1 Flow Structure Validation
```javascript
// ✅ REQUIRED STRUCTURE
{
  "name": string,
  "description": string,
  "flow_inputs": array,    // optional tapi recommended
  "flow_data": {
    "version": "1.0",       // WAJIB
    "steps": array,          // WAJIB
    "config": object         // WAJIB
  }
}
```

#### 1.2 Step Structure Validation
```javascript
// ✅ SETIAP STEP WAJIB
{
  "id": string,             // WAJIB
  "name": string,           // WAJIB
  "method": string,         // WAJIB
  "url": string             // WAJIB
}
```

### **Level 2: Field Validation**

#### 2.1 ID Validation Rules
```javascript
// ✅ BENAR - Valid ID patterns
id: "register_user"
id: "getUserProfile123"
id: "send_email_notification"

// ❌ SALAH - Invalid patterns
id: "register-user"          // ❌ dash tidak valid
id: "register user"          // ❌ space tidak valid
id: "123register"            // ❌ tidak boleh mulai angka
id: "register@user"          // ❌ special char tidak valid
id: ""                       // ❌ tidak boleh kosong

// VALIDATION REGEX: /^[a-zA-Z_][a-zA-Z0-9_]*$/
```

#### 2.2 HTTP Method Validation
```javascript
// ✅ ALLOWED METHODS
method: "GET"
method: "POST"
method: "PUT"
method: "DELETE"
method: "PATCH"

// ❌ FORBIDDEN
method: "HEAD"
method: "OPTIONS"
method: "TRACE"
method: "CONNECT"
method: lowercase_string
```

#### 2.3 URL Validation
```javascript
// ✅ BENAR
url: "https://api.example.com/users"
url: "{{env.API_URL}}/auth/login"
url: "/api/users/{{input.userId}}"
url: "{{step1.response}}/process"

// ❌ SALAH
url: ""                                    // ❌ kosong
url: "not-a-url"                         // ❌ tidak valid URL format
url: "ftp://invalid-protocol.com"        // ❌ hanya HTTP/HTTPS
```

### **Level 3: Variable Reference Validation**

#### 3.1 Reference Format Rules
```javascript
// ✅ BENAR - Valid reference format
{{input.fieldName}}
{{env.VARIABLE_NAME}}
{{stepId.outputField}}
{{headers.HeaderName}}

// ❌ SALAH - Invalid format
{{invalidreference}}                    // ❌ tidak ada dot separator
{{step.invalid-field}}                  // ❌ dash tidak valid
{{@invalid.type}}                       // ❌ special char tidak valid
{{123invalid.field}}                    // ❌ tidak boleh mulai angka
{{}}                                   // ❌ kosong
{{.invalid}}                            // ❌ tidak valid
```

#### 3.2 Reference Type Validation
```javascript
// ✅ ALLOWED TYPES
type: "input"     // Flow inputs
type: "env"       // Environment variables
type: "headers"   // Request headers
type: "stepId"    // Step ID yang valid

// ❌ FORBIDDEN TYPES
type: "system"    // ❌ tidak ada
type: "global"    // ❌ tidak ada
type: "config"    // ❌ tidak ada
```

#### 3.3 Field Name Validation
```javascript
// ✅ BENAR - Valid field names
{{input.username}}
{{env.API_URL}}
{{register_user.userId}}
{{headers.Authorization}}

// ❌ SALAH - Invalid field names
{{input.user-name}}        // ❌ dash tidak valid
{{input.user name}}        // ❌ space tidak valid
{{input.123name}}          // ❌ tidak boleh mulai angka
{{input.@invalid}}         // ❌ special char tidak valid

// VALIDATION REGEX: /^[a-zA-Z_][a-zA-Z0-9_]*$/
```

## 🔍 Validation Algorithms

### Algorithm 1: ID Validation
```javascript
function validateStepId(id) {
  const pattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  return pattern.test(id) && id.length > 0;
}
```

### Algorithm 2: Variable Reference Validation
```javascript
function validateVariableReference(reference) {
  // Step 1: Check format {{type.field}}
  const pattern = /^\{\{([^}]+)\}\}$/;
  if (!pattern.test(reference)) return false;

  // Step 2: Extract type and field
  const content = reference.slice(2, -2);
  const [type, field] = content.split('.');

  // Step 3: Validate type
  const validTypes = ['input', 'env', 'headers'];
  if (!validTypes.includes(type)) {
    // Check if it's a valid step ID
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(type)) return false;
  }

  // Step 4: Validate field
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field)) return false;

  return true;
}
```

### Algorithm 3: URL Validation
```javascript
function validateUrl(url) {
  try {
    // Check if it's a valid URL
    new URL(url);
    return true;
  } catch {
    // If not a full URL, check for template variables
    if (url.includes('{{')) {
      // Basic template URL validation
      return url.length > 0 && url.includes('/');
    }
    return false;
  }
}
```

## 📋 Validation Checklist

### Pre-Creation Checklist
```javascript
const validationSteps = [
  // 1. Structure Validation
  validateFlowStructure(flow),

  // 2. Step Validation
  validateAllSteps(flow.flow_data.steps),

  // 3. Variable Reference Validation
  validateAllVariableReferences(flow),

  // 4. Dependency Validation
  validateStepDependencies(flow),

  // 5. Input Validation
  validateFlowInputs(flow.flow_inputs)
];
```

### Step-by-Step Validation

#### Step 1: Validate Flow Structure
```javascript
function validateFlowStructure(flow) {
  const errors = [];

  // Check required fields
  if (!flow.name) errors.push("Flow name is required");
  if (!flow.flow_data) errors.push("flow_data is required");
  if (flow.flow_data?.version !== "1.0") errors.push("flow_data.version must be '1.0'");
  if (!Array.isArray(flow.flow_data?.steps)) errors.push("flow_data.steps must be array");
  if (typeof flow.flow_data?.config !== "object") errors.push("flow_data.config must be object");

  return errors;
}
```

#### Step 2: Validate All Steps
```javascript
function validateAllSteps(steps) {
  const errors = [];
  const usedIds = new Set();

  steps.forEach((step, index) => {
    // Check required fields
    if (!step.id) errors.push(`Step ${index}: id is required`);
    if (!step.name) errors.push(`Step ${index}: name is required`);
    if (!step.method) errors.push(`Step ${index}: method is required`);
    if (!step.url) errors.push(`Step ${index}: url is required`);

    // Validate ID format
    if (step.id && !validateStepId(step.id)) {
      errors.push(`Step ${index}: invalid id format '${step.id}'`);
    }

    // Check for duplicate IDs
    if (step.id && usedIds.has(step.id)) {
      errors.push(`Step ${index}: duplicate id '${step.id}'`);
    }
    usedIds.add(step.id);

    // Validate HTTP method
    if (step.method && !["GET", "POST", "PUT", "DELETE", "PATCH"].includes(step.method)) {
      errors.push(`Step ${index}: invalid method '${step.method}'`);
    }

    // Validate URL
    if (step.url && !validateUrl(step.url)) {
      errors.push(`Step ${index}: invalid URL '${step.url}'`);
    }
  });

  return errors;
}
```

#### Step 3: Validate Variable References
```javascript
function validateAllVariableReferences(flow) {
  const errors = [];
  const stepIds = flow.flow_data.steps.map(s => s.id);

  flow.flow_data.steps.forEach((step, stepIndex) => {
    // Extract variable references from all string fields
    const references = extractVariableReferences(step);

    references.forEach(ref => {
      const [type, field] = ref.split('.');

      // Validate input references
      if (type === 'input') {
        if (!flow.flow_inputs) {
          errors.push(`Step ${stepIndex}: input reference '${ref}' but no flow_inputs defined`);
        } else {
          const inputExists = flow.flow_inputs.some(input => input.name === field);
          if (!inputExists) {
            errors.push(`Step ${stepIndex}: input field '${field}' not found in flow_inputs`);
          }
        }
      }

      // Validate step references
      if (type !== 'input' && type !== 'env' && type !== 'headers') {
        if (!stepIds.includes(type)) {
          errors.push(`Step ${stepIndex}: step '${type}' not found in flow`);
        }
      }
    });
  });

  return errors;
}
```

## 🚨 Error Messages Format

### Standard Error Format
```javascript
{
  "validation_errors": [
    {
      "type": "structure|field|reference|dependency",
      "step": "step_index or null",
      "field": "field_name or null",
      "message": "Human readable error description",
      "severity": "error|warning"
    }
  ]
}
```

### Common Error Examples
```javascript
// Structure Errors
{
  "type": "structure",
  "message": "Flow name is required",
  "severity": "error"
}

// Field Errors
{
  "type": "field",
  "step": 0,
  "field": "id",
  "message": "Invalid id format 'register-user'",
  "severity": "error"
}

// Reference Errors
{
  "type": "reference",
  "step": 1,
  "message": "Step 'user_data' not found in flow",
  "severity": "error"
}
```

## ⚡ Performance Rules

### Validation Optimization
1. **Early Exit**: Stop at first critical error
2. **Batch Validation**: Validate all fields before returning
3. **Caching**: Cache validation patterns for common flows
4. **Parallel Processing**: Validate multiple sections independently

### Time Complexity
- **Structure Validation**: O(1)
- **Step Validation**: O(n) where n = number of steps
- **Reference Validation**: O(n*m) where n = steps, m = references per step
- **Overall**: O(n*m) acceptable for typical flows (n < 50, m < 20)

---

**AI/LLM HARUS menggunakan validasi ini sebelum menghasilkan flow untuk memastikan 100% akurasi!**