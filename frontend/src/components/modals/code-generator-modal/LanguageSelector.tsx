import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Download,
  Copy,
  Code,
  FileText,
  Terminal
} from "lucide-react"
import { CodeSnippet } from "./utils/template-utils"
import { getLanguageConfig, getFileExtension } from "./utils/language-configs"

interface LanguageSelectorProps {
  snippets: CodeSnippet[]
  selectedLanguage: string
  onLanguageSelect: (language: string) => void
  onCopyCode: (code: string, language: string) => void
  onDownloadCode: (code: string, language: string, extension: string) => void
  copiedLanguage: string | null
}

export function LanguageSelector({
  snippets,
  selectedLanguage,
  onLanguageSelect,
  onCopyCode,
  onDownloadCode,
  copiedLanguage
}: LanguageSelectorProps) {

  // Get icon component for language
  const getLanguageIcon = (language: string) => {
    const icons: Record<string, React.ReactNode> = {
      'javascript': <Code className="w-4 h-4" />,
      'python': <Terminal className="w-4 h-4" />,
      'bash': <Terminal className="w-4 h-4" />,
      'java': <FileText className="w-4 h-4" />,
      'php': <FileText className="w-4 h-4" />,
      'ruby': <FileText className="w-4 h-4" />,
      'csharp': <FileText className="w-4 h-4" />,
      'powershell': <Terminal className="w-4 h-4" />
    }
    return icons[language] || <Code className="w-4 h-4" />
  }

  // Get unique languages from snippets
  const uniqueLanguages = React.useMemo(() => {
    const languages = new Set()
    return snippets.filter(snippet => {
      if (languages.has(snippet.language)) {
        return false
      }
      languages.add(snippet.language)
      return true
    })
  }, [snippets])

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">Programming Languages</h4>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            Copy All
          </Button>
          <Button size="sm" variant="outline">
            Download All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {uniqueLanguages.map((snippet) => {
          const config = getLanguageConfig(snippet.language)
          const isSelected = selectedLanguage === snippet.language
          const isCopied = copiedLanguage === snippet.language

          return (
            <Button
              key={snippet.language}
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => onLanguageSelect(snippet.language)}
              className="h-12 p-3 flex flex-col items-start justify-between"
            >
              <div className="flex items-center gap-2">
                {getLanguageIcon(snippet.language)}
                <div className="text-left">
                  <div className="text-sm font-medium capitalize">
                    {config?.displayName || snippet.language}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {snippet.framework}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCopyCode(snippet.code, snippet.language)
                  }}
                  className={isCopied ? 'bg-green-100 text-green-800' : ''}
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDownloadCode(snippet.code, snippet.language, getFileExtension(snippet.language))
                  }}
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
}