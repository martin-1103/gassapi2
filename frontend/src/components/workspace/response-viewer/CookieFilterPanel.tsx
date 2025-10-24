/**
 * Cookie filter and action panel
 */

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Copy } from 'lucide-react'

interface CookieFilterPanelProps {
  totalCount: number
  filteredCount: number
  searchQuery: string
  onSearchChange: (query: string) => void
  onToggleEditMode: () => void
  editMode: boolean
  onImport: () => void
  onExport: () => void
  onCopyAsCurl: () => void
}

export function CookieFilterPanel({
  totalCount,
  filteredCount,
  searchQuery,
  onSearchChange,
  onToggleEditMode,
  editMode,
  onImport,
  onExport,
  onCopyAsCurl
}: CookieFilterPanelProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        <h3 className="font-semibold">Cookies</h3>
        <Badge variant="outline">
          {totalCount} total
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search cookies..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-64 h-8"
        />
        <Button size="sm" variant="outline" onClick={onToggleEditMode}>
          {editMode ? 'View Mode' : 'Edit Mode'}
        </Button>
        <Button size="sm" variant="outline" onClick={onImport}>
          Import
        </Button>
        <Button size="sm" variant="outline" onClick={onExport}>
          Export
        </Button>
        <Button size="sm" variant="outline" onClick={onCopyAsCurl}>
          <Copy className="w-4 h-4 mr-2" />
          cURL
        </Button>
      </div>
    </div>
  )
}