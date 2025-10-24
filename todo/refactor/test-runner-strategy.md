# Strategi Refactoring Test Runner

## Analisis File Saat Ini
**File:** `src/lib/testing/test-runner.ts`
**Ukuran:** 526 lines
**Masalah:** File terlalu besar, complex, dan multiple responsibilities

### Struktur Saat Ini:
1. **TestRunner class** (lines 5-313)
   - runPreRequestScript (lines 13-62)
   - runPostResponseTests (lines 64-156)
   - executeScript (lines 158-183)
   - createSandbox (lines 185-300)
   - runInSandbox (lines 302-312)

2. **AssertionBuilder class** (lines 316-526)
   - 20+ method assertion
   - HTTP specific assertions
   - Custom schema validation

## Identifikasi Modules untuk Diekstrak

### 1. **Sandbox Engine** (~150 lines)
**File baru:** `test-sandbox.ts`
- createSandbox method
- runInSandbox method
- Script execution logic
- Error handling sandbox

### 2. **Assertion Builder** (~200 lines)
**File baru:** `assertion-builder.ts`
- AssertionBuilder class seluruhnya
- Semua assertion methods
- HTTP specific assertions
- Schema validation

### 3. **Test Context Manager** (~100 lines)
**File baru:** `test-context-manager.ts`
- Context creation dan setup
- Variable management
- Console handling
- Environment setup

### 4. **Script Executor** (~80 lines)
**File baru:** `script-executor.ts`
- executeScript logic
- Script wrapping
- Error handling
- Pre/post script coordination

### 5. **Test Result Processor** (~90 lines)
**File baru:** `test-result-processor.ts`
- Result parsing logic
- Test status determination
- Duration calculation
- Error formatting

## Rencana Pemecahan File

### File 1: `test-runner.ts` (sisa ~50 lines)
```typescript
// Main orchestrator
export class TestRunner {
  // Konstruktor & koordinasi utama
  // Delegate ke specialized modules
}
```

### File 2: `test-sandbox.ts` (~150 lines)
```typescript
// Sandbox creation dan execution
export class TestSandbox {
  createSandbox(context: TestContext): any
  runInSandbox(script: string, sandbox: any): Promise<any>
}
```

### File 3: `assertion-builder.ts` (~200 lines)
```typescript
// Semua assertion logic
export class AssertionBuilder {
  // 20+ assertion methods
}
```

### File 4: `test-context-manager.ts` (~100 lines)
```typescript
// Context management
export class TestContextManager {
  createContext(request, response, variables): TestContext
  updateContext(context, updates): void
}
```

### File 5: `script-executor.ts` (~80 lines)
```typescript
// Script execution coordination
export class ScriptExecutor {
  executePreRequest(script, context): Promise<ScriptResult>
  executePostResponse(scripts, context): Promise<TestResult[]>
}
```

### File 6: `test-result-processor.ts` (~90 lines)
```typescript
// Result processing dan formatting
export class TestResultProcessor {
  processResults(testContext): TestResult[]
  formatError(error): TestResult
  calculateDuration(startTime, endTime): number
}
```

## Benefits Refactoring

### ✅ **Single Responsibility**
- Setiap file fokus pada satu concern spesifik
- Lebih mudah dipahami dan dimaintain

### ✅ **Testability**
- Setiap module bisa di-test secara independen
- Mock dependency lebih mudah

### ✅ **Maintainability**
- Perubahan di satu area tidak affecting yang lain
- Code review lebih fokus

### ✅ **Reusability**
- AssertionBuilder bisa dipakai di tempat lain
- Sandbox engine reusable untuk script execution lain

## Implementation Strategy

### Phase 1: Ekstrak AssertionBuilder
1. Copy class ke file baru
2. Update imports
3. Test functionality

### Phase 2: Ekstrak Sandbox Engine
1. Pindahkan createSandbox & runInSandbox
2. Create TestSandbox class
3. Update TestRunner dependencies

### Phase 3: Ekstrak Context Manager
1. Create TestContextManager
2. Pindahkan context creation logic
3. Update references

### Phase 4: Ekstrak Script Executor
1. Create ScriptExecutor class
2. Pindahkan execution logic
3. Update TestRunner methods

### Phase 5: Ekstrak Result Processor
1. Create TestResultProcessor
2. Pindahkan processing logic
3. Update return handling

### Phase 6: Cleanup Main TestRunner
1. Kurangi dependency
2. Simplify methods
3. Update exports

## Risk Mitigation

### 🛡️ **Backward Compatibility**
- Maintain existing API interface
- Keep same method signatures
- Gradual migration approach

### 🛡️ **Testing Strategy**
- Test each extraction step
- Keep integration tests passing
- Add unit tests for new modules

### 🛡️ **Performance Impact**
- Monitor for performance regression
- Optimize import statements
- Avoid unnecessary object creation

## Next Steps

1. **Review strategy** dengan team
2. **Create branch** untuk refactoring
3. **Start Phase 1** (AssertionBuilder extraction)
4. **Test thoroughly** setiap phase
5. **Update documentation** dan examples
6. **Deploy incrementally** dengan confidence

---

*Catatan: Fokus pada simplicity dan maintainability. Jangan over-engineer solutions.*