# TODO: Flow Management System Implementation

## 🎯 Overview
Backend untuk menyimpan dan mengelola definisi flow testing. Execution engine akan dihandle oleh sistem terpisah (MCP/Frontend).

## 📋 Fitur-Fitur yang Akan Diimplementasi

### 1. Flow Management CRUD
- [ ] Create Flow - POST /project/{id}/flows
- [ ] List Flows - GET /project/{id}/flows
- [ ] Get Flow Detail - GET /flow/{id}
- [ ] Update Flow - PUT /flow/{id}
- [ ] Delete Flow - DELETE /flow/{id}
- [ ] Duplicate Flow - POST /flow/{id}/duplicate
- [ ] Toggle Active Status - PUT /flow/{id}/toggle-active

### 2. Flow Structure Definition
```json
{
  "flow_inputs": [
    {
      "name": "username",
      "type": "string",
      "required": true,
      "validation": {
        "min_length": 3,
        "pattern": "^[a-zA-Z0-9_]+$"
      }
    }
  ],
  "version": "1.0",
  "steps": [
    {
      "id": "login",
      "name": "User Authentication",
      "method": "POST",
      "url": "{{env.API_BASE_URL}}/auth/login",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "username": "{{input.username}}",
        "password": "{{input.password}}"
      },
      "outputs": {
        "authToken": "response.body.token",
        "userId": "response.body.user.id"
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

### 3. Dynamic Input System
- [ ] Input Definition Support
  - Basic types: string, number, boolean, email, password
  - Complex types: object, array, file, date, json
  - Validation rules: required, min/max, pattern, options
- [ ] Input Usage in Steps
  - Reference format: `{{input.fieldName}}`
  - Support default values
  - Type validation

### 4. Variable Reference System
- [ ] Input Variables: `{{input.fieldName}}`
- [ ] Step Variables: `{{stepId.outputName}}`
- [ ] Environment Variables: `{{env.VAR_NAME}}`
- [ ] Header Variables: `{{headers.headerName}}`

### 5. Flow Configuration
- [ ] Delay: Jeda antar step (ms)
- [ ] Retry Count: Berapa kali retry jika gagal
- [ ] Parallel: Eksekusi paralel atau berurutan

### 6. Metadata Support
- [ ] Created by tracking (user/ai_system)
- [ ] Timestamp management
- [ ] AI-friendly fields (ai_version, generation_strategy, complexity_score)
- [ ] Project/Collection association

## 🔧 IMPLEMENTATION DETAIL

### Phase 1: Fix Core FlowHandler.php
**File: `backend/src/handlers/FlowHandler.php`**

#### 1.1 Create FlowConverter Helper
**File: `backend/src/helpers/FlowConverter.php` (baru)**
- [ ] Method reactFlowToSteps(): Konversi React Flow → Steps format
- [ ] Method stepsToReactFlow(): Konversi Steps → React Flow format (untuk existing data)
- [ ] Validate structure dari kedua format

#### 1.2 Fix FlowHandler untuk Dual Format
- [ ] Method create(): Handle React Flow input dari UI
  - Konversi ke steps format
  - Simpan kedua format (flow_data + ui_data)
- [ ] Method update(): Update kedua format
- [ ] Add method getForUI(): Return ui_data untuk Frontend
- [ ] Method getForExecution(): Return flow_data untuk MCP/External

#### 1.3 Fix Default Flow Data Structure
- [ ] Line 75: Ubah default menjadi steps-based
- [ ] Tambah default ui_data (kosong nodes/edges)

#### 1.4 Simplify execute() Method
- [ ] Hapus execution logic placeholder
- [ ] Return flow_data (steps format) untuk external execution

### Phase 2: Update FlowRepository.php
**File: `backend/src/repositories/FlowRepository.php`**

#### 2.1 Ensure JSON Handling Consistency
- [ ] Method createForProject(): Validate JSON encoding untuk flow_data dan ui_data
- [ ] Method updateFlow(): Handle JSON encoding untuk kedua format
- [ ] Remove double encoding issues

#### 2.2 Add Dual Format Support
- [ ] Create method saveDualFormat(): Simpan flow_data (steps) + ui_data (React Flow)
- [ ] Method getForUI(): Return ui_data untuk UI
- [ ] Method getForExecution(): Return flow_data untuk execution engines

#### 2.3 Add Input Definition Support
- [ ] Update schema untuk support `flow_inputs` field
- [ ] Add validation untuk input structure

### Phase 3: Add Flow Validation
**File: `backend/src/helpers/FlowValidator.php` (baru)**

#### 3.1 Create FlowValidator Class
- [ ] validateFlowStructure(): Basic structure validation
- [ ] validateSteps(): Step structure validation
- [ ] validateInputs(): Input definition validation
- [ ] validateVariableReferences(): Variable format validation

#### 3.2 Integration in FlowHandler
- [ ] Add validation di method create()
- [ ] Add validation di method update()
- [ ] Return proper error messages

### Phase 4: Database Schema Update
**File: `backend/migrations/XXX_update_flows_table.sql` (baru)**

#### 4.1 Add Flow Inputs Support
- [ ] Tambah kolom `flow_inputs` (LONGTEXT)
- [ ] Update existing data untuk compatibility

#### 4.2 Add Dual Format Support
- [ ] Tambah kolom `ui_data` (LONGTEXT) untuk React Flow format
- [ ] Tetap pakai `flow_data` untuk steps-based format (execution)
- [ ] Update existing flows dengan default ui_data

#### 4.3 Add Metadata Fields
- [ ] Tambah kolom `ai_version` (VARCHAR(100), nullable)
- [ ] Tambah kolom `generation_strategy` (VARCHAR(100), nullable)
- [ ] Tambah kolom `complexity_score` (DECIMAL(3,2), nullable)

### Phase 5: Update Seed Data
**File: `backend/seeds/006_seed_flows.sql`**

#### 5.1 Update Sample Data
- [ ] Update contoh flows ke steps-based format
- [ ] Add flow_inputs examples
- [ ] Add proper metadata

### Phase 6: Update API Responses
**File: `backend/src/handlers/FlowHandler.php`**

#### 6.1 Add Dual Format API Endpoints
- [ ] GET /flow/{id}/ui → Return ui_data (React Flow format)
- [ ] PUT /flow/{id}/ui → Update ui_data + konversi ke flow_data
- [ ] Existing GET /flow/{id} → Return flow_data (steps format) - untuk execution

#### 6.2 Enhance Response Format
- [ ] Include flow_inputs di response
- [ ] Include rich metadata
- [ ] Consistent error handling
- [ ] Response format compatibility untuk UI vs Execution engines

## 📊 CONTOH IMPLEMENTASI

### Example: Login → Change Password Flow
```json
{
  "name": "Login and Change Password Flow",
  "description": "User authentication dengan password change",
  "flow_inputs": [
    {
      "name": "existing_username",
      "type": "string",
      "required": true,
      "validation": {"min_length": 3}
    },
    {
      "name": "existing_password",
      "type": "string",
      "required": true
    },
    {
      "name": "new_password",
      "type": "string",
      "required": true,
      "validation": {"min_length": 8}
    }
  ],
  "flow_data": {
    "version": "1.0",
    "steps": [
      {
        "id": "login",
        "name": "User Authentication",
        "method": "POST",
        "url": "{{env.API_BASE_URL}}/auth/login",
        "body": {
          "username": "{{input.existing_username}}",
          "password": "{{input.existing_password}}"
        },
        "outputs": {
          "authToken": "response.body.token",
          "userId": "response.body.user.id"
        }
      },
      {
        "id": "change_password",
        "name": "Update Password",
        "method": "PUT",
        "url": "{{env.API_BASE_URL}}/users/{{login.userId}}/password",
        "headers": {
          "Authorization": "Bearer {{login.authToken}}"
        },
        "body": {
          "old_password": "{{input.existing_password}}",
          "new_password": "{{input.new_password}}"
        },
        "outputs": {
          "success": "response.body.success"
        }
      }
    ],
    "config": {
      "delay": 500,
      "retryCount": 2
    }
  }
}
```

## 🎯 SUCCESS CRITERIA
1. ✅ Dual format support (React Flow + Steps-based)
2. ✅ Flow creation dengan konversi otomatis
3. ✅ Fast loading (no conversion on read)
4. ✅ Dynamic input definition dengan validation
5. ✅ Variable reference system berfungsi
6. ✅ Comprehensive validation dan error handling
7. ✅ Clean API contract untuk UI dan execution systems
8. ✅ Rich metadata support untuk AI systems

## 🚫 OUT OF SCOPE
- Execution engine implementation
- AI integration logic
- Real-time processing/monitoring
- Performance optimization runtime
- Documentation files (focus on implementation)

## 📅 NOTES
- Focus pada data management layer murni
- AI systems dan execution engine terpisah
- Pastikan format konsisten dan valid
- Metadata tracking untuk AI learning support