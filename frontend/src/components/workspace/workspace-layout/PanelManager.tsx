import { useState } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronDown, MoreHorizontal, Plus, FileText, Folder, Search } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { MethodBadge } from '@/components/common/method-badge'
import { Badge } from '@/components/ui/badge'
import { FolderPlus } from 'lucide-react'

interface Collection {
  id: string
  name: string
  description: string
  endpoints: Array<{
    id: string
    name: string
    method: string
    url: string
  }>
}

interface PanelManagerProps {
  sidebarCollapsed: boolean
  searchTerm: string
  expandedCollections: Set<string>
  filteredCollections: Collection[]
  selectedEndpoint: string | null
  selectedEnvironment: any
  environments: any[]

  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void
  setSearchTerm: (term: string) => void
  toggleCollection: (collectionId: string) => void
  setSelectedEndpoint: (endpointId: string | null) => void
  setMethod: (method: string) => void
  setUrl: (url: string) => void
  setSelectedEnvironment: (env: any) => void

  // Children
  requestPanel: React.ReactNode
  responsePanel: React.ReactNode
}

export function PanelManager({
  sidebarCollapsed,
  searchTerm,
  expandedCollections,
  filteredCollections,
  selectedEndpoint,
  selectedEnvironment,
  environments,
  setSidebarCollapsed,
  setSearchTerm,
  toggleCollection,
  setSelectedEndpoint,
  setMethod,
  setUrl,
  setSelectedEnvironment,
  requestPanel,
  responsePanel
}: PanelManagerProps) {
  const handleEndpointClick = (endpoint: any) => {
    setSelectedEndpoint(endpoint.id)
    setMethod(endpoint.method)
    setUrl(`${selectedEnvironment?.base_url}${endpoint.url}`)
  }

  return (
    <div className="flex-1 flex">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Collections Sidebar */}
        <ResizablePanel
          defaultSize={25}
          minSize={15}
          maxSize={30}
          collapsible={true}
          onCollapse={() => setSidebarCollapsed(true)}
          onExpand={() => setSidebarCollapsed(false)}
          className={sidebarCollapsed ? "min-w-[50px]" : ""}
        >
          <div className="h-full flex flex-col border-r">
            {!sidebarCollapsed ? (
              <>
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
                      expandedCollections={expandedCollections}
                      selectedEndpoint={selectedEndpoint}
                      toggleCollection={toggleCollection}
                      onEndpointClick={handleEndpointClick}
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
              </>
            ) : (
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
        <ResizablePanel defaultSize={40} minSize={30} maxSize={50}>
          {requestPanel}
        </ResizablePanel>

        <ResizableHandle withHandle className="w-1 bg-border" />

        {/* Response Panel */}
        <ResizablePanel defaultSize={35} minSize={30} maxSize={60}>
          {responsePanel}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

// Sub-component for collection item
interface CollectionItemProps {
  collection: Collection
  expandedCollections: Set<string>
  selectedEndpoint: string | null
  toggleCollection: (collectionId: string) => void
  onEndpointClick: (endpoint: any) => void
}

function CollectionItem({
  collection,
  expandedCollections,
  selectedEndpoint,
  toggleCollection,
  onEndpointClick
}: CollectionItemProps) {
  return (
    <div className="mb-1">
      <div
        className="flex items-center justify-between p-2 hover:bg-accent rounded cursor-pointer group"
        onClick={() => toggleCollection(collection.id)}
      >
        <div className="flex items-center gap-2">
          {expandedCollections.has(collection.id) ? (
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
      {expandedCollections.has(collection.id) && (
        <div className="ml-6">
          {collection.endpoints.map((endpoint) => (
            <div
              key={endpoint.id}
              className={`flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer group ${
                selectedEndpoint === endpoint.id ? 'bg-accent' : ''
              }`}
              onClick={() => onEndpointClick(endpoint)}
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
              <MethodBadge method={endpoint.method} size="sm" />
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