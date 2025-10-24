import { formatHeaders } from './code-gen-utils';
import type { CodeSnippet, RequestData } from './types';

export function generateJavaScriptFetch(requestData: RequestData): CodeSnippet {
  return {
    language: 'javascript',
    code: `const response = await fetch('${requestData.url}', {
  method: '${requestData.method}',
  headers: ${formatHeaders(requestData.headers)},
  ${requestData.body ? `body: JSON.stringify(${JSON.stringify(requestData.body)}, null, 2),` : ''}
});

const data = await response.json();
console.log(data);`,
    description: 'JavaScript (Node.js with fetch API)',
    framework: 'Node.js',
  };
}

export function generateJavaScriptAxios(requestData: RequestData): CodeSnippet {
  return {
    language: 'javascript',
    code: `const axios = require('axios');

const response = await axios({
  method: '${requestData.method}',
  url: '${requestData.url}',
  headers: ${formatHeaders(requestData.headers)},
  ${requestData.body ? `data: ${JSON.stringify(requestData.body)}` : ''}
});

console.log(response.data);`,
    description: 'JavaScript (Axios)',
    framework: 'Node.js',
  };
}
