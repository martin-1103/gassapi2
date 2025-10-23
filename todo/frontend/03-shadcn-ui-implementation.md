# Phase 3: Shadcn/UI Implementation

## Overview
Implementasi modern UI components menggunakan shadcn/ui untuk professional API documentation tool interface.

## 3.1 Shadcn/UI Setup

### Components Configuration
```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### Core Components Installation
```bash
# Installation commands untuk semua komponen yang dibutuhkan
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
npx shadcn-ui@latest add command
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add menubar
npx shadcn-ui@latest add sidebar
npx shadcn-ui@latest add collapsible
npx shadcn-ui@latest add accordion
```

## 3.2 Component Library Structure

### Directory Organization
```
src/
├── components/
│   ├── ui/                    # Shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── layout/               # Layout components
│   │   ├── app-layout.tsx
│   │   ├── workspace-layout.tsx
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   ├── api/                  # API-related components
│   │   ├── request-builder.tsx
│   │   ├── response-viewer.tsx
│   │   ├── collection-tree.tsx
│   │   └── environment-selector.tsx
│   ├── forms/               # Form components
│   │   ├── endpoint-form.tsx
│   │   ├── collection-form.tsx
│   │   └── environment-form.tsx
│   ├── modals/             # Modal dialogs
│   │   ├── create-endpoint-modal.tsx
│   │   ├── import-modal.tsx
│   │   └── export-modal.tsx
│   └── common/             # Reusable components
│       ├── method-badge.tsx
│       ├── status-badge.tsx
│       ├── code-editor.tsx
│       └── time-display.tsx
```

## 3.3 Custom UI Components

### HTTP Method Badge
```typescript
// src/components/common/method-badge.tsx
import { Badge } from '@/components/ui/badge'
import { HttpMethod } from '@/types/api'

interface MethodBadgeProps {
  method: HttpMethod
  size?: 'sm' | 'md' | 'lg'
}

export function MethodBadge({ method, size = 'md' }: MethodBadgeProps) {
  const methodConfig = {
    GET: { variant: 'secondary' as const, color: 'text-blue-600' },
    POST: { variant: 'default' as const, color: 'text-green-600' },
    PUT: { variant: 'outline' as const, color: 'text-orange-600' },
    PATCH: { variant: 'outline' as const, color: 'text-yellow-600' },
    DELETE: { variant: 'destructive' as const, color: 'text-red-600' },
    HEAD: { variant: 'secondary' as const, color: 'text-purple-600' },
    OPTIONS: { variant: 'secondary' as const, color: 'text-gray-600' }
  }

  const config = methodConfig[method]
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  return (
    <Badge 
      variant={config.variant}
      className={`${config.color} ${sizeClasses[size]} font-mono font-semibold`}
    >
      {method}
    </Badge>
  )
}
```

### Status Code Badge
```typescript
// src/components/common/status-badge.tsx
import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: number
  size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const getStatusInfo = (status: number) => {
    if (status >= 200 && status < 300) {
      return { variant: 'default' as const, label: 'Success', color: 'bg-green-100 text-green-800' }
    } else if (status >= 300 && status < 400) {
      return { variant: 'secondary' as const, label: 'Redirect', color: 'bg-yellow-100 text-yellow-800' }
    } else if (status >= 400 && status < 500) {
      return { variant: 'outline' as const, label: 'Client Error', color: 'bg-orange-100 text-orange-800' }
    } else if (status >= 500) {
      return { variant: 'destructive' as const, label: 'Server Error', color: 'bg-red-100 text-red-800' }
    }
    return { variant: 'secondary' as const, label: 'Unknown', color: 'bg-gray-100 text-gray-800' }
  }

  const { variant, label, color } = getStatusInfo(status)
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={variant}
        className={`${color} ${sizeClasses[size]} font-mono font-semibold`}
      >
        {status}
      </Badge>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  )
}
```

### Code Editor Component
```typescript
// src/components/common/code-editor.tsx
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  language?: 'json' | 'xml' | 'html' | 'javascript'
  rows?: number
  readOnly?: boolean
  className?: string
}

export function CodeEditor({ 
  value, 
  onChange, 
  placeholder = '',
  language = 'json',
  rows = 6,
  readOnly = false,
  className = ''
}: CodeEditorProps) {
  const [isValid, setIsValid] = useState(true)

  const validateJSON = (text: string) => {
    if (language !== 'json' || !text.trim()) return true
    try {
      JSON.parse(text)
      return true
    } catch {
      return false
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    if (language === 'json') {
      setIsValid(validateJSON(newValue))
    }
  }

  const formatJSON = () => {
    if (language === 'json' && value.trim()) {
      try {
        const parsed = JSON.parse(value)
        const formatted = JSON.stringify(parsed, null, 2)
        onChange(formatted)
      } catch {
        // Invalid JSON, don't format
      }
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        readOnly={readOnly}
        className={`font-mono text-sm ${!isValid ? 'border-red-500 focus:border-red-500' : ''}`}
      />
      
      {language === 'json' && !readOnly && (
        <button
          onClick={formatJSON}
          className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
        >
          Format
        </button>
      )}
      
      {!isValid && (
        <p className="text-xs text-red-500 mt-1">Invalid JSON syntax</p>
      )}
    </div>
  )
}
```

### Time Display Component
```typescript
// src/components/common/time-display.tsx
import { Badge } from '@/components/ui/badge'

interface TimeDisplayProps {
  time: number // in milliseconds
  showDetailed?: boolean
}

export function TimeDisplay({ time, showDetailed = false }: TimeDisplayProps) {
  const formatTime = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)}s`
    } else {
      const minutes = Math.floor(ms / 60000)
      const seconds = ((ms % 60000) / 1000).toFixed(2)
      return `${minutes}m ${seconds}s`
    }
  }

  const getPerformanceColor = (ms: number) => {
    if (ms < 200) return 'text-green-600 bg-green-50'
    if (ms < 1000) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const colorClass = getPerformanceColor(time)

  if (showDetailed) {
    return (
      <div className="flex items-center gap-2">
        <Badge className={colorClass} variant="outline">
          {formatTime(time)}
        </Badge>
        <span className="text-xs text-gray-500">
          {time < 200 ? 'Fast' : time < 1000 ? 'Normal' : 'Slow'}
        </span>
      </div>
    )
  }

  return (
    <Badge className={colorClass} variant="outline">
      {formatTime(time)}
    </Badge>
  )
}
```

## 3.4 Theme System

### Dark Mode Provider
```typescript
// src/contexts/theme-context.tsx
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme
    return saved || 'system'
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const root = window.document.documentElement
    
    const updateTheme = () => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
          ? 'dark' 
          : 'light'
        setResolvedTheme(systemTheme)
        root.classList.remove('light', 'dark')
        root.classList.add(systemTheme)
      } else {
        setResolvedTheme(theme)
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
      }
    }

    updateTheme()

    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', updateTheme)
      return () => mediaQuery.removeEventListener('change', updateTheme)
    }
  }, [theme])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

### Theme Toggle Component
```typescript
// src/components/common/theme-toggle.tsx
import { Button } from '@/components/ui/button'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme}>
      {getIcon()}
      <span className="ml-2 hidden md:inline">
        {theme.charAt(0).toUpperCase() + theme.slice(1)}
      </span>
    </Button>
  )
}
```

## 3.5 Responsive Layout System

### Responsive Container
```typescript
// src/components/layout/responsive-container.tsx
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  fluid?: boolean
}

export function ResponsiveContainer({ children, className, fluid = false }: ResponsiveContainerProps) {
  return (
    <div 
      className={cn(
        fluid ? 'w-full' : 'container mx-auto px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  )
}
```

## Deliverables
- ✅ Shadcn/ui components setup dengan proper configuration
- ✅ Custom UI components (MethodBadge, StatusBadge, CodeEditor, TimeDisplay)
- ✅ Theme system dengan dark mode support
- ✅ Responsive layout components
- ✅ Component library structure yang organized
- ✅ Design system consistency

## Next Steps
Lanjut ke Phase 3.2: Workspace Layout Implementation untuk implementasi 3-panel layout dengan resizable panels.
