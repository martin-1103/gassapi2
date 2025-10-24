/**
 * Error handling types
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface EndpointValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// API Error types
export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
  data?: unknown;
}

// JSON parsing error
export interface JSONParseError extends Error {
  message: string;
}

// Generic error with optional message
export interface ErrorWithMessage extends Error {
  message: string;
}
