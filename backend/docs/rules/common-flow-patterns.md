# Common Flow Patterns for AI

## 📚 Pattern Library

Berikut adalah pattern flow yang umum digunakan dan dapat menjadi template untuk AI dalam membuat flow.

## 🔐 Authentication Patterns

### Pattern 1: User Login & Token Management
```json
{
  "name": "User Authentication Flow",
  "description": "Login user and obtain authentication token",
  "flow_inputs": [
    {
      "name": "username",
      "type": "string",
      "required": true,
      "description": "User username"
    },
    {
      "name": "password",
      "type": "password",
      "required": true,
      "description": "User password"
    }
  ],
  "flow_data": {
    "version": "1.0",
    "steps": [
      {
        "id": "login",
        "name": "User Login",
        "method": "POST",
        "url": "{{env.API_URL}}/auth/login",
        "headers": {"Content-Type": "application/json"},
        "body": {
          "username": "{{input.username}}",
          "password": "{{input.password}}"
        },
        "outputs": {
          "accessToken": "response.body.access_token",
          "refreshToken": "response.body.refresh_token",
          "userId": "response.body.user.id",
          "userRole": "response.body.user.role"
        }
      },
      {
        "id": "get_profile",
        "name": "Get User Profile",
        "method": "GET",
        "url": "{{env.API_URL}}/users/{{login.userId}}/profile",
        "headers": {
          "Authorization": "Bearer {{login.accessToken}}"
        },
        "outputs": {
          "profileData": "response.body",
          "permissions": "response.body.permissions"
        }
      }
    ],
    "config": {
      "delay": 0,
      "retryCount": 2,
      "parallel": false
    }
  }
}
```

### Pattern 2: Multi-Step Registration
```json
{
  "name": "User Registration with Verification",
  "description": "Complete registration with email verification",
  "flow_inputs": [
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
    },
    {
      "name": "firstName",
      "type": "string",
      "required": true,
      "description": "User first name"
    },
    {
      "name": "lastName",
      "type": "string",
      "required": true,
      "description": "User last name"
    }
  ],
  "flow_data": {
    "version": "1.0",
    "steps": [
      {
        "id": "create_user",
        "name": "Create User Account",
        "method": "POST",
        "url": "{{env.API_URL}}/auth/register",
        "headers": {"Content-Type": "application/json"},
        "body": {
          "email": "{{input.email}}",
          "password": "{{input.password}}",
          "firstName": "{{input.firstName}}",
          "lastName": "{{input.lastName}}"
        },
        "outputs": {
          "userId": "response.body.user.id",
          "activationToken": "response.body.activation_token",
          "verificationRequired": "response.body.verification_required"
        }
      },
      {
        "id": "send_verification",
        "name": "Send Verification Email",
        "method": "POST",
        "url": "{{env.API_URL}}/auth/send-verification",
        "headers": {"Content-Type": "application/json"},
        "body": {
          "email": "{{input.email}}",
          "token": "{{create_user.activationToken}}"
        },
        "outputs": {
          "emailSent": "response.body.sent",
          "sentAt": "response.body.timestamp"
        }
      },
      {
        "id": "verify_email",
        "name": "Verify Email Token",
        "method": "POST",
        "url": "{{env.API_URL}}/auth/verify-email",
        "body": {
          "token": "{{create_user.activationToken}}"
        },
        "outputs": {
          "verificationStatus": "response.body.status",
          "verifiedAt": "response.body.timestamp"
        }
      }
    ],
    "config": {
      "delay": 1000,
      "retryCount": 3,
      "parallel": false
    }
  }
}
```

## 📊 Data Management Patterns

### Pattern 3: CRUD Operations
```json
{
  "name": "User CRUD Operations",
  "description": "Complete CRUD flow for user management",
  "flow_inputs": [
    {
      "name": "operation",
      "type": "string",
      "required": true,
      "validation": {"allowed_values": ["create", "read", "update", "delete"]},
      "description": "CRUD operation type"
    },
    {
      "name": "userId",
      "type": "string",
      "required": false,
      "description": "User ID (for read, update, delete operations)"
    },
    {
      "name": "userData",
      "type": "object",
      "required": false,
      "description": "User data (for create, update operations)"
    },
    {
      "name": "authToken",
      "type": "string",
      "required": true,
      "description": "Authentication token"
    }
  ],
  "flow_data": {
    "version": "1.0",
    "steps": [
      {
        "id": "validate_operation",
        "name": "Validate Operation Parameters",
        "method": "POST",
        "url": "{{env.API_URL}}/validate/operation",
        "headers": {
          "Authorization": "Bearer {{input.authToken}}",
          "Content-Type": "application/json"
        },
        "body": {
          "operation": "{{input.operation}}",
          "userId": "{{input.userId}}",
          "userData": "{{input.userData}}"
        },
        "outputs": {
          "valid": "response.body.valid",
          "errors": "response.body.errors"
        }
      },
      {
        "id": "execute_crud",
        "name": "Execute CRUD Operation",
        "method": "POST",
        "url": "{{env.API_URL}}/users/crud",
        "headers": {
          "Authorization": "Bearer {{input.authToken}}",
          "Content-Type": "application/json"
        },
        "body": {
          "operation": "{{input.operation}}",
          "userId": "{{input.userId}}",
          "userData": "{{input.userData}}"
        },
        "outputs": {
          "result": "response.body",
          "success": "response.body.success",
          "message": "response.body.message"
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

### Pattern 4: Data Fetch & Transform
```json
{
  "name": "Data Fetch and Transform",
  "description": "Fetch data from API and transform it",
  "flow_inputs": [
    {
      "name": "dataSourceUrl",
      "type": "string",
      "required": true,
      "validation": {"pattern": "^https?://.+"},
      "description": "Data source API URL"
    },
    {
      "name": "outputFormat",
      "type": "string",
      "required": true,
      "validation": {"allowed_values": ["json", "csv", "xml"]},
      "description": "Desired output format"
    },
    {
      "name": "filters",
      "type": "object",
      "required": false,
      "description": "Data filtering criteria"
    }
  ],
  "flow_data": {
    "version": "1.0",
    "steps": [
      {
        "id": "fetch_raw_data",
        "name": "Fetch Raw Data",
        "method": "GET",
        "url": "{{input.dataSourceUrl}}",
        "headers": {
          "Accept": "application/json",
          "User-Agent": "GASS-API-Fetcher/1.0"
        },
        "outputs": {
          "rawData": "response.body",
          "responseStatus": "response.status",
          "contentLength": "response.headers.content-length"
        }
      },
      {
        "id": "filter_data",
        "name": "Apply Filters",
        "method": "POST",
        "url": "{{env.API_URL}}/data/filter",
        "headers": {"Content-Type": "application/json"},
        "body": {
          "data": "{{fetch_raw_data.rawData}}",
          "filters": "{{input.filters}}",
          "operation": "filter"
        },
        "outputs": {
          "filteredData": "response.body.data",
          "filterCount": "response.body.count"
        }
      },
      {
        "id": "transform_format",
        "name": "Transform to Target Format",
        "method": "POST",
        "url": "{{env.API_URL}}/data/transform",
        "headers": {"Content-Type": "application/json"},
        "body": {
          "data": "{{filter_data.filteredData}}",
          "targetFormat": "{{input.outputFormat}}",
          "options": {
            "prettyPrint": true,
            "includeHeaders": false
          }
        },
        "outputs": {
          "transformedData": "response.body.data",
          "format": "response.body.format",
          "downloadUrl": "response.body.downloadUrl"
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

## 🔄 Business Logic Patterns

### Pattern 5: Order Processing
```json
{
  "name": "E-commerce Order Processing",
  "description": "Complete order processing workflow",
  "flow_inputs": [
    {
      "name": "orderId",
      "type": "string",
      "required": true,
      "description": "Order ID to process"
    },
    {
      "name": "processType",
      "type": "string",
      "required": true,
      "validation": {"allowed_values": ["validate", "process", "ship", "cancel"]},
      "description": "Order processing type"
    }
  ],
  "flow_data": {
    "version": "1.0",
    "steps": [
      {
        "id": "get_order",
        "name": "Get Order Details",
        "method": "GET",
        "url": "{{env.API_URL}}/orders/{{input.orderId}}",
        "outputs": {
          "orderData": "response.body",
          "orderStatus": "response.body.status",
          "totalAmount": "response.body.total",
          "customerId": "response.body.customer_id"
        }
      },
      {
        "id": "validate_inventory",
        "name": "Check Inventory Availability",
        "method": "POST",
        "url": "{{env.API_URL}}/inventory/check",
        "headers": {"Content-Type": "application/json"},
        "body": {
          "items": "{{get_order.orderData.items}}",
          "checkAvailability": true
        },
        "outputs": {
          "allAvailable": "response.body.all_available",
          "unavailableItems": "response.body.unavailable_items",
          "stockCheckId": "response.body.check_id"
        }
      },
      {
        "id": "process_payment",
        "name": "Process Payment",
        "method": "POST",
        "url": "{{env.API_URL}}/payments/process",
        "headers": {"Content-Type": "application/json"},
        "body": {
          "orderId": "{{input.orderId}}",
          "amount": "{{get_order.totalAmount}}",
          "customerId": "{{get_order.customerId}}"
        },
        "outputs": {
          "paymentId": "response.body.payment_id",
          "paymentStatus": "response.body.status",
          "transactionId": "response.body.transaction_id"
        }
      },
      {
        "id": "update_order_status",
        "name": "Update Order Status",
        "method": "PUT",
        "url": "{{env.API_URL}}/orders/{{input.orderId}}/status",
        "headers": {"Content-Type": "application/json"},
        "body": {
          "status": "processing",
          "paymentId": "{{process_payment.paymentId}}",
          "processedAt": "{{env.CURRENT_TIMESTAMP}}"
        },
        "outputs": {
          "updated": "response.body.updated",
          "newStatus": "response.body.status"
        }
      }
    ],
    "config": {
      "delay": 0,
      "retryCount": 3,
      "parallel": false
    }
  }
}
```

### Pattern 6: Notification Workflow
```json
{
  "name": "Multi-Channel Notification Flow",
  "description": "Send notifications through multiple channels",
  "flow_inputs": [
    {
      "name": "notificationType",
      "type": "string",
      "required": true,
      "validation": {"allowed_values": ["email", "sms", "push", "webhook"]},
      "description": "Notification channel type"
    },
    {
      "name": "recipient",
      "type": "string",
      "required": true,
      "description": "Notification recipient"
    },
    {
      "name": "message",
      "type": "string",
      "required": true,
      "description": "Notification message content"
    },
    {
      "name": "templateId",
      "type": "string",
      "required": false,
      "description": "Notification template ID"
    }
  ],
  "flow_data": {
    "version": "1.0",
    "steps": [
      {
        "id": "validate_recipient",
        "name": "Validate Recipient",
        "method": "POST",
        "url": "{{env.API_URL}}/notifications/validate",
        "headers": {"Content-Type": "application/json"},
        "body": {
          "type": "{{input.notificationType}}",
          "recipient": "{{input.recipient}}"
        },
        "outputs": {
          "valid": "response.body.valid",
          "validatedRecipient": "response.body.formatted_recipient"
        }
      },
      {
        "id": "prepare_notification",
        "name": "Prepare Notification Content",
        "method": "POST",
        "url": "{{env.API_URL}}/notifications/prepare",
        "headers": {"Content-Type": "application/json"},
        "body": {
          "type": "{{input.notificationType}}",
          "message": "{{input.message}}",
          "templateId": "{{input.templateId}}",
          "variables": {
            "recipient": "{{validate_recipient.validatedRecipient}}",
            "timestamp": "{{env.CURRENT_TIMESTAMP}}"
          }
        },
        "outputs": {
          "preparedContent": "response.body.content",
          "subject": "response.body.subject",
          "attachments": "response.body.attachments"
        }
      },
      {
        "id": "send_notification",
        "name": "Send Notification",
        "method": "POST",
        "url": "{{env.API_URL}}/notifications/send",
        "headers": {"Content-Type": "application/json"},
        "body": {
          "type": "{{input.notificationType}}",
          "recipient": "{{validate_recipient.validatedRecipient}}",
          "content": "{{prepare_notification.preparedContent}}",
          "subject": "{{prepare_notification.subject}}",
          "attachments": "{{prepare_notification.attachments}}"
        },
        "outputs": {
          "notificationId": "response.body.notification_id",
          "sent": "response.body.sent",
          "sentAt": "response.body.sent_at",
          "deliveryStatus": "response.body.delivery_status"
        }
      }
    ],
    "config": {
      "delay": 0,
      "retryCount": 5,
      "parallel": false
    }
  }
}
```

## 🧪 Testing Patterns

### Pattern 7: API Health Check
```json
{
  "name": "API Health Check Flow",
  "description": "Check health status of multiple API endpoints",
  "flow_inputs": [
    {
      "name": "services",
      "type": "array",
      "required": true,
      "description": "List of services to check"
    }
  ],
  "flow_data": {
    "version": "1.0",
    "steps": [
      {
        "id": "check_auth_service",
        "name": "Check Auth Service Health",
        "method": "GET",
        "url": "{{env.AUTH_API_URL}}/health",
        "outputs": {
          "status": "response.body.status",
          "responseTime": "response.headers.x-response-time"
        }
      },
      {
        "id": "check_database_service",
        "name": "Check Database Health",
        "method": "GET",
        "url": "{{env.DB_API_URL}}/health",
        "outputs": {
          "status": "response.body.status",
          "connectionPool": "response.body.connection_pool"
        }
      },
      {
        "id": "check_cache_service",
        "name": "Check Cache Health",
        "method": "GET",
        "url": "{{env.CACHE_API_URL}}/health",
        "outputs": {
          "status": "response.body.status",
          "memoryUsage": "response.body.memory_usage"
        }
      },
      {
        "id": "compile_health_report",
        "name": "Compile Health Report",
        "method": "POST",
        "url": "{{env.MONITORING_API_URL}}/reports/health",
        "headers": {"Content-Type": "application/json"},
        "body": {
          "services": {
            "auth": "{{check_auth_service.status}}",
            "database": "{{check_database_service.status}}",
            "cache": "{{check_cache_service.status}}"
          },
          "timestamp": "{{env.CURRENT_TIMESTAMP}}"
        },
        "outputs": {
          "overallStatus": "response.body.overall_status",
          "reportId": "response.body.report_id",
          "alertLevel": "response.body.alert_level"
        }
      }
    ],
    "config": {
      "delay": 100,
      "retryCount": 1,
      "parallel": true
    }
  }
}
```

## 🔧 Utility Patterns

### Pattern 8: Configuration Management
```json
{
  "name": "Configuration Sync Flow",
  "description": "Synchronize configuration across services",
  "flow_inputs": [
    {
      "name": "configType",
      "type": "string",
      "required": true,
      "validation": {"allowed_values": ["api", "database", "cache", "security"]},
      "description": "Configuration type to sync"
    },
    {
      "name": "environments",
      "type": "array",
      "required": true,
      "description": "Target environments"
    }
  ],
  "flow_data": {
    "version": "1.0",
    "steps": [
      {
        "id": "fetch_master_config",
        "name": "Fetch Master Configuration",
        "method": "GET",
        "url": "{{env.CONFIG_API_URL}}/config/{{input.configType}}/master",
        "outputs": {
          "masterConfig": "response.body",
          "version": "response.body.version",
          "lastModified": "response.body.last_modified"
        }
      },
      {
        "id": "validate_config",
        "name": "Validate Configuration",
        "method": "POST",
        "url": "{{env.CONFIG_API_URL}}/config/validate",
        "headers": {"Content-Type": "application/json"},
        "body": {
          "config": "{{fetch_master_config.masterConfig}}",
          "type": "{{input.configType}}"
        },
        "outputs": {
          "valid": "response.body.valid",
          "errors": "response.body.errors",
          "warnings": "response.body.warnings"
        }
      },
      {
        "id": "sync_to_environments",
        "name": "Sync to Target Environments",
        "method": "POST",
        "url": "{{env.CONFIG_API_URL}}/config/sync",
        "headers": {"Content-Type": "application/json"},
        "body": {
          "configType": "{{input.configType}}",
          "config": "{{fetch_master_config.masterConfig}}",
          "environments": "{{input.environments}}",
          "force": false
        },
        "outputs": {
          "syncId": "response.body.sync_id",
          "syncResults": "response.body.results",
          "failedEnvironments": "response.body.failed"
        }
      }
    ],
    "config": {
      "delay": 0,
      "retryCount": 3,
      "parallel": false
    }
  }
}
```

## 🎯 Pattern Selection Guide

### When to Use Which Pattern:

| Use Case | Recommended Pattern | Key Features |
|---------|-------------------|-------------|
| **User Management** | Pattern 1, 2 | Login, registration, verification |
| **Data Operations** | Pattern 3, 4 | CRUD, fetch, transform |
| **E-commerce** | Pattern 5 | Order processing, inventory |
| **Communications** | Pattern 6 | Multi-channel notifications |
| **System Monitoring** | Pattern 7 | Health checks, monitoring |
| **DevOps** | Pattern 8 | Configuration, deployment |

### Pattern Customization Rules:
1. **Always** keep the basic structure
2. **Customize** flow_inputs for your specific needs
3. **Modify** step logic for your business requirements
4. **Ensure** variable references are correct
5. **Test** thoroughly before deployment

---

**AI/LLM harus menggunakan pattern ini sebagai template dasar dan menyesuaikan sesuai kebutuhan spesifik!**