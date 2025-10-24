# GASS API Frontend

## Project Overview

GASS API is a React TypeScript frontend application designed as an API Testing & Management platform. The application provides a comprehensive interface for managing API projects, testing endpoints, and organizing workspaces.

### Technology Stack
- **Frontend Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.1.7
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: Zustand
- **API Communication**: Axios with React Query (@tanstack/react-query)
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives, shadcn-inspired components
- **Icons**: Lucide React

### Project Structure
```
src/
├── assets/          # Static assets (images, icons, etc.)
├── components/      # Reusable UI components
│   ├── layout/      # Layout components (AppLayout, etc.)
│   └── workspace/   # Workspace-specific components
├── features/        # Feature-specific components and logic
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and libraries
├── pages/          # Page components (Dashboard, Projects, etc.)
├── stores/         # Zustand stores (authStore, etc.)
├── types/          # TypeScript type definitions
├── App.tsx         # Main application router and layout
├── main.tsx        # Application entry point
├── index.css       # Main CSS file
└── style.css       # Additional styling
```

### Key Features
- **Authentication**: Login and registration system with protected routes
- **Dashboard**: Overview of projects and statistics
- **Project Management**: Create, view, and manage API projects
- **Workspace**: Detailed API testing environment for specific projects
- **State Management**: Authentication and application state using Zustand
- **API Integration**: Communication with backend API using Axios
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

### Key Dependencies
- **UI Components**: Radix UI primitives for accessible components
- **Data Fetching**: React Query for server state management
- **Form Validation**: React Hook Form with Zod schema validation
- **Notifications**: Sonner for toast notifications
- **Icons**: Lucide React for consistent iconography
- **Data Visualization**: ReactFlow for flow-based visualizations

## Building and Running

### Prerequisites
- Node.js (version compatible with package.json dependencies)
- npm or yarn package manager

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

### Development
1. Start the development server:
   ```bash
   npm run dev
   ```
   This will start the Vite development server, typically available at `http://localhost:5173`

2. Additional development scripts:
   - `npm run lint`: Lint code for issues
   - `npm run lint:fix`: Automatically fix lint issues
   - `npm run format`: Format code with Prettier
   - `npm run type-check`: Type check with TypeScript

### Production
1. Build for production:
   ```bash
   npm run build
   ```
   This creates an optimized production build in the `dist/` directory.

2. Preview production build locally:
   ```bash
   npm run preview
   ```

## Configuration

### Environment Variables
The application uses the following environment variables (defined in `.env` files):
- `VITE_API_BASE_URL`: Base URL for the backend API
- `VITE_API_TIMEOUT`: Request timeout in milliseconds
- `VITE_APP_NAME`: Application display name
- `VITE_APP_VERSION`: Application version

### Routing
The application implements a protected routing system:
- Public routes: `/login`, `/register`
- Protected routes: `/dashboard`, `/projects`, `/workspace/:projectId`
- Route protection is handled by `ProtectedRoute` and `PublicRoute` components

## Development Conventions

### Code Style
- Code is formatted using Prettier with custom configuration
- Linting is enforced using ESLint
- TypeScript strict mode is enabled
- Component organization follows feature-based structure

### Component Architecture
- Reusable components in `src/components/`
- Page components in `src/pages/`
- Feature-specific logic in `src/features/`
- Shared hooks in `src/hooks/`
- State stores in `src/stores/`

### State Management
- Authentication state is managed using Zustand store (`authStore`)
- API data is cached and managed using React Query
- Global state is kept minimal and well-organized

### Styling
- Tailwind CSS for utility-first styling
- Component-specific styling using CSS modules or utility classes
- Dark mode support implemented
- Consistent design system using Radix UI components