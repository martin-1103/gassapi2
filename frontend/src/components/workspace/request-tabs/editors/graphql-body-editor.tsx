import React from 'react';

import { CodeEditor } from '@/components/common/code-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BodyData } from '@/hooks/use-request-body-state';

interface GraphQLBodyEditorProps {
  bodyData: BodyData;
  updateGraphQLQuery: (query: string) => void;
  updateGraphQLVariables: (variables: string) => void;
}

export const GraphQLBodyEditor: React.FC<GraphQLBodyEditorProps> = ({
  bodyData,
  updateGraphQLQuery,
  updateGraphQLVariables,
}) => {
  return (
    <div className='h-full'>
      <Tabs defaultValue='query' className='h-full flex flex-col'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='query'>QUERY</TabsTrigger>
          <TabsTrigger value='variables'>VARIABLES</TabsTrigger>
        </TabsList>

        <div className='flex-1 mt-4'>
          <TabsContent value='query' className='h-full'>
            <CodeEditor
              value={bodyData.graphqlQuery}
              onChange={updateGraphQLQuery}
              language='javascript'
              placeholder='query {\n  users {\n    id\n    name\n  }\n}'
              rows={15}
            />
          </TabsContent>

          <TabsContent value='variables' className='h-full'>
            <CodeEditor
              value={bodyData.graphqlVariables}
              onChange={updateGraphQLVariables}
              language='json'
              placeholder='{\n  "limit": 10\n}'
              rows={10}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
