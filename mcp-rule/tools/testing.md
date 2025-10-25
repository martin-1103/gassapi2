# Testing Tools

## Available Tools
- `test_endpoint`

## test_endpoint

**Purpose:** Execute HTTP request to test endpoint with environment variables

### Parameters
- **Required:** endpoint_id, environment_id
- **Optional:** override_variables, timeout

### Usage Example
```
test_endpoint(
  endpoint_id: "ep_123",
  environment_id: "env_456"
)

test_endpoint(
  endpoint_id: "ep_123",
  environment_id: "env_456",
  override_variables: {
    "baseUrl": "https://api.test.com",
    "apiKey": "test_key"
  },
  timeout: 60000
)
```

### Returns
- HTTP response status
- Response headers
- Response body
- Response time
- Request details

### Common Mistakes
- ❌ Invalid endpoint_id
- ❌ Invalid environment_id
- ❌ Missing environment variables
- ✅ Use override_variables to test with different values
- ✅ Set appropriate timeout for slow endpoints