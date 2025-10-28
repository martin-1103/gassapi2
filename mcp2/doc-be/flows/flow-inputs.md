# Flow Inputs

## Konsep

**Flow Inputs** adalah definisi input dinamis yang memungkinkan flow menerima parameter dari user atau sistem eksternal. Input ini divalidasi secara otomatis saat flow dijalankan.

## Struktur Flow Input

```json
{
  "name": "inputName",
  "type": "string",
  "required": true,
  "validation": {
    // validation rules
  },
  "description": "Deskripsi input untuk user",
  "default": "default_value"
}
```

## Input Types yang Didukung

### 1. **string**
Text input untuk data berupa string.

```json
{
  "name": "username",
  "type": "string",
  "required": true,
  "validation": {
    "min_length": 3,
    "max_length": 50
  },
  "description": "Username untuk registrasi"
}
```

**Validation Rules:**
- `min_length`: Minimum panjang string
- `max_length`: Maximum panjang string
- `pattern`: Regex pattern untuk validasi format

### 2. **email**
Email input dengan validasi format email otomatis.

```json
{
  "name": "userEmail",
  "type": "email",
  "required": true,
  "description": "Email address user"
}
```

### 3. **password**
Password input dengan validasi complexity.

```json
{
  "name": "password",
  "type": "password",
  "required": true,
  "validation": {
    "min_length": 8,
    "pattern": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"
  },
  "description": "Password dengan huruf besar, kecil, dan angka"
}
```

### 4. **number**
Numeric input untuk angka.

```json
{
  "name": "userAge",
  "type": "number",
  "required": true,
  "validation": {
    "min": 18,
    "max": 100
  },
  "description": "Usia user (18-100 tahun)"
}
```

**Validation Rules:**
- `min`: Nilai minimum
- `max`: Nilai maximum

### 5. **boolean**
Boolean input untuk true/false.

```json
{
  "name": "isActive",
  "type": "boolean",
  "required": false,
  "default": true,
  "description": "Status aktif user"
}
```

### 6. **object**
Object input untuk data kompleks.

```json
{
  "name": "userProfile",
  "type": "object",
  "required": false,
  "description": "Profile data user",
  "default": {
    "bio": "",
    "location": ""
  }
}
```

### 7. **array**
Array input untuk multiple values.

```json
{
  "name": "tags",
  "type": "array",
  "required": false,
  "validation": {
    "min_items": 1,
    "max_items": 5
  },
  "description": "Tags untuk categorization"
}
```

**Validation Rules:**
- `min_items`: Minimum jumlah items
- `max_items`: Maximum jumlah items

### 8. **file**
File input untuk upload files.

```json
{
  "name": "avatarImage",
  "type": "file",
  "required": false,
  "validation": {
    "allowed_types": ["jpg", "png", "gif"],
    "max_size": "5MB"
  },
  "description": "Avatar image user"
}
```

### 9. **date**
Date input untuk tanggal.

```json
{
  "name": "birthDate",
  "type": "date",
  "required": false,
  "validation": {
    "format": "Y-m-d"
  },
  "description": "Tanggal lahir user"
}
```

### 10. **json**
JSON input untuk complex data structure.

```json
{
  "name": "metadata",
  "type": "json",
  "required": false,
  "description": "Additional metadata in JSON format"
}
```

## Field Properties

### **name** (Required)
- Identifier unik untuk input
- Harus valid variable name: `[a-zA-Z_][a-zA-Z0-9_]*`
- Digunakan dalam variable reference: `{{input.fieldName}}`

### **type** (Required)
- Tipe data input
- Salah satu dari: `string`, `email`, `password`, `number`, `boolean`, `object`, `array`, `file`, `date`, `json`

### **required** (Optional)
- Default: `false`
- Menentukan apakah input wajib diisi

### **validation** (Optional)
- Object dengan validation rules
- Berbeda untuk setiap tipe data
- Divalidasi saat flow dijalankan

### **description** (Optional)
- Deskripsi input untuk user interface
- Membantu user memahami purpose input

### **default** (Optional)
- Default value jika input tidak disediakan
- Hanya untuk input non-required

## Contoh Lengkap Flow Inputs

### User Registration Flow
```json
[
  {
    "name": "username",
    "type": "string",
    "required": true,
    "validation": {
      "min_length": 3,
      "max_length": 30
    },
    "description": "Username untuk registrasi (3-30 karakter)"
  },
  {
    "name": "email",
    "type": "email",
    "required": true,
    "description": "Email address yang valid"
  },
  {
    "name": "password",
    "type": "password",
    "required": true,
    "validation": {
      "min_length": 8,
      "pattern": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"
    },
    "description": "Password minimal 8 karakter dengan huruf besar, kecil, dan angka"
  },
  {
    "name": "confirmPassword",
    "type": "password",
    "required": true,
    "description": "Konfirmasi password"
  },
  {
    "name": "profile",
    "type": "object",
    "required": false,
    "default": {
      "firstName": "",
      "lastName": "",
      "phone": ""
    },
    "description": "Profile data user"
  },
  {
    "name": "agreeTerms",
    "type": "boolean",
    "required": true,
    "description": "Setujui syarat dan ketentuan"
  }
]
```

### API Testing Flow
```json
[
  {
    "name": "baseUrl",
    "type": "string",
    "required": true,
    "validation": {
      "pattern": "^https?://.+"
    },
    "description": "Base URL untuk API testing"
  },
  {
    "name": "authToken",
    "type": "string",
    "required": true,
    "description": "Authentication token untuk API"
  },
  {
    "name": "testUserId",
    "type": "string",
    "required": false,
    "description": "Specific user ID untuk testing (optional)"
  },
  {
    "name": "environment",
    "type": "string",
    "required": false,
    "validation": {
      "options": ["development", "staging", "production"]
    },
    "default": "development",
    "description": "Environment untuk testing"
  },
  {
    "name": "enableRetry",
    "type": "boolean",
    "required": false,
    "default": true,
    "description": "Enable retry logic for failed requests"
  }
]
```

## Penggunaan dalam Flow

### Reference di Flow Steps
```json
{
  "id": "register_user",
  "method": "POST",
  "url": "{{input.baseUrl}}/auth/register",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{input.authToken}}"
  },
  "body": {
    "username": "{{input.username}}",
    "email": "{{input.email}}",
    "password": "{{input.password}}",
    "profile": "{{input.profile}}"
  }
}
```

### Reference di React Flow Nodes
```json
{
  "id": "node_register",
  "type": "apiCall",
  "data": {
    "name": "Register User",
    "method": "POST",
    "url": "{{input.baseUrl}}/auth/register",
    "headers": {
      "Authorization": "Bearer {{input.authToken}}"
    },
    "body": {
      "username": "{{input.username}}",
      "email": "{{input.email}}"
    }
  }
}
```

## Validation Error Messages

Sistem akan mengembalikan error yang jelas jika validation gagal:

```json
{
  "status": "error",
  "message": "Invalid flow inputs: Input username: name is required, Input email: invalid email format"
}
```

## Best Practices

1. **Use Descriptive Names**: `userEmail` lebih baik dari `email`
2. **Provide Clear Descriptions**: Bantu user memahami purpose input
3. **Set Appropriate Validation**: Prevent invalid data
4. **Use Default Values**: Untuk optional inputs
5. **Group Related Inputs**: Use object type untuk complex data
6. **Document Constraints**: Jelaskan batasan dan requirements

## Integration dengan UI

Frontend dapat menggunakan flow inputs untuk:
- Generate dynamic forms
- Show input validation
- Provide help text
- Auto-generate variable references
- Display input requirements