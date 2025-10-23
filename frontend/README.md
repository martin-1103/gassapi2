# GASS API Frontend

Frontend aplikasi untuk GASS API - API Testing & Management Tool seperti Postman/Apifox.

## 🚀 Tech Stack

- **React 19** + **TypeScript** - UI framework
- **Vite** - Build tool & dev server
- **React Router v6** - Routing
- **TanStack Query (React Query)** - Server state management
- **Zustand** - Client state management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Hook Form** + **Zod** - Form management & validation
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **ReactFlow** - Flow editor (ready for implementation)

## 📁 Struktur Folder

```
src/
├── assets/              # Static assets
├── components/          # Reusable components
│   ├── layout/         # Layout components (Sidebar, Header)
│   ├── ui/             # UI primitives (ready for shadcn/ui)
│   ├── forms/          # Form components
│   └── common/         # Shared components
├── features/           # Feature modules
│   ├── auth/           # Authentication
│   ├── projects/       # Project management
│   ├── collections/    # Collection management
│   ├── endpoints/      # Endpoint builder & testing
│   ├── environments/   # Environment management
│   ├── flows/          # Flow editor (ready)
│   └── workspace/      # Main workspace layout
├── hooks/              # Custom React hooks
├── lib/                # Utilities & libraries
│   ├── api/           # API client & endpoints
│   ├── utils/         # Helper functions
│   └── constants/     # App constants
├── stores/             # Zustand stores
│   ├── authStore.ts   # Authentication state
│   ├── projectStore.ts # Project state
│   └── workspaceStore.ts # Workspace UI state
├── types/              # TypeScript types
│   └── api.ts         # API types
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── ProjectsPage.tsx
│   └── WorkspacePage.tsx
├── App.tsx             # Root component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## 🔧 Development

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend API running at `/gassapi2/backend/`

### Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Aplikasi akan berjalan di `http://localhost:5173`

### Build for Production

\`\`\`bash
npm run build
\`\`\`

Output akan ada di folder `dist/`

### Preview Production Build

\`\`\`bash
npm run preview
\`\`\`

## 🎯 Features Implemented

### ✅ Phase 1-2: Foundation & Authentication
- [x] Vite + React + TypeScript setup
- [x] Tailwind CSS configuration
- [x] Folder structure
- [x] API client dengan Axios interceptors
- [x] Login & Register pages
- [x] Token management (access & refresh)
- [x] Protected routes
- [x] Auth store dengan Zustand

### ✅ Phase 3: Core Features
- [x] Project management (CRUD)
- [x] Collection management (CRUD)
- [x] Collections tree view dengan expand/collapse
- [x] Environment management (CRUD)
- [x] Environment selector
- [x] Environment variables

### ✅ Phase 4: Endpoint Builder
- [x] HTTP method selector (GET, POST, PUT, DELETE, etc)
- [x] URL builder dengan variable interpolation (`{{variable}}`)
- [x] Headers editor (JSON format)
- [x] Body editor (JSON format)
- [x] Send request functionality
- [x] Response viewer dengan status code, timing, body
- [x] Save endpoint functionality
- [x] Tab-based workspace
- [x] Create endpoint from collection

### 🚧 Phase 5: Flow Editor (Ready for Implementation)
- [ ] ReactFlow canvas integration
- [ ] Flow nodes (Endpoint, Condition, Loop, etc)
- [ ] Visual flow builder
- [ ] Flow execution engine
- [ ] Flow variables & data passing

### ✅ Phase 6: Polish
- [x] Error handling dengan toast notifications
- [x] Loading states
- [x] Responsive sidebar
- [x] Type-safe dengan TypeScript
- [x] Clean code architecture

## 🏗️ Architecture

### State Management Strategy

**Client State (Zustand):**
- `authStore` - User authentication & tokens
- `projectStore` - Current active project
- `workspaceStore` - UI state (sidebar, tabs)

**Server State (TanStack Query):**
- Projects, collections, endpoints, environments, flows
- Automatic caching & refetching
- Optimistic updates
- Query invalidation

### API Integration

Backend menggunakan format query parameter:
```
/gassapi2/backend/?act=action_name&id={id}
```

API client di `lib/api/client.ts` menggunakan Axios dengan:
- Request interceptor untuk attach JWT token
- Response interceptor untuk handle 401 & token refresh
- Helper function `buildQuery()` untuk format URL

### Variable Interpolation

Format: `{{variable_name}}`

Hierarchy:
1. Environment variables (highest priority)
2. Collection variables
3. Global variables

Contoh:
```
URL: {{base_url}}/users/{{user_id}}
Headers: { "Authorization": "Bearer {{token}}" }
```

## 📝 Indonesian Casual Language

Sesuai CLAUDE.md, aplikasi menggunakan bahasa Indonesia casual untuk:
- Comments dalam code
- User-facing messages
- Toast notifications
- Button labels
- Form labels

Contoh:
```typescript
toast.success('Project berhasil dibuat!')
toast.error('Gagal menyimpan endpoint. Coba lagi.')
```

## 🔐 Authentication Flow

1. User login via `/login` → POST `?act=login`
2. Backend return `access_token` & `refresh_token`
3. Tokens disimpan di localStorage via Zustand persist
4. Setiap request attach `Authorization: Bearer {access_token}`
5. Kalau 401, attempt refresh via POST `?act=refresh`
6. Kalau refresh gagal, logout & redirect ke login

## 🎨 UI Components

Aplikasi siap untuk integrasi shadcn/ui. Components bisa ditambahkan di `components/ui/` dengan command:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
# dll
```

Current styling menggunakan Tailwind CSS dengan color scheme:
- Primary: Blue (600-700)
- Background: Gray (50-100)
- Text: Gray (600-900)
- Error: Red (600)
- Success: Green (600)

## 🧪 Testing

Manual testing checklist:

### Authentication
- [ ] Login dengan credentials valid
- [ ] Login dengan credentials invalid
- [ ] Register user baru
- [ ] Auto-redirect ke dashboard setelah login
- [ ] Logout functionality
- [ ] Token refresh automatic

### Projects
- [ ] List projects di dashboard
- [ ] Create project baru
- [ ] View project detail
- [ ] Delete project
- [ ] Navigate ke workspace

### Workspace
- [ ] Collections tree view
- [ ] Expand/collapse collections
- [ ] View endpoints dalam collection
- [ ] Create collection baru
- [ ] Create endpoint baru
- [ ] Environment selector
- [ ] Create environment baru

### Endpoint Builder
- [ ] Open endpoint di tab
- [ ] Edit endpoint name, method, URL
- [ ] Edit headers (JSON)
- [ ] Edit body (JSON)
- [ ] Send request
- [ ] View response (status, time, body)
- [ ] Variable interpolation works
- [ ] Save endpoint changes
- [ ] Multiple tabs support
- [ ] Close tab

## 🐛 Known Issues & Future Enhancements

### Known Issues
- None currently reported

### Future Enhancements
- [ ] Flow editor implementation dengan ReactFlow
- [ ] Response history per endpoint
- [ ] Code snippets export (curl, JS, Python, etc)
- [ ] Dark mode support
- [ ] Keyboard shortcuts
- [ ] Request/response templates
- [ ] Import/export collections
- [ ] Team collaboration features
- [ ] API documentation generator
- [ ] Test assertions dalam response viewer
- [ ] GraphQL support

## 📞 Support

Untuk pertanyaan atau masalah, hubungi tim GASSAPI atau buat issue di repository.

---

**Built with ❤️ using React + TypeScript + Vite**
