# Phase 1: Foundation Setup

## Overview
Setup foundation untuk modern API documentation tool dengan shadcn/ui components dan Electron architecture.

## 1.1 Shadcn/UI Implementation

### Install Shadcn/UI CLI
```bash
npm install -D @shadcn/ui
```

### Setup Configuration
- Create `components.json` configuration file
- Configure design tokens dan theme system
- Setup component library structure

### Essential Components Installation
```bash
# Core UI components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add card
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add resizable
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add label
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add toast
```

### Utility Setup
- Create `src/lib/utils/cn.ts` untuk className merging
- Setup proper TypeScript types
- Configure component variants dengan CVA

## 1.2 Electron + Web Hybrid Setup

### Install Electron Dependencies
```json
{
  "main": "dist-electron/main.js",
  "scripts": {
    "dev": "concurrently \"npm run dev:web\" \"npm run dev:electron\"",
    "dev:web": "vite",
    "dev:electron": "wait-on http://localhost:5173 && electron .",
    "build": "npm run build:web && npm run build:electron",
    "build:web": "vite build",
    "build:electron": "electron-builder",
    "dist": "npm run build && electron-builder --publish=never"
  },
  "dependencies": {
    "@electron-toolkit/preload": "^3.0.0",
    "@electron-toolkit/utils": "^3.0.0",
    "electron-updater": "^6.1.7"
  },
  "devDependencies": {
    "electron": "^28.1.0",
    "electron-builder": "^24.9.1",
    "concurrently": "^8.2.2"
  }
}
```

### Directory Structure
```
frontend/
├── electron/
│   ├── main.ts              # Main process
│   ├── preload.ts           # Preload script
│   ├── menu.ts              # Menu configuration
│   ├── updater.ts           # Auto-updater
│   └── ipc/                 # IPC handlers
│       ├── file.ts          # File operations
│       ├── system.ts        # System operations
│       └── app.ts           # App operations
├── src/
│   ├── components/
│   │   └── ui/              # Shadcn/ui components
│   ├── electron/            # Electron-specific code
│   │   ├── preload-api.ts   # Preload API definitions
│   │   └── utils.ts         # Electron utilities
│   └── web/                 # Web-specific code
├── public/
│   └── electron-icon.png    # App icon
└── electron-builder.json    # Build configuration
```

### Configuration Files
- `electron/main.ts` - Main process configuration
- `electron/preload.ts` - Secure preload script
- `electron-builder.json` - Multi-platform build config
- `vite.config.ts` - Updated untuk Electron development

## 1.3 Environment Detection

### Web vs Electron Detection
```typescript
// src/lib/environment.ts
export const isElectron = () => {
  return window && window.process && window.process.type
}

export const isWeb = () => !isElectron()

export const getPlatform = () => {
  if (isElectron()) {
    return window.electronAPI?.platform || 'unknown'
  }
  return navigator.platform
}
```

## Deliverables
- ✅ Shadcn/UI CLI setup dengan essential components
- ✅ Electron development environment
- ✅ Build configuration untuk multi-platform
- ✅ Component library structure
- ✅ Environment detection utilities
- ✅ Secure IPC communication setup

## Next Steps
Setelah foundation selesai, lanjut ke Phase 2: Direct HTTP Client Architecture untuk implementasi direct API requests bypass backend.
