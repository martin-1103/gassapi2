import { ImportResult, Parser, ImportType } from './types';
import { parsePostmanCollection } from './parsers/postman-parser';
import { parseOpenAPISpec } from './parsers/openapi-parser';
import { parseCurlCommand } from './parsers/curl-parser';

/**
 * Factory untuk memilih parser yang tepat berdasarkan import type
 */
export function createParser(importType: ImportType): Parser {
  switch (importType) {
    case 'postman':
      return {
        parse: parsePostmanCollection
      };
    case 'openapi':
      return {
        parse: parseOpenAPISpec
      };
    case 'curl':
      return {
        parse: parseCurlCommand
      };
    default:
      throw new Error(`Unsupported import type: ${importType}`);
  }
}

/**
 * Main parsing function - memilih parser otomatis berdasarkan type
 */
export const parseImportContent = async (
  content: string,
  importType: ImportType
): Promise<ImportResult> => {
  try {
    const parser = createParser(importType);
    return await parser.parse(content);
  } catch (error: any) {
    return {
      success: false,
      message: `Parser error for ${importType}: ${error.message}`,
      warnings: [`Tidak bisa membuat parser untuk type: ${importType}`]
    };
  }
};

/**
 * Auto-detect import type dari content
 */
export const detectImportType = (content: string): ImportType => {
  const lowerContent = content.toLowerCase().trim();

  // Coba detect berdasarkan content patterns
  if (lowerContent.includes('openapi') || lowerContent.includes('swagger')) {
    return 'openapi';
  }

  if (lowerContent.includes('info.schema') ||
      lowerContent.includes('"item"') &&
      lowerContent.includes('"request"')) {
    return 'postman';
  }

  if (lowerContent.startsWith('curl') ||
      lowerContent.includes('-x') ||
      lowerContent.includes('-h')) {
    return 'curl';
  }

  // Default ke postman
  return 'postman';
};

/**
 * Parse dengan auto-detection type
 */
export const parseWithAutoDetection = async (
  content: string
): Promise<ImportResult> => {
  const detectedType = detectImportType(content);
  return await parseImportContent(content, detectedType);
};