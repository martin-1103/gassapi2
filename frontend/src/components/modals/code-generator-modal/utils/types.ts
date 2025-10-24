export interface RequestData {
  method: string
  url: string
  headers: Record<string, string>
  body?: any
}

export interface CodeSnippet {
  language: string
  code: string
  description: string
  framework?: string
}