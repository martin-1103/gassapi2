import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Key, Eye, EyeOff } from "lucide-react"
import { AuthData } from "./hooks/use-auth-state"

interface OAuth2AuthProps {
  authData: AuthData
  showSecret: boolean
  setShowSecret: (show: boolean) => void
  updateOAuth2: (updates: Partial<AuthData['oauth2']>) => void
}

export function OAuth2Auth({
  authData,
  showSecret,
  setShowSecret,
  updateOAuth2
}: OAuth2AuthProps) {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <div>
            <Label htmlFor="oauth-grant-type">Grant Type</Label>
            <Select value={authData.oauth2.grantType} onValueChange={(grantType) => updateOAuth2({ grantType: grantType as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="authorization_code">Authorization Code</SelectItem>
                <SelectItem value="client_credentials">Client Credentials</SelectItem>
                <SelectItem value="password">Password</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="oauth-client-id">Client ID</Label>
            <Input
              id="oauth-client-id"
              placeholder="Enter client ID"
              value={authData.oauth2.clientId}
              onChange={(e) => updateOAuth2({ clientId: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="oauth-client-secret">Client Secret</Label>
            <div className="relative">
              <Input
                id="oauth-client-secret"
                type={showSecret ? "text" : "password"}
                placeholder="Enter client secret"
                value={authData.oauth2.clientSecret}
                onChange={(e) => updateOAuth2({ clientSecret: e.target.value })}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {(authData.oauth2.grantType === 'authorization_code' || authData.oauth2.grantType === 'password') && (
            <div>
              <Label htmlFor="oauth-scope">Scope (optional)</Label>
              <Input
                id="oauth-scope"
                placeholder="read write admin"
                value={authData.oauth2.scope || ''}
                onChange={(e) => updateOAuth2({ scope: e.target.value })}
              />
            </div>
          )}

          {authData.oauth2.grantType === 'authorization_code' && (
            <>
              <div>
                <Label htmlFor="oauth-redirect-uri">Redirect URI</Label>
                <Input
                  id="oauth-redirect-uri"
                  placeholder="https://yourapp.com/callback"
                  value={authData.oauth2.redirectUri || ''}
                  onChange={(e) => updateOAuth2({ redirectUri: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="oauth-auth-url">Authorization URL</Label>
                <Input
                  id="oauth-auth-url"
                  placeholder="https://auth.example.com/oauth/authorize"
                  value={authData.oauth2.authUrl || ''}
                  onChange={(e) => updateOAuth2({ authUrl: e.target.value })}
                />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <div>
            <Label htmlFor="oauth-access-token">Access Token</Label>
            <Textarea
              id="oauth-access-token"
              placeholder="Access token akan muncul di sini setelah autentikasi"
              value={authData.oauth2.accessToken || ''}
              onChange={(e) => updateOAuth2({ accessToken: e.target.value })}
              rows={3}
              className="font-mono text-sm"
            />
          </div>

          <div>
            <Label htmlFor="oauth-refresh-token">Refresh Token</Label>
            <Textarea
              id="oauth-refresh-token"
              placeholder="Refresh token akan muncul di sini setelah autentikasi"
              value={authData.oauth2.refreshToken || ''}
              onChange={(e) => updateOAuth2({ refreshToken: e.target.value })}
              rows={3}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm">
              <Key className="w-4 h-4 mr-2" />
              Get New Token
            </Button>
            <span className="text-xs text-muted-foreground">
              Authenticate with OAuth 2.0 provider
            </span>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">OAuth 2.0 Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Automatic Token Refresh</Label>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Store Tokens Securely</Label>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">PKCE Support</Label>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Token Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>• Tokens are encrypted before storage</p>
              <p>• Access tokens are refreshed automatically</p>
              <p>• Refresh tokens are used to get new access tokens</p>
              <p>• Token expiration is monitored and handled</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}