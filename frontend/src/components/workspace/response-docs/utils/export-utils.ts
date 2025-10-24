// Utilitas untuk export documentation ke berbagai format

import { ApiEndpoint } from '../types'
import { formatSchema } from './schema-utils'

export interface DocumentationData {
  endpoint: ApiEndpoint
  response: any
  request: any
  generatedAt: string
}

/**
 * Generate Markdown documentation dari endpoint
 */
export function generateMarkdownDocumentation(endpoint: ApiEndpoint): string {
  let markdown = `# API Documentation\n\n`
  markdown += `## ${endpoint.method} ${endpoint.url}\n\n`

  if (endpoint.description) {
    markdown += `${endpoint.description}\n\n`
  }

  // Parameters
  if (endpoint.parameters && endpoint.parameters.length > 0) {
    markdown += `## Parameters\n\n`
    markdown += `| Name | Location | Type | Required | Description |\n`
    markdown += `|------|----------|------|----------|------------|\n`

    endpoint.parameters.forEach(param => {
      markdown += `| ${param.name} | ${param.in} | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.description || '-'} |\n`
    })

    markdown += `\n`
  }

  // Responses
  markdown += `## Responses\n\n`

  Object.entries(endpoint.responses).forEach(([statusCode, response]) => {
    markdown += `### ${statusCode} ${response.description}\n\n`

    Object.entries(response.content).forEach(([contentType, content]) => {
      markdown += `**Content-Type:** ${contentType}\n\n`
      markdown += `\`\`\`${formatSchema(content.schema)}\`\`\n\n`
    })
  })

  // Schema
  if (Object.keys(endpoint.responses).length > 0) {
    const firstResponse = Object.values(endpoint.responses)[0]
    const schema = Object.values(firstResponse.content)[0]?.schema

    if (schema) {
      markdown += `## Schema\n\n\`\`\`\n${formatSchema(schema)}\`\`\n`
    }
  }

  return markdown
}

/**
 * Generate cURL example
 */
export function generateCurlExample(method: string, url: string, headers: Record<string, string>): string {
  let curlCommand = `curl -X ${method} "${url}"`

  Object.entries(headers).forEach(([key, value]) => {
    curlCommand += ` \\\n  -H "${key}: ${value}"`
  })

  return curlCommand
}

/**
 * Generate JavaScript example
 */
export function generateJavaScriptExample(method: string, url: string, headers: Record<string, string>): string {
  return `const axios = require('axios');

const config = {
  method: '${method.toLowerCase()}',
  url: '${url}',
  headers: ${JSON.stringify(headers, null, 2)}
};

axios(config)
  .then(function (response) {
  console.log(JSON.stringify(response.data, null, 2));
})
  .catch(function (error) {
  console.error(error);
});
`
}

/**
 * Generate Python example
 */
export function generatePythonExample(method: string, url: string, headers: Record<string, string>): string {
  return `import requests

url = "${url}"
headers = ${JSON.stringify(headers, null, 2)}

response = requests.${method.toLowerCase()}(url, headers=headers)

print(response.json())
`
}

/**
 * Download documentation sebagai file JSON
 */
export function downloadDocumentation(data: DocumentationData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `api-docs-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Copy text ke clipboard dengan fallback
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    // Fallback untuk browser yang tidak mendukung clipboard API
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

