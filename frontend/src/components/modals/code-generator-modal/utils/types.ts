export interface RequestData {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface CodeSnippet {
  language: string;
  code: string;
  description: string;
  framework?: string;
}
