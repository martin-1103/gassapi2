import type { ImportValidationResult } from './types';

export const validatePostmanCollection = (
  content: string,
): ImportValidationResult => {
  const result: ImportValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  try {
    const parsed = JSON.parse(content);

    // Cek validitas Postman collection
    if (!parsed.info) {
      result.isValid = false;
      result.errors.push('Missing required "info" field di Postman collection');
      return result;
    }

    if (!parsed.info.name) {
      result.isValid = false;
      result.errors.push('Postman collection harus memiliki nama');
      return result;
    }

    if (typeof parsed.item !== 'undefined' && !Array.isArray(parsed.item)) {
      result.isValid = false;
      result.errors.push(
        'Field "item" di Postman collection harus berupa array',
      );
      return result;
    }

    // Validasi tambahan
    if (parsed.auth) {
      result.warnings.push(
        'Authentication settings di Postman collection mungkin tidak diimport',
      );
    }

    if (parsed.variable && parsed.variable.length > 0) {
      result.warnings.push(
        `Ditemukan ${parsed.variable.length} environment variables yang tidak diimport`,
      );
    }

    // Check for empty collections
    if (parsed.item && parsed.item.length === 0) {
      result.warnings.push('Collection kosong - tidak ada items yang diimport');
    }

    return result;
  } catch (error: unknown) {
    result.isValid = false;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Format JSON tidak valid: ${errorMessage}`);
    return result;
  }
};

export const validateOpenAPISpec = (
  content: string,
): ImportValidationResult => {
  const result: ImportValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  try {
    // Coba parse JSON dulu
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (jsonError) {
      // Jika JSON gagal, coba basic YAML validation
      if (
        content.includes('openapi:') ||
        content.includes('swagger:') ||
        content.includes('info:')
      ) {
        result.warnings.push(
          'Format YAML terdeteksi - parsing mungkin terbatas',
        );
        parsed = { openapi: '3.0.0' }; // Mock untuk basic validation
      } else {
        throw jsonError;
      }
    }

    // Cek validitas OpenAPI/Swagger
    if (!parsed.openapi && !parsed.swagger) {
      result.isValid = false;
      result.errors.push(
        'Missing required "openapi" atau "swagger" field di OpenAPI specification',
      );
      return result;
    }

    // Validasi versi
    if (parsed.openapi) {
      const version = parsed.openapi;
      if (!version.startsWith('3.')) {
        result.warnings.push(
          `OpenAPI versi ${version} mungkin tidak fully supported. Direkomendasikan: 3.x.x`,
        );
      }
    } else if (parsed.swagger) {
      const version = parsed.swagger;
      if (!version.startsWith('2.')) {
        result.warnings.push(
          `Swagger versi ${version} mungkin tidak fully supported. Direkomendasikan: 2.0`,
        );
      }
    }

    // Cek paths
    if (!parsed.paths || Object.keys(parsed.paths).length === 0) {
      result.warnings.push(
        'OpenAPI specification tidak memiliki paths yang didefinisikan',
      );
    }

    // Cek info section
    if (!parsed.info) {
      result.warnings.push('Missing "info" section di OpenAPI spec');
    } else {
      if (!parsed.info.title) {
        result.warnings.push('API harus memiliki title di info section');
      }
      if (!parsed.info.version) {
        result.warnings.push('API harus memiliki version di info section');
      }
    }

    return result;
  } catch (error: unknown) {
    result.isValid = false;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Format tidak valid: ${errorMessage}`);
    return result;
  }
};

export const validateCurlCommand = (
  content: string,
): ImportValidationResult => {
  const result: ImportValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // Basic validation untuk cURL command
  if (!content.toLowerCase().includes('curl')) {
    result.isValid = false;
    result.errors.push(
      'Content tidak terlihat seperti cURL command. Harus dimulai dengan "curl"',
    );
    return result;
  }

  // Cek method
  const methodMatch = content.match(/-X\s+([A-Z]+)/i);
  if (!methodMatch) {
    result.warnings.push(
      'Tidak ada HTTP method yang dispesifikasikan (gunakan -X GET, -X POST, etc.)',
    );
  }

  // Cek URL
  const urlMatches = [
    content.match(/'([^']+?)'/g),
    content.match(/"([^"]+?)"/g),
    content.match(/([^\s"']+)/g),
  ];

  let hasValidUrl = false;
  for (const matches of urlMatches) {
    if (matches) {
      for (const match of matches) {
        const candidate = match.replace(/^['"]|['"]$/g, '');
        if (
          candidate.startsWith('http://') ||
          candidate.startsWith('https://') ||
          candidate.startsWith('ftp://')
        ) {
          hasValidUrl = true;
          break;
        }
      }
      if (hasValidUrl) break;
    }
  }

  if (!hasValidUrl) {
    result.isValid = false;
    result.errors.push('Tidak ada URL yang valid ditemukan di cURL command');
    return result;
  }

  // Cek untuk common issues
  if (content.includes('-k') || content.includes('--insecure')) {
    result.warnings.push(
      'Menggunakan opsi -k/--insecure (skip SSL verification)',
    );
  }

  if (!content.includes('-H') && !content.includes('--header')) {
    result.warnings.push('Tidak ada headers yang dispesifikasikan');
  }

  if (content.includes('-d') || content.includes('--data')) {
    if (
      !methodMatch ||
      ['POST', 'PUT', 'PATCH'].includes(methodMatch[1].toUpperCase())
    ) {
      // Good - has data with appropriate method
    } else {
      result.warnings.push(
        'Mengirim data tanpa method yang sesuai (POST/PUT/PATCH)',
      );
    }
  }

  return result;
};

export const validateImportContent = (
  content: string,
  importType: 'postman' | 'openapi' | 'curl',
): ImportValidationResult => {
  // Basic content validation
  if (!content || content.trim().length === 0) {
    return {
      isValid: false,
      errors: ['Content kosong - tidak ada yang diimport'],
      warnings: [],
    };
  }

  if (content.length > 10 * 1024 * 1024) {
    // 10MB limit
    return {
      isValid: false,
      errors: ['File terlalu besar - maksimal 10MB'],
      warnings: [],
    };
  }

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
        errors: ['Tipe import tidak didukung'],
        warnings: [],
      };
  }
};
