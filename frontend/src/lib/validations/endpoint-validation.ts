import type { Endpoint, AuthData } from '@/types/api';
import type { RequestBody } from '@/types/api';
import type {
  ValidationError,
  EndpointValidationResult,
} from '@/types/error-types';

/**
 * Validates endpoint data
 */
export const validateEndpoint = (
  endpoint: Partial<Endpoint>,
): EndpointValidationResult => {
  const errors: ValidationError[] = [];

  // Validate name
  if (!endpoint.name || endpoint.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Name is required',
    });
  }

  // Validate method
  if (
    !endpoint.method ||
    !['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(
      endpoint.method.toUpperCase(),
    )
  ) {
    errors.push({
      field: 'method',
      message: 'Valid HTTP method is required',
    });
  }

  // Validate URL
  if (!endpoint.url || endpoint.url.trim() === '') {
    errors.push({
      field: 'url',
      message: 'URL is required',
    });
  } else if (!isValidUrl(endpoint.url)) {
    errors.push({
      field: 'url',
      message: 'Valid URL is required',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates if a URL is properly formatted (basic validation)
 */
export const isValidUrl = (url: string): boolean => {
  // If it's a variable reference, it's considered valid
  if (url.startsWith('{{') && url.endsWith('}}')) {
    return true;
  }

  // Use URL constructor for validation instead of regex to avoid ReDoS
  try {
    const testUrl = url.startsWith('http') ? url : `http://${url}`;
    new URL(testUrl);
    return testUrl.includes('.') && testUrl.split('.')[1]?.length >= 2;
  } catch {
    return false;
  }
};

/**
 * Validates query parameters
 */
export const validateQueryParams = (
  params: Array<{ key: string; value: string; enabled: boolean }>,
): EndpointValidationResult => {
  const errors: ValidationError[] = [];

  params.forEach((param, index) => {
    if (param.enabled && param.key && param.value === undefined) {
      errors.push({
        field: `params[${index}].value`,
        message: `Parameter value is required for key: ${param.key}`,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates headers
 */
export const validateHeaders = (
  headers: Array<{ key: string; value: string; enabled: boolean }>,
): EndpointValidationResult => {
  const errors: ValidationError[] = [];

  headers.forEach((header, index) => {
    if (header.enabled && header.key && !header.value) {
      errors.push({
        field: `headers[${index}].value`,
        message: `Header value is required for key: ${header.key}`,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates request body based on content type
 */
export const validateRequestBody = (
  body: RequestBody,
  contentType: string,
): EndpointValidationResult => {
  const errors: ValidationError[] = [];

  if (!body) {
    return {
      isValid: true,
      errors,
    };
  }

  if (contentType.includes('application/json')) {
    try {
      JSON.parse(body);
    } catch {
      errors.push({
        field: 'body',
        message: 'Invalid JSON format',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates authentication data
 */
export const validateAuth = (
  authData: AuthData | undefined,
): EndpointValidationResult => {
  const errors: ValidationError[] = [];

  if (!authData || !authData.type) {
    return {
      isValid: true, // Auth is optional
      errors,
    };
  }

  switch (authData.type) {
    case 'bearer':
      if (!authData.bearer.token) {
        errors.push({
          field: 'auth.bearer.token',
          message: 'Bearer token is required',
        });
      }
      break;
    case 'basic':
      if (!authData.basic.username || !authData.basic.password) {
        errors.push({
          field: 'auth.basic',
          message: 'Username and password are required for basic auth',
        });
      }
      break;
    case 'apikey':
      if (!authData.apikey.key || !authData.apikey.value) {
        errors.push({
          field: 'auth.apikey',
          message: 'API key and value are required',
        });
      }
      break;
    case 'oauth2':
      if (!authData.oauth2.clientId || !authData.oauth2.clientSecret) {
        errors.push({
          field: 'auth.oauth2',
          message: 'Client ID and Client Secret are required for OAuth2',
        });
      }
      break;
    case 'noauth':
      // No validation needed
      break;
    default:
      errors.push({
        field: 'auth.type',
        message: 'Invalid authentication type',
      });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
