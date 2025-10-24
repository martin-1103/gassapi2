import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { CodeEditor } from '@/components/common/CodeEditor';

interface JsonBodyEditorProps {
  rawType: 'text' | 'javascript' | 'json' | 'html' | 'xml' | 'yaml';
  rawContent: string;
  contentType: string;
  onRawTypeChange: (
    rawType: 'text' | 'javascript' | 'json' | 'html' | 'xml' | 'yaml',
  ) => void;
  onRawContentChange: (content: string) => void;
  onFormatJSON: () => void;
  onFormatXML: () => void;
  getLanguage: () => string;
}

export function JsonBodyEditor({
  rawType,
  rawContent,
  contentType,
  onRawTypeChange,
  onRawContentChange,
  onFormatJSON,
  onFormatXML,
  getLanguage,
}: JsonBodyEditorProps) {
  return (
    <div className='h-full flex flex-col'>
      <div className='flex items-center justify-between mb-4'>
        <Select value={rawType} onValueChange={onRawTypeChange}>
          <SelectTrigger className='w-32'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='text'>Text</SelectItem>
            <SelectItem value='javascript'>JavaScript</SelectItem>
            <SelectItem value='json'>JSON</SelectItem>
            <SelectItem value='html'>HTML</SelectItem>
            <SelectItem value='xml'>XML</SelectItem>
            <SelectItem value='yaml'>YAML</SelectItem>
          </SelectContent>
        </Select>

        <div className='flex items-center gap-2'>
          {(rawType === 'json' || rawType === 'xml') && (
            <Button
              size='sm'
              variant='outline'
              onClick={rawType === 'json' ? onFormatJSON : onFormatXML}
            >
              Format
            </Button>
          )}
          <Badge variant='outline' className='text-xs'>
            {contentType}
          </Badge>
        </div>
      </div>

      <div className='flex-1'>
        <CodeEditor
          value={rawContent}
          onChange={onRawContentChange}
          language={getLanguage()}
          placeholder='Enter request body...'
          rows={20}
        />
      </div>
    </div>
  );
}
