/**
 * Variable interpolation types
 */

export interface EnvironmentVariable {
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvironmentVariable[];
  is_default?: boolean;
}

export interface RequestConfig {
  url?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface TemplateValidationResult {
  isValid: boolean;
  missingVariables: string[];
  invalidSyntax: string[];
}

// Union types for interpolation
export type InterpolatableValue =
  | string
  | Record<string, unknown>
  | unknown[]
  | unknown;
export type InterpolatedObject = Record<string, InterpolatableValue>;
