import { Code } from 'lucide-react';
import * as React from 'react';

import { MethodBadge } from '@/components/common/method-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

import { CodePreview } from './CodePreview';
import { LanguageSelector } from './LanguageSelector';
import { TemplateRenderer } from './TemplateRenderer';
import { generateCodeSnippets } from './utils/template-utils';
import type { RequestData } from './utils/template-utils';

interface CodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestData: RequestData;
}

export function CodeGeneratorModal({
  isOpen,
  onClose,
  requestData,
}: CodeGeneratorModalProps) {
  const [selectedLanguage, setSelectedLanguage] = React.useState('javascript');
  const [copiedLanguage, setCopiedLanguage] = React.useState<string | null>(
    null,
  );
  const { toast } = useToast();

  // Generate code snippets - memoize with deep comparison
  const snippets = React.useMemo(() => {
    return generateCodeSnippets(requestData);
  }, [requestData, generateCodeSnippets]);

  // Copy to clipboard
  const copyToClipboard = React.useCallback(
    async (code: string, language: string) => {
      try {
        await navigator.clipboard.writeText(code);
        setCopiedLanguage(language);
        toast({
          title: 'Code copied',
          description: `${language} code copied to clipboard`,
        });
      } catch {
        toast({
          title: 'Copy failed',
          description: 'Failed to copy code to clipboard',
        });
      }
    },
    [toast],
  );

  // Download code
  const downloadCode = React.useCallback(
    (code: string, language: string, extension: string) => {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `request.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Code downloaded',
        description: `${language} code downloaded`,
      });
    },
    [toast],
  );

  // Reset selected language when modal opens
  React.useEffect(() => {
    if (isOpen && snippets.length > 0) {
      setSelectedLanguage(snippets[0].language);
      setCopiedLanguage(null);
    }
  }, [isOpen, snippets]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Code className='w-5 h-5' />
            <MethodBadge method={requestData.method} />
            <span className='text-muted-foreground truncate ml-2'>
              {requestData.url}
            </span>
            <Button size='sm' variant='ghost' onClick={onClose}>
              ×
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className='p-6'>
          <div className='flex items-center gap-4 mb-4'>
            <h3 className='text-lg font-semibold'>Generate Code</h3>
            <p className='text-sm text-muted-foreground'>
              Generate code snippets for multiple programming languages
            </p>
          </div>

          {/* Request Info */}
          <CodePreview requestData={requestData} />
        </div>

        {/* Language Selection */}
        <LanguageSelector
          snippets={snippets}
          selectedLanguage={selectedLanguage}
          onLanguageSelect={setSelectedLanguage}
          onCopyCode={copyToClipboard}
          onDownloadCode={downloadCode}
          copiedLanguage={copiedLanguage}
        />

        {/* Code Display */}
        <TemplateRenderer
          snippets={snippets}
          selectedLanguage={selectedLanguage}
        />

        {/* Actions */}
        <div className='flex justify-end gap-3 p-6 border-t'>
          <Button variant='outline' onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export untuk backward compatibility
export default CodeGeneratorModal;
