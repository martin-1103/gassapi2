# GASSAPI - Generate MCP Token

Utilitas untuk generate MCP token - tersedia dalam 2 versi: Public API Endpoint dan CLI Script.

---

## 🌐 Public API Endpoint

Endpoint publik yang bisa dipanggil dari mana saja untuk generate MCP token.

### Endpoint
```
POST http://mapi.gass.web.id/public/generate-mcp-token.php
```

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "YourPassword123",
  "project_id": "proj_1761603583_55943b7f"
}
```

### Response Success (201)

```json
{
  "project": {
    "id": "proj_1761603583_55943b7f",
    "name": "Test Project",
    "description": "Project for testing MCP token generation"
  },
  "mcpClient": {
    "token": "7dcc4740e839770c1cc16fe79b5b96ec29ca574306995036ce319b7e5a8506c0"
  }
}
```

### Response Error (401/403/500)

```json
{
  "success": false,
  "message": "Login failed",
  "error": "Invalid credentials"
}
```

### Example Usage

**cURL:**
```bash
curl -X POST "http://mapi.gass.web.id/public/generate-mcp-token.php" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "YourPassword123",
    "project_id": "proj_xxx"
  }'
```

**JavaScript:**
```javascript
const response = await fetch('http://mapi.gass.web.id/public/generate-mcp-token.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'YourPassword123',
    project_id: 'proj_xxx'
  })
});

const data = await response.json();
console.log(data.mcpClient.token);
```

**Python:**
```python
import requests

response = requests.post(
    'http://mapi.gass.web.id/public/generate-mcp-token.php',
    json={
        'email': 'user@example.com',
        'password': 'YourPassword123',
        'project_id': 'proj_xxx'
    }
)

data = response.json()
print(data['mcpClient']['token'])
```

---

## 💻 CLI Script (PHP)

Script untuk generate MCP token secara otomatis.

### Usage

```bash
php generate-mcp-token.php <email> <password> <project_id>
```

### Example

```bash
php generate-mcp-token.php testuser@example.com MyPassword123 proj_1761603583_55943b7f
```

### Parameter

- `email` - Email akun user yang sudah terdaftar
- `password` - Password akun user
- `project_id` - ID project yang ingin di-generate MCP token-nya

### Output

Script akan:
1. Login dengan kredensial yang diberikan
2. Verifikasi akses ke project yang ditentukan
3. Generate MCP token baru untuk project tersebut
4. Test validasi token
5. Menyimpan konfigurasi lengkap ke file JSON

File output: `gassapi_{project_id}.json`

### Sample Output

```
=== GASSAPI MCP Token Generator ===

[1/3] Logging in as: testuser@example.com
✓ Login successful - Welcome, Test User

[2/3] Verifying project access...
✓ Project found: Test Project
  Description: Project for testing MCP token generation

[3/3] Generating MCP token...
✓ MCP token generated successfully

=== MCP Configuration ===

Project Name:  Test Project
Project ID:    proj_1761603583_55943b7f

MCP Token (save this securely):
cc172a7b78228766e1f4cf655f89b415ca7d4fcbb432ac2e92ac2d185e4e6a27

API Base URL:
http://localhost/gassapi2/backend/

Environments:
  - development (default)

✓ Configuration saved to: gassapi_proj_1761603583_55943b7f.json

[Bonus] Testing MCP token validation...
✓ MCP token is valid and working!
  Validated for project: Test Project

=== Done! ===
```

### File Konfigurasi

File JSON yang dihasilkan berisi:
- Project name dan ID
- API base URL
- MCP token (plaintext, simpan dengan aman!)
- MCP validate endpoint
- Daftar environments dengan variabel-variabelnya

### Notes

- MCP token yang di-generate bersifat permanent dan hanya ditampilkan sekali
- Simpan token dengan aman, token ini memberikan akses penuh ke project
- Token dapat direvoke melalui API jika diperlukan
- Script otomatis melakukan validasi token setelah generate
