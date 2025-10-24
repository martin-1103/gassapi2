# History Module Documentation

## Overview
Modular history management system yang telah direfactor dari file `request-history.ts` (448 lines) menjadi struktur yang modular dan maintainable.

## File Structure

### 📁 **Core Files**
- **`types.ts`** - Type definitions dan interfaces
- **`history-storage.ts`** - Storage operations (CRUD, localStorage)
- **`history-search.ts`** - Search dan filtering logic
- **`history-utils.ts`** - Utility functions (sanitization, formatting)
- **`history-manager.ts`** - Main manager class dengan clean API

### 📁 **Public API**
- **`index.ts`** - Clean export interface untuk external usage

### 📁 **Backward Compatibility**
- **`request-history.ts`** - Re-export untuk backward compatibility (deprecated)

## Usage Examples

### Basic Usage (Recommended)
```typescript
import { requestHistory } from '@/lib/history';

// Add item to history
await requestHistory.addToHistory({
  method: 'GET',
  url: '/api/users',
  headers: { 'Content-Type': 'application/json' },
  status: 'success',
  duration: 250
});

// Get history
const history = await requestHistory.getHistory();

// Search history
const results = await requestHistory.searchHistory('users');

// Filter by criteria
const filtered = await requestHistory.filterHistory({
  method: 'GET',
  status: 'success',
  dateFrom: Date.now() - 86400000 // last 24 hours
});
```

### Advanced Usage (Direct Class)
```typescript
import { HistoryManager } from '@/lib/history';

const manager = new HistoryManager();
// atau gunakan singleton
const manager = HistoryManager.getInstance();
```

### Utility Functions
```typescript
import { HistoryUtils } from '@/lib/history';

// Format duration
const duration = HistoryUtils.formatDuration(1250); // "1.25s"

// Get status color
const color = HistoryUtils.getStatusColor('success'); // "#10b981"

// Export history
const jsonExport = await requestHistory.exportHistory();
```

## API Reference

### HistoryManager Methods
- `addToHistory(item)` - Add new history item
- `getHistory(limit?)` - Get all history (with optional limit)
- `filterHistory(filter)` - Filter by criteria
- `searchHistory(query)` - Search by text
- `getHistoryItem(id)` - Get item by ID
- `updateHistoryItem(id, updates)` - Update existing item
- `deleteHistoryItem(id)` - Delete item
- `clearHistory()` - Clear all history
- `clearProjectHistory(projectId)` - Clear project-specific history
- `getStatistics()` - Get usage statistics
- `exportHistory()` - Export to JSON
- `importHistory(jsonData)` - Import from JSON

### Types
```typescript
interface RequestHistoryItem {
  id: string;
  name?: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  response?: DirectResponse;
  timestamp: number;
  duration: number;
  status: 'success' | 'error' | 'pending';
  projectId?: string;
  collectionId?: string;
  endpointId?: string;
  environment?: string;
  tags?: string[];
}

interface HistoryFilter {
  method?: string;
  status?: 'success' | 'error' | 'pending';
  projectId?: string;
  collectionId?: string;
  environment?: string;
  dateFrom?: number;
  dateTo?: number;
  search?: string;
}
```

## Benefits of Refactoring

### ✅ **Separation of Concerns**
- Storage logic terisolasi di `history-storage.ts`
- Search logic terisolasi di `history-search.ts`
- Utility functions terisolasi di `history-utils.ts`
- Clean API melalui `HistoryManager`

### ✅ **Improved Maintainability**
- Setiap file <150 lines (dari 448 lines)
- Single responsibility per file
- Mudah untuk testing individual components

### ✅ **Better Type Safety**
- Strong typing dengan TypeScript interfaces
- Clear API contracts
- Better IDE support

### ✅ **Enhanced Reusability**
- Utility functions dapat digunakan di tempat lain
- Search logic dapat di-reuse
- Storage operations dapat di-extend

### ✅ **Backward Compatibility**
- Existing code tetap berfungsi
- Gradual migration path
- Clear deprecation notices

## Migration Guide

### From Old API
```typescript
// Old (still works)
import { requestHistory } from '@/lib/history/request-history';

// New (recommended)
import { requestHistory } from '@/lib/history';
```

### For New Development
Gunakan import dari `@/lib/history` dan manfaatkan utility functions yang tersedia.

## Events
History system dispatch custom events untuk UI updates:
```typescript
// Listen untuk updates
window.addEventListener('requestHistoryUpdated', (event) => {
  const { action, item, id, count, projectId } = event.detail;
  // Handle UI updates based on action
});
```

Available actions:
- `added` - New item added
- `updated` - Item updated
- `deleted` - Item deleted
- `cleared` - All history cleared
- `cleared-project` - Project history cleared
- `imported` - Items imported