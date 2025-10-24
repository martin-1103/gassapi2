import { generateCurlHeaders } from './code-gen-utils';
import type { CodeSnippet, RequestData } from './types';

export function generateCurl(requestData: RequestData): CodeSnippet {
  const curlHeaders = generateCurlHeaders(requestData.headers);

  let curlCommand = `curl -X ${requestData.method.toUpperCase()} ${curlHeaders}`;

  if (requestData.body) {
    curlCommand += ` -d '${JSON.stringify(requestData.body)}'`;
  }

  curlCommand += ` '${requestData.url}'`;

  return {
    language: 'bash',
    code: curlCommand,
    description: 'cURL command line',
    framework: 'CLI',
  };
}
