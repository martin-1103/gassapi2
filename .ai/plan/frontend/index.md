# 🎨 Frontend Package (Web + Electron)

**Package:** `gassapi-frontend` (npm + multi-build targets)
**Purpose:** Visual flow builder dengan real-time collaboration
**Focus:** Single source code untuk web + desktop, modern UI/UX

---

## 🏗️ Package Structure

```
frontend/
├── src/
│   ├── components/      # 🧩 React components (shared web + electron)
│   │   ├── common/      # 🔧 Shared components
│   │   ├── auth/        # 🔐 Authentication components
│   │   ├── project/     # 📋 Project management
│   │   ├── flow/        # 🌊 Flow builder
│   │   └── collaboration/ # 👥 Real-time features
│   ├── electron/        # 🖥️ Electron specific code
│   ├── hooks/           # 🎣 React hooks (shared)
│   ├── store/           # 🗄️ State management
│   ├── services/        # 🌐 API services (shared)
│   ├── utils/           # 🔧 Utilities (shared)
│   ├── types/           # 📝 TypeScript definitions (shared)
│   ├── App.tsx          # 🖥️ Main app component
│   ├── main.tsx         # 🚀 Web app entry point
│   └── index.css        # 🎨 Global styles
├── public/              # 📂 Static assets
├── tests/               # 🧪 Test files
├── bin/                 # 📜 Executable scripts
├── dist-web/            # 🌐 Web build output
├── dist-electron/       # 🖥️ Electron build output
├── package.json         # 📦 Dependencies & npm package config
├── electron-builder.json # 🖥️ Electron build configuration
├── vite.config.ts       # ⚡ Vite config (web)
├── vite.electron.config.ts # ⚡ Vite config (electron)
└── README.md            # 📖 Frontend documentation
```

---

## 🎯 Core Features

### 1. Visual Flow Builder
- React Flow integration (drag-and-drop)
- Real-time flow validation
- Interactive node editing
- Auto-layout options

### 2. Project Management
- Project dashboard dengan analytics
- Member management interface
- Environment configuration
- Settings & preferences

### 3. Multi-Target Builds
- Single source code untuk web + electron
- Vite untuk web development
- Electron Builder untuk desktop packaging

---

## 📋 Planning Files

- [Flow Builder](./flow-builder.md) - React Flow integration
- [Build Configuration](./build-config.md) - Vite + Electron setup

---

## 🚀 Build Targets

### Web Application
```bash
npm run dev              # Development server (localhost:5173)
npm run build:web        # Production build untuk web
npm run preview:web      # Preview web build
```

**Output:** `dist-web/` (static files untuk Vercel/Netlify)

### Desktop Application
```bash
npm run dev:electron     # Development electron window
npm run build:electron   # Build electron app
npm run package:electron # Package .exe, .dmg, .AppImage
```

**Output:** `dist-electron/` (packaged executables)

---

## 📦 Package Distribution

**Target:** npm package + executable builds
**Entry Points:**
- Web: `dist-web/index.html`
- Electron: `bin/gassapi-desktop`

**Dependencies:**
- React 18 + TypeScript
- React Flow (visual builder)
- Vite (build tool)
- Electron Builder (desktop packaging)

---

## 🔧 Development Setup

```bash
# Install package
npm install gassapi-frontend

# Web development
npx gassapi-frontend dev  # localhost:5173

# Desktop development
npx gassapi-frontend dev:electron
```

### Environment Variables
```bash
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_MODE=development
```

---

## 🎨 Design Philosophy

### Single Source Architecture
- **Shared Components**: Satu library untuk web + electron
- **Unified State**: Sama state management untuk semua platforms
- **Consistent UX**: Identical experience antara web dan desktop
- **Code Reuse**: Tidak ada duplikasi logika atau UI

### Modern Development
- **TypeScript**: Full type safety
- **Component-Driven**: Modular, reusable components
- **Performance**: Code splitting & lazy loading
- **Responsive**: Mobile-first approach