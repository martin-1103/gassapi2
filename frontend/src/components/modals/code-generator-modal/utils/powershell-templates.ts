import { formatPowerShellHeaders } from './code-gen-utils';
import type { CodeSnippet, RequestData } from './types';

export function generatePowerShell(requestData: RequestData): CodeSnippet {
  return {
    language: 'powershell',
    code: `$headers = @{${formatPowerShellHeaders(requestData.headers)}}
$body = ${requestData.body ? `${JSON.stringify(requestData.body)}` : '$null'}

try {
    $response = Invoke-RestMethod -Uri "${requestData.url}" -Method ${requestData.method.toUpperCase()} -Headers $headers -Body $body -UseBasicParsing $false
    $response | ConvertTo-Json
} catch {
    Write-Error "Request failed: $_"
}`,
    description: 'PowerShell (Invoke-RestMethod)',
    framework: 'PowerShell',
  };
}
