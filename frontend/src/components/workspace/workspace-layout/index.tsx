import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWorkspaceLayout } from './hooks/use-workspace-layout'
import { PanelManager } from './PanelManager'
import { RequestPanel } from './RequestPanel'
import { ResponsePanel } from './ResponsePanel'

// Component utama workspace layout - hanya berisi struktur dan layout visual
export default function WorkspaceLayout() {
  const {
    sidebarCollapsed,
    searchTerm,
    expandedCollections,
    selectedEndpoint,
    method,
    url,
    selectedEnvironment,
    params,
    headers,
    bodyData,
    isSending,
    response,
    filteredCollections,
    environments,
    setSearchTerm,
    toggleCollection,
    setSelectedEndpoint,
    setSidebarCollapsed,
    setMethod,
    setUrl,
    setSelectedEnvironment,
    setParams,
    setHeaders,
    setBodyData,
    sendRequest
  } = useWorkspaceLayout()

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="h-14 border-b flex items-center px-4 justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">GASS API</h1>
          <Badge variant="outline">Development</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">Import</Button>
          <Button size="sm">Export</Button>
        </div>
      </div>

      {/* Main Content */}
      <PanelManager
        sidebarCollapsed={sidebarCollapsed}
        searchTerm={searchTerm}
        expandedCollections={expandedCollections}
        filteredCollections={filteredCollections}
        selectedEndpoint={selectedEndpoint}
        selectedEnvironment={selectedEnvironment}
        environments={environments}
        setSidebarCollapsed={setSidebarCollapsed}
        setSearchTerm={setSearchTerm}
        toggleCollection={toggleCollection}
        setSelectedEndpoint={setSelectedEndpoint}
        setMethod={setMethod}
        setUrl={setUrl}
        setSelectedEnvironment={setSelectedEnvironment}
        requestPanel={
          <RequestPanel
            method={method}
            url={url}
            selectedEnvironment={selectedEnvironment}
            environments={environments}
            params={params}
            headers={headers}
            bodyData={bodyData}
            isSending={isSending}
            onMethodChange={setMethod}
            onUrlChange={setUrl}
            onEnvironmentChange={setSelectedEnvironment}
            onParamsChange={setParams}
            onHeadersChange={setHeaders}
            onBodyDataChange={setBodyData}
            onSendRequest={sendRequest}
          />
        }
        responsePanel={
          <ResponsePanel response={response} />
        }
      />
    </div>
  )
}

// Export types untuk external use
export type { WorkspaceLayoutState, WorkspaceLayoutActions } from './hooks/use-workspace-layout'