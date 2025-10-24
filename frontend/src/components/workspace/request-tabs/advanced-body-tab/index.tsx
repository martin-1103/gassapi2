import { FileText, Binary, Upload } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { FormDataEditor } from './FormDataEditor';
import { GraphQLBodyEditor } from './GraphQLBodyEditor';
import { useBodyState, type BodyData } from './hooks/use-body-state';
import { JsonBodyEditor } from './JsonBodyEditor';

interface AdvancedBodyTabProps {
  body: BodyData;
  onChange: (body: BodyData) => void;
}

export default function AdvancedBodyTab({
  body,
  onChange,
}: AdvancedBodyTabProps) {
  const {
    updateBodyType,
    updateRawType,
    updateRawContent,
    updateFormData,
    updateGraphQLQuery,
    updateGraphQLVariables,
    getContentType,
    getBodyPreview,
    getLanguage,
    formatJSON,
    formatXML,
  } = useBodyState({ initialBody: body, onChange });

  const addGraphQLTemplate = () => {
    const query = `query {
  users(first: 10) {
    edges {
      node {
        id
        name
        email
      }
    }
  }
}`;
    const variables = `{
  "first": 10
}`;
    updateGraphQLQuery(query);
    updateGraphQLVariables(variables);
  };

  return (
    <div className='h-full flex flex-col'>
      {/* Body Type Selector */}
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center gap-4'>
          <h3 className='font-semibold'>Body</h3>
          {getContentType() && (
            <Badge variant='outline'>{getContentType()}</Badge>
          )}
        </div>

        <Select value={body.type} onValueChange={updateBodyType}>
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
        {body.type === 'none' && (
          <div className='h-full flex items-center justify-center text-muted-foreground'>
            <div className='text-center'>
              <FileText className='w-16 h-16 mx-auto mb-4 opacity-50' />
              <h3 className='text-lg font-semibold mb-2'>No Body</h3>
              <p className='text-sm'>This request does not have a body</p>
            </div>
          </div>
        )}

        {body.type === 'raw' && (
          <JsonBodyEditor
            rawType={body.rawType}
            rawContent={body.rawContent}
            contentType={getContentType() || ''}
            onRawTypeChange={updateRawType}
            onRawContentChange={updateRawContent}
            onFormatJSON={formatJSON}
            onFormatXML={formatXML}
            getLanguage={getLanguage}
          />
        )}

        {(body.type === 'form-data' ||
          body.type === 'x-www-form-urlencoded') && (
          <div className='h-full'>
            <FormDataEditor
              formData={body.formData}
              onChange={updateFormData}
            />
          </div>
        )}

        {body.type === 'binary' && (
          <div className='h-full flex items-center justify-center'>
            <Card className='w-96'>
              <CardContent className='pt-6'>
                <div className='text-center'>
                  <Binary className='w-12 h-12 mx-auto mb-4 text-muted-foreground' />
                  <h4 className='text-lg font-semibold mb-2'>Select File</h4>
                  <p className='text-sm text-muted-foreground mb-4'>
                    Choose a file to send as binary data
                  </p>
                  <Button className='w-full'>
                    <Upload className='w-4 h-4 mr-2' />
                    Choose File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {body.type === 'graphql' && (
          <GraphQLBodyEditor
            graphqlQuery={body.graphqlQuery}
            graphqlVariables={body.graphqlVariables}
            onQueryChange={updateGraphQLQuery}
            onVariablesChange={updateGraphQLVariables}
            onAddTemplate={addGraphQLTemplate}
          />
        )}
      </div>

      {/* Preview */}
      {body.type !== 'none' && body.type !== 'binary' && (
        <div className='p-4 border-t bg-muted/50'>
          <div className='text-sm text-muted-foreground mb-2'>Preview:</div>
          <pre className='text-xs bg-background p-2 rounded overflow-x-auto'>
            {getBodyPreview()}
          </pre>
        </div>
      )}
    </div>
  );
}
