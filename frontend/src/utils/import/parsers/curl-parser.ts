import { ImportResult } from '../types';

/**
 * Parser untuk cURL commands
 * Mengekstrak method, URL, headers, body, dan options dari command cURL
 */
export const parseCurlCommand = async (content: string): Promise<ImportResult> => {
  try {
    const cleanContent = content.trim();

    // Validasi basic cURL command
    if (!cleanContent.toLowerCase().includes('curl')) {
      throw new Error('Input tidak terlihat seperti command cURL yang valid');
    }

    // Extract method (default GET)
    const methodMatch = cleanContent.match(/-X\s+([A-Z]+)/i);
    const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';

    // Extract URL - handle various quote styles
    const urlMatches = [
      cleanContent.match(/'([^']+?)'/g),
      cleanContent.match(/"([^"]+?)"/g),
      cleanContent.match(/([^\s"']+)/g)
    ];

    let url = '';
    for (const matches of urlMatches) {
      if (matches) {
        for (const match of matches) {
          const candidate = match.replace(/^['"]|['"]$/g, '');
          if (candidate.startsWith('http://') || candidate.startsWith('https://') || candidate.startsWith('ftp://')) {
            url = candidate;
            break;
          }
        }
        if (url) break;
      }
    }

    if (!url) {
      throw new Error('Tidak bisa menemukan URL yang valid dalam command cURL');
    }

    // Extract headers
    const headers: Record<string, string> = {};
    const headerRegex = /-H\s+(['"])([^:]+?):\s*([^'"]*?)\1/g;
    let headerMatch;
    while ((headerMatch = headerRegex.exec(cleanContent)) !== null) {
      const key = headerMatch[2].trim();
      const value = headerMatch[3].trim();
      if (key) {
        headers[key] = value;
      }
    }

    // Extract data/body
    let body = '';
    const dataRegex = /-d\s+(['"])([\s\S]*?)\1(?=\s|$)/g;
    const dataMatch = dataRegex.exec(cleanContent);
    if (dataMatch) {
      body = dataMatch[2];
    }

    // Extract form data
    const formData: Record<string, string> = {};
    const formRegex = /-F\s+(['"])([^=]+?)=([^'"]*?)\1/g;
    let formMatch;
    while ((formMatch = formRegex.exec(cleanContent)) !== null) {
      const key = formMatch[2].trim();
      const value = formMatch[3].trim();
      if (key) {
        formData[key] = value;
      }
    }

    // Extract cookies
    const cookieRegex = /--cookie\s+(['"])([^'"]*?)\1/;
    const cookieMatch = cookieRegex.exec(cleanContent);
    let cookies = '';
    if (cookieMatch) {
      cookies = cookieMatch[2];
      headers['Cookie'] = cookies;
    }

    // Extract user agent
    const userAgentRegex = /-A\s+['"]([^'"]*?)['"]|--user-agent\s+['"]([^'"]*?)['"]/;
    const userAgentMatch = userAgentRegex.exec(cleanContent);
    if (userAgentMatch) {
      headers['User-Agent'] = userAgentMatch[1] || userAgentMatch[2] || '';
    }

    // Extract other useful flags
    const options = {
      verbose: /-v|--verbose/.test(cleanContent),
      silent: /-s|--silent/.test(cleanContent),
      insecure: /-k|--insecure/.test(cleanContent),
      followRedirects: /-L|--location/.test(cleanContent),
      compressed: /--compressed/.test(cleanContent),
      output: /-o\s+(\S+)/.test(cleanContent),
      timeout: /--max-time\s+(\d+)/.test(cleanContent)
    };

    const transformedData = {
      type: 'curl' as const,
      method,
      url,
      headers,
      body: body || (Object.keys(formData).length > 0 ? JSON.stringify(formData) : ''),
      formData: Object.keys(formData).length > 0 ? formData : undefined,
      cookies,
      options,
      rawCommand: cleanContent
    };

    return {
      success: true,
      message: `Berhasil parse cURL command: ${method} ${url}`,
      data: transformedData,
      warnings: [
        ...(Object.keys(formData).length > 0 ? ['FormData detected, converted to JSON body'] : []),
        ...(options.insecure ? ['Menggunakan opsi -k/--insecure (skip SSL verification)'] : []),
        ...(Object.keys(headers).length === 0 ? ['Tidak ada headers yang ditemukan'] : [])
      ]
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Gagal parse cURL command: ${error.message}`,
      warnings: [
        'Pastikan command cURL valid dan mengandung URL',
        'Support options: -X, -H, -d, -F, -A, --cookie, -v, -s, -k, -L'
      ]
    };
  }
};