import { CodeSnippet, RequestData } from './types'
import { formatHeaders } from './code-gen-utils'

export function generatePythonRequests(requestData: RequestData): CodeSnippet {
  return {
    language: 'python',
    code: `import requests

response = requests.${requestData.method.toLowerCase()}(
  '${requestData.url}',
  headers=${formatHeaders(requestData.headers)},
  json=${requestData.body ? JSON.stringify(requestData.body) : 'None'}
)

print(response.json())`,
    description: 'Python (Requests library)',
    framework: 'Python'
  }
}

export function generatePythonHttpx(requestData: RequestData): CodeSnippet {
  return {
    language: 'python',
    code: `import httpx

response = httpx.${requestData.method.toLowerCase()}(
  '${requestData.url}',
  headers=${formatHeaders(requestData.headers)},
  ${requestData.body ? `json=${JSON.stringify(requestData.body)}` : ''}
)

print(response.json())`,
    description: 'Python (httpx library)',
    framework: 'Python'
  }
}