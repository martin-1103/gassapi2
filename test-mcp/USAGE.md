# MCP2 Error Reproduction Scripts - Usage Guide

## 🚀 Quick Start

### 1. Quick Health Check
```bash
npm run test:quick
```
Mengecek kesehatan dasar MCP2 (backend connectivity + MCP validation).

### 2. Full Error Reproduction Suite
```bash
npm run test:all
```
Menjalankan semua test reproduksi error lengkap.

### 3. Specific Test Categories
```bash
# Test error yang sudah diperbaiki (regression testing)
npm run test:fixed-errors

# Test error yang masih ada
npm run test:current-issues

# Debugging spesifik
npm run test:debug-endpoints
npm run test:debug-flows
```

## 📊 Script Categories

### 🔧 Fixed Errors Regression Testing (`test-fixed-errors.js`)
**Purpose**: Memastikan error yang sudah diperbaiki tidak muncul kembali.

**Test Cases**:
- ✅ Missing Import Error (ResponseHelper MessageHelper)
- ✅ Authentication Consistency (FlowHandler vs AuthHelper)
- ✅ Database Schema Issues (endpoints table)
- ✅ Endpoint Mapping Error (list_endpoints)

**Expected Result**: 100% PASS (tidak ada regression)

### 🐛 Current Issues Testing (`test-current-issues.js`)
**Purpose**: Mereproduksi error-error yang masih belum diperbaiki.

**Test Cases**:
- 🔸 create_endpoint Request Format Issue
- 🔸 Flow Management Permission Issue

**Expected Result**: 0% PASS (mereproduksi error yang sama)

### 🔍 Endpoint Debugging (`debug-endpoints.js`)
**Purpose**: Analisis detail masalah create_endpoint.

**Debug Analyses**:
- Header format differences (JSON.stringify vs JSON.stringify(headers, null, 2))
- URL generation dan parameter substitution
- Request body encoding issues
- Authentication header differences

### 🔍 Flow Debugging (`debug-flows.js`)
**Purpose**: Analisis detail masalah flow management permission.

**Debug Analyses**:
- MCP vs JWT token authentication comparison
- MCP token validation response analysis
- Project membership verification
- FlowHandler permission check simulation
- MCP token record consistency

## 📈 Expected Results untuk Setiap Script

### Regression Testing (`test-fixed-errors.js`)
```
✅ Fixed Errors Regression Testing
✅ PASS: Missing import error FIXED - JSON response proper
✅ PASS: Authentication consistency FIXED - Flow endpoint accessible
✅ PASS: Database schema FIXED - Endpoint created successfully
✅ PASS: Endpoint mapping FIXED - project_endpoints working
📊 Test Results Summary:
✅ Passed: 4
✅ Failed: 0
✅ Success Rate: 100%
🎉 ALL FIXED ERRORS STILL FIXED - No regression detected!
```

### Current Issues Testing (`test-current-issues.js`)
```
🔍 Testing create_endpoint Request Format Issue...
✅ SUCCESS: Direct request works
🔍 ISSUE REPRODUCED: MCP client fails, direct request works
   Root cause: MCP client request format inconsistency

🔍 Testing Flow Management Permission Issue...
🔍 ISSUE REPRODUCED: MCP token fails, JWT token works
   Root cause: MCP token authentication context mapping issue
```

### Endpoint Debugging (`debug-endpoints.js`)
```
🔍 Testing Header Format Differences...
🎯 ROOT CAUSE FOUND: Header format indentation issue!
   MCP client uses JSON.stringify(headers, null, 2) but backend expects JSON.stringify(headers)
```

### Flow Debugging (`debug-flows.js`)
```
🔍 Analyzing MCP Token Validation Response...
✅ MCP Validation: SUCCESS
   User Context: NOT AVAILABLE
   ⚠️ This could be the issue - no user context in MCP validation
```

## 🛠️ Cara Menggunakan Hasil Testing

### 1. Identifikasi Root Cause
Script debugging akan menunjukkan root cause spesifik:
- "Header format indentation issue"
- "MCP token authentication context mapping issue"
- "User context NOT AVAILABLE in MCP validation"

### 2. Verifikasi Perbaikan
Setelah melakukan perbaikan:
```bash
npm run test:fixed-errors
```
Pastikan tidak ada regression.

### 3. Monitoring Current Issues
Untuk error yang belum diperbaiki:
```bash
npm run test:current-issues
```
Monitor apakah error masih sama atau sudah berubah.

### 4. Regression Testing
Setiap kali ada perubahan code:
```bash
npm run test:all
```
Pastikan tidak ada error yang kembali.

## 📋 Interpreting Results

### ✅ Success Indicators
- **Fixed Errors**: 100% pass rate, no regression
- **Current Issues**: Error messages konsisten dengan analisis
- **Debug Scripts**: Root cause teridentifikasi dengan jelas

### ⚠️ Warning Signs
- **Regression**: Fixed errors kembali gagal
- **Inconsistent Results**: Error berubah-ubah antar test runs
- **Unexpected Behaviors**: Hasil tidak sesuai ekspektasi

### ❌ Critical Issues
- **Cannot Connect**: Backend tidak reachable
- **Authentication Failures**: Token tidak valid
- **Database Errors**: Schema inconsistency

## 🔄 Automation Integration

### CI/CD Pipeline
```yaml
# Example GitHub Actions
- name: Run MCP2 Error Tests
  run: |
    cd test-mcp
    npm install
    npm run test:all
```

### Pre-commit Hooks
```bash
# Package.json scripts
"precommit": "cd test-mcp && npm run test:fixed-errors"
```

### Scheduled Monitoring
```bash
# Cron job untuk daily testing
0 9 * * * cd /path/to/gassapi2/test-mcp && npm run test:all
```

## 📁 File Structure

```
test-mcp/
├── README.md                    # Dokumentasi lengkap
├── USAGE.md                    # Panduan penggunaan
├── package.json                # Dependencies dan scripts
├── config.js                   # Konfigurasi testing
├── index.js                    # Main entry point
├── test-fixed-errors.js         # Regression testing
├── test-current-issues.js       # Current issues testing
├── debug-endpoints.js          # Endpoint debugging
├── debug-flows.js             # Flow debugging
├── reports/                    # Test reports (auto-generated)
└── .gitignore                  # Git ignore rules
```

## 🎯 Best Practices

1. **Run tests sebelum dan sesudah perubahan**
2. **Save test reports** untuk tracking historical data
3. **Gunakan debug scripts** untuk analisis mendalam
4. **Update test data** jika konfigurasi berubah
5. **Monitor test duration** untuk performance issues

## 🔧 Customization

### Menambah Test Case
Edit file yang sesuai (`test-fixed-errors.js` atau `test-current-issues.js`):
```javascript
// Tambah test case baru
async testNewError() {
  // Implementation
  return success;
}

// Tambah ke array tests
const tests = [
  () => this.testExistingError(),
  () => this.testNewError() // Tambah di sini
];
```

### Mengubah Konfigurasi
Edit `config.js`:
```javascript
// Update credentials atau test data
mcp: {
  projectId: 'your-project-id',
  token: 'your-mcp-token'
}
```