# Phase 5: Desktop Enhancement with Electron

## Overview
Implementasi native desktop features dengan Electron untuk file system access, system notifications, offline capabilities, dan advanced debugging tools.

## 5.1 Electron Architecture Setup

### Main Process Configuration
```typescript
// electron/main.ts
import { app, BrowserWindow, ipcMain, Menu, shell, dialog, nativeImage } from 'electron'
import { join } from 'path'
import { autoUpdater } from 'electron-updater'
import { WindowManager } from './window-manager'
import { MenuManager } from './menu'
import { IpcHandlers } from './ipc/handlers'
import { Logger } from './logger'

class ElectronApp {
  private windowManager: WindowManager
  private menuManager: MenuManager
  private ipcHandlers: IpcHandlers
  private logger: Logger

  constructor() {
    this.windowManager = new WindowManager()
    this.menuManager = new MenuManager()
    this.ipcHandlers = new IpcHandlers()
    this.logger = new Logger()
    
    this.setupApp()
    this.setupIpc()
    this.setupUpdater()
  }

  private setupApp(): void {
    // App event handlers
    app.whenReady().then(() => {
      this.windowManager.createMainWindow()
      this.menuManager.createMenu()
      
      // Development: Open DevTools
      if (process.env.NODE_ENV === 'development') {
        this.windowManager.mainWindow.webContents.openDevTools()
      }
    })

    app.on('window-all-closed', () => {
      // On macOS, keep app running even when all windows are closed
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    app.on('activate', () => {
      // On macOS, recreate window when dock icon is clicked
      if (BrowserWindow.getAllWindows().length === 0) {
        this.windowManager.createMainWindow()
      }
    })

    // Security: Prevent new window creation
    app.on('web-contents-created', (_, contents) => {
      contents.setWindowOpenHandler(({ url }) => {
        // Open external URLs in default browser
        shell.openExternal(url)
        return { action: 'deny' }
      })
    })

    // Protocol handler for gass:// protocol
    if (process.defaultApp) {
      app.setAsDefaultProtocolClient('gass')
    }

    app.on('open-url', (_, url) => {
      this.handleProtocolUrl(url)
    })
  }

  private setupIpc(): void {
    this.ipcHandlers.register()
  }

  private setupUpdater(): void {
    autoUpdater.checkForUpdatesAndNotify()
    
    autoUpdater.on('update-available', () => {
      this.windowManager.mainWindow.webContents.send('updater:available')
    })
    
    autoUpdater.on('update-downloaded', () => {
      this.windowManager.mainWindow.webContents.send('updater:downloaded')
    })
  }

  private handleProtocolUrl(url: string): void {
    // Handle gass:// protocol for deep linking
    if (url.startsWith('gass://')) {
      this.windowManager.mainWindow.webContents.send('protocol:open', url)
      this.windowManager.mainWindow.focus()
    }
  }
}

// Initialize app
new ElectronApp()
```

### Window Manager
```typescript
// electron/window-manager.ts
import { BrowserWindow, screen } from 'electron'
import { join } from 'path'

export class WindowManager {
  public mainWindow: BrowserWindow

  createMainWindow(): BrowserWindow {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    
    this.mainWindow = new BrowserWindow({
      width: Math.min(1400, width - 100),
      height: Math.min(900, height - 100),
      minWidth: 1000,
      minHeight: 700,
      show: false,
      autoHideMenuBar: true,
      icon: join(__dirname, '../../assets/icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: join(__dirname, '../preload/preload.js'),
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false
      }
    })

    // Load app
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:5173')
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show()
      this.mainWindow.focus()
    })

    // Handle window close
    this.mainWindow.on('close', (event) => {
      // Prevent default close behavior
      event.preventDefault()
      
      // Save window state
      const bounds = this.mainWindow.getBounds()
      this.mainWindow.webContents.send('window:before-close', bounds)
      
      // Hide instead of close for macOS
      if (process.platform === 'darwin') {
        this.mainWindow.hide()
      }
    })

    // Handle window destroy
    this.mainWindow.on('closed', () => {
      this.mainWindow = null as any
    })

    return this.mainWindow
  }

  createRequestWindow(requestData: any): BrowserWindow {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    
    const requestWindow = new BrowserWindow({
      width: 800,
      height: 600,
      parent: this.mainWindow,
      modal: false,
      show: false,
      icon: join(__dirname, '../../assets/icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, '../preload/preload.js')
      }
    })

    // Load request window
    requestWindow.loadURL(`file://${join(__dirname, '../renderer/request.html')}?request=${encodeURIComponent(JSON.stringify(requestData))}`)
    
    requestWindow.once('ready-to-show', () => {
      requestWindow.show()
    })

    return requestWindow
  }
}
```

### Menu Manager
```typescript
// electron/menu.ts
import { Menu, MenuItemConstructorOptions, app, shell, dialog } from 'electron'

export class MenuManager {
  createMenu(): Menu {
    const template: MenuItemConstructorOptions[] = [
      // App Menu (macOS only)
      ...(process.platform === 'darwin' ? [{
        label: app.getName(),
        submenu: [
          { role: 'about', label: `About ${app.getName()}` },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      }] : []),
      
      // File Menu
      {
        label: 'File',
        submenu: [
          {
            label: 'New Collection',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              // Send event to renderer
              BrowserWindow.getFocusedWindow()?.webContents.send('menu:new-collection')
            }
          },
          {
            label: 'New Request',
            accelerator: 'CmdOrCtrl+T',
            click: () => {
              BrowserWindow.getFocusedWindow()?.webContents.send('menu:new-request')
            }
          },
          { type: 'separator' },
          {
            label: 'Import Collection',
            accelerator: 'CmdOrCtrl+I',
            click: () => {
              BrowserWindow.getFocusedWindow()?.webContents.send('menu:import')
            }
          },
          {
            label: 'Export Collection',
            accelerator: 'CmdOrCtrl+E',
            click: () => {
              BrowserWindow.getFocusedWindow()?.webContents.send('menu:export')
            }
          },
          { type: 'separator' },
          {
            label: 'Open Workspace',
            accelerator: 'CmdOrCtrl+O',
            click: () => {
              this.openWorkspace()
            }
          },
          {
            label: 'Save Workspace',
            accelerator: 'CmdOrCtrl+S',
            click: () => {
              BrowserWindow.getFocusedWindow()?.webContents.send('menu:save-workspace')
            }
          },
          { type: 'separator' },
          ...(process.platform !== 'darwin' ? [
            { role: 'quit' }
          ] : [])
        ]
      },
      
      // Edit Menu
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Find',
            accelerator: 'CmdOrCtrl+F',
            click: () => {
              BrowserWindow.getFocusedWindow()?.webContents.send('menu:find')
            }
          }
        ]
      },
      
      // View Menu
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
          { type: 'separator' },
          {
            label: 'Toggle Sidebar',
            accelerator: 'CmdOrCtrl+B',
            click: () => {
              BrowserWindow.getFocusedWindow()?.webContents.send('menu:toggle-sidebar')
            }
          },
          {
            label: 'Toggle Console',
            accelerator: 'CmdOrCtrl+`',
            click: () => {
              BrowserWindow.getFocusedWindow()?.webContents.send('menu:toggle-console')
            }
          }
        ]
      },
      
      // Request Menu
      {
        label: 'Request',
        submenu: [
          {
            label: 'Send Request',
            accelerator: 'CmdOrCtrl+Enter',
            click: () => {
              BrowserWindow.getFocusedWindow()?.webContents.send('menu:send-request')
            }
          },
          {
            label: 'Save Request',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: () => {
              BrowserWindow.getFocusedWindow()?.webContents.send('menu:save-request')
            }
          },
          {
            label: 'Duplicate Request',
            accelerator: 'CmdOrCtrl+D',
            click: () => {
              BrowserWindow.getFocusedWindow()?.webContents.send('menu:duplicate-request')
            }
          }
        ]
      },
      
      // Tools Menu
      {
        label: 'Tools',
        submenu: [
          {
            label: 'Environment Manager',
            click: () => {
              BrowserWindow.getFocusedWindow()?.webContents.send('menu:environment-manager')
            }
          },
          {
            label: 'Collection Runner',
            click: () => {
              BrowserWindow.getFocusedWindow()?.webContents.send('menu:collection-runner')
            }
          },
          {
            label: 'API Documentation',
            click: () => {
              BrowserWindow.getFocusedWindow()?.webContents.send('menu:api-documentation')
            }
          },
          { type: 'separator' },
          {
            label: 'Preferences',
            accelerator: 'CmdOrCtrl+,',
            click: () => {
              BrowserWindow.getFocusedWindow()?.webContents.send('menu:preferences')
            }
          }
        ]
      },
      
      // Help Menu
      {
        label: 'Help',
        submenu: [
          {
            label: 'Documentation',
            click: () => {
              shell.openExternal('https://docs.gassapi.com')
            }
          },
          {
            label: 'Keyboard Shortcuts',
            accelerator: 'F1',
            click: () => {
              BrowserWindow.getFocusedWindow()?.webContents.send('menu:shortcuts')
            }
          },
          {
            label: 'Check for Updates',
            click: () => {
              BrowserWindow.getFocusedWindow()?.webContents.send('menu:check-updates')
            }
          },
          { type: 'separator' },
          {
            label: 'Report Issue',
            click: () => {
              shell.openExternal('https://github.com/gassapi/gassapi/issues')
            }
          },
          {
            label: 'About GASS API',
            click: () => {
              BrowserWindow.getFocusedWindow()?.webContents.send('menu:about')
            }
          }
        ]
      }
    ]

    return Menu.buildFromTemplate(template)
  }

  private async openWorkspace(): Promise<void> {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'GASS API Workspace', extensions: ['gass', 'json'] }
      ]
    })

    if (!result.canceled && result.filePaths.length > 0) {
      BrowserWindow.getFocusedWindow()?.webContents.send('menu:workspace-opened', result.filePaths[0])
    }
  }
}
```

## 5.2 IPC Handlers for Native Features

### HTTP Client Handler
```typescript
// electron/ipc/handlers/http-client.ts
import { ipcMain } from 'electron'
import axios, { AxiosRequestConfig } from 'axios'
import { CertificateManager } from '../certificate-manager'

export class HttpClientHandler {
  private certificateManager: CertificateManager

  constructor() {
    this.certificateManager = new CertificateManager()
    this.registerHandlers()
  }

  private registerHandlers(): void {
    // Send HTTP request with native capabilities
    ipcMain.handle('http:sendRequest', async (_, config) => {
      return this.sendRequest(config)
    })

    // Certificate management
    ipcMain.handle('http:getCertificates', () => {
      return this.certificateManager.getCertificates()
    })

    ipcMain.handle('http:addCertificate', async (_, certificate) => {
      return this.certificateManager.addCertificate(certificate)
    })

    ipcMain.handle('http:removeCertificate', async (_, fingerprint) => {
      return this.certificateManager.removeCertificate(fingerprint)
    })

    // Proxy configuration
    ipcMain.handle('http:getProxyConfig', () => {
      return this.getProxyConfig()
    })

    ipcMain.handle('http:setProxyConfig', async (_, config) => {
      return this.setProxyConfig(config)
    })
  }

  private async sendRequest(config: any): Promise<any> {
    try {
      const axiosConfig: AxiosRequestConfig = {
        method: config.method,
        url: config.url,
        headers: config.headers || {},
        data: config.body,
        timeout: config.timeout || 30000,
        maxRedirects: config.followRedirects ? 5 : 0,
        validateStatus: () => true, // Don't throw on HTTP errors
        // Enhanced Electron capabilities
        responseType: 'arraybuffer',
        decompress: true,
        // Certificate handling
        httpsAgent: this.certificateManager.createAgent(config.certificates),
        // Proxy configuration
        proxy: this.getProxyConfig()
      }

      const response = await axios(axiosConfig)
      const startTime = Date.now()

      // Handle different response types
      let responseData: any
      if (response.data instanceof ArrayBuffer) {
        // Handle binary data
        const textDecoder = new TextDecoder('utf-8', { fatal: false })
        try {
          responseData = textDecoder.decode(response.data)
          
          // Try to parse as JSON
          try {
            responseData = JSON.parse(responseData)
          } catch {
            // Keep as string if not JSON
          }
        } catch {
          responseData = response.data.toString('base64')
        }
      } else {
        responseData = response.data
      }

      const endTime = Date.now()

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: responseData,
        time: endTime - startTime,
        size: this.calculateResponseSize(response),
        redirected: response.request?.res?.responseUrl !== config.url,
        redirectUrl: response.request?.res?.responseUrl
      }
    } catch (error: any) {
      return {
        status: 0,
        statusText: error.message,
        headers: {},
        data: null,
        time: 0,
        size: 0,
        error: {
          message: error.message,
          code: error.code,
          errno: error.errno,
          syscall: error.syscall,
          address: error.address,
          port: error.port
        }
      }
    }
  }

  private calculateResponseSize(response: any): number {
    if (response.data instanceof ArrayBuffer) {
      return response.data.byteLength
    } else if (typeof response.data === 'string') {
      return new Blob([response.data]).size
    } else if (typeof response.data === 'object') {
      return new Blob([JSON.stringify(response.data)]).size
    }
    return 0
  }

  private getProxyConfig(): any {
    // Get system proxy configuration
    return {
      proxy: false,
      host: '',
      port: '',
      username: '',
      password: ''
    }
  }

  private async setProxyConfig(config: any): Promise<void> {
    // Set system proxy configuration
    // This would integrate with system proxy settings
  }
}
```

### File System Handler
```typescript
// electron/ipc/handlers/file-system.ts
import { ipcMain, dialog } from 'electron'
import { readFile, writeFile, mkdir, readdir, stat } from 'fs/promises'
import { join, basename, dirname, extname } from 'path'
import { app } from 'electron'

export class FileSystemHandler {
  private userDataPath: string

  constructor() {
    this.userDataPath = app.getPath('userData')
    this.registerHandlers()
  }

  private registerHandlers(): void {
    // File operations
    ipcMain.handle('fs:readFile', async (_, filePath: string) => {
      return this.readFile(filePath)
    })

    ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
      return this.writeFile(filePath, content)
    })

    ipcMain.handle('fs:readDirectory', async (_, dirPath: string) => {
      return this.readDirectory(dirPath)
    })

    ipcMain.handle('fs:showOpenDialog', async (_, options) => {
      return this.showOpenDialog(options)
    })

    ipcMain.handle('fs:showSaveDialog', async (_, options) => {
      return this.showSaveDialog(options)
    })

    ipcMain.handle('fs:getAppDataPath', () => {
      return this.userDataPath
    })

    // Collection operations
    ipcMain.handle('fs:saveCollection', async (_, collection) => {
      return this.saveCollection(collection)
    })

    ipcMain.handle('fs:loadCollection', async (_, collectionId: string) => {
      return this.loadCollection(collectionId)
    })

    ipcMain.handle('fs:deleteCollection', async (_, collectionId: string) => {
      return this.deleteCollection(collectionId)
    })

    // Request history
    ipcMain.handle('fs:saveRequestHistory', async (_, history) => {
      return this.saveRequestHistory(history)
    })

    ipcMain.handle('fs:loadRequestHistory', async () => {
      return this.loadRequestHistory()
    })
  }

  private async readFile(filePath: string): Promise<{ content: string; error?: string }> {
    try {
      const content = await readFile(filePath, 'utf-8')
      return { content }
    } catch (error: any) {
      return { content: '', error: error.message }
    }
  }

  private async writeFile(filePath: string, content: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Ensure directory exists
      const dir = dirname(filePath)
      await mkdir(dir, { recursive: true })
      
      await writeFile(filePath, content, 'utf-8')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  private async readDirectory(dirPath: string): Promise<{ files: Array<{ name: string; isDirectory: boolean; size: number; modified: Date }>; error?: string }> {
    try {
      const files = await readdir(dirPath)
      const fileStats = await Promise.all(
        files.map(async (file) => {
          const filePath = join(dirPath, file)
          const stats = await stat(filePath)
          return {
            name: file,
            isDirectory: stats.isDirectory(),
            size: stats.size,
            modified: stats.mtime
          }
        })
      )
      return { files: fileStats }
    } catch (error: any) {
      return { files: [], error: error.message }
    }
  }

  private async showOpenDialog(options: any): Promise<{ canceled: boolean; filePaths: string[] }> {
    const result = await dialog.showOpenDialog({
      properties: options.properties || ['openFile'],
      filters: options.filters || [],
      defaultPath: options.defaultPath || this.userDataPath
    })

    return {
      canceled: result.canceled,
      filePaths: result.filePaths || []
    }
  }

  private async showSaveDialog(options: any): Promise<{ canceled: boolean; filePath?: string }> {
    const result = await dialog.showSaveDialog({
      defaultPath: options.defaultPath || join(this.userDataPath, options.defaultName || ''),
      filters: options.filters || []
    })

    return {
      canceled: result.canceled,
      filePath: result.filePath
    }
  }

  private async saveCollection(collection: any): Promise<{ success: boolean; error?: string }> {
    try {
      const collectionsDir = join(this.userDataPath, 'collections')
      await mkdir(collectionsDir, { recursive: true })
      
      const filePath = join(collectionsDir, `${collection.id}.json`)
      const content = JSON.stringify(collection, null, 2)
      
      await writeFile(filePath, content, 'utf-8')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  private async loadCollection(collectionId: string): Promise<{ collection?: any; error?: string }> {
    try {
      const filePath = join(this.userDataPath, 'collections', `${collectionId}.json`)
      const content = await readFile(filePath, 'utf-8')
      const collection = JSON.parse(content)
      return { collection }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  private async deleteCollection(collectionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const filePath = join(this.userDataPath, 'collections', `${collectionId}.json`)
      await unlink(filePath)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  private async saveRequestHistory(history: any[]): Promise<{ success: boolean; error?: string }> {
    try {
      const filePath = join(this.userDataPath, 'request-history.json')
      const content = JSON.stringify(history, null, 2)
      await writeFile(filePath, content, 'utf-8')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  private async loadRequestHistory(): Promise<{ history?: any[]; error?: string }> {
    try {
      const filePath = join(this.userDataPath, 'request-history.json')
      const content = await readFile(filePath, 'utf-8')
      const history = JSON.parse(content)
      return { history }
    } catch (error: any) {
      return { history: [], error: error.message }
    }
  }
}
```

## 5.3 Preload Script for Secure IPC

### Preload API Definition
```typescript
// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron'

// Define the API interface
export interface ElectronAPI {
  // HTTP Client
  httpClient: {
    sendRequest: (config: any) => Promise<any>
    getCertificates: () => Promise<any[]>
    addCertificate: (certificate: any) => Promise<any>
    removeCertificate: (fingerprint: string) => Promise<any>
    getProxyConfig: () => Promise<any>
    setProxyConfig: (config: any) => Promise<void>
  }
  
  // File System
  fs: {
    readFile: (filePath: string) => Promise<{ content: string; error?: string }>
    writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
    readDirectory: (dirPath: string) => Promise<{ files: any[]; error?: string }>
    showOpenDialog: (options: any) => Promise<{ canceled: boolean; filePaths: string[] }>
    showSaveDialog: (options: any) => Promise<{ canceled: boolean; filePath?: string }>
    getAppDataPath: () => string
    
    // Collections
    saveCollection: (collection: any) => Promise<{ success: boolean; error?: string }>
    loadCollection: (collectionId: string) => Promise<{ collection?: any; error?: string }>
    deleteCollection: (collectionId: string) => Promise<{ success: boolean; error?: string }>
    
    // History
    saveRequestHistory: (history: any[]) => Promise<{ success: boolean; error?: string }>
    loadRequestHistory: () => Promise<{ history?: any[]; error?: string }>
  }
  
  // System
  system: {
    showNotification: (options: NotificationOptions) => void
    openExternal: (url: string) => void
    getVersion: () => string
    getPlatform: () => string
    showItemInFolder: (fullPath: string) => void
    beep: () => void
  }
  
  // Events
  on: (channel: string, callback: (data: any) => void) => void
  off: (channel: string, callback: (data: any) => void) => void
}

interface NotificationOptions {
  title: string
  body: string
  silent?: boolean
  icon?: string
}

// Expose the API to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // HTTP Client API
  httpClient: {
    sendRequest: (config) => ipcRenderer.invoke('http:sendRequest', config),
    getCertificates: () => ipcRenderer.invoke('http:getCertificates'),
    addCertificate: (cert) => ipcRenderer.invoke('http:addCertificate', cert),
    removeCertificate: (fingerprint) => ipcRenderer.invoke('http:removeCertificate', fingerprint),
    getProxyConfig: () => ipcRenderer.invoke('http:getProxyConfig'),
    setProxyConfig: (config) => ipcRenderer.invoke('http:setProxyConfig', config)
  },
  
  // File System API
  fs: {
    readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', filePath, content),
    readDirectory: (dirPath) => ipcRenderer.invoke('fs:readDirectory', dirPath),
    showOpenDialog: (options) => ipcRenderer.invoke('fs:showOpenDialog', options),
    showSaveDialog: (options) => ipcRenderer.invoke('fs:showSaveDialog', options),
    getAppDataPath: () => ipcRenderer.invoke('fs:getAppDataPath'),
    saveCollection: (collection) => ipcRenderer.invoke('fs:saveCollection', collection),
    loadCollection: (collectionId) => ipcRenderer.invoke('fs:loadCollection', collectionId),
    deleteCollection: (collectionId) => ipcRenderer.invoke('fs:deleteCollection', collectionId),
    saveRequestHistory: (history) => ipcRenderer.invoke('fs:saveRequestHistory', history),
    loadRequestHistory: () => ipcRenderer.invoke('fs:loadRequestHistory')
  },
  
  // System API
  system: {
    showNotification: (options) => ipcRenderer.invoke('system:showNotification', options),
    openExternal: (url) => ipcRenderer.invoke('system:openExternal', url),
    getVersion: () => ipcRenderer.invoke('system:getVersion'),
    getPlatform: () => ipcRenderer.invoke('system:getPlatform'),
    showItemInFolder: (fullPath) => ipcRenderer.invoke('system:showItemInFolder', fullPath),
    beep: () => ipcRenderer.invoke('system:beep')
  },
  
  // Event listeners
  on: (channel, callback) => {
    ipcRenderer.on(channel, (_, data) => callback(data))
  },
  
  off: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback)
  }
} as ElectronAPI)

// Type declaration for renderer process
declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
```

## Deliverables
- ✅ Electron main process dengan proper window management
- ✅ Native HTTP client tanpa CORS restrictions
- ✅ File system operations untuk collections dan history
- ✅ Certificate management untuk SSL testing
- ✅ System notifications untuk test results
- ✅ Menu bar dengan keyboard shortcuts
- ✅ Auto-updater untuk seamless updates
- ✅ Secure IPC communication dengan context isolation

## Next Steps
Lanjut ke Phase 6: Web + Desktop Integration untuk implementasi cross-platform synchronization dan progressive web app features.
