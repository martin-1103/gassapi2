# Health Check

## Endpoint
`GET /health`

## Description
Check status kesehatan API dan database.

## Response
### Success (200)
```json
{
  "success": true,
  "message": "API is healthy",
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-20T10:30:00Z",
    "version": "1.0.0",
    "database": {
      "status": "connected",
      "connection": "mysql"
    },
    "uptime": "5 days, 3 hours, 20 minutes"
  }
}
```

### Error (503)
```json
{
  "success": false,
  "message": "Database connection failed",
  "code": 503
}
```

## Example
```
GET /gassapi/backend-php?act=health
```

## Notes
- Tidak memerlukan authentication
- Untuk monitoring dan load balancer
- Check koneksi database
- Return 503 jika database bermasalah