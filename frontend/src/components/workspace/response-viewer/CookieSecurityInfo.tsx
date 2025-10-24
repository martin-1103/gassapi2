/**
 * Cookie security information footer
 */

import { Shield, Info } from 'lucide-react'
import { isCookieExpired } from '@/lib/utils/cookie-utils'
import type { CookieType } from '@/lib/utils/cookie-utils'

interface CookieSecurityInfoProps {
  cookies: CookieType[]
  filteredCount: number
}

export function CookieSecurityInfo({ cookies, filteredCount }: CookieSecurityInfoProps) {
  const expiredCount = cookies.filter(isCookieExpired).length

  return (
    <div className="p-4 border-t bg-muted/50">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Security Info:</span>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" /> Secure + HttpOnly
            <Shield className="w-4 h-4 text-blue-600" /> Secure only
            <Shield className="w-4 h-4 text-yellow-600" /> HttpOnly only
            <Info className="w-4 h-4 text-gray-400" /> No security
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span>Total: {cookies.length} cookies</span>
          <span>{filteredCount} filtered</span>
          <span>{expiredCount} expired</span>
        </div>
      </div>
    </div>
  )
}