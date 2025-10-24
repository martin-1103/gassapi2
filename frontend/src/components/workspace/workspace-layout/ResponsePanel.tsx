import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeEditor } from '@/components/common/code-editor'
import { StatusBadge } from '@/components/common/status-badge'
import { TimeDisplay } from '@/components/common/time-display'

interface ResponsePanelProps {
  response: any
}

export function ResponsePanel({ response }: ResponsePanelProps) {
  if (!response) {
    return (
      <div className="p-4 h-full">
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-lg mb-2">Belum Ada Response</p>
            <p className="text-sm">Kirim request untuk melihat response di sini</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 h-full">
      {/* Response Status */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <StatusBadge status={response.status} />
            <span className="text-sm text-muted-foreground">
              {response.statusText}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <TimeDisplay time={response.time} showDetailed />
            <span className="text-sm text-muted-foreground">
              {response.size} bytes
            </span>
          </div>
        </div>
      </Card>

      {/* Response Tabs */}
      <Tabs defaultValue="body" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="cookies">Cookies</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
        </TabsList>

        <div className="flex-1 mt-4">
          <TabsContent value="body" className="h-full">
            <Card className="p-4">
              <CodeEditor
                value={JSON.stringify(response.data, null, 2)}
                onChange={() => {}}
                language="json"
                readOnly
                rows={20}
              />
            </Card>
          </TabsContent>

          <TabsContent value="headers" className="h-full">
            <Card className="p-4">
              <div className="space-y-2">
                {Object.entries(response.headers || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-2 bg-muted/50 rounded">
                    <span className="font-mono text-sm">{key}</span>
                    <span className="font-mono text-sm text-muted-foreground">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="cookies" className="h-full">
            <Card className="p-4">
              <div className="flex items-center justify-center text-muted-foreground">
                <p>Tidak ada cookies</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tests" className="h-full">
            <Card className="p-4">
              <div className="flex items-center justify-center text-muted-foreground">
                <p>Tidak ada tests</p>
              </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}