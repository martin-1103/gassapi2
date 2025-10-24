import { ImportResult } from '@/types/import-types';

export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validatePostmanCollection = (content: string): ImportValidationResult => {
  const result: ImportValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    const parsed = JSON.parse(content);
    
    // Check if it's a valid Postman collection
    if (!parsed.info) {
      result.isValid = false;
      result.errors.push('Missing required "info" field in Postman collection');
      return result;
    }
    
    if (!parsed.info.name) {
      result.isValid = false;
      result.errors.push('Postman collection must have a name');
      return result;
    }
    
    if (typeof parsed.item !== 'undefined' && !Array.isArray(parsed.item)) {
      result.isValid = false;
      result.errors.push('Postman collection "item" field must be an array');
      return result;
    }
    
    // Add any additional validation as needed
    if (parsed.auth) {
      result.warnings.push('Authentication settings in Postman collection may not be imported');
    }

    return result;
  } catch (error: any) {
    result.isValid = false;
    result.errors.push(`Invalid JSON format: ${error.message}`);
    return result;
  }
};

export const validateOpenAPISpec = (content: string): ImportValidationResult => {
  const result: ImportValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    const parsed = JSON.parse(content);
    
    // Check if it's a valid OpenAPI/Swagger spec
    if (!parsed.openapi && !parsed.swagger) {
      result.isValid = false;
      result.errors.push('Missing required "openapi" or "swagger" field in OpenAPI specification');
      return result;
    }
    
    // Validate version
    if (parsed.openapi) {
      const version = parsed.openapi;
      if (!version.startsWith('3.')) {
        result.warnings.push(`OpenAPI version ${version} may not be fully supported. Recommended: 3.x.x`);
      }
    } else if (parsed.swagger) {
      const version = parsed.swagger;
      if (!version.startsWith('2.')) {
        result.warnings.push(`Swagger version ${version} may not be fully supported. Recommended: 2.0`);
      }
    }
    
    // Check for paths
    if (!parsed.paths || Object.keys(parsed.paths).length === 0) {
      result.warnings.push('OpenAPI specification has no defined paths');
    }
    
    return result;
  } catch (error: any) {
    result.isValid = false;
    result.errors.push(`Invalid JSON format: ${error.message}`);
    return result;
  }
};

export const validateCurlCommand = (content: string): ImportValidationResult => {
  const result: ImportValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Basic validation for cURL command
  if (!content.includes('curl ')) {
    result.isValid = false;
    result.errors.push('Content does not appear to be a cURL command. Should start with "curl "');
    return result;
  }

  // Check for method
  const methodMatch = content.match(/-X\s+([A-Z]+)/i);
  if (!methodMatch) {
    result.warnings.push('No HTTP method specified (use -X GET, -X POST, etc.)');
  }

  // Check for URL
  const urlMatch = content.match(/'([^\']+)'/) || content.match(/"([^\"]+)"/) || content.match(/(\S+)\s/);
  if (!urlMatch) {
    result.isValid = false;
    result.errors.push('No URL found in cURL command');
    return result;
  }

  return result;
};

export const validateImportContent = (
  content: string, 
  importType: 'postman' | 'openapi' | 'curl'
): ImportValidationResult => {
  switch (importType) {
    case 'postman':
      return validatePostmanCollection(content);
    case 'openapi':
      return validateOpenAPISpec(content);
    case 'curl':
      return validateCurlCommand(content);
    default:
      return {
        isValid: false,
        errors: ['Unsupported import type'],
        warnings: []
      };
  }
};