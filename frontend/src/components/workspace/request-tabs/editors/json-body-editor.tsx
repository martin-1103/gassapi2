import React from 'react';
import { CodeEditor } from '@/components/common/code-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BodyData } from '@/hooks/use-request-body-state';

interface JsonBodyEditorProps {
  bodyData: BodyData;
  updateRawType: (rawType: BodyData['rawType']) => void;
  updateRawContent: (content: string) => void;
  getContentType: (bodyData: BodyData) => string | null;
}

export const JsonBodyEditor: React.FC<JsonBodyEditorProps> = ({
  bodyData,
  updateRawType,
  updateRawContent,
  getContentType,
}) => {
  return (
    <div className='h-full flex flex-col'>
      <div className='flex items-center justify-between mb-4'>
        <Select value={bodyData.rawType} onValueChange={updateRawType}>
          <SelectTrigger className='w-32'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='text'>Text</SelectItem>
            <SelectItem value='javascript'>JavaScript</SelectItem>
            <SelectItem value='json'>JSON</SelectItem>
            <SelectItem value='html'>HTML</SelectItem>
            <SelectItem value='xml'>XML</SelectItem>
          </SelectContent>
        </Select>

        <div className='text-sm text-muted-foreground'>
          {getContentType(bodyData)}
        </div>
      </div>

      <div className='flex-1'>
        <CodeEditor
          value={bodyData.rawContent}
          onChange={updateRawContent}
          language={
            bodyData.rawType === 'javascript'
              ? 'javascript'
              : bodyData.rawType === 'xml'
                ? 'xml'
                : bodyData.rawType === 'html'
                  ? 'html'
                  : 'json'
          }
          placeholder='Enter request body...'
          rows={20}
        />
      </div>
    </div>
  );
};