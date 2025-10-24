/**
 * Custom hook for cookie management state and operations
 */

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { CookieType } from '@/lib/utils/cookie-utils'
import {
  extractCookiesFromHeaders,
  formatCookiesForCurl,
  prepareCookiesForExport,
  filterCookies
} from '@/lib/utils/cookie-utils'

export interface UseCookieManagementStateProps {
  cookies: Record<string, any>
}

export function useCookieManagementState({ cookies }: UseCookieManagementStateProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCookies, setExpandedCookies] = useState<Set<string>>(new Set())
  const [editMode, setEditMode] = useState(false)
  const [editCookie, setEditCookie] = useState<Partial<CookieType> | null>(null)
  const { toast } = useToast()

  const cookiesList = extractCookiesFromHeaders(cookies)
  const filteredCookies = filterCookies(cookiesList, searchQuery)

  const toggleExpanded = (name: string) => {
    const newExpanded = new Set(expandedCookies)
    if (newExpanded.has(name)) {
      newExpanded.delete(name)
    } else {
      newExpanded.add(name)
    }
    setExpandedCookies(newExpanded)
  }

  const updateCookie = (name: string, updates: Partial<CookieType>) => {
    // This would typically make an API call to update cookies
    // For now, just show toast
    toast({
      title: 'Cookie Update',
      description: `Cookie "${name}" would be updated: ${JSON.stringify(updates)}`,
    })
  }

  const deleteCookie = (name: string) => {
    toast({
      title: 'Cookie Delete',
      description: `Cookie "${name}" would be deleted`,
    })
  }

  const exportCookies = () => {
    const cookiesData = prepareCookiesForExport(cookiesList)

    const blob = new Blob([JSON.stringify(cookiesData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cookies_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: 'Cookies Exported',
      description: `Exported ${cookiesList.length} cookies to file`,
    })
  }

  const importCookies = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const importedCookies = JSON.parse(text)

        if (Array.isArray(importedCookies)) {
          toast({
            title: 'Cookies Imported',
            description: `Imported ${importedCookies.length} cookies`,
          })
        }
      } catch (error) {
        toast({
          title: 'Import Failed',
          description: 'Invalid JSON file format',
          variant: 'destructive'
        })
      }
    }

    input.click()
  }

  const copyCookiesAsCurl = () => {
    const cookieHeaders = formatCookiesForCurl(cookiesList)

    navigator.clipboard.writeText(cookieHeaders)
    toast({
      title: 'Cookies Copied',
      description: 'Cookies copied to clipboard in cURL format',
    })
  }

  return {
    // State
    searchQuery,
    expandedCookies,
    editMode,
    editCookie,
    cookiesList,
    filteredCookies,

    // Actions
    setSearchQuery,
    setEditMode,
    setEditCookie,
    toggleExpanded,
    updateCookie,
    deleteCookie,
    exportCookies,
    importCookies,
    copyCookiesAsCurl,
  }
}