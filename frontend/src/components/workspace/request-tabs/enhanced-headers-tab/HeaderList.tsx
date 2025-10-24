import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { RequestHeader } from './index'
import HeaderValidator from './HeaderValidator'

interface HeaderListProps {
  headers: RequestHeader[]
  onUpdateHeader: (id: string, updates: Partial<RequestHeader>) => void
  onDeleteHeader: (id: string) => void
  onDuplicateHeader: (header: RequestHeader) => void
  onAddHeader: () => void
}

export default function HeaderList({
  headers,
  onUpdateHeader,
  onDeleteHeader,
  onDuplicateHeader,
  onAddHeader
}: HeaderListProps) {
  const [validatingHeaders, setValidatingHeaders] = useState<Set<string>>(new Set())

  const updateHeaderWithValidation = (id: string, updates: Partial<RequestHeader>) => {
    setValidatingHeaders(prev => new Set(prev).add(id))
    onUpdateHeader(id, updates)

    // Remove validation status after a delay
    setTimeout(() => {
      setValidatingHeaders(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 500)
  }

  const handleValidationChange = (headerId: string, isValid: boolean) => {
    if (!isValid) {
      setValidatingHeaders(prev => new Set(prev).add(headerId))
    } else {
      setValidatingHeaders(prev => {
        const next = new Set(prev)
        next.delete(headerId)
        return next
      })
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Enabled</TableHead>
            <TableHead>Header Name</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {headers.map((header) => (
            <TableRow key={header.id}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={header.enabled}
                  onChange={(e) =>
                    updateHeaderWithValidation(header.id, { enabled: e.target.checked })
                  }
                  className="rounded"
                />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Input
                    placeholder="Header name"
                    value={header.key}
                    onChange={(e) =>
                      updateHeaderWithValidation(header.id, { key: e.target.value })
                    }
                    className={`font-mono text-sm ${
                      validatingHeaders.has(header.id) && !header.key.trim()
                        ? 'border-destructive'
                        : ''
                    }`}
                    disabled={!header.enabled}
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Input
                    placeholder="Header value"
                    value={header.value}
                    onChange={(e) =>
                      updateHeaderWithValidation(header.id, { value: e.target.value })
                    }
                    className={`font-mono text-sm ${
                      validatingHeaders.has(header.id) && !header.value.trim()
                        ? 'border-destructive'
                        : ''
                    }`}
                    disabled={!header.enabled}
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Input
                    placeholder="Description (optional)"
                    value={header.description || ''}
                    onChange={(e) =>
                      updateHeaderWithValidation(header.id, { description: e.target.value })
                    }
                    className="text-sm"
                    disabled={!header.enabled}
                  />
                  {validatingHeaders.has(header.id) && (
                    <HeaderValidator
                      header={header}
                      onValidationChange={(isValid) =>
                        handleValidationChange(header.id, isValid)
                      }
                    />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onDuplicateHeader(header)}>
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDeleteHeader(header.id)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {headers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="mb-4">
            <Plus className="w-8 h-8 mx-auto text-muted-foreground/50" />
          </div>
          <p className="mb-2">No headers added yet</p>
          <p className="text-sm">Click "Add" to create a new header.</p>
          <Button
            size="sm"
            onClick={onAddHeader}
            className="mt-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Header
          </Button>
        </div>
      )}
    </div>
  )
}