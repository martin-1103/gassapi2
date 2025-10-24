import React from 'react';

import { CodeEditor } from '@/components/common/code-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BodyData } from '@/hooks/use-request-body-state';

interface XmlBodyEditorProps {
  bodyData: BodyData;
  updateRawType: (rawType: BodyData['rawType']) => void;
  updateRawContent: (content: string) => void;
  getContentType: (bodyData: BodyData) => string | null;
}

export const XmlBodyEditor: React.FC<XmlBodyEditorProps> = ({
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
          language='xml'
          placeholder='Enter XML request body...'
          rows={20}
        />
      </div>
    </div>
  );
};
