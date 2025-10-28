# Flow UI Endpoints

## Konsep

**Flow UI Endpoints** adalah API endpoints khusus untuk mendapatkan dan mengupdate flow dalam **React Flow format** yang digunakan oleh frontend UI.

## Available Endpoints

### 1. **GET /flow/{id}/ui** - Get Flow for UI

Mengambil detail flow dalam format React Flow untuk visualisasi di UI.

#### Request
```bash
GET /gassapi2/backend/?act=flow_detail_ui&id=flow_123
Authorization: Bearer {access_token}
```

#### Response (200)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Flow data for UI",
  "data": {
    "id": "flow_123",
    "name": "User Registration Flow",
    "description": "Complete user registration and verification flow",
    "project_id": "proj_456",
    "folder_id": "fld_789",
    "flow_inputs": [
      {
        "name": "username",
        "type": "string",
        "required": true,
        "validation": {
          "min_length": 3,
          "max_length": 50
        },
        "description": "Username untuk registrasi"
      },
      {
        "name": "email",
        "type": "email",
        "required": true,
        "description": "Email address user"
      },
      {
        "name": "password",
        "type": "password",
        "required": true,
        "validation": {
          "min_length": 8
        },
        "description": "Password user"
      }
    ],
    "flow_data": {
      "nodes": [
        {
          "id": "register",
          "type": "apiCall",
          "position": {"x": 100, "y": 100},
          "data": {
            "name": "Register User",
            "method": "POST",
            "url": "{{env.API_URL}}/auth/register",
            "headers": {
              "Content-Type": "application/json"
            },
            "body": {
              "username": "{{input.username}}",
              "email": "{{input.email}}",
              "password": "{{input.password}}"
            },
            "outputs": {
              "userId": "response.body.user.id",
              "activationToken": "response.body.activation_token"
            }
          }
        },
        {
          "id": "verify_email",
          "type": "apiCall",
          "position": {"x": 350, "y": 100},
          "data": {
            "name": "Verify Email",
            "method": "POST",
            "url": "{{env.API_URL}}/auth/verify-email",
            "body": {
              "token": "{{register.activationToken}}"
            }
          }
        }
      ],
      "edges": [
        {
          "id": "edge-register-verify",
          "source": "register",
          "target": "verify_email",
          "type": "smoothstep"
        }
      ]
    },
    "is_active": 1,
    "created_by": "user_123",
    "created_at": "2025-10-25 10:30:00",
    "updated_at": "2025-10-25 10:30:00"
  }
}
```

#### Error Responses
```json
// 404 - Flow not found
{
  "status": "error",
  "message": "Flow not found"
}

// 403 - Forbidden
{
  "status": "error",
  "message": "Forbidden"
}

// 400 - Invalid flow ID
{
  "status": "error",
  "message": "Flow ID is required"
}
```

### 2. **PUT /flow/{id}/ui** - Update Flow from UI

Mengupdate flow dengan data React Flow format dari UI.

#### Request
```bash
PUT /gassapi2/backend/?act=flow_update_ui&id=flow_123
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Updated User Registration Flow",
  "description": "Updated description",
  "flow_inputs": [
    {
      "name": "username",
      "type": "string",
      "required": true,
      "validation": {
        "min_length": 3,
        "max_length": 50
      }
    },
    {
      "name": "email",
      "type": "email",
      "required": true
    },
    {
      "name": "password",
      "type": "password",
      "required": true,
      "validation": {
        "min_length": 8
      }
    },
    {
      "name": "profile",
      "type": "object",
      "required": false,
      "default": {
        "firstName": "",
        "lastName": ""
      }
    }
  ],
  "flow_data": {
    "nodes": [
      {
        "id": "register",
        "type": "apiCall",
        "position": {"x": 100, "y": 100},
        "data": {
          "name": "Register User",
          "method": "POST",
          "url": "{{env.API_URL}}/auth/register",
          "headers": {
            "Content-Type": "application/json"
          },
          "body": {
            "username": "{{input.username}}",
            "email": "{{input.email}}",
            "password": "{{input.password}}",
            "profile": "{{input.profile}}"
          },
          "outputs": {
            "userId": "response.body.user.id",
            "activationToken": "response.body.activation_token"
          }
        }
      },
      {
        "id": "verify_email",
        "type": "apiCall",
        "position": {"x": 350, "y": 100},
        "data": {
          "name": "Verify Email",
          "method": "POST",
          "url": "{{env.API_URL}}/auth/verify-email",
          "body": {
            "token": "{{register.activationToken}}"
          }
        }
      },
      {
        "id": "send_welcome",
        "type": "apiCall",
        "position": {"x": 600, "y": 100},
        "data": {
          "name": "Send Welcome Email",
          "method": "POST",
          "url": "{{env.API_URL}}/notifications/welcome",
          "body": {
            "userId": "{{register.userId}}"
          }
        }
      }
    ],
    "edges": [
      {
        "id": "edge-register-verify",
        "source": "register",
        "target": "verify_email",
        "type": "smoothstep"
      },
      {
        "id": "edge-verify-welcome",
        "source": "verify_email",
        "target": "send_welcome",
        "type": "smoothstep"
      }
    ]
  },
  "is_active": true
}
```

#### Response (200)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Flow updated",
  "data": {
    "id": "flow_123",
    "name": "Updated User Registration Flow",
    "description": "Updated description",
    "project_id": "proj_456",
    "folder_id": "fld_789",
    "flow_inputs": "[{\"name\":\"username\",\"type\":\"string\",\"required\":true}]",
    "flow_data": "{\"version\":\"1.0\",\"steps\":[...]}",
    "ui_data": "{\"nodes\":[...],\"edges\":[...]}",
    "is_active": 1,
    "created_by": "user_123",
    "created_at": "2025-10-25 10:30:00",
    "updated_at": "2025-10-25 11:00:00"
  }
}
```

#### Error Responses
```json
// 400 - Invalid flow format
{
  "status": "error",
  "message": "Invalid flow format: Node missing required field 'id'"
}

// 400 - Invalid variable references
{
  "status": "error",
  "message": "Invalid variable references: Step 0: Invalid field name 'invalid-field' in reference 'step.invalid-field'"
}

// 404 - Flow not found
{
  "status": "error",
  "message": "Flow not found"
}

// 403 - Forbidden
{
  "status": "error",
  "message": "Forbidden"
}
```

## Node Types Supported

### 1. **apiCall** - Default Node Type
Untuk API calls dengan HTTP methods.

```json
{
  "id": "unique_node_id",
  "type": "apiCall",
  "position": {"x": 100, "y": 100},
  "data": {
    "name": "Node Name",
    "method": "GET|POST|PUT|DELETE|PATCH",
    "url": "https://api.example.com/endpoint/{{input.param}}",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{input.token}}"
    },
    "body": {
      "param1": "{{input.value1}}",
      "param2": "{{step.output}}"
    },
    "outputs": {
      "responseData": "response.body.data",
      "responseStatus": "response.status"
    },
    "tests": [
      "pm.test('Status is 200', () => pm.response.to.have.status(200));"
    ]
  }
}
```

### 2. **condition** - Conditional Node
Untuk branching logic.

```json
{
  "id": "condition_node",
  "type": "condition",
  "position": {"x": 200, "y": 200},
  "data": {
    "name": "Check User Role",
    "condition": "{{step.userRole}} === 'admin'",
    "trueLabel": "Admin Path",
    "falseLabel": "User Path"
  }
}
```

### 3. **delay** - Delay Node
Untuk pause execution.

```json
{
  "id": "delay_node",
  "type": "delay",
  "position": {"x": 300, "y": 300},
  "data": {
    "name": "Wait 5 seconds",
    "duration": 5000
  }
}
```

## Edge Types

### 1. **smoothstep** - Default
Smooth curved connection.

```json
{
  "id": "edge_id",
  "source": "source_node_id",
  "target": "target_node_id",
  "type": "smoothstep"
}
```

### 2. **straight**
Straight line connection.

```json
{
  "id": "edge_id",
  "source": "source_node_id",
  "target": "target_node_id",
  "type": "straight"
}
```

### 3. **step**
Step line connection with corner.

```json
{
  "id": "edge_id",
  "source": "source_node_id",
  "target": "target_node_id",
  "type": "step"
}
```

## UI Integration Examples

### React Flow Integration
```javascript
// Fetch flow data for UI
const fetchFlow = async (flowId) => {
  const response = await fetch(`/gassapi2/backend/?act=flow_detail_ui&id=${flowId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();
  if (result.success) {
    return result.data.flow_data; // React Flow data
  }
  throw new Error(result.message);
};

// Update flow from UI
const updateFlow = async (flowId, flowData) => {
  const response = await fetch(`/gassapi2/backend/?act=flow_update_ui&id=${flowId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: flowData.name,
      description: flowData.description,
      flow_inputs: flowData.flow_inputs,
      flow_data: flowData.flow_data,
      is_active: flowData.is_active
    })
  });

  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message);
};
```

### Vue.js Integration
```javascript
// Vue composition API
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const flowData = ref(null);
    const loading = ref(false);

    const loadFlow = async (flowId) => {
      loading.value = true;
      try {
        const response = await fetch(`/gassapi2/backend/?act=flow_detail_ui&id=${flowId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const result = await response.json();
        if (result.success) {
          flowData.value = result.data.flow_data;
        }
      } catch (error) {
        console.error('Failed to load flow:', error);
      } finally {
        loading.value = false;
      }
    };

    return {
      flowData,
      loading,
      loadFlow
    };
  }
};
```

## Best Practices

### 1. **Error Handling**
Selalu handle error responses dengan baik:
```javascript
try {
  const result = await fetchFlow(flowId);
  setFlowData(result);
} catch (error) {
  setErrorMessage(error.message);
  // Show user-friendly error message
}
```

### 2. **Loading States**
Tampilkan loading saat mengambil data:
```javascript
const [loading, setLoading] = useState(false);
const [flowData, setFlowData] = useState(null);

const loadFlow = async (id) => {
  setLoading(true);
  try {
    const data = await fetchFlow(id);
    setFlowData(data);
  } finally {
    setLoading(false);
  }
};
```

### 3. **Validation di UI**
Validasi flow data sebelum mengirim:
```javascript
const validateFlowData = (nodes, edges) => {
  const errors = [];

  // Check for required fields
  nodes.forEach(node => {
    if (!node.id) errors.push('Node missing ID');
    if (!node.type) errors.push('Node missing type');
    if (!node.data?.name) errors.push('Node missing name');
  });

  // Check for valid edge connections
  edges.forEach(edge => {
    const sourceExists = nodes.find(n => n.id === edge.source);
    const targetExists = nodes.find(n => n.id === edge.target);

    if (!sourceExists) errors.push(`Edge source ${edge.source} not found`);
    if (!targetExists) errors.push(`Edge target ${edge.target} not found`);
  });

  return errors;
};
```

### 4. **Debounced Updates**
Untuk flow editing yang kompleks:
```javascript
import { debounce } from 'lodash';

const debouncedUpdate = debounce(async (flowId, data) => {
  try {
    await updateFlow(flowId, data);
    showSuccessMessage('Flow saved successfully');
  } catch (error) {
    showErrorMessage(error.message);
  }
}, 1000);

// Call debouncedUpdate on every change
```

### 5. **Caching**
Cache flow data untuk performance:
```javascript
const flowCache = new Map();

const fetchFlowWithCache = async (flowId) => {
  if (flowCache.has(flowId)) {
    return flowCache.get(flowId);
  }

  const data = await fetchFlow(flowId);
  flowCache.set(flowId, data);
  return data;
};
```

## Security Considerations

### 1. **Authorization**
Selalu sertakan valid token:
```javascript
const token = localStorage.getItem('token');
if (!token) {
  // Redirect to login
  window.location.href = '/login';
}
```

### 2. **Input Sanitization**
Backend akan otomatis melakukan sanitization pada input.

### 3. **Rate Limiting**
Implement rate limiting untuk update operations.

## Performance Tips

### 1. **Lazy Loading**
Load flow data hanya saat dibutuhkan.

### 2. **Incremental Updates**
Update hanya bagian yang berubah.

### 3. **Minimize Payload**
Hanya kirim field yang berubah saat update.