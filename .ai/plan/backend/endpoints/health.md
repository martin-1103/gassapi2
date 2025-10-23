# 🔔 Health & Status API

## Overview
Basic health check dan system status endpoints untuk monitoring backend service.

---

## GET `/health`
Basic health check endpoint.

### Headers
No authentication required.

### Response (Healthy)
```json
{
  "status": "healthy",
  "timestamp": "2025-01-21T16:30:00Z",
  "uptime": 3600,
  "database": "connected",
  "version": "1.0.0"
}
```

### Response (Unhealthy)
```json
{
  "status": "unhealthy",
  "timestamp": "2025-01-21T16:30:00Z",
  "uptime": 3600,
  "database": "disconnected",
  "error": "Database connection timeout",
  "version": "1.0.0"
}
```

### Health Checks Performed
- **Database Connection**: Verify MySQL connection
- **Memory Usage**: Check available memory
- **Disk Space**: Verify available disk space
- **Response Time**: Service response time check

### Status Values
- `healthy` - All checks passed
- `unhealthy` - One or more checks failed
- `degraded` - Service functional but with issues

---

## GET `/status`
Detailed system status endpoint.

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "api": "operational",
  "database": "operational",
  "activeUsers": 42,
  "activeProjects": 128,
  "totalEndpoints": 1024,
  "totalCollections": 256,
  "uptime": 86400,
  "version": "1.0.0",
  "environment": "production",
  "timestamp": "2025-01-21T16:30:00Z",
  "metrics": {
    "memory": {
      "used": "256MB",
      "total": "1GB",
      "percentage": 25
    },
    "cpu": {
      "usage": 15.5,
      "cores": 4
    },
    "disk": {
      "used": "10GB",
      "total": "50GB",
      "percentage": 20
    }
  }
}
```

### Component Status Values
- `operational` - Component functioning normally
- `degraded` - Component functional but with issues
- `down` - Component not functioning
- `maintenance` - Component under maintenance

### Metrics Information
- **Active Users**: Users active in last 30 minutes
- **Active Projects**: Projects with recent activity
- **Total Endpoints**: Total endpoints stored
- **Total Collections**: Total collections created
- **Memory Usage**: Current memory consumption
- **CPU Usage**: Current CPU utilization
- **Disk Usage**: Current disk utilization

---

## 🔧 Business Logic

### Health Check Implementation

#### Database Health
```sql
-- Simple connection test
SELECT 1 as health_check;

-- Performance test
SELECT COUNT(*) FROM users LIMIT 1;
```

#### Service Dependencies
- **MySQL Database**: Primary data store
- **Redis Cache**: Session storage (optional)
- **External APIs**: Third-party integrations (optional)

#### Health Check Frequency
- **Basic Health**: Every request (cached result, 30s TTL)
- **Detailed Status**: Every request with authentication
- **Metrics**: Every request with authentication

### Performance Considerations

#### Response Time Targets
- **Health Check**: < 100ms response time
- **Status Endpoint**: < 500ms response time

#### Caching Strategy
- **Health Status**: 30s cache TTL
- **Detailed Metrics**: 60s cache TTL
- **System Stats**: 5s cache TTL

### Security Considerations

#### Public Endpoints
- `/health` - No authentication required

#### Protected Endpoints
- `/status` - Authentication required

#### Rate Limiting
- Health endpoints: No rate limiting
- Status endpoint: Standard rate limiting applies

### Error Handling

#### HTTP Status Codes
- `200` - Service healthy
- `503` - Service unhealthy
- `500` - Internal error during health check

#### Error Response Format
```json
{
  "status": "error",
  "timestamp": "2025-01-21T16:30:00Z",
  "error": "Health check failed",
  "details": {
    "database": "connection_timeout",
    "memory": "critical_usage"
  }
}
```