import { CookieTable } from './CookieTable'
import { CookieFilterPanel } from './CookieFilterPanel'
import { CookieSecurityInfo } from './CookieSecurityInfo'
import { CookieEmptyState } from './CookieEmptyState'
import { useCookieManagementState } from '@/hooks/useCookieManagementState'

interface ResponseCookiesTabProps {
  cookies: Record<string, any>
}

export function ResponseCookiesTab({ cookies }: ResponseCookiesTabProps) {
  const {
    searchQuery,
    expandedCookies,
    editMode,
    editCookie,
    cookiesList,
    filteredCookies,
    setSearchQuery,
    setEditMode,
    setEditCookie,
    toggleExpanded,
    updateCookie,
    deleteCookie,
    exportCookies,
    importCookies,
    copyCookiesAsCurl,
  } = useCookieManagementState({ cookies })

  return (
    <div className="h-full flex flex-col">
      {/* Filter and Actions Panel */}
      <CookieFilterPanel
        totalCount={cookiesList.length}
        filteredCount={filteredCookies.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleEditMode={() => setEditMode(!editMode)}
        editMode={editMode}
        onImport={importCookies}
        onExport={exportCookies}
        onCopyAsCurl={copyCookiesAsCurl}
      />

      {/* Cookies List */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        {cookiesList.length === 0 ? (
          <CookieEmptyState />
        ) : (
          <CookieTable
            cookies={filteredCookies}
            expandedCookies={expandedCookies}
            editMode={editMode}
            editCookie={editCookie}
            onToggleExpanded={toggleExpanded}
            onUpdateCookie={updateCookie}
            onDeleteCookie={deleteCookie}
            onSetEditCookie={setEditCookie}
          />
        )}
      </div>

      {/* Security Info Footer */}
      <CookieSecurityInfo
        cookies={cookiesList}
        filteredCount={filteredCookies.length}
      />
    </div>
  )
}
