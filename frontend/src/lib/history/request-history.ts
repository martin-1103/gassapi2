/**
 * Request History Management
 * Store dan manage request history dengan search/filter
 * 
 * Storage: IndexedDB untuk large data, localStorage sebagai fallback
 */

import type { RequestHistoryItem, RequestHistoryFilter } from '@/types/http-client'

const DB_NAME = 'gassapi_request_history'
const DB_VERSION = 1
const STORE_NAME = 'requests'
const MAX_HISTORY_ITEMS = 1000 // Limit untuk prevent storage overflow

export class RequestHistoryManager {
  private db: IDBDatabase | null = null
  private useIndexedDB: boolean = true
  private initialized: boolean = false

  constructor() {
    this.initializeStorage()
  }

  /**
   * Initialize storage (IndexedDB atau fallback ke localStorage)
   */
  private async initializeStorage(): Promise<void> {
    if (this.initialized) return

    try {
      await this.initIndexedDB()
      this.useIndexedDB = true
    } catch (error) {
      console.warn('IndexedDB not available, using localStorage fallback', error)
      this.useIndexedDB = false
    }

    this.initialized = true
  }

  /**
   * Initialize IndexedDB
   */
  private initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB not supported'))
        return
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          
          // Create indexes untuk efficient searching
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('method', 'request.method', { unique: false })
          store.createIndex('status', 'response.status', { unique: false })
          store.createIndex('collectionId', 'collectionId', { unique: false })
          store.createIndex('endpointId', 'endpointId', { unique: false })
        }
      }
    })
  }

  /**
   * Add request history item
   */
  async addItem(item: RequestHistoryItem): Promise<void> {
    await this.initializeStorage()

    if (this.useIndexedDB && this.db) {
      return this.addItemIndexedDB(item)
    } else {
      return this.addItemLocalStorage(item)
    }
  }

  /**
   * Add item ke IndexedDB
   */
  private addItemIndexedDB(item: RequestHistoryItem): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.add(item)

      request.onsuccess = () => {
        this.cleanupOldItems().then(resolve).catch(resolve) // Cleanup old items in background
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Add item ke localStorage
   */
  private async addItemLocalStorage(item: RequestHistoryItem): Promise<void> {
    const items = await this.getAllItemsLocalStorage()
    items.unshift(item)

    // Keep only last MAX_HISTORY_ITEMS
    const trimmed = items.slice(0, MAX_HISTORY_ITEMS)
    localStorage.setItem('request_history', JSON.stringify(trimmed))
  }

  /**
   * Get all items dari localStorage
   */
  private async getAllItemsLocalStorage(): Promise<RequestHistoryItem[]> {
    const data = localStorage.getItem('request_history')
    return data ? JSON.parse(data) : []
  }

  /**
   * Get history items dengan filter
   */
  async getItems(filter?: RequestHistoryFilter, limit: number = 50): Promise<RequestHistoryItem[]> {
    await this.initializeStorage()

    if (this.useIndexedDB && this.db) {
      return this.getItemsIndexedDB(filter, limit)
    } else {
      return this.getItemsLocalStorage(filter, limit)
    }
  }

  /**
   * Get items dari IndexedDB
   */
  private getItemsIndexedDB(filter?: RequestHistoryFilter, limit: number = 50): Promise<RequestHistoryItem[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('timestamp')
      
      // Get items dalam descending order (newest first)
      const request = index.openCursor(null, 'prev')
      const items: RequestHistoryItem[] = []

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        
        if (cursor && items.length < limit) {
          const item = cursor.value as RequestHistoryItem
          
          // Apply filters
          if (this.matchesFilter(item, filter)) {
            items.push(item)
          }
          
          cursor.continue()
        } else {
          resolve(items)
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get items dari localStorage
   */
  private async getItemsLocalStorage(filter?: RequestHistoryFilter, limit: number = 50): Promise<RequestHistoryItem[]> {
    const allItems = await this.getAllItemsLocalStorage()
    
    // Filter items
    const filtered = filter 
      ? allItems.filter(item => this.matchesFilter(item, filter))
      : allItems

    // Return limited items
    return filtered.slice(0, limit)
  }

  /**
   * Check apakah item match dengan filter
   */
  private matchesFilter(item: RequestHistoryItem, filter?: RequestHistoryFilter): boolean {
    if (!filter) return true

    // Filter by method
    if (filter.method && item.request.method !== filter.method) {
      return false
    }

    // Filter by status
    if (filter.status && item.response?.status !== filter.status) {
      return false
    }

    // Filter by collection
    if (filter.collectionId && item.collectionId !== filter.collectionId) {
      return false
    }

    // Filter by endpoint
    if (filter.endpointId && item.endpointId !== filter.endpointId) {
      return false
    }

    // Filter by date range
    if (filter.dateFrom && item.timestamp < filter.dateFrom) {
      return false
    }
    if (filter.dateTo && item.timestamp > filter.dateTo) {
      return false
    }

    // Filter by search (URL atau name)
    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      const url = item.request.url.toLowerCase()
      
      if (!url.includes(searchLower)) {
        return false
      }
    }

    return true
  }

  /**
   * Get item by ID
   */
  async getItemById(id: string): Promise<RequestHistoryItem | null> {
    await this.initializeStorage()

    if (this.useIndexedDB && this.db) {
      return this.getItemByIdIndexedDB(id)
    } else {
      return this.getItemByIdLocalStorage(id)
    }
  }

  /**
   * Get item by ID dari IndexedDB
   */
  private getItemByIdIndexedDB(id: string): Promise<RequestHistoryItem | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get item by ID dari localStorage
   */
  private async getItemByIdLocalStorage(id: string): Promise<RequestHistoryItem | null> {
    const items = await this.getAllItemsLocalStorage()
    return items.find(item => item.id === id) || null
  }

  /**
   * Delete item
   */
  async deleteItem(id: string): Promise<void> {
    await this.initializeStorage()

    if (this.useIndexedDB && this.db) {
      return this.deleteItemIndexedDB(id)
    } else {
      return this.deleteItemLocalStorage(id)
    }
  }

  /**
   * Delete item dari IndexedDB
   */
  private deleteItemIndexedDB(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Delete item dari localStorage
   */
  private async deleteItemLocalStorage(id: string): Promise<void> {
    const items = await this.getAllItemsLocalStorage()
    const filtered = items.filter(item => item.id !== id)
    localStorage.setItem('request_history', JSON.stringify(filtered))
  }

  /**
   * Clear all history
   */
  async clearAll(): Promise<void> {
    await this.initializeStorage()

    if (this.useIndexedDB && this.db) {
      return this.clearAllIndexedDB()
    } else {
      return this.clearAllLocalStorage()
    }
  }

  /**
   * Clear all dari IndexedDB
   */
  private clearAllIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Clear all dari localStorage
   */
  private async clearAllLocalStorage(): Promise<void> {
    localStorage.removeItem('request_history')
  }

  /**
   * Cleanup old items (keep only MAX_HISTORY_ITEMS)
   */
  private async cleanupOldItems(): Promise<void> {
    if (!this.useIndexedDB || !this.db) return

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('timestamp')
      const request = index.openCursor(null, 'prev')

      let count = 0

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        
        if (cursor) {
          count++
          if (count > MAX_HISTORY_ITEMS) {
            cursor.delete()
          }
          cursor.continue()
        } else {
          resolve()
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Export history sebagai JSON
   */
  async exportHistory(): Promise<string> {
    const items = await this.getItems(undefined, MAX_HISTORY_ITEMS)
    return JSON.stringify(items, null, 2)
  }

  /**
   * Import history dari JSON
   */
  async importHistory(jsonData: string): Promise<{ imported: number; failed: number }> {
    try {
      const items = JSON.parse(jsonData) as RequestHistoryItem[]
      let imported = 0
      let failed = 0

      for (const item of items) {
        try {
          await this.addItem(item)
          imported++
        } catch {
          failed++
        }
      }

      return { imported, failed }
    } catch (error) {
      throw new Error('Invalid JSON format')
    }
  }
}

// Singleton instance
export const requestHistory = new RequestHistoryManager()
