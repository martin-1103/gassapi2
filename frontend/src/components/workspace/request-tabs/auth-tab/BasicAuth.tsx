import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Info, Eye, EyeOff } from "lucide-react"
import { AuthData } from "./hooks/use-auth-state"

interface BasicAuthProps {
  authData: AuthData
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  updateBasic: (updates: Partial<AuthData['basic']>) => void
  generateBasicAuth: () => string
}

export function BasicAuth({
  authData,
  showPassword,
  setShowPassword,
  updateBasic,
  generateBasicAuth
}: BasicAuthProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="basic-username">Username</Label>
        <Input
          id="basic-username"
          placeholder="Enter username"
          value={authData.basic.username}
          onChange={(e) => updateBasic({ username: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="basic-password">Password</Label>
        <div className="relative">
          <Input
            id="basic-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={authData.basic.password}
            onChange={(e) => updateBasic({ password: e.target.value })}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">How it works:</p>
              <p>Basic authentication encodes credentials and adds to Authorization header:</p>
              <code className="block bg-muted p-1 rounded mt-1 text-xs">
                Authorization: Basic {generateBasicAuth() || '<base64-encoded-credentials>'}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}