// Import all template generators
import { generateCSharp } from './csharp-templates';
import { generateCurl } from './curl-templates';
import { generateGo } from './go-templates';
import { generateJavaOkHttp, generateJavaUnirest } from './java-templates';
import {
  generateJavaScriptFetch,
  generateJavaScriptAxios,
} from './javascript-templates';
import { generatePhpGuzzle } from './php-templates';
import { generatePowerShell } from './powershell-templates';
import {
  generatePythonRequests,
  generatePythonHttpx,
} from './python-templates';
import { generateRuby } from './ruby-templates';
import type { CodeSnippet, RequestData } from './types';

/**
 * TemplateManager - Clean API untuk generate code snippets
 * Template generator untuk berbagai bahasa
 */
export class TemplateManager {
  constructor(private requestData: RequestData) {}

  // Generate all available code snippets
  public generateAllSnippets(): CodeSnippet[] {
    const snippets: CodeSnippet[] = [];

    // JavaScript variants
    snippets.push(generateJavaScriptFetch(this.requestData));
    snippets.push(generateJavaScriptAxios(this.requestData));

    // Python variants
    snippets.push(generatePythonRequests(this.requestData));
    snippets.push(generatePythonHttpx(this.requestData));

    // cURL
    snippets.push(generateCurl(this.requestData));

    // Java variants
    snippets.push(generateJavaOkHttp(this.requestData));
    snippets.push(generateJavaUnirest(this.requestData));

    // Go
    snippets.push(generateGo(this.requestData));

    // PHP
    snippets.push(generatePhpGuzzle(this.requestData));

    // Ruby
    snippets.push(generateRuby(this.requestData));

    // C#
    snippets.push(generateCSharp(this.requestData));

    // PowerShell
    snippets.push(generatePowerShell(this.requestData));

    return snippets;
  }

  // Generate snippets by language
  public generateByLanguage(language: string): CodeSnippet[] {
    const allSnippets = this.generateAllSnippets();
    return allSnippets.filter(snippet => snippet.language === language);
  }

  // Generate specific template variants
  public generateJavaScript(): CodeSnippet[] {
    return [
      generateJavaScriptFetch(this.requestData),
      generateJavaScriptAxios(this.requestData),
    ];
  }

  public generatePython(): CodeSnippet[] {
    return [
      generatePythonRequests(this.requestData),
      generatePythonHttpx(this.requestData),
    ];
  }

  public generateJava(): CodeSnippet[] {
    return [
      generateJavaOkHttp(this.requestData),
      generateJavaUnirest(this.requestData),
    ];
  }

  public generateCurl(): CodeSnippet {
    return generateCurl(this.requestData);
  }

  public generateGo(): CodeSnippet {
    return generateGo(this.requestData);
  }

  public generatePhp(): CodeSnippet {
    return generatePhpGuzzle(this.requestData);
  }

  public generateRuby(): CodeSnippet {
    return generateRuby(this.requestData);
  }

  public generateCSharp(): CodeSnippet {
    return generateCSharp(this.requestData);
  }

  public generatePowerShell(): CodeSnippet {
    return generatePowerShell(this.requestData);
  }
}

// Helper function untuk backward compatibility
export function generateCodeSnippets(requestData: RequestData): CodeSnippet[] {
  const manager = new TemplateManager(requestData);
  return manager.generateAllSnippets();
}
