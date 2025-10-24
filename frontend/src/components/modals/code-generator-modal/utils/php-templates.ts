import { CodeSnippet, RequestData } from './types'
import { formatHeaders } from './code-gen-utils'

export function generatePhpGuzzle(requestData: RequestData): CodeSnippet {
  return {
    language: 'php',
    code: `<?php
$client = new \\GuzzleHttp\\Client(['base_uri' => '${requestData.url}']);

$headers = ${formatHeaders(requestData.headers)};
${requestData.body ? `$body = json_encode(${JSON.stringify(requestData.body)});` : ''}

$options = [
    '${requestData.method.toUpperCase()}'
];

$request = new \\GuzzleHttp\\Psr7\\MessageFactory\\Request('${requestData.method.toUpperCase()}', $headers);
$response = $client->send($request, $options);

echo $response->getBody();
?>`,
    description: 'PHP (Guzzle)',
    framework: 'PHP'
  }
}