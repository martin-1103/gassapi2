# Phase 6: Web + Desktop Integration

## Overview
Implementasi cross-platform synchronization, progressive web app features, dan unified experience antara web dan desktop versions.

## 10.1 Progressive Web App (PWA)

### Service Worker Implementation
```typescript
// public/sw.ts
// Service Worker untuk offline capability dan caching

const CACHE_NAME = 'gass-api-v1'
const STATIC_CACHE = 'gass-api-static-v1'
const API_CACHE = 'gass-api-api-v1'

// Assets to cache for offline usage
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // CSS dan JS files akan ditambahkan oleh build process
]

// API endpoints untuk caching
const CACHED_API_ENDPOINTS = [
  '/api/projects',
  '/api/collections',
  '/api/environments'
]

self.addEventListener('install', (event) => {
  console.log('SW: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  console.log('SW: Activating...')
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== API_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Network with caching strategy
self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  // Handle static assets
  if (request.method === 'GET' && 
      (request.destination === 'script' || 
       request.destination === 'style' || 
       request.destination === 'image' ||
       request.destination === 'font')) {
    event.respondWith(
      caches.open(STATIC_CACHE)
        .then((cache) => cache.match(request))
        .then((response) => {
          return response || fetch(request).then((response) => {
            // Cache successful responses
            if (response.ok) {
              caches.open(STATIC_CACHE)
                .then((cache) => cache.put(request, response.clone()))
            }
            return response
          })
        })
    )
    return
  }

  // Handle API requests
  if (url.origin === self.location.origin && 
      CACHED_API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))) {
    event.respondWith(
      caches.open(API_CACHE)
        .then((cache) => cache.match(request))
        .then((response) => {
          // Return cached response if available
          if (response) {
            // Try network in background for fresh data
            fetch(request).then((networkResponse) => {
              if (networkResponse.ok) {
                cache.put(request, networkResponse.clone())
              }
            }).catch(() => {
              // Network failed, serve cached version
            })
            return response
          }
          
          // No cached version, fetch from network
          return fetch(request).then((response) => {
            if (response.ok) {
              caches.open(API_CACHE)
                .then((cache) => cache.put(request, response.clone()))
            }
            return response
          })
        })
    )
    return
  }

  // Handle navigation requests (offline first)
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/').then((response) => {
        return response || fetch(request)
      })
    )
    return
  }

  // Default: Network only
  event.respondWith(fetch(request))
})

// Sync events untuk background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-collections') {
    event.waitUntil(syncCollections())
  }
  
  if (event.tag === 'sync-requests') {
    event.waitUntil(syncPendingRequests())
  }
})

async function syncCollections(): Promise<void> {
  try {
    // Sync collections dari server
    const response = await fetch('/api/sync/collections')
    if (response.ok) {
      const collections = await response.json()
      
      // Cache collections
      const cache = await caches.open(API_CACHE)
      await cache.put('/api/collections', new Response(JSON.stringify(collections)))
    }
  } catch (error) {
    console.error('Failed to sync collections:', error)
  }
}

async function syncPendingRequests(): Promise<void> {
  try {
    // Sync pending requests dari IndexedDB
    const pendingRequests = await getPendingRequests()
    
    for (const request of pendingRequests) {
      try {
        const response = await fetch(request.url, request.options)
        if (response.ok) {
          await removePendingRequest(request.id)
        }
      } catch (error) {
        console.error('Failed to sync request:', error)
      }
    }
  } catch (error) {
    console.error('Failed to sync pending requests:', error)
  }
}

async function getPendingRequests(): Promise<any[]> {
  // Get pending requests dari IndexedDB
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GassAPI_DB', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['pendingRequests'], 'readonly')
      const store = transaction.objectStore('pendingRequests')
      const getRequest = store.getAll()
      
      getRequest.onerror = () => reject(getRequest.error)
      getRequest.onsuccess = () => resolve(getRequest.result)
    }
  })
}

async function removePendingRequest(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GassAPI_DB', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['pendingRequests'], 'readwrite')
      const store = transaction.objectStore('pendingRequests')
      const deleteRequest = store.delete(id)
      
      deleteRequest.onerror = () => reject(deleteRequest.error)
      deleteRequest.onsuccess = () => resolve()
    }
  })
}
```

### PWA Manifest
```json
// public/manifest.json
{
  "name": "GASS API - Modern API Documentation Tool",
  "short_name": "GASS API",
  "description": "Professional API testing and documentation tool",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "New Request",
      "short_name": "New",
      "description": "Create a new API request",
      "url": "/new",
      "icons": [{ "src": "/icons/new-96.png", "sizes": "96x96" }]
    },
    {
      "name": "Collections",
      "short_name": "Collections",
      "description": "View your API collections",
      "url": "/collections",
      "icons": [{ "src": "/icons/collections-96.png", "sizes": "96x96" }]
    }
  ],
  "share_target": {
    "action": "/import",
    "method": "GET",
    "params": {
      "url": "url",
      "title": "title"
    }
  }
}
```

## 10.2 Cross-Platform Sync Engine

### Sync Manager
```typescript
// src/lib/sync/sync-manager.ts
export interface SyncConfig {
  endpoint: string
  apiKey: string
  autoSync: boolean
  syncInterval: number // dalam minutes
  lastSync: number
}

export interface SyncableData {
  type: 'collection' | 'environment' | 'request-history' | 'settings'
  id: string
  data: any
  timestamp: number
  version: number
}

export interface ConflictResolution {
  strategy: 'local' | 'remote' | 'merge' | 'manual'
  timestamp: number
}

export class SyncManager {
  private config: SyncConfig | null = null
  private syncQueue: SyncableData[] = []
  private isOnline = navigator.onLine
  private conflictResolver: ConflictResolution = {
    strategy: 'local',
    timestamp: Date.now()
  }

  constructor() {
    this.setupEventListeners()
    this.loadConfig()
  }

  private setupEventListeners(): void {
    // Network status changes
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processSyncQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })

    // Sync when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline && this.shouldAutoSync()) {
        this.sync()
      }
    })
  }

  async loadConfig(): Promise<void> {
    try {
      const stored = localStorage.getItem('gass-sync-config')
      if (stored) {
        this.config = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load sync config:', error)
    }
  }

  async saveConfig(config: Partial<SyncConfig>): Promise<void> {
    this.config = { ...this.config, ...config } as SyncConfig
    try {
      localStorage.setItem('gass-sync-config', JSON.stringify(this.config))
    } catch (error) {
      console.warn('Failed to save sync config:', error)
    }
  }

  async addDataToSync(data: Omit<SyncableData, 'timestamp'>): Promise<void> {
    const syncableData: SyncableData = {
      ...data,
      timestamp: Date.now(),
      version: 1
    }

    if (this.isOnline && this.config?.autoSync) {
      await this.uploadData(syncableData)
    } else {
      this.syncQueue.push(syncableData)
      await this.saveSyncQueue()
    }
  }

  async sync(): Promise<{
    success: boolean
    uploaded: number
    downloaded: number
    conflicts: any[]
  }> {
    if (!this.config || !this.isOnline) {
      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        conflicts: []
      }
    }

    try {
      // Upload pending data
      const uploaded = await this.uploadPendingData()
      
      // Download remote data
      const { downloaded, conflicts } = await this.downloadRemoteData()
      
      // Update last sync timestamp
      await this.saveConfig({
        lastSync: Date.now()
      })

      // Clear sync queue
      this.syncQueue = []
      await this.saveSyncQueue()

      return {
        success: true,
        uploaded,
        downloaded,
        conflicts
      }
    } catch (error) {
      console.error('Sync failed:', error)
      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        conflicts: []
      }
    }
  }

  private async uploadPendingData(): Promise<number> {
    if (this.syncQueue.length === 0) return 0

    let uploaded = 0
    for (const data of this.syncQueue) {
      try {
        await this.uploadData(data)
        uploaded++
      } catch (error) {
        console.warn('Failed to upload data:', error)
      }
    }

    return uploaded
  }

  private async uploadData(data: SyncableData): Promise<void> {
    const response = await fetch(`${this.config!.endpoint}/sync/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config!.apiKey}`
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }
  }

  private async downloadRemoteData(): Promise<{
    downloaded: number
    conflicts: any[]
  }> {
    const lastSync = this.config?.lastSync || 0
    
    const response = await fetch(
      `${this.config!.endpoint}/sync/sync?since=${lastSync}`,
      {
        headers: {
          'Authorization': `Bearer ${this.config!.apiKey}`
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`)
    }

    const remoteData = await response.json()
    const conflicts: any[] = []
    let downloaded = 0

    for (const item of remoteData) {
      try {
        const localData = await this.getLocalData(item.type, item.id)
        
        if (localData) {
          // Check for conflicts
          if (this.hasConflict(localData, item)) {
            const resolution = await this.resolveConflict(localData, item)
            conflicts.push({
              type: item.type,
              id: item.id,
              localData,
              remoteData: item,
              resolution
            })
            
            if (resolution.strategy === 'merge') {
              const merged = await this.mergeData(localData, item)
              await this.saveLocalData(merged)
              downloaded++
            }
          } else {
            // No conflict, update local data
            await this.saveLocalData(item)
            downloaded++
          }
        } else {
          // No local data, just save remote data
          await this.saveLocalData(item)
          downloaded++
        }
      } catch (error) {
        console.warn('Failed to process remote data:', error)
      }
    }

    return { downloaded, conflicts }
  }

  private async getLocalData(type: string, id: string): Promise<any> {
    // Get data dari IndexedDB atau localStorage
    try {
      switch (type) {
        case 'collection':
          return this.getLocalCollection(id)
        case 'environment':
          return this.getLocalEnvironment(id)
        case 'request-history':
          return this.getLocalRequestHistory(id)
        default:
          return null
      }
    } catch {
      return null
    }
  }

  private async saveLocalData(data: SyncableData): Promise<void> {
    try {
      switch (data.type) {
        case 'collection':
          await this.saveLocalCollection(data)
          break
        case 'environment':
          await this.saveLocalEnvironment(data)
          break
        case 'request-history':
          await this.saveLocalRequestHistory(data)
          break
      }
    } catch (error) {
      console.warn('Failed to save local data:', error)
    }
  }

  private hasConflict(local: any, remote: SyncableData): boolean {
    return local.timestamp > remote.timestamp && 
           local.version !== remote.version
  }

  private async resolveConflict(local: any, remote: SyncableData): Promise<ConflictResolution> {
    // Auto-resolution based on strategy
    switch (this.conflictResolver.strategy) {
      case 'local':
        return { strategy: 'local', timestamp: Date.now() }
      case 'remote':
        return { strategy: 'remote', timestamp: Date.now() }
      case 'merge':
        return { strategy: 'merge', timestamp: Date.now() }
      case 'manual':
        // Show conflict resolution dialog
        return this.showConflictDialog(local, remote)
      default:
        return { strategy: 'local', timestamp: Date.now() }
    }
  }

  private async mergeData(local: any, remote: SyncableData): Promise<SyncableData> {
    // Smart merge logic based on data type
    switch (remote.type) {
      case 'collection':
        return this.mergeCollections(local, remote)
      case 'environment':
        return this.mergeEnvironments(local, remote)
      default:
        return this.mergeGeneric(local, remote)
    }
  }

  private mergeCollections(local: any, remote: SyncableData): SyncableData {
    // Merge collections dengan mempertahankan semua changes
    const merged = {
      ...remote.data,
      // Local changes yang lebih baru
      ...(local.timestamp > remote.timestamp ? local.data : {}),
      // Update metadata
      updatedAt: Date.now(),
      version: Math.max(local.version || 1, remote.version || 1) + 1
    }

    return {
      ...remote,
      data: merged
    }
  }

  private mergeEnvironments(local: any, remote: SyncableData): SyncableData {
    // Merge environment variables
    const mergedVariables = {
      ...remote.data.variables,
      ...(local.timestamp > remote.timestamp ? local.data.variables : {})
    }

    return {
      ...remote,
      data: {
        ...remote.data,
        variables: mergedVariables,
        updatedAt: Date.now(),
        version: Math.max(local.version || 1, remote.version || 1) + 1
      }
    }
  }

  private mergeGeneric(local: any, remote: SyncableData): SyncableData {
    // Generic merge logic
    return {
      ...remote,
      data: local.timestamp > remote.timestamp ? local.data : remote.data,
      version: Math.max(local.version || 1, remote.version || 1) + 1
    }
  }

  private showConflictDialog(local: any, remote: SyncableData): ConflictResolution {
    // Show modal untuk manual conflict resolution
    // Ini akan menampilkan UI untuk user memilih
    return { strategy: 'local', timestamp: Date.now() }
  }

  private shouldAutoSync(): boolean {
    if (!this.config?.autoSync) return false
    
    const now = Date.now()
    const syncInterval = this.config.syncInterval * 60 * 1000 // Convert to ms
    return now - this.config.lastSync > syncInterval
  }

  private async saveSyncQueue(): Promise<void> {
    try {
      localStorage.setItem('gass-sync-queue', JSON.stringify(this.syncQueue))
    } catch (error) {
      console.warn('Failed to save sync queue:', error)
    }
  }

  private async loadSyncQueue(): Promise<void> {
    try {
      const stored = localStorage.getItem('gass-sync-queue')
      if (stored) {
        this.syncQueue = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load sync queue:', error)
    }
  }

  private async processSyncQueue(): Promise<void> {
    if (this.syncQueue.length > 0 && this.config?.autoSync) {
      await this.sync()
    }
  }

  // Local storage helpers
  private async getLocalCollection(id: string): Promise<any> {
    try {
      const collections = JSON.parse(localStorage.getItem('gass-collections') || '[]')
      return collections.find((c: any) => c.id === id)
    } catch {
      return null
    }
  }

  private async saveLocalCollection(data: SyncableData): Promise<void> {
    try {
      const collections = JSON.parse(localStorage.getItem('gass-collections') || '[]')
      const index = collections.findIndex((c: any) => c.id === data.id)
      
      if (index >= 0) {
        collections[index] = data.data
      } else {
        collections.push(data.data)
      }
      
      localStorage.setItem('gass-collections', JSON.stringify(collections))
    } catch (error) {
      console.warn('Failed to save local collection:', error)
    }
  }

  // ... similar methods untuk environments dan request history
}
```

## 10.3 Platform Detection & Features

### Platform Utils
```typescript
// src/lib/platform/platform-utils.ts
export interface PlatformFeatures {
  isElectron: boolean
  isPWA: boolean
  isMobile: boolean
  isDesktop: boolean
  supportsFileSystem: boolean
  supportsNotifications: boolean
  supportsBackgroundSync: boolean
  supportsOffline: boolean
}

export class PlatformDetector {
  static getFeatures(): PlatformFeatures {
    const isElectron = this.isElectron()
    const isPWA = this.isPWA()
    const isMobile = this.isMobile()
    const isDesktop = !isMobile
    
    return {
      isElectron,
      isPWA,
      isMobile,
      isDesktop,
      supportsFileSystem: isElectron || (isPWA && 'showDirectoryPicker' in window),
      supportsNotifications: isElectron || 'Notification' in window,
      supportsBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      supportsOffline: 'serviceWorker' in navigator
    }
  }

  static isElectron(): boolean {
    return !!(window as any).electronAPI
  }

  static isPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true
  }

  static isMobile(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  static getPlatform(): 'electron' | 'web' | 'pwa' {
    if (this.isElectron()) return 'electron'
    if (this.isPWA()) return 'pwa'
    return 'web'
  }

  static getOS(): 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'unknown' {
    const userAgent = navigator.userAgent.toLowerCase()
    const platform = navigator.platform.toLowerCase()
    
    if (platform.includes('win') || userAgent.includes('win')) return 'windows'
    if (platform.includes('mac') || userAgent.includes('mac')) return 'macos'
    if (platform.includes('linux') || userAgent.includes('linux')) return 'linux'
    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios'
    if (/android/.test(userAgent)) return 'android'
    
    return 'unknown'
  }

  static getBrowser(): 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown' {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('chrome')) return 'chrome'
    if (userAgent.includes('firefox')) return 'firefox'
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari'
    if (userAgent.includes('edg/')) return 'edge'
    
    return 'unknown'
  }

  static async installPWA(): Promise<boolean> {
    if ('beforeinstallprompt' in window) {
      const promptEvent = (window as any).beforeinstallprompt
      if (promptEvent) {
        promptEvent.prompt()
        const result = await promptEvent.userChoice
        return result.outcome === 'accepted'
      }
    }
    return false
  }

  static async checkPWAUpdate(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration && registration.waiting) {
        // Update available
        return true
      }
    }
    return false
  }

  static async applyPWAUpdate(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        registration.waiting.addEventListener('statechange', (e) => {
          if ((e.target as any).state === 'activated') {
            window.location.reload()
          }
        })
      }
    }
  }
}
```

### Platform-Aware Component
```typescript
// src/components/platform/platform-features.tsx
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Download, 
  Monitor, 
  Smartphone, 
  Wifi, 
  WifiOff,
  Bell,
  BellOff,
  Sync,
  AlertCircle
} from 'lucide-react'
import { PlatformDetector, PlatformFeatures } from '@/lib/platform/platform-utils'
import { useToast } from '@/hooks/use-toast'

export function PlatformFeatures() {
  const [features, setFeatures] = useState<PlatformFeatures | null>(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const platformFeatures = PlatformDetector.getFeatures()
    setFeatures(platformFeatures)
    
    // Check for PWA updates
    if (platformFeatures.isPWA) {
      PlatformDetector.checkPWAUpdate().then(setUpdateAvailable)
    }
  }, [])

  const handleInstallPWA = async () => {
    try {
      const installed = await PlatformDetector.installPWA()
      if (installed) {
        toast({
          title: 'PWA Installed',
          description: 'GASS API has been installed to your device'
        })
      }
    } catch (error) {
      toast({
        title: 'Installation Failed',
        description: 'Could not install PWA. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const handleApplyUpdate = async () => {
    try {
      await PlatformDetector.applyPWAUpdate()
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Could not apply update. Please refresh manually.',
        variant: 'destructive'
      })
    }
  }

  if (!features) return null

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Platform Information
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Platform Type */}
        <div>
          <h4 className="font-medium mb-2">Platform Type</h4>
          <div className="flex flex-wrap gap-2">
            {features.isElectron && (
              <Badge variant="outline">Desktop App</Badge>
            )}
            {features.isPWA && (
              <Badge variant="outline">Progressive Web App</Badge>
            )}
            {features.isMobile && (
              <Badge variant="outline">Mobile</Badge>
            )}
            {features.isDesktop && (
              <Badge variant="outline">Desktop</Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Available Features */}
        <div>
          <h4 className="font-medium mb-2">Available Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FeatureItem
              icon={<Download className="w-4 h-4" />}
              title="File System Access"
              available={features.supportsFileSystem}
            />
            <FeatureItem
              icon={<Bell className="w-4 h-4" />}
              title="Notifications"
              available={features.supportsNotifications}
            />
            <FeatureItem
              icon={<Sync className="w-4 h-4" />}
              title="Background Sync"
              available={features.supportsBackgroundSync}
            />
            <FeatureItem
              icon={<Wifi className="w-4 h-4" />}
              title="Offline Support"
              available={features.supportsOffline}
            />
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div>
          <h4 className="font-medium mb-2">Actions</h4>
          <div className="space-y-2">
            {features.isPWA && !features.isElectron && !window.matchMedia('(display-mode: standalone)').matches && (
              <Button onClick={handleInstallPWA} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Install PWA
              </Button>
            )}
            
            {updateAvailable && (
              <Button onClick={handleApplyUpdate} variant="outline" className="w-full">
                <Sync className="w-4 h-4 mr-2" />
                Apply Update
              </Button>
            )}
          </div>
        </div>

        {/* Network Status */}
        <div>
          <h4 className="font-medium mb-2">Network Status</h4>
          <div className="flex items-center gap-2">
            {navigator.onLine ? (
              <>
                <Wifi className="w-4 h-4 text-green-600" />
                <span className="text-sm">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-600" />
                <span className="text-sm">Offline</span>
              </>
            )}
          </div>
          
          {!navigator.onLine && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Offline Mode</p>
                  <p className="text-xs text-yellow-700">
                    Some features may be limited while offline. Your data will be synced when you reconnect.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface FeatureItemProps {
  icon: React.ReactNode
  title: string
  available: boolean
}

function FeatureItem({ icon, title, available }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border">
      <div className={`${
        available ? 'text-green-600' : 'text-gray-400'
      }`}>
        {icon}
      </div>
      <span className={`text-sm ${
        available ? 'text-gray-900' : 'text-gray-500'
      }`}>
        {title}
      </span>
      {available ? (
        <div className="w-2 h-2 bg-green-600 rounded-full ml-auto" />
      ) : (
        <div className="w-2 h-2 bg-gray-300 rounded-full ml-auto" />
      )}
    </div>
  )
}
```

## Deliverables
- ✅ Progressive Web App dengan offline capability
- ✅ Service Worker untuk caching dan background sync
- ✅ Cross-platform synchronization engine
- ✅ Conflict resolution system
- ✅ Platform detection dan feature availability
- ✅ PWA installation and update management
- ✅ Network status handling
- ✅ Unified experience antara web dan desktop

## Final Outcome
Complete modern API documentation tool yang works seamlessly di web browser, PWA, dan desktop app dengan:

✅ **Professional UI** - Modern shadcn/ui interface dengan dark mode
✅ **Advanced API Testing** - Direct requests, variable interpolation, test scripts
✅ **Import/Export** - Postman, OpenAPI, cURL, multiple programming languages
✅ **Cross-Platform Sync** - Seamless synchronization antara web dan desktop
✅ **Offline Capability** - Works tanpa internet connection
✅ **Desktop Features** - File access, notifications, native HTTP client
✅ **Testing Engine** - JavaScript test scripts dengan assertions
✅ **Documentation** - Auto-generated API docs dari endpoints

Total Implementation Time: 4-6 weeks
Ready untuk production deployment dan user adoption!
