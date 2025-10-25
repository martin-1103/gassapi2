# Flow System Overview

## Konsep Dual Format

Sistem flow kami menggunakan **dual format storage** untuk mendukung dua use case utama:

### 🎨 **React Flow Format** (Untuk UI/Frontend)
- **Purpose**: Visual flow builder di frontend
- **Structure**: `nodes` dan `edges` seperti React Flow library
- **Storage**: Disimpan di kolom `ui_data`
- **Usage**: UI visualization, drag-drop interface, visual editing

### ⚙️ **Steps Format** (Untuk Execution)
- **Purpose**: API automation dan test execution
- **Structure**: Array of `steps` dengan konfigurasi API call
- **Storage**: Disimpan di kolom `flow_data`
- **Usage**: External execution engines, API testing, automation

## Arsitektur System

```mermaid
graph TD
    A[Frontend UI] -->|React Flow Format| B[POST /flows]
    C[Execution Engine] -->|Steps Format| B[POST /flows]

    B --> D[Format Detection]
    D -->|React Flow| E[Convert to Steps]
    D -->|Steps| F[Convert to React Flow]

    E --> G[Store: flow_data]
    F --> H[Store: ui_data]

    I[Frontend Request] -->|GET /flow/{id}/ui| J[Return React Flow]
    K[Execution Engine] -->|GET /flow/{id}| L[Return Steps]
```

## Use Case Separation

### 🎯 **React Flow Format - UI Use Cases**
- **Visual Flow Builder**: Drag-drop interface untuk membuat flow
- **Flow Visualization**: Menampilkan flow secara visual dengan nodes dan connections
- **Interactive Editing**: Edit flow melalui UI visual
- **User Experience**: Mudah dipahami oleh non-technical users

### 🔧 **Steps Format - Execution Use Cases**
- **API Automation**: Menjalankan sequence of API calls
- **Test Execution**: Automated testing scenarios
- **External Engines**: Integration dengan execution engines
- **Performance**: Optimized untuk execution speed

## API Endpoint Mapping

### Single Create Endpoint
```
POST /project/{id}/flows
```
- Menerima **React Flow format** atau **Steps format**
- Otomatis deteksi input format
- Simpan kedua format untuk fleksibilitas

### Format-Specific Endpoints
```
# React Flow Format (UI)
GET  /flow/{id}/ui     # Get React Flow format
PUT  /flow/{id}/ui     # Update dengan React Flow

# Steps Format (Execution)
GET  /flow/{id}        # Get Steps format
PUT  /flow/{id}        # Update dengan Steps
```

## Flow Structure Comparison

### React Flow Format (UI)
```json
{
  "nodes": [
    {
      "id": "node_1",
      "type": "apiCall",
      "position": {"x": 100, "y": 100},
      "data": {
        "name": "Register User",
        "method": "POST",
        "url": "/auth/register",
        "headers": {"Content-Type": "application/json"},
        "body": {
          "username": "{{input.username}}",
          "email": "{{input.email}}"
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "source": "node_1",
      "target": "node_2"
    }
  ]
}
```

### Steps Format (Execution)
```json
{
  "version": "1.0",
  "steps": [
    {
      "id": "register",
      "name": "Register User",
      "method": "POST",
      "url": "/auth/register",
      "headers": {"Content-Type": "application/json"},
      "body": {
        "username": "{{input.username}}",
        "email": "{{input.email}}"
      },
      "outputs": {
        "userId": "response.body.user.id",
        "activationToken": "response.body.activation_token"
      }
    }
  ],
  "config": {
    "delay": 1000,
    "retryCount": 2,
    "parallel": false
  }
}
```

## Automatic Conversion

Sistem secara otomatis mengkonversi antar format:

1. **React Flow → Steps**: Untuk keperluan execution
2. **Steps → React Flow**: Untuk keperluan UI visualization
3. **Validation**: Kedua format divalidasi sebelum disimpan
4. **Consistency**: Memastikan data konsisten antar format

## Flow Inputs

Dinamis input definitions yang validasi user input:

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

## Variable References

System untuk referensi data antar steps:

- **`{{input.field}}`**: Reference ke flow inputs
- **`{{stepId.output}}`**: Reference ke output step lain
- **Validation**: Automatic validation untuk broken references

## Benefits

### 🔄 **Flexibility**
- Single backend mendukung multiple frontend types
- Easy integration dengan berbagai execution engines
- Future-proof untuk berbagai use cases

### 🚀 **Performance**
- Optimized format untuk masing-masing use case
- Efficient storage dengan dual format
- Fast conversion antar format

### 🛡️ **Reliability**
- Consistent data antar format
- Comprehensive validation
- Error handling untuk format conversion

## Getting Started

1. **Read [flow-inputs.md](flow-inputs.md)** untuk memahami dynamic inputs
2. **Read [variable-references.md](variable-references.md)** untuk variable system
3. **Read [ui-endpoints.md](ui-endpoints.md)** untuk UI integration
4. **Read [format-conversion.md](format-conversion.md)** untuk conversion logic
5. **Read [validation.md](validation.md)** untuk validation rules