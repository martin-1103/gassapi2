export interface ImportResult {
  success: boolean;
  message: string;
  data?: any;
  warnings?: string[];
  importedCount?: number;
}

export interface ImportTypeInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
  acceptedFormats: string;
  example: string;
}

export type ImportType = 'postman' | 'openapi' | 'curl';
export type ImportMethod = 'file' | 'url';

export interface Parser {
  parse(content: string): Promise<ImportResult>;
}

export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}