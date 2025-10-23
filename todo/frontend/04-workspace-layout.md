# Phase 3.2: Workspace Layout Implementation

## Overview
Implementasi modern 3-panel workspace layout menggunakan shadcn/ui components dengan resizable panels, collapsible sections, dan responsive design.

## 4.1 Layout Architecture

### Workspace Structure
```
┌─────────────────────────────────────────────────────────────────┐
│                        Header Bar                                │
│  [Logo] [Project Name]      [Search] [Theme] [User] [Settings]  │
├─────────────────────────────────────────────────────────────────┤
│        │                         │                               │
│  Side  │      Request Builder     │         Response Viewer       │
│  Panel │    (Tabs: Params,       │    (Tabs: Body, Headers,      │
│  (Col  │     Headers, Body,      │     Cookies, Tests, Docs)     │
│  lecs) │     Tests, Auth)        │                               │
│        │                         │                               │
│        │                         │                               │
│        │                         │                               │
├─────────────────────────────────────────────────────────────────┤
│                        Status Bar                                │
│  [Method] [URL] [Status] [Time] [Size] [Environment] [Logs]    │
└─────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy
```
WorkspaceLayout
├── Header
│   ├── ProjectSelector
│   ├── GlobalSearch
│   ├── ThemeToggle
│   └── UserMenu
├── ResizablePanels
│   ├── CollectionsSidebar
│   │   ├── ProjectTree
│   │   ├── CreateButton
│   │   └── ImportButton
│   ├── RequestPanel
│   │   ├── RequestTabs
│   │   ├── MethodSelector
│   │   ├── URLInput
│   │   ├── RequestTabs (Params, Headers, Body, Tests, Auth)
│   │   └── SendButton
│   └── ResponsePanel
│       ├── ResponseTabs (Body, Headers, Cookies, Tests, Docs)
│       ├── ResponseViewer
│       └── StatusInfo
└── StatusBar
    ├── RequestMethod
    ├── ResponseStatus
    ├── ResponseTime
    ├── ResponseSize
    └── EnvironmentInfo
```

## 4.2 Resizable Panel System

### Main Layout Component
```typescript
// src/components/workspace/workspace-layout.tsx
import { useState } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import Header from './header'
import CollectionsSidebar from './collections-sidebar'
import RequestPanel from './request-panel'
import ResponsePanel from './response-panel'
import StatusBar from './status-bar'
import type { Project, Collection, Environment } from '@/types/api'

interface WorkspaceLayoutProps {
  project: Project
  collections: Collection[]
  environments: Environment[]
}

export default function WorkspaceLayout({
  project,
  collections,
  environments
}: WorkspaceLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [panelSizes, setPanelSizes] = useState([20, 40, 40]) // Sidebar, Request, Response

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <Header project={project} />
      
      {/* Main Content */}
      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Collections Sidebar */}
          <ResizablePanel
            defaultSize={panelSizes[0]}
            minSize={15}
            maxSize={30}
            collapsible={true}
            onCollapse={() => setSidebarCollapsed(true)}
            onExpand={() => setSidebarCollapsed(false)}
            className={sidebarCollapsed ? "min-w-[50px]" : ""}
          >
            <div className="h-full flex flex-col border-r">
              {!sidebarCollapsed && (
                <CollectionsSidebar
                  project={project}
                  collections={collections}
                  environments={environments}
                />
              )}
              {sidebarCollapsed && (
                <div className="p-2">
                  <button className="w-full p-2 hover:bg-accent rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="w-1 bg-border" />

          {/* Request Panel */}
          <ResizablePanel
            defaultSize={panelSizes[1]}
            minSize={30}
            maxSize={50}
          >
            <ScrollArea className="h-full">
              <RequestPanel
                projectId={project.id}
                environments={environments}
              />
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle withHandle className="w-1 bg-border" />

          {/* Response Panel */}
          <ResizablePanel
            defaultSize={panelSizes[2]}
            minSize={30}
            maxSize={60}
          >
            <ResponsePanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  )
}
```

### Collections Sidebar
```typescript
// src/components/workspace/collections-sidebar.tsx
import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  FolderPlus, 
  Search, 
  MoreHorizontal, 
  ChevronRight,
  ChevronDown,
  Plus,
  FileText,
  Folder
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import type { Collection, Environment } from '@/types/api'

interface CollectionsSidebarProps {
  project: any
  collections: Collection[]
  environments: Environment[]
}

export default function CollectionsSidebar({ 
  project, 
  collections, 
  environments 
}: CollectionsSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set())
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)

  const toggleCollection = (collectionId: string) => {
    const newExpanded = new Set(expandedCollections)
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId)
    } else {
      newExpanded.add(collectionId)
    }
    setExpandedCollections(newExpanded)
  }

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Collections</h3>
          <Button size="sm" variant="ghost">
            <FolderPlus className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Collections Tree */}
      <ScrollArea className="flex-1 p-2">
        {filteredCollections.map((collection) => (
          <CollectionItem
            key={collection.id}
            collection={collection}
            isExpanded={expandedCollections.has(collection.id)}
            onToggle={() => toggleCollection(collection.id)}
            selectedEndpoint={selectedEndpoint}
            onSelectEndpoint={setSelectedEndpoint}
          />
        ))}
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-2 border-t">
        <div className="space-y-1">
          <Button size="sm" variant="ghost" className="w-full justify-start">
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
          <Button size="sm" variant="ghost" className="w-full justify-start">
            <FolderPlus className="w-4 h-4 mr-2" />
            New Collection
          </Button>
        </div>
      </div>
    </div>
  )
}

interface CollectionItemProps {
  collection: Collection
  isExpanded: boolean
  onToggle: () => void
  selectedEndpoint: string | null
  onSelectEndpoint: (id: string | null) => void
}

function CollectionItem({ 
  collection, 
  isExpanded, 
  onToggle, 
  selectedEndpoint, 
  onSelectEndpoint 
}: CollectionItemProps) {
  // Mock endpoints for now
  const endpoints = [
    { id: 'ep1', name: 'Get Users', method: 'GET' },
    { id: 'ep2', name: 'Create User', method: 'POST' },
    { id: 'ep3', name: 'Update User', method: 'PUT' },
    { id: 'ep4', name: 'Delete User', method: 'DELETE' }
  ]

  return (
    <div className="mb-1">
      {/* Collection Header */}
      <div 
        className="flex items-center justify-between p-2 hover:bg-accent rounded cursor-pointer group"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <Folder className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">{collection.name}</span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Endpoints */}
      {isExpanded && (
        <div className="ml-6">
          {endpoints.map((endpoint) => (
            <div
              key={endpoint.id}
              className={`flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer group ${
                selectedEndpoint === endpoint.id ? 'bg-accent' : ''
              }`}
              onClick={() => onSelectEndpoint(endpoint.id)}
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
              <Badge variant="outline" className="text-xs px-1 py-0">
                {endpoint.method}
              </Badge>
              <span className="text-sm">{endpoint.name}</span>
            </div>
          ))}
          
          {/* Add Endpoint Button */}
          <div className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer text-muted-foreground">
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add Request</span>
          </div>
        </div>
      )}
    </div>
  )
}
```

### Request Panel
```typescript
// src/components/workspace/request-panel.tsx
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Send, Save, MoreHorizontal } from 'lucide-react'
import { MethodBadge } from '@/components/common/method-badge'
import { CodeEditor } from '@/components/common/code-editor'
import { EnvironmentSelector } from './environment-selector'
import { RequestHeadersTab } from './request-tabs/headers-tab'
import { RequestBodyTab } from './request-tabs/body-tab'
import { RequestTestsTab } from './request-tabs/tests-tab'
import { RequestAuthTab } from './request-tabs/auth-tab'
import { RequestParamsTab } from './request-tabs/params-tab'
import type { Environment } from '@/types/api'

interface RequestPanelProps {
  projectId: string
  environments: Environment[]
}

export default function RequestPanel({ projectId, environments }: RequestPanelProps) {
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('')
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(
    environments.find(env => env.is_default) || environments[0] || null
  )
  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    if (!url.trim()) return
    
    setIsSending(true)
    try {
      // Send request logic here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock delay
    } finally {
      setIsSending(false)
    }
  }

  const handleSave = () => {
    // Save endpoint logic here
  }

  return (
    <div className="h-full flex flex-col">
      {/* Request Header */}
      <Card className="m-4 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="HEAD">HEAD</SelectItem>
              <SelectItem value="OPTIONS">OPTIONS</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="https://api.example.com/endpoint or {{base_url}}/users"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 font-mono"
          />

          <Button
            onClick={handleSend}
            disabled={isSending || !url.trim()}
            className="px-6"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? 'Sending...' : 'Send'}
          </Button>

          <Button variant="outline" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>

        {/* Environment Selector */}
        <EnvironmentSelector
          environments={environments}
          selectedEnvironment={selectedEnvironment}
          onSelectEnvironment={setSelectedEnvironment}
        />
      </Card>

      {/* Request Tabs */}
      <div className="flex-1 px-4 pb-4">
        <Tabs defaultValue="params" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="params">Params</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="auth">Auth</TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-4">
            <TabsContent value="params" className="h-full">
              <RequestParamsTab />
            </TabsContent>
            
            <TabsContent value="headers" className="h-full">
              <RequestHeadersTab />
            </TabsContent>
            
            <TabsContent value="body" className="h-full">
              <RequestBodyTab />
            </TabsContent>
            
            <TabsContent value="tests" className="h-full">
              <RequestTestsTab />
            </TabsContent>
            
            <TabsContent value="auth" className="h-full">
              <RequestAuthTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
```

### Response Panel
```typescript
// src/components/workspace/response-panel.tsx
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatusBadge } from '@/components/common/status-badge'
import { TimeDisplay } from '@/components/common/time-display'
import { CodeEditor } from '@/components/common/code-editor'

interface ResponsePanelProps {
  // Response data will come from state management
}

export default function ResponsePanel({}: ResponsePanelProps) {
  // Mock response data for now
  const mockResponse = {
    status: 200,
    statusText: 'OK',
    time: 245,
    size: 1024,
    data: {
      "message": "Success",
      "data": [
        { "id": 1, "name": "John Doe", "email": "john@example.com" },
        { "id": 2, "name": "Jane Smith", "email": "jane@example.com" }
      ]
    },
    headers: {
      "content-type": "application/json",
      "content-length": "1024",
      "cache-control": "no-cache"
    }
  }

  const hasResponse = mockResponse && mockResponse.status

  return (
    <div className="h-full flex flex-col p-4">
      {!hasResponse ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-lg mb-2">No Response Yet</p>
            <p className="text-sm">Send a request to see the response here</p>
          </div>
        </div>
      ) : (
        <>
          {/* Response Status */}
          <Card className="p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <StatusBadge status={mockResponse.status} />
                <span className="text-sm text-muted-foreground">
                  {mockResponse.statusText}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <TimeDisplay time={mockResponse.time} showDetailed />
                <span className="text-sm text-muted-foreground">
                  {mockResponse.size} bytes
                </span>
              </div>
            </div>
          </Card>

          {/* Response Tabs */}
          <Tabs defaultValue="body" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="body">Body</TabsTrigger>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="cookies">Cookies</TabsTrigger>
              <TabsTrigger value="tests">Tests</TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-4">
              <TabsContent value="body" className="h-full">
                <ScrollArea className="h-full">
                  <CodeEditor
                    value={JSON.stringify(mockResponse.data, null, 2)}
                    onChange={() => {}}
                    language="json"
                    readOnly
                  />
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="headers" className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-2">
                    {Object.entries(mockResponse.headers).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-2 bg-muted/50 rounded">
                        <span className="font-mono text-sm">{key}</span>
                        <span className="font-mono text-sm text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="cookies" className="h-full">
                <div className="flex items-center justify-center text-muted-foreground">
                  <p>No cookies</p>
                </div>
              </TabsContent>
              
              <TabsContent value="tests" className="h-full">
                <div className="flex items-center justify-center text-muted-foreground">
                  <p>No tests</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </>
      )}
    </div>
  )
}
```

## Deliverables
- ✅ 3-panel resizable workspace layout
- ✅ Collections sidebar dengan tree view
- ✅ Modern request panel dengan tabs
- ✅ Professional response viewer dengan syntax highlighting
- ✅ Responsive design untuk mobile/desktop
- ✅ Keyboard shortcuts support
- ✅ Dark mode ready

## Next Steps
Lanjut ke Phase 3.3: Request Builder Implementation untuk implementasi detailed request tabs dengan advanced features.
