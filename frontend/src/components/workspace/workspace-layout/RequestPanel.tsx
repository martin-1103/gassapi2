import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeEditor } from '@/components/common/code-editor'
import { RequestParamsTab, QueryParam } from '../../request-tabs/params-tab'
import { RequestHeadersTab, RequestHeader } from '../../request-tabs/headers-tab'
import { RequestBodyTab, BodyData } from '../../request-tabs/body-tab'

interface RequestPanelProps {
  method: string
  url: string
  selectedEnvironment: any
  environments: any[]
  params: QueryParam[]
  headers: RequestHeader[]
  bodyData: BodyData
  isSending: boolean

  onMethodChange: (method: string) => void
  onUrlChange: (url: string) => void
  onEnvironmentChange: (env: any) => void
  onParamsChange: (params: QueryParam[]) => void
  onHeadersChange: (headers: RequestHeader[]) => void
  onBodyDataChange: (bodyData: BodyData) => void
  onSendRequest: () => void
  onSaveRequest?: () => void
}

export function RequestPanel({
  method,
  url,
  selectedEnvironment,
  environments,
  params,
  headers,
  bodyData,
  isSending,
  onMethodChange,
  onUrlChange,
  onEnvironmentChange,
  onParamsChange,
  onHeadersChange,
  onBodyDataChange,
  onSendRequest,
  onSaveRequest
}: RequestPanelProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        {/* Request Header */}
        <Card className="p-4 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Select value={method} onValueChange={onMethodChange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="HEAD">HEAD</SelectItem>
                <SelectItem value="OPTIONS">OPTIONS</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="https://api.example.com/endpoint atau {{base_url}}/users"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              className="flex-1 font-mono"
            />

            <Button
              className="px-6"
              onClick={onSendRequest}
              disabled={isSending || !url.trim()}
            >
              {isSending ? 'Mengirim...' : 'Kirim'}
            </Button>

            {onSaveRequest && (
              <Button variant="outline" onClick={onSaveRequest}>
                Simpan
              </Button>
            )}
          </div>

          {/* Environment Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Environment:</span>
            <Select
              value={selectedEnvironment.id}
              onValueChange={(envId) => {
                const env = environments.find(e => e.id === envId)
                if (env) onEnvironmentChange(env)
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {environments.map((env) => (
                  <SelectItem key={env.id} value={env.id}>
                    {env.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline">{selectedEnvironment.base_url}</Badge>
          </div>
        </Card>

        {/* Request Tabs */}
        <Tabs defaultValue="params" className="h-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="params">Params</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="auth">Auth</TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-4">
            <TabsContent value="params" className="h-full">
              <RequestParamsTab params={params} onChange={onParamsChange} />
            </TabsContent>

            <TabsContent value="headers" className="h-full">
              <RequestHeadersTab headers={headers} onChange={onHeadersChange} />
            </TabsContent>

            <TabsContent value="body" className="h-full">
              <RequestBodyTab bodyData={bodyData} onChange={onBodyDataChange} />
            </TabsContent>

            <TabsContent value="tests">
              <Card className="p-4">
                <h4 className="font-medium mb-4">Tests</h4>
                <CodeEditor
                  value="// Tulis JavaScript tests di sini\npm.test('Status code adalah 200', () => {\n  pm.response.to.have.status(200);\n});"
                  onChange={() => {}}
                  language="javascript"
                  placeholder="Tulis script test..."
                  rows={10}
                />
              </Card>
            </TabsContent>

            <TabsContent value="auth">
              <Card className="p-4">
                <h4 className="font-medium mb-4">Authentication</h4>
                <Select defaultValue="noauth">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="noauth">No Auth</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="apikey">API Key</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-4">
                  Pilih tipe autentikasi untuk mengkonfigurasi
                </p>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </ScrollArea>
  )
}