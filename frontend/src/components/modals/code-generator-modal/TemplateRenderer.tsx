import { Code, FileText, Terminal } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

import { getLanguageConfig } from './utils/language-configs';
import type { CodeSnippet } from './utils/template-utils';

interface TemplateRendererProps {
  snippets: CodeSnippet[];
  selectedLanguage: string;
}

export function TemplateRenderer({
  snippets,
  selectedLanguage,
}: TemplateRendererProps) {
  // Get the current snippet
  const currentSnippet = React.useMemo(() => {
    return snippets.find(s => s.language === selectedLanguage);
  }, [snippets, selectedLanguage]);

  // Get icon component for language
  const getLanguageIcon = (language: string) => {
    const icons: Record<string, React.ReactNode> = {
      javascript: <Code className='w-4 h-4' />,
      python: <Terminal className='w-4 h-4' />,
      bash: <Terminal className='w-4 h-4' />,
      java: <FileText className='w-4 h-4' />,
      php: <FileText className='w-4 h-4' />,
      ruby: <FileText className='w-4 h-4' />,
      csharp: <FileText className='w-4 h-4' />,
      powershell: <Terminal className='w-4 h-4' />,
    };
    return icons[language] || <Code className='w-4 h-4' />;
  };

  if (!currentSnippet) {
    return (
      <div className='flex-1 overflow-hidden'>
        <Card className='flex-1'>
          <CardContent className='p-0'>
            <div className='h-96 flex items-center justify-center'>
              <p className='text-muted-foreground'>
                Pilih bahasa untuk melihat kode
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const config = getLanguageConfig(currentSnippet.language);

  return (
    <div className='flex-1 overflow-hidden'>
      <div className='h-full flex'>
        <Card className='flex-1'>
          <CardContent className='p-0'>
            {/* Header */}
            <div className='flex items-center justify-between p-4 border-b'>
              <div className='flex items-center gap-2'>
                {getLanguageIcon(currentSnippet.language)}
                <div className='text-left'>
                  <div className='text-sm font-medium'>
                    {config?.displayName || currentSnippet.language}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {currentSnippet.description}
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='text-xs'>
                  {currentSnippet.language}
                </Badge>
                <span className='text-xs text-muted-foreground'>
                  {currentSnippet.framework || 'Standard'}
                </span>
              </div>
            </div>

            {/* Code Display */}
            <ScrollArea className='h-96'>
              <div className='relative'>
                <pre className='text-sm font-mono p-4 bg-slate-50 m-0'>
                  <code>{currentSnippet.code}</code>
                </pre>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
