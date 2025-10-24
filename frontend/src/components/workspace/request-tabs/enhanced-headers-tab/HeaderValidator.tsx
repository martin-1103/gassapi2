import { AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RequestHeader } from './index'

interface HeaderValidatorProps {
  header: RequestHeader
  onValidationChange?: (isValid: boolean) => void
}

export default function HeaderValidator({ header, onValidationChange }: HeaderValidatorProps) {
  const validateHeader = (key: string, value: string) => {
    const keyValid = key.trim().length > 0
    const valueValid = value.trim().length > 0 || !header.enabled

    const isValid = keyValid && valueValid
    onValidationChange?.(isValid)

    return {
      keyValid,
      valueValid,
      isValid
    }
  }

  const validation = validateHeader(header.key, header.value)

  if (header.key.trim() === '' && header.value.trim() === '') {
    return null
  }

  if (!header.enabled) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <AlertCircle className="w-3 h-3" />
        Header dinonaktifkan
      </div>
    )
  }

  if (!validation.isValid) {
    return (
      <div className="space-y-1">
        {!validation.keyValid && (
          <Alert variant="destructive" className="py-1">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              Nama header tidak boleh kosong
            </AlertDescription>
          </Alert>
        )}
        {!validation.valueValid && (
          <Alert variant="destructive" className="py-1">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              Nilai header tidak boleh kosong
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 text-xs text-green-600">
      <CheckCircle className="w-3 h-3" />
      Header valid
    </div>
  )
}