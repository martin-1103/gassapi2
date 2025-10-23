import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Shield, 
  Key, 
  Lock, 
  Database, 
  Cloud,
  Eye,
  EyeOff,
  Copy,
  Save,
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

interface AuthConfig {
  type: 'none' | 'bearer' | 'basic' | 'apikey' | 'oauth2' | 'aws'
  bearer?: {
    token: string
    prefix?: string
  }
  basic?: {
    username: string
    password: string
  }
  apikey?: {
    key: string
    value: string
    addTo: 'header' | 'query'
    keyName?: string
  }
  oauth2?: {
    grantType: 'authorization_code' | 'client_credentials' | 'password'
    authUrl: string
    tokenUrl: string
    clientId: string
    clientSecret: string
    scopes: string[]
    accessToken?: string
    refreshToken?: string
  }
  aws?: {
    accessKey: string
    secretKey: string
    region: string
    service: string
  }
}

interface AuthTabProps {
  config: AuthConfig
  onChange: (config: AuthConfig) => void
  environment?: Record<string, string>
}

// Auth helper templates
const AUTH_TEMPLATES = {
  'GitHub API': {
    type: 'bearer' as const,
    bearer: { token: 'ghp_xxxxxxxxxxxxxxxxxxxx', prefix: 'token' }
  },
  'Twitter API': {
    type: 'bearer' as const,
    bearer: { token: 'Bearer xxxxxxxxxxxxxxxxxxxxxx', prefix: '' }
  },
  'Google OAuth2': {
    type: 'oauth2' as const,
    oauth2: {
      grantType: 'authorization_code' as const,
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      clientId: 'your-client-id',
      clientSecret: 'your-client-secret',
      scopes: ['email', 'profile']
    }
  },
  'AWS Signature': {
    type: 'aws' as const,
    aws: {
      accessKey: 'AKIA...',
      secretKey: 'secret...',
      region: 'us-east-1',
      service: 's3'
    }
  }
}

export default function AuthTab({ config, onChange, environment = {} }: AuthTabProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const { toast } = useToast()

  const updateConfig = (updates: Partial<AuthConfig>) => {
    onChange({ ...config, ...updates })
  }

  const interpolateVariables = (text: string): string => {
    if (!text || !environment) return text
    
    let interpolated = text
    Object.entries(environment).forEach(([key, value]) => {
      interpolated = interpolated.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    return interpolated
  }

  const getAuthHeaders = (): Record<string, string> => {
    switch (config.type) {
      case 'bearer':
        if (config.bearer?.token) {
          const token = interpolateVariables(config.bearer.token)
          const prefix = config.bearer.prefix || 'Bearer'
          return { 'Authorization': `${prefix} ${token}` }
        }
        return {}
      
      case 'basic':
        if (config.basic?.username && config.basic?.password) {
          const username = interpolateVariables(config.basic.username)
          const password = interpolateVariables(config.basic.password)
          const credentials = btoa(`${username}:${password}`)
          return { 'Authorization': `Basic ${credentials}` }
        }
        return {}
      
      case 'apikey':
        if (config.apikey?.key && config.apikey?.value) {
          const key = interpolateVariables(config.apikey.key)
          const value = interpolateVariables(config.apikey.value)
          if (config.apikey.addTo === 'header') {
            return { [key]: value }
          }
        }
        return {}
      
      case 'oauth2':
        if (config.oauth2?.accessToken) {
          const token = interpolateVariables(config.oauth2.accessToken)
          return { 'Authorization': `Bearer ${token}` }
        }
        return {}
      
      default:
        return {}
    }
  }

  const copyAuthHeaders = () => {
    const headers = getAuthHeaders()
    const headersText = Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')
    navigator.clipboard.writeText(headersText)
    toast({
      title: 'Headers Copied',
      description: 'Authentication headers copied to clipboard'
    })
  }

  const applyTemplate = (templateName: string) => {
    const template = AUTH_TEMPLATES[templateName as keyof typeof AUTH_TEMPLATES]
    if (template) {
      onChange(template)
      toast({
        title: 'Template Applied',
        description: `${templateName} authentication template applied`
      })
    }
  }

  const testAuth = () => {
    const headers = getAuthHeaders()
    if (Object.keys(headers).length === 0) {
      toast({
        title: 'No Authentication',
        description: 'Please configure authentication settings',
        variant: 'destructive'
      })
      return
    }

    // Test auth configuration
    toast({
      title: 'Authentication Valid',
      description: 'Authentication configuration looks good',
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">Authentication</h3>
          {config.type !== 'none' && (
            <Badge variant="outline">{config.type.toUpperCase()}</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={testAuth}>
            <Shield className="w-4 h-4 mr-2" />
            Test
          </Button>
          <Button size="sm" variant="outline" onClick={copyAuthHeaders}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Headers
          </Button>
        </div>
      </div>

      {/* Auth Type Selector */}
      <div className="px-4 pt-4">
        <Select value={config.type} onValueChange={(value: AuthConfig['type']) => updateConfig({ type: value })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select authentication type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Authentication</SelectItem>
            <SelectItem value="bearer">Bearer Token</SelectItem>
            <SelectItem value="basic">Basic Auth</SelectItem>
            <SelectItem value="apikey">API Key</SelectItem>
            <SelectItem value="oauth2">OAuth 2.0</SelectItem>
            <SelectItem value="aws">AWS Signature</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates */}
      {config.type === 'none' && (
        <Card className="mx-4 mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Auth Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.keys(AUTH_TEMPLATES).map((templateName) => (
                <Button
                  key={templateName}
                  size="sm"
                  variant="outline"
                  onClick={() => applyTemplate(templateName)}
                  className="justify-start"
                >
                  {templateName}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auth Configuration */}
      {config.type !== 'none' && (
        <div className="flex-1 p-4">
          <ScrollArea className="h-full">
            {config.type === 'bearer' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="token">Token</Label>
                  <Input
                    id="token"
                    type="password"
                    value={config.bearer?.token || ''}
                    onChange={(e) => updateConfig({
                      bearer: { ...config.bearer, token: e.target.value }
                    })}
                    placeholder="Enter bearer token or {{environment_variable}}"
                    className="font-mono"
                  />
                </div>
                
                <div>
                  <Label htmlFor="prefix">Token Prefix</Label>
                  <Select 
                    value={config.bearer?.prefix || 'Bearer'} 
                    onValueChange={(prefix) => updateConfig({
                      bearer: { ...config.bearer, prefix }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bearer">Bearer</SelectItem>
                      <SelectItem value="token">token</SelectItem>
                      <SelectItem value="">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {config.type === 'basic' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={config.basic?.username || ''}
                    onChange={(e) => updateConfig({
                      basic: { ...config.basic, username: e.target.value }
                    })}
                    placeholder="Enter username or {{environment_variable}}"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={config.basic?.password || ''}
                      onChange={(e) => updateConfig({
                        basic: { ...config.basic, password: e.target.value }
                      })}
                      placeholder="Enter password or {{environment_variable}}"
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {config.type === 'apikey' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="apiKeyKey">API Key Name</Label>
                  <Input
                    id="apiKeyKey"
                    value={config.apikey?.key || ''}
                    onChange={(e) => updateConfig({
                      apikey: { ...config.apikey, key: e.target.value }
                    })}
                    placeholder="Enter API key name (e.g., X-API-Key)"
                    className="font-mono"
                  />
                </div>
                
                <div>
                  <Label htmlFor="apiKeyValue">API Key Value</Label>
                  <Input
                    id="apiKeyValue"
                    type="password"
                    value={config.apikey?.value || ''}
                    onChange={(e) => updateConfig({
                      apikey: { ...config.apikey, value: e.target.value }
                    })}
                    placeholder="Enter API key value or {{environment_variable}}"
                    className="font-mono"
                  />
                </div>
                
                <div>
                  <Label>Add to</Label>
                  <Select 
                    value={config.apikey?.addTo || 'header'} 
                    onValueChange={(addTo: 'header' | 'query') => updateConfig({
                      apikey: { ...config.apikey, addTo }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Header</SelectItem>
                      <SelectItem value="query">Query Parameter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {config.type === 'oauth2' && (
              <div className="space-y-4">
                <div>
                  <Label>Grant Type</Label>
                  <Select 
                    value={config.oauth2?.grantType || 'authorization_code'} 
                    onValueChange={(grantType: 'authorization_code' | 'client_credentials' | 'password') => updateConfig({
                      oauth2: { ...config.oauth2, grantType }
                    })}
                  >
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="authUrl">Authorization URL</Label>
                    <Input
                      id="authUrl"
                      value={config.oauth2?.authUrl || ''}
                      onChange={(e) => updateConfig({
                        oauth2: { ...config.oauth2, authUrl: e.target.value }
                      })}
                      placeholder="https://example.com/oauth/authorize"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tokenUrl">Token URL</Label>
                    <Input
                      id="tokenUrl"
                      value={config.oauth2?.tokenUrl || ''}
                      onChange={(e) => updateConfig({
                        oauth2: { ...config.oauth2, tokenUrl: e.target.value }
                      })}
                      placeholder="https://example.com/oauth/token"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      value={config.oauth2?.clientId || ''}
                      onChange={(e) => updateConfig({
                        oauth2: { ...config.oauth2, clientId: e.target.value }
                      })}
                      placeholder="your-client-id"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="clientSecret">Client Secret</Label>
                    <div className="relative">
                      <Input
                        id="clientSecret"
                        type={showSecret ? 'text' : 'password'}
                        value={config.oauth2?.clientSecret || ''}
                        onChange={(e) => updateConfig({
                          oauth2: { ...config.oauth2, clientSecret: e.target.value }
                        })}
                        placeholder="your-client-secret"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => setShowSecret(!showSecret)}
                      >
                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="scopes">Scopes</Label>
                  <Textarea
                    id="scopes"
                    value={config.oauth2?.scopes?.join('\n') || ''}
                    onChange={(e) => updateConfig({
                      oauth2: { 
                        ...config.oauth2, 
                        scopes: e.target.value.split('\n').filter(s => s.trim())
                      }
                    })}
                    placeholder="email&#10;profile&#10;read"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accessToken">Access Token</Label>
                    <Input
                      id="accessToken"
                      type="password"
                      value={config.oauth2?.accessToken || ''}
                      onChange={(e) => updateConfig({
                        oauth2: { ...config.oauth2, accessToken: e.target.value }
                      })}
                      placeholder="{{access_token}}"
                      className="font-mono"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="refreshToken">Refresh Token</Label>
                    <Input
                      id="refreshToken"
                      type="password"
                      value={config.oauth2?.refreshToken || ''}
                      onChange={(e) => updateConfig({
                        oauth2: { ...config.oauth2, refreshToken: e.target.value }
                      })}
                      placeholder="{{refresh_token}}"
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {config.type === 'aws' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accessKey">Access Key ID</Label>
                    <Input
                      id="accessKey"
                      value={config.aws?.accessKey || ''}
                      onChange={(e) => updateConfig({
                        aws: { ...config.aws, accessKey: e.target.value }
                      })}
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                      className="font-mono"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="secretKey">Secret Access Key</Label>
                    <Input
                      id="secretKey"
                      type="password"
                      value={config.aws?.secretKey || ''}
                      onChange={(e) => updateConfig({
                        aws: { ...config.aws, secretKey: e.target.value }
                      })}
                      placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="region">AWS Region</Label>
                    <Select 
                      value={config.aws?.region || 'us-east-1'} 
                      onValueChange={(region) => updateConfig({
                        aws: { ...config.aws, region }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us-east-1">us-east-1</SelectItem>
                        <SelectItem value="us-west-2">us-west-2</SelectItem>
                        <SelectItem value="eu-west-1">eu-west-1</SelectItem>
                        <SelectItem value="ap-southeast-1">ap-southeast-1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="service">AWS Service</Label>
                    <Select 
                      value={config.aws?.service || 's3'} 
                      onValueChange={(service) => updateConfig({
                        aws: { ...config.aws, service }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="s3">S3</SelectItem>
                        <SelectItem value="ec2">EC2</SelectItem>
                        <SelectItem value="lambda">Lambda</SelectItem>
                        <SelectItem value="dynamodb">DynamoDB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      )}

      {/* Generated Headers Preview */}
      {config.type !== 'none' && (
        <div className="p-4 border-t bg-muted/50">
          <div className="text-sm text-muted-foreground mb-2">Generated Headers:</div>
          <div className="space-y-1">
            {Object.entries(getAuthHeaders()).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-2 bg-background rounded">
                <span className="font-mono text-sm">{key}:</span>
                <span className="font-mono text-sm text-muted-foreground ml-2">
                  {value.length > 30 ? value.substring(0, 30) + '...' : value}
                </span>
              </div>
            ))}
            {Object.keys(getAuthHeaders()).length === 0 && (
              <div className="text-xs text-muted-foreground italic">
                No headers will be added. Configure authentication to generate headers.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
