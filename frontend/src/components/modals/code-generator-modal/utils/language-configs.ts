import { safePropertyAccess } from '@/lib/security/object-injection-utils';

export interface LanguageConfig {
  language: string;
  displayName: string;
  framework: string;
  extension: string;
  icon: string;
}

// Konfigurasi bahasa yang didukung
export const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  javascript: {
    language: 'javascript',
    displayName: 'JavaScript',
    framework: 'Node.js',
    extension: 'js',
    icon: 'code',
  },
  python: {
    language: 'python',
    displayName: 'Python',
    framework: 'Python',
    extension: 'py',
    icon: 'terminal',
  },
  bash: {
    language: 'bash',
    displayName: 'cURL',
    framework: 'CLI',
    extension: 'sh',
    icon: 'terminal',
  },
  java: {
    language: 'java',
    displayName: 'Java',
    framework: 'Java',
    extension: 'java',
    icon: 'file-text',
  },
  php: {
    language: 'php',
    displayName: 'PHP',
    framework: 'PHP',
    extension: 'php',
    icon: 'file-text',
  },
  ruby: {
    language: 'ruby',
    displayName: 'Ruby',
    framework: 'Ruby',
    extension: 'rb',
    icon: 'file-text',
  },
  csharp: {
    language: 'csharp',
    displayName: 'C#',
    framework: '.NET',
    extension: 'cs',
    icon: 'file-text',
  },
  powershell: {
    language: 'powershell',
    displayName: 'PowerShell',
    framework: 'PowerShell',
    extension: 'ps1',
    icon: 'terminal',
  },
  go: {
    language: 'go',
    displayName: 'Go',
    framework: 'Go',
    extension: 'go',
    icon: 'code',
  },
};

// Dapatkan ekstensi file untuk bahasa tertentu
export function getFileExtension(language: string): string {
  // Validate language to prevent prototype pollution
  if (
    language === '__proto__' ||
    language === 'constructor' ||
    language === 'prototype'
  ) {
    return 'txt';
  }
  const config = safePropertyAccess(LANGUAGE_CONFIGS, language);
  return config?.extension || 'txt';
}

// Dapatkan konfigurasi bahasa
export function getLanguageConfig(
  language: string,
): LanguageConfig | undefined {
  // Validate language to prevent prototype pollution
  if (
    language === '__proto__' ||
    language === 'constructor' ||
    language === 'prototype'
  ) {
    return undefined;
  }
  return safePropertyAccess(LANGUAGE_CONFIGS, language);
}
