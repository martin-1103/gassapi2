/**
 * Empty state component for when no cookies are present
 */

import { Cookie } from 'lucide-react'

export function CookieEmptyState() {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Cookie className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <h4 className="text-lg font-semibold mb-2">No Cookies</h4>
      <p className="text-sm">
        No cookies were received with this response. Cookies are typically set by the server for session management or tracking purposes.
      </p>
    </div>
  )
}