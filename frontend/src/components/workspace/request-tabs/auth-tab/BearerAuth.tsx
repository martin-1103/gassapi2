import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Info } from "lucide-react"
import { AuthData } from "./hooks/use-auth-state"

interface BearerAuthProps {
  authData: AuthData
  updateBearer: (updates: Partial<AuthData['bearer']>) => void
}

export function BearerAuth({ authData, updateBearer }: BearerAuthProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="bearer-token">Token</Label>
        <Textarea
          id="bearer-token"
          placeholder="Bearer token here..."
          value={authData.bearer.token}
          onChange={(e) => updateBearer({ token: e.target.value })}
          rows={3}
          className="font-mono text-sm"
        />
      </div>

      <div>
        <Label htmlFor="bearer-prefix">Token Prefix</Label>
        <Select value={authData.bearer.prefix} onValueChange={(prefix) => updateBearer({ prefix })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Bearer">Bearer</SelectItem>
            <SelectItem value="JWT">JWT</SelectItem>
            <SelectItem value="Token">Token</SelectItem>
            <SelectItem value="">No Prefix</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">How it works:</p>
              <p>Token akan ditambahkan ke header Authorization sebagai:</p>
              <code className="block bg-muted p-1 rounded mt-1 text-xs">
                Authorization: {authData.bearer.prefix} {authData.bearer.token || '<token>'}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}