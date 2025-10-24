import { FileText, Plus, Upload } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { useRequestBodyState } from '@/hooks/use-request-body-state';
import { BodyPreview } from '@/lib/preview/body-preview';
import { getContentType } from '@/lib/utils/body-utils';
import { CodeEditor } from '@/components/common/code-editor';
import { FormDataEditor } from '@/components/workspace/request-tabs/editors/form-data-editor';
import { BinaryBodyEditor } from '@/components/workspace/request-tabs/editors/binary-body-editor';
import { GraphQLBodyEditor } from '@/components/workspace/request-tabs/editors/graphql-body-editor';
import { UrlEncodedEditor } from '@/components/workspace/request-tabs/editors/url-encoded-editor';

export interface BodyData {
  type:
    | 'none'
    | 'form-data'
    | 'x-www-form-urlencoded'
    | 'raw'
    | 'binary'
    | 'graphql';
  rawType: 'text' | 'javascript' | 'json' | 'html' | 'xml';
  formData: Array<{
    id: string;
    key: string;
    value: string;
    type: 'text' | 'file';
    enabled: boolean;
  }>;
  rawContent: string;
  graphqlQuery: string;
  graphqlVariables: string;
  binaryFile?: File;
}

interface RequestBodyTabProps {
  bodyData: BodyData;
  onChange: (bodyData: BodyData) => void;
}

export function RequestBodyTab({ bodyData, onChange }: RequestBodyTabProps) {
  const {
    bodyData: currentBodyData,
    updateBodyType,
    updateRawType,
    updateRawContent,
    updateGraphQLQuery,
    updateGraphQLVariables,
    addFormField,
    updateFormField,
    deleteFormField,
    handleFileUpload,
  } = useRequestBodyState({
    initialBodyData: bodyData,
    onChange,
  });

  return (
    <TooltipProvider>
      <div className='h-full flex flex-col'>
        {/* Body Type Selector */}
        <div className='flex items-center justify-between p-4 border-b'>
          <div className='flex items-center gap-4'>
            <h3 className='font-semibold'>Body</h3>
            {getContentType(currentBodyData) && (
              <Badge variant='outline'>{getContentType(currentBodyData)}</Badge>
            )}
          </div>

          <Select value={currentBodyData.type} onValueChange={updateBodyType}>
            <SelectTrigger className='w-48'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='none'>none</SelectItem>
              <SelectItem value='form-data'>form-data</SelectItem>
              <SelectItem value='x-www-form-urlencoded'>
                x-www-form-urlencoded
              </SelectItem>
              <SelectItem value='raw'>raw</SelectItem>
              <SelectItem value='binary'>binary</SelectItem>
              <SelectItem value='graphql'>GraphQL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Body Content */}
        <div className='flex-1 p-4'>
          {currentBodyData.type === 'none' && (
            <div className='h-full flex items-center justify-center text-muted-foreground'>
              <div className='text-center'>
                <FileText className='w-12 h-12 mx-auto mb-4 opacity-50' />
                <p className='text-lg mb-2'>
                  This request does not have a body
                </p>
                <p className='text-sm'>
                  Select a body type to add request data
                </p>
              </div>
            </div>
          )}

          {currentBodyData.type === 'raw' && (
            <div className='h-full flex flex-col'>
              <div className='flex items-center justify-between mb-4'>
                <Select value={currentBodyData.rawType} onValueChange={updateRawType}>
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
                  {getContentType(currentBodyData)}
                </div>
              </div>

              <div className='flex-1'>
                <CodeEditor
                  value={currentBodyData.rawContent}
                  onChange={updateRawContent}
                  language={
                    currentBodyData.rawType === 'javascript'
                      ? 'javascript'
                      : currentBodyData.rawType === 'xml'
                        ? 'xml'
                        : currentBodyData.rawType === 'html'
                          ? 'html'
                          : 'json'
                  }
                  placeholder='Enter request body...'
                  rows={20}
                />
              </div>
            </div>
          )}

          {currentBodyData.type === 'form-data' && (
            <FormDataEditor
              bodyData={currentBodyData}
              addFormField={addFormField}
              updateFormField={updateFormField}
              deleteFormField={deleteFormField}
              handleFileUpload={handleFileUpload}
            />
          )}

          {currentBodyData.type === 'x-www-form-urlencoded' && (
            <UrlEncodedEditor
              bodyData={currentBodyData}
              addFormField={addFormField}
              updateFormField={updateFormField}
              deleteFormField={deleteFormField}
            />
          )}

          {currentBodyData.type === 'binary' && (
            <BinaryBodyEditor />
          )}

          {currentBodyData.type === 'graphql' && (
            <GraphQLBodyEditor
              bodyData={currentBodyData}
              updateGraphQLQuery={updateGraphQLQuery}
              updateGraphQLVariables={updateGraphQLVariables}
            />
          )}
        </div>

        {/* Preview */}
        <BodyPreview bodyData={currentBodyData} />
      </div>
    </TooltipProvider>
  );
}