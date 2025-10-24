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