import { escapeJsonString, formatHeaders } from './code-gen-utils';
import type { CodeSnippet, RequestData } from './types';

export function generateCSharp(requestData: RequestData): CodeSnippet {
  return {
    language: 'csharp',
    code: `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        using var client = new HttpClient();
        var jsonBody = ${requestData.body ? `"${escapeJsonString(requestData.body)}"` : ''};

        var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

        var request = new HttpRequestMessage(
            HttpMethod.${requestData.method},
            "${requestData.url}",
            content,
            headers: ${formatHeaders(requestData.headers)}
        );

        var response = await client.SendAsync(request);
        var responseText = await response.Content.ReadAsStringAsync();

        Console.WriteLine(responseText);
    }
}`,
    description: 'C# (HttpClient)',
    framework: '.NET',
  };
}
