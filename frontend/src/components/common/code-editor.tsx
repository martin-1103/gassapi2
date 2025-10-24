import { Check, X, FileText, Code } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/index';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  language?: 'json' | 'xml' | 'html' | 'javascript' | 'text';
  rows?: number;
  readOnly?: boolean;
  className?: string;
  showFormatButton?: boolean;
  showValidation?: boolean;
  onValidationError?: (error: string | null) => void;
}

export function CodeEditor({
  value,
  onChange,
  placeholder = '',
  language = 'json',
  rows = 6,
  readOnly = false,
  className = '',
  showFormatButton = true,
  showValidation = true,
  onValidationError,
}: CodeEditorProps) {
  const [isValid, setIsValid] = React.useState(true);
  const [validationError, setValidationError] = React.useState<string | null>(
    null,
  );

  const validateJSON = (text: string) => {
    if (language !== 'json' || !text.trim()) {
      setIsValid(true);
      setValidationError(null);
      onValidationError?.(null);
      return true;
    }

    try {
      JSON.parse(text);
      setIsValid(true);
      setValidationError(null);
      onValidationError?.(null);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Invalid JSON';
      setIsValid(false);
      setValidationError(errorMessage);
      onValidationError?.(errorMessage);
      return false;
    }
  };

  const formatJSON = () => {
    if (language === 'json' && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        const formatted = JSON.stringify(parsed, null, 2);
        onChange(formatted);
        setIsValid(true);
        setValidationError(null);
        onValidationError?.(null);
      } catch {
        // Invalid JSON, don't format
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (language === 'json' && showValidation) {
      validateJSON(newValue);
    }
  };

  const getLanguageIcon = () => {
    switch (language) {
      case 'json':
      case 'javascript':
        return <Code className='w-4 h-4' />;
      case 'xml':
      case 'html':
        return <FileText className='w-4 h-4' />;
      default:
        return <FileText className='w-4 h-4' />;
    }
  };

  const getLanguageLabel = () => {
    switch (language) {
      case 'json':
        return 'JSON';
      case 'xml':
        return 'XML';
      case 'html':
        return 'HTML';
      case 'javascript':
        return 'JavaScript';
      default:
        return 'Text';
    }
  };

  return (
    <div className={cn('relative group', className)}>
      {/* Header */}
      <div className='flex items-center justify-between p-2 border-b bg-muted/50'>
        <div className='flex items-center gap-2'>
          {getLanguageIcon()}
          <span className='text-sm font-medium'>{getLanguageLabel()}</span>
          {showValidation && (
            <div className='flex items-center gap-1'>
              {isValid ? (
                <Check className='w-3 h-3 text-green-600' />
              ) : (
                <X className='w-3 h-3 text-red-600' />
              )}
            </div>
          )}
        </div>

        {showFormatButton && language === 'json' && !readOnly && (
          <Button
            size='sm'
            variant='ghost'
            onClick={formatJSON}
            className='h-6 px-2 text-xs'
          >
            Format
          </Button>
        )}
      </div>

      {/* Editor */}
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        readOnly={readOnly}
        className={cn(
          'font-mono text-sm border-0 rounded-none focus:ring-0 resize-none',
          !isValid && showValidation && 'border-red-500 focus:border-red-500',
          readOnly && 'bg-muted/30',
        )}
        style={{
          minHeight: `${rows * 1.5}rem`,
        }}
      />

      {/* Validation Error */}
      {validationError && showValidation && (
        <div className='absolute bottom-0 left-0 right-0 bg-red-50 border border-red-200 p-2 text-xs text-red-700'>
          <div className='flex items-center gap-1'>
            <X className='w-3 h-3' />
            <span>{validationError}</span>
          </div>
        </div>
      )}

      {/* Line Numbers (simple implementation) */}
      <div className='absolute left-0 top-8 bottom-0 w-8 bg-muted/30 border-r text-xs text-muted-foreground p-2 text-right select-none'>
        {value.split('\n').map((_, index) => (
          <div key={index} className='leading-6'>
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
