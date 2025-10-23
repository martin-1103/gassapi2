# ⚡ Build Configuration

## 🎯 Multi-Target Strategy

Single source code → Web + Electron builds dengan optimal performance untuk masing-masing platform.

---

## 🌐 Web Build Configuration

### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
    },
  },
  build: {
    outDir: 'dist-web',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          flow: ['reactflow'],
          ui: ['@headlessui/react', '@heroicons/react'],
          utils: ['axios'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
```

### Web Package Scripts
```json
{
  "scripts": {
    "dev": "vite --mode development",
    "build:web": "vite build --mode production",
    "preview:web": "vite preview --port 4173",
    "test:web": "vitest --mode web"
  }
}
```

---

## 🖥️ Electron Build Configuration

### vite.electron.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@electron': resolve(__dirname, 'src/electron'),
    },
  },
  build: {
    outDir: 'dist-electron',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/electron/main.ts'),
        preload: resolve(__dirname, 'src/electron/preload.ts'),
        index: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  define: {
    __ELECTRON__: 'true',
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
```

### Electron Builder Configuration
```json
{
  "build": {
    "appId": "com.gassapi.desktop",
    "productName": "GassAPI Desktop",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist-electron/**/*",
      "node_modules/**/*"
    ],
    "extraMetadata": {
      "main": "dist-electron/main.js"
    },
    "mac": {
      "category": "public.app-category.developer-tools",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        }
      ]
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ]
    },
    "linux": {
      "target": [
        {
          "target": "AppImage",
          "arch": ["x64"]
        }
      ]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

### Electron Package Scripts
```json
{
  "scripts": {
    "dev:electron": "concurrently \"npm run dev:electron:renderer\" \"npm run dev:electron:main\"",
    "dev:electron:renderer": "vite --config vite.electron.config.ts --mode electron-renderer",
    "dev:electron:main": "tsc -w src/electron/main.ts",
    "build:electron": "npm run build:electron:renderer && npm run build:electron:main",
    "build:electron:renderer": "vite build --config vite.electron.config.ts --mode electron-renderer",
    "build:electron:main": "tsc src/electron/main.ts --outDir dist-electron",
    "package:electron": "electron-builder",
    "dist:electron": "npm run build:electron && electron-builder --publish=never"
  }
}
```

---

## 🔧 Main Process Configuration

### src/electron/main.ts
```typescript
import { app, BrowserWindow, Menu, shell } from 'electron';
import { join } from 'path';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'default',
    show: false,
  });

  // Load app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
};

// App events
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security
app.on('web-contents-created', (_, contents) => {
  contents.on('new-window', (navigationEvent, url) => {
    navigationEvent.preventDefault();
    shell.openExternal(url);
  });
});
```

### src/electron/preload.ts
```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => ipcRenderer.invoke('app:getVersion'),

  // File operations
  selectFile: () => ipcRenderer.invoke('dialog:selectFile'),
  saveFile: (content: string, filename: string) =>
    ipcRenderer.invoke('dialog:saveFile', content, filename),

  // Notifications
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke('notification:show', title, body),

  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
});

declare global {
  interface Window {
    electronAPI: {
      getVersion: () => Promise<string>;
      selectFile: () => Promise<string>;
      saveFile: (content: string, filename: string) => Promise<void>;
      showNotification: (title: string, body: string) => Promise<void>;
      minimizeWindow: () => Promise<void>;
      maximizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
    };
  }
}
```

---

## 📦 Package.json Configuration

```json
{
  "name": "gassapi-frontend",
  "version": "1.0.0",
  "main": "dist-electron/main.js",
  "scripts": {
    "dev": "vite --mode development",
    "dev:electron": "concurrently \"npm run dev:electron:renderer\" \"npm run dev:electron:main\"",
    "build:web": "vite build --mode production",
    "build:electron": "npm run build:electron:renderer && npm run build:electron:main",
    "package:electron": "electron-builder",
    "dist:electron": "npm run build:electron && electron-builder --publish=never"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "reactflow": "^11.10.0",
    "@headlessui/react": "^1.7.0",
    "@heroicons/react": "^2.0.0",
    "axios": "^1.5.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0",
    "typescript": "^5.0.0",
    "electron": "^26.0.0",
    "electron-builder": "^24.6.0",
    "concurrently": "^8.2.0"
  }
}
```

---

## 🚀 Build Outputs

### Web Build (`dist-web/`)
```
dist-web/
├── assets/
│   ├── index-abc123.js
│   ├── vendor-def456.js
│   └── styles-ghi789.css
├── index.html
└── favicon.ico
```

### Electron Build (`dist-electron/` + `release/`)
```
dist-electron/
├── main.js
├── preload.js
├── assets/
└── index.html

release/
├── GassAPI-Desktop-1.0.0.dmg
├── GassAPI-Desktop-Setup-1.0.0.exe
└── GassAPI-Desktop-1.0.0.AppImage
```