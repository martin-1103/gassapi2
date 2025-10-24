# Strategi Refactoring Import Modal (546 lines)

## 📊 Analisis Struktur Saat Ini

File `import-modal.tsx` saat ini memiliki **546 lines** dengan beberapa tanggung jawab:

### Komponen Utama:
1. **UI Modal & State Management** (44-360 lines)
2. **Parsing Logic** (181-331 lines)
3. **UI Rendering** (366-546 lines)

### Masalah yang Teridentifikasi:
- ❌ File terlalu panjang (> 300 lines)
- ❌ Mixing logic parsing dengan UI components
- ❌ Fungsi parsing terlalu kompleks (50+ lines per fungsi)
- ❌ Hard to test logic parsing
- ❌ Reusable parsing logic tidak bisa dipakai di tempat lain

## 🎯 Target Refactoring

1. **Pecah menjadi 4-5 components** < 300 lines
2. **Extract parsing logic** ke dalam utilities tersendiri
3. **Single responsibility** untuk setiap component
4. **Improve testability** dengan memisahkan logic dari UI
5. **Maintain reusability** untuk parsing logic

## 🏗️ Rencana Pemecahan Component

### 1. ImportModal (main component)
- **File:** `src/components/modals/import-modal.tsx`
- **Lines:** ~150 lines
- **Responsibility:** Modal container, state management, orchestration
- **Props:** `isOpen`, `onClose`, `onImport`

```tsx
export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  // State management only
  // Handle file/URL upload
  // Render sub-components
  // No parsing logic
}
```

### 2. ImportTypeSelector
- **File:** `src/components/modals/import-type-selector.tsx`
- **Lines:** ~80 lines
- **Responsibility:** UI untuk memilih tipe import (Postman/OpenAPI/cURL)
- **Props:** `selectedType`, `onTypeChange`, `importInfo`

```tsx
interface ImportTypeSelectorProps {
  selectedType: 'postman' | 'openapi' | 'curl'
  onTypeChange: (type: ImportType) => void
  importInfo: ImportTypeInfo
}
```

### 3. ImportMethodTabs
- **File:** `src/components/modals/import-method-tabs.tsx`
- **Lines:** ~120 lines
- **Responsibility:** Tab untuk upload file vs import URL
- **Props:** `method`, `onMethodChange`, `onFileUpload`, `onUrlImport`, `isImporting`

```tsx
interface ImportMethodTabsProps {
  method: 'file' | 'url'
  onMethodChange: (method: ImportMethod) => void
  onFileUpload: (file: File) => void
  onUrlImport: (url: string) => void
  isImporting: boolean
  acceptedFormats: string
}
```

### 4. ImportResult
- **File:** `src/components/modals/import-result.tsx`
- **Lines:** ~100 lines
- **Responsibility:** Display hasil import (success/error)
- **Props:** `result`, `onClose`

```tsx
interface ImportResultProps {
  result: ImportResult | null
  onClose: () => void
}
```

### 5. ImportProgress
- **File:** `src/components/modals/import-progress.tsx`
- **Lines:** ~30 lines
- **Responsibility:** Progress bar dan status import
- **Props:** `progress`, `isImporting`

```tsx
interface ImportProgressProps {
  progress: number
  isImporting: boolean
}
```

## 🔧 Extract Parsing Logic

### 6. PostmanParser (Utility)
- **File:** `src/utils/import/parsers/postman-parser.ts`
- **Lines:** ~60 lines
- **Responsibility:** Parse Postman collection JSON
- **Export:** `parsePostmanCollection(content: string): ImportResult`

### 7. OpenAPIParser (Utility)
- **File:** `src/utils/import/parsers/openapi-parser.ts`
- **Lines:** ~70 lines
- **Responsibility:** Parse OpenAPI/Swagger specs
- **Export:** `parseOpenAPISpec(content: string): ImportResult`

### 8. CurlParser (Utility)
- **File:** `src/utils/import/parsers/curl-parser.ts`
- **Lines:** ~50 lines
- **Responsibility:** Parse cURL commands
- **Export:** `parseCurlCommand(content: string): ImportResult`

### 9. ImportParser (Factory)
- **File:** `src/utils/import/import-parser.ts`
- **Lines:** ~40 lines
- **Responsibility:** Factory untuk memilih parser yang tepat
- **Export:** `createParser(type: ImportType): Parser`

### 10. ImportTypes (Types)
- **File:** `src/utils/import/types.ts`
- **Lines:** ~20 lines
- **Responsibility:** Shared types untuk import functionality
- **Export:** `ImportResult`, `ImportType`, `Parser`, dll

## 📁 Struktur Folder Baru

```
src/
├── components/modals/
│   ├── import-modal.tsx (main, ~150 lines)
│   ├── import-type-selector.tsx (~80 lines)
│   ├── import-method-tabs.tsx (~120 lines)
│   ├── import-result.tsx (~100 lines)
│   └── import-progress.tsx (~30 lines)
├── utils/import/
│   ├── types.ts (~20 lines)
│   ├── import-parser.ts (~40 lines)
│   └── parsers/
│       ├── postman-parser.ts (~60 lines)
│       ├── openapi-parser.ts (~70 lines)
│       └── curl-parser.ts (~50 lines)
```

## ✅ Benefits Setelah Refactoring

1. **Maintainability**: Setiap file < 300 lines, fokus single responsibility
2. **Testability**: Parsing logic bisa di-test secara isolated
3. **Reusability**: Parser utilities bisa dipakai di tempat lain
4. **Readability**: Code lebih mudah dibaca dan dipahami
5. **Performance**: Component yang lebih kecil = render lebih cepat
6. **Development**: Bisa kerja pada parsing logic tanpa touch UI

## 🚀 Implementation Plan

### Phase 1: Extract Utilities
1. Buat types di `src/utils/import/types.ts`
2. Extract Postman parser
3. Extract OpenAPI parser
4. Extract cURL parser
5. Buat factory parser

### Phase 2: Extract UI Components
1. Extract ImportTypeSelector
2. Extract ImportMethodTabs
3. Extract ImportResult
4. Extract ImportProgress

### Phase 3: Refactor Main Component
1. Update ImportModal untuk menggunakan extracted components
2. Update imports
3. Test functionality

### Phase 4: Cleanup
1. Remove unused code
2. Update tests jika ada
3. Verify semua functionality masih bekerja

## ⚠️ Notes

- Pastikan semua props interfaces well-typed
- Maintain existing functionality (no breaking changes)
- Consider error handling di setiap component
- Keep Indonesian casual style untuk user-facing messages
- Follow existing code patterns dan naming conventions