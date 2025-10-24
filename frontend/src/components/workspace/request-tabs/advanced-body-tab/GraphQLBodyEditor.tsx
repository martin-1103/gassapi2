import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeEditor } from '@/components/common/CodeEditor'
import { Database } from 'lucide-react'

interface GraphQLBodyEditorProps {
  graphqlQuery: string
  graphqlVariables: string
  onQueryChange: (query: string) => void
  onVariablesChange: (variables: string) => void
  onAddTemplate: () => void
}

export function GraphQLBodyEditor({
  graphqlQuery,
  graphqlVariables,
  onQueryChange,
  onVariablesChange,
  onAddTemplate
}: GraphQLBodyEditorProps) {
  return (
    <div className="h-full">
      <Tabs defaultValue="query" className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="query">QUERY</TabsTrigger>
            <TabsTrigger value="variables">VARIABLES</TabsTrigger>
          </TabsList>
          <Button size="sm" variant="outline" onClick={onAddTemplate}>
            <Database className="w-4 h-4 mr-2" />
            Template
          </Button>
        </div>

        <div className="flex-1 mt-4 px-4">
          <TabsContent value="query" className="h-full">
            <CodeEditor
              value={graphqlQuery}
              onChange={onQueryChange}
              language="javascript"
              placeholder="query {\n  users {\n    id\n    name\n  }\n}"
              rows={15}
            />
          </TabsContent>

          <TabsContent value="variables" className="h-full">
            <CodeEditor
              value={graphqlVariables}
              onChange={onVariablesChange}
              language="json"
              placeholder='{\n  "limit": 10\n}'
              rows={10}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}