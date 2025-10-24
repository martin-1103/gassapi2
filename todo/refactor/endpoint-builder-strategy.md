# 🎯 Strategi Refactoring EndpointBuilder.tsx

## 📊 Analisis Saat Ini
- **File**: `src/features/endpoints/EndpointBuilder.tsx`
- **Lines**: 495 lines (melebihi batas 300 lines)
- **Complexity**: Tinggi - terlalu banyak tanggung jawab dalam satu component

## 🔍 Identifikasi Masalah

### Tanggung Jawab Component Saat Ini:
1. **State Management** - endpoint, response, bodyData, testScripts, authData, queryParams, headersList
2. **Request Logic** - URL interpolation, header building, authentication handling
3. **UI Rendering** - Header form, request tabs, response display
4. **API Integration** - request sending, response handling, endpoint saving

## 🏗️ Rencana Pemecahan Component

### 1. **EndpointBuilderHeader** (~80 lines)
**Lokasi**: `src/features/endpoints/components/EndpointBuilderHeader.tsx`
**Tanggung Jawab**:
- Form nama endpoint
- Method selector
- URL input
- Send & Save buttons

### 2. **useEndpointRequest** (~60 lines)
**Lokasi**: `src/features/endpoints/hooks/useEndpointRequest.ts`
**Tanggung Jawab**:
- State management untuk request (params, headers, body, auth, tests)
- URL interpolation logic
- Request building logic

### 3. **RequestTabsContainer** (~120 lines)
**Lokasi**: `src/features/endpoints/components/RequestTabsContainer.tsx`
**Tanggung Jawab**:
- Tab navigation untuk request (Params, Headers, Body, Tests, Auth)
- Render active tab content
- Manage active tab state

### 4. **ResponseDisplay** (~150 lines)
**Lokasi**: `src/features/endpoints/components/ResponseDisplay.tsx`
**Tanggung Jawab**:
- Response header dengan status badge
- Response tabs navigation (Body, Headers, Tests)
- Response content rendering
- Format mode & search state

### 5. **useEndpointSend** (~100 lines)
**Lokasi**: `src/features/endpoints/hooks/useEndpointSend.ts`
**Tanggung Jawab**:
- HTTP request logic
- Authentication handling
- Response processing
- Error handling

### 6. **EndpointBuilder Main** (~80 lines)
**Lokasi**: `src/features/endpoints/EndpointBuilder.tsx` (refactored)
**Tanggung Jawab**:
- Orchestrate semua components
- Query client management
- Save endpoint logic

## 📁 Struktur File Baru

```
src/features/endpoints/
├── EndpointBuilder.tsx (refactored ~80 lines)
├── components/
│   ├── EndpointBuilderHeader.tsx (~80 lines)
│   ├── RequestTabsContainer.tsx (~120 lines)
│   └── ResponseDisplay.tsx (~150 lines)
└── hooks/
    ├── useEndpointRequest.ts (~60 lines)
    └── useEndpointSend.ts (~100 lines)
```

## 🔄 Alur Data Baru

```
EndpointBuilder (main)
├── EndpointBuilderHeader
├── useEndpointRequest (hook)
│   └── RequestTabsContainer
└── useEndpointSend (hook)
    └── ResponseDisplay
```

## ✅ Benefits Refactoring

1. **Single Responsibility** - Setiap component punya 1 tanggung jawab jelas
2. **Reusability** - Hook & components bisa dipakai di tempat lain
3. **Testability** - Unit testing lebih mudah untuk setiap bagian
4. **Maintainability** - Perubahan lebih terisolasi
5. **Readability** - Code lebih mudah dimengerti

## 🚀 Tahap Implementasi

### Phase 1: Extract Hooks
1. `useEndpointRequest` - State management untuk request
2. `useEndpointSend` - HTTP request logic

### Phase 2: Extract Components
1. `EndpointBuilderHeader` - Header form & buttons
2. `RequestTabsContainer` - Request tabs management
3. `ResponseDisplay` - Response UI

### Phase 3: Refactor Main Component
1. Update `EndpointBuilder.tsx` - Orchestrate components
2. Test integration semua components

## 📝 Notes
- Pastikan semua props interface jelas
- Maintain backward compatibility
- Test setelah setiap phase
- Keep Indonesian comments & messages