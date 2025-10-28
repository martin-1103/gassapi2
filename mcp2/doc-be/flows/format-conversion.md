# Format Conversion

## Konsep

**Format Conversion** adalah proses otomatis mengkonversi antara **React Flow format** (visual) dan **Steps format** (execution) untuk memastikan konsistensi data dan mendukung kedua use case.

## Conversion Direction

### 1. **React Flow → Steps** (For Execution)
Konversi dari visual format ke execution format saat:
- Flow dibuat dengan React Flow format
- UI update dengan React Flow format

### 2. **Steps → React Flow** (For Visualization)
Konversi dari execution format ke visual format saat:
- Flow dibuat dengan Steps format
- Flow perlu ditampilkan di UI

## Conversion Logic

### React Flow → Steps Conversion

#### Node Structure Mapping
```json
// React Flow Node
{
  "id": "register_user",
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
      "email": "{{input.email}}"
    },
    "outputs": {
      "userId": "response.body.user.id",
      "token": "response.body.token"
    }
  }
}
```

```json
// Converted Step
{
  "id": "register_user",
  "name": "Register User",
  "method": "POST",
  "url": "{{env.API_URL}}/auth/register",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "username": "{{input.username}}",
    "email": "{{input.email}}"
  },
  "outputs": {
    "userId": "response.body.user.id",
    "token": "response.body.token"
  }
}
```

#### Steps → React Flow Conversion

```json
// Step
{
  "id": "register_user",
  "name": "Register User",
  "method": "POST",
  "url": "{{env.API_URL}}/auth/register",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "username": "{{input.username}}",
    "email": "{{input.email}}"
  },
  "outputs": {
    "userId": "response.body.user.id",
    "token": "response.body.token"
  }
}
```

```json
// Converted React Flow Node
{
  "id": "register_user",
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
      "email": "{{input.email}}"
    },
    "outputs": {
      "userId": "response.body.user.id",
      "token": "response.body.token"
    }
  }
}
```

## Node Type Mapping

### 1. **apiCall** → **apiCall**
Direct mapping for API call nodes.

```json
// React Flow
{
  "id": "api_node",
  "type": "apiCall",
  "data": {
    "name": "API Call",
    "method": "POST",
    "url": "https://api.example.com/endpoint",
    "headers": {},
    "body": {},
    "outputs": {}
  }
}

// Steps
{
  "id": "api_node",
  "name": "API Call",
  "method": "POST",
  "url": "https://api.example.com/endpoint",
  "headers": {},
  "body": {},
  "outputs": {}
}
```

### 2. **condition** → **condition**
Conditional branching logic.

```json
// React Flow
{
  "id": "condition_node",
  "type": "condition",
  "data": {
    "name": "Check Condition",
    "condition": "{{step.output}} === 'admin'",
    "trueLabel": "Admin Path",
    "falseLabel": "User Path"
  }
}

// Steps
{
  "id": "condition_node",
  "name": "Check Condition",
  "condition": "{{step.output}} === 'admin'",
  "trueLabel": "Admin Path",
  "falseLabel": "User Path"
}
```

### 3. **delay** → **delay**
Execution pause.

```json
// React Flow
{
  "id": "delay_node",
  "type": "delay",
  "data": {
    "name": "Wait",
    "duration": 5000
  }
}

// Steps
{
  "id": "delay_node",
  "name": "Wait",
  "delay": 5000
}
```

## Edge Conversion

### React Flow Edges → Steps Configuration

Edges dalam React Flow digunakan untuk:
1. **Flow execution order** (topological sorting)
2. **Conditional branching** logic

```json
// React Flow Edges
[
  {
    "id": "edge_1",
    "source": "node_1",
    "target": "node_2",
    "type": "smoothstep"
  },
  {
    "id": "edge_2",
    "source": "node_2",
    "target": "node_3",
    "type": "smoothstep"
  }
]
```

```json
// Steps Flow Config
{
  "version": "1.0",
  "config": {
    "delay": 0,
    "retryCount": 1,
    "parallel": false
  },
  "steps": [
    // Steps ordered by execution sequence
  ]
}
```

## Automatic Position Calculation

Saat Steps → React Flow conversion, posisi node dihitung otomatis menggunakan formula: `x = index * 250, y = 100`

**Logic:**
- Step pertama (index 0): x = 0 * 250 = 0
- Step kedua (index 1): x = 1 * 250 = 250
- Step ketiga (index 2): x = 2 * 250 = 500
- Semua nodes: y = 100 (satu baris horizontal)

```json
// Steps Input
{
  "steps": [
    {"id": "step_1", "name": "First Step"},
    {"id": "step_2", "name": "Second Step"},
    {"id": "step_3", "name": "Third Step"}
  ]
}
```

```json
// React Flow Output with Auto-Position
{
  "nodes": [
    {
      "id": "step_1",
      "type": "apiCall",
      "position": {"x": 0, "y": 100},
      "data": { "name": "First Step" }
    },
    {
      "id": "step_2",
      "type": "apiCall",
      "position": {"x": 250, "y": 100},
      "data": { "name": "Second Step" }
    },
    {
      "id": "step_3",
      "type": "apiCall",
      "position": {"x": 500, "y": 100},
      "data": { "name": "Third Step" }
    }
  ],
  "edges": [
    {
      "id": "edge_step_1_step_2",
      "source": "step_1",
      "target": "step_2",
      "type": "smoothstep"
    },
    {
      "id": "edge_step_2_step_3",
      "source": "step_2",
      "target": "step_3",
      "type": "smoothstep"
    }
  ]
}
```

## Complete Conversion Examples

### Example 1: Simple API Flow

#### React Flow Format
```json
{
  "nodes": [
    {
      "id": "login",
      "type": "apiCall",
      "position": {"x": 100, "y": 100},
      "data": {
        "name": "User Login",
        "method": "POST",
        "url": "{{env.API_URL}}/auth/login",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "username": "{{input.username}}",
          "password": "{{input.password}}"
        },
        "outputs": {
          "userId": "response.body.user.id",
          "token": "response.body.access_token"
        }
      }
    },
    {
      "id": "get_profile",
      "type": "apiCall",
      "position": {"x": 350, "y": 100},
      "data": {
        "name": "Get User Profile",
        "method": "GET",
        "url": "{{env.API_URL}}/users/{{login.userId}}",
        "headers": {
          "Authorization": "Bearer {{login.token}}"
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-login-profile",
      "source": "login",
      "target": "get_profile",
      "type": "smoothstep"
    }
  ]
}
```

#### Steps Format
```json
{
  "version": "1.0",
  "steps": [
    {
      "id": "login",
      "name": "User Login",
      "method": "POST",
      "url": "{{env.API_URL}}/auth/login",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "username": "{{input.username}}",
        "password": "{{input.password}}"
      },
      "outputs": {
        "userId": "response.body.user.id",
        "token": "response.body.access_token"
      }
    },
    {
      "id": "get_profile",
      "name": "Get User Profile",
      "method": "GET",
      "url": "{{env.API_URL}}/users/{{login.userId}}",
      "headers": {
        "Authorization": "Bearer {{login.token}}"
      }
    }
  ],
  "config": {
    "delay": 0,
    "retryCount": 1,
    "parallel": false
  }
}
```

### Example 2: Complex Flow with Conditions

#### Steps Format
```json
{
  "version": "1.0",
  "steps": [
    {
      "id": "login",
      "name": "User Login",
      "method": "POST",
      "url": "{{env.API_URL}}/auth/login",
      "body": {
        "username": "{{input.username}}",
        "password": "{{input.password}}"
      },
      "outputs": {
        "userId": "response.body.user.id",
        "userRole": "response.body.role",
        "token": "response.body.access_token"
      }
    },
    {
      "id": "check_role",
      "name": "Check User Role",
      "condition": "{{login.userRole}} === 'admin'",
      "trueLabel": "Admin Path",
      "falseLabel": "User Path"
    },
    {
      "id": "admin_dashboard",
      "name": "Load Admin Dashboard",
      "method": "GET",
      "url": "{{env.API_URL}}/admin/dashboard",
      "headers": {
        "Authorization": "Bearer {{login.token}}"
      }
    },
    {
      "id": "user_dashboard",
      "name": "Load User Dashboard",
      "method": "GET",
      "url": "{{env.API_URL}}/user/dashboard",
      "headers": {
        "Authorization": "Bearer {{login.token}}"
      }
    }
  ]
}
```

#### React Flow Format
```json
{
  "nodes": [
    {
      "id": "login",
      "type": "apiCall",
      "position": {"x": 100, "y": 200},
      "data": {
        "name": "User Login",
        "method": "POST",
        "url": "{{env.API_URL}}/auth/login",
        "body": {
          "username": "{{input.username}}",
          "password": "{{input.password}}"
        },
        "outputs": {
          "userId": "response.body.user.id",
          "userRole": "response.body.role",
          "token": "response.body.access_token"
        }
      }
    },
    {
      "id": "check_role",
      "type": "condition",
      "position": {"x": 350, "y": 200},
      "data": {
        "name": "Check User Role",
        "condition": "{{login.userRole}} === 'admin'",
        "trueLabel": "Admin Path",
        "falseLabel": "User Path"
      }
    },
    {
      "id": "admin_dashboard",
      "type": "apiCall",
      "position": {"x": 600, "y": 100},
      "data": {
        "name": "Load Admin Dashboard",
        "method": "GET",
        "url": "{{env.API_URL}}/admin/dashboard",
        "headers": {
          "Authorization": "Bearer {{login.token}}"
        }
      }
    },
    {
      "id": "user_dashboard",
      "type": "apiCall",
      "position": {"x": 600, "y": 300},
      "data": {
        "name": "Load User Dashboard",
        "method": "GET",
        "url": "{{env.API_URL}}/user/dashboard",
        "headers": {
          "Authorization": "Bearer {{login.token}}"
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-login-check_role",
      "source": "login",
      "target": "check_role",
      "type": "smoothstep"
    },
    {
      "id": "edge-check_role-admin",
      "source": "check_role",
      "target": "admin_dashboard",
      "type": "smoothstep",
      "data": {
        "condition": "true"
      }
    },
    {
      "id": "edge-check_role-user",
      "source": "check_role",
      "target": "user_dashboard",
      "type": "smoothstep",
      "data": {
        "condition": "false"
      }
    }
  ]
}
```

## Validation During Conversion

### React Flow → Steps Validation
```json
// Invalid React Flow (missing required fields)
{
  "nodes": [
    {
      "id": "", // Invalid: empty ID
      "type": "apiCall",
      "data": {} // Invalid: missing name
    }
  ]
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Invalid flow format: Node missing required field 'id', Node missing required field 'name'"
}
```

### Steps → React Flow Validation
```json
// Invalid Steps (missing required fields)
{
  "steps": [
    {
      // Missing 'id' field
      "name": "Test Step",
      "method": "GET",
      "url": "https://api.example.com/test"
    }
  ]
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Invalid flow format: Step missing required field 'id'"
}
```

## Performance Considerations

### Conversion Caching
- Conversion results are cached when possible
- Avoid redundant conversions for same data

### Optimization Strategies
```php
// FlowConverter optimization
class FlowConverter {
    private static $conversionCache = [];

    public static function reactFlowToSteps($reactFlowData) {
        $cacheKey = md5(json_encode($reactFlowData));

        if (isset(self::$conversionCache[$cacheKey])) {
            return self::$conversionCache[$cacheKey];
        }

        $result = self::performConversion($reactFlowData);
        self::$conversionCache[$cacheKey] = $result;

        return $result;
    }
}
```

## Error Handling

### Conversion Failures
```json
{
  "status": "error",
  "message": "Format conversion failed: Unsupported node type 'custom_node'",
  "details": {
    "node_id": "node_123",
    "node_type": "custom_node",
    "supported_types": ["apiCall", "condition", "delay"]
  }
}
```

### Partial Conversion Recovery
- System akan attempt to convert as much as possible
- Failed nodes will be skipped with warning
- Remaining valid data will still be processed

## Testing Conversion

### Unit Test Example
```php
class FlowConverterTest extends TestCase {
    public function testReactFlowToSteps() {
        $reactFlow = [
            'nodes' => [
                [
                    'id' => 'test_node',
                    'type' => 'apiCall',
                    'data' => [
                        'name' => 'Test Node',
                        'method' => 'GET',
                        'url' => 'https://api.test.com'
                    ]
                ]
            ],
            'edges' => []
        ];

        $steps = FlowConverter::reactFlowToSteps($reactFlow);

        $this->assertArrayHasKey('steps', $steps);
        $this->assertEquals('test_node', $steps['steps'][0]['id']);
        $this->assertEquals('Test Node', $steps['steps'][0]['name']);
    }

    public function testStepsToReactFlow() {
        $steps = [
            'version' => '1.0',
            'steps' => [
                [
                    'id' => 'test_step',
                    'name' => 'Test Step',
                    'method' => 'GET',
                    'url' => 'https://api.test.com'
                ]
            ]
        ];

        $reactFlow = FlowConverter::stepsToReactFlow($steps);

        $this->assertArrayHasKey('nodes', $reactFlow);
        $this->assertArrayHasKey('edges', $reactFlow);
        $this->assertEquals('test_step', $reactFlow['nodes'][0]['id']);
        $this->assertEquals('Test Step', $reactFlow['nodes'][0]['data']['name']);
    }
}
```

## Future Enhancements

### Planned Improvements
1. **Custom Node Types**: Support for custom node types
2. **Advanced Positioning**: Smart positioning algorithms
3. **Flow Validation**: Comprehensive flow structure validation
4. **Conversion Analytics**: Track conversion performance
5. **Visual Mapping**: Enhanced visual representation of complex flows

### Extensibility
```php
// Custom converter interface
interface FlowConverterInterface {
    public function convert(array $data): array;
    public function validate(array $data): array;
}

// Custom node converter
class CustomNodeConverter implements FlowConverterInterface {
    public function convert(array $reactFlowNode): array {
        // Custom conversion logic
    }
}
```