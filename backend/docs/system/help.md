# API Help

## Endpoint
`GET /`

## Description
Menampilkan dokumentasi API.

## Response
### Success (200)
```json
{
  "success": true,
  "message": "API Documentation",
  "data": {
    "api_name": "Backend PHP API",
    "version": "1.0.0",
    "base_url": "/gassapi/backend-php",
    "usage": "?act=endpoint_name&id={id}",
    "endpoints": [
      {
        "method": "GET",
        "path": "/",
        "description": "API documentation"
      },
      {
        "method": "GET",
        "path": "/health",
        "description": "Health check"
      }
    ],
    "examples": [
      {
        "description": "Get API help",
        "url": "?act=help"
      },
      {
        "description": "Health check",
        "url": "?act=health"
      }
    ]
  }
}
```

## Example
```
GET /gassapi/backend-php?act=help
```

## Notes
- Tidak memerlukan authentication
- Mengembalikan daftar semua endpoint
- Termasuk contoh penggunaan