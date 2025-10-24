import { LANGUAGE_CONFIGS } from './language-configs'

export interface RequestData {
  method: string
  url: string
  headers: Record<string, string>
  body?: any
}

export interface CodeSnippet {
  language: string
  code: string
  description: string
  framework?: string
}

// Template generator untuk berbagai bahasa
export class CodeTemplateGenerator {
  constructor(private requestData: RequestData) {}

  // Generate JavaScript (Node.js / Fetch)
  private generateJavaScriptFetch(): CodeSnippet {
    return {
      language: 'javascript',
      code: `const response = await fetch('${this.requestData.url}', {
  method: '${this.requestData.method}',
  headers: ${JSON.stringify(this.requestData.headers, null, 2)},
  ${this.requestData.body ? `body: JSON.stringify(${JSON.stringify(this.requestData.body)}, null, 2),` : ''}
});

const data = await response.json();
console.log(data);`,
      description: 'JavaScript (Node.js with fetch API)',
      framework: 'Node.js'
    }
  }

  // Generate JavaScript (Axios)
  private generateJavaScriptAxios(): CodeSnippet {
    return {
      language: 'javascript',
      code: `const axios = require('axios');

const response = await axios({
  method: '${this.requestData.method}',
  url: '${this.requestData.url}',
  headers: ${JSON.stringify(this.requestData.headers, null, 2)},
  ${this.requestData.body ? `data: ${JSON.stringify(this.requestData.body)}` : ''}
});

console.log(response.data);`,
      description: 'JavaScript (Axios)',
      framework: 'Node.js'
    }
  }

  // Generate Python (Requests)
  private generatePythonRequests(): CodeSnippet {
    return {
      language: 'python',
      code: `import requests

response = requests.${this.requestData.method.toLowerCase()}(
  '${this.requestData.url}',
  headers=${JSON.stringify(this.requestData.headers, null, 2)},
  json=${this.requestData.body ? JSON.stringify(this.requestData.body) : 'None'}
)

print(response.json())`,
      description: 'Python (Requests library)',
      framework: 'Python'
    }
  }

  // Generate Python (httpx)
  private generatePythonHttpx(): CodeSnippet {
    return {
      language: 'python',
      code: `import httpx

response = httpx.${this.requestData.method.toLowerCase()}(
  '${this.requestData.url}',
  headers=${JSON.stringify(this.requestData.headers, null, 2)},
  ${this.requestData.body ? `json=${JSON.stringify(this.requestData.body)}` : ''}
)

print(response.json())`,
      description: 'Python (httpx library)',
      framework: 'Python'
    }
  }

  // Generate cURL command
  private generateCurl(): CodeSnippet {
    const curlHeaders = Object.entries(this.requestData.headers)
      .map(([key, value]) => `-H "${key}: ${value}"`)
      .join(' ')

    let curlCommand = `curl -X ${this.requestData.method.toUpperCase()} ${curlHeaders}`

    if (this.requestData.body) {
      curlCommand += ` -d '${JSON.stringify(this.requestData.body)}'`
    }

    curlCommand += ` '${this.requestData.url}'`

    return {
      language: 'bash',
      code: curlCommand,
      description: 'cURL command line',
      framework: 'CLI'
    }
  }

  // Generate Java (OkHttp)
  private generateJavaOkHttp(): CodeSnippet {
    return {
      language: 'java',
      code: `import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;

public class ApiClient {
    public static void main(String[] args) throws Exception {
        String url = "${this.requestData.url}";
        String jsonBody = ${this.requestData.body ? `"${JSON.stringify(this.requestData.body).replace(/"/g, '\\"')}"` : ""};

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .method(HttpMethod.${this.requestData.method.toUpperCase()})
            .header("Content-Type", "application/json")
            ${Object.entries(this.requestData.headers).map(([key, value]) => `.header("${key}", "${value}")`).join("\n            ")}
            ${this.requestData.body ? `.POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))` : ''}
            .build();

        HttpResponse<String> response = client.send(request);
        System.out.println(response.body());
    }
}`,
      description: 'Java (OkHttp)',
      framework: 'Java'
    }
  }

  // Generate Java (Unirest)
  private generateJavaUnirest(): CodeSnippet {
    return {
      language: 'java',
      code: `import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;

public class ApiClient {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static void main(String[] args) throws Exception {
        String url = "${this.requestData.url}";
        String jsonBody = ${this.requestData.body ? `"${JSON.stringify(this.requestData.body).replace(/"/g, '\\"')}"` : ""};

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .method(HttpMethod.${this.requestData.method.toUpperCase()})
            .header("Content-Type", "application/json")
            ${Object.entries(this.requestData.headers).map(([key, value]) => `.header("${key}", "${value}")`).join("\n            ")}
            .${this.requestData.body ? `.POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))` : ''}
            .build();

        HttpResponse<String> response = client.send(request);

        // Parse and print JSON response
        Object jsonResponse = mapper.readValue(response.body(), Object.class);
        System.out.println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonResponse));
    }
}`,
      description: 'Java (Unirest with Jackson)',
      framework: 'Java'
    }
  }

  // Generate Go
  private generateGo(): CodeSnippet {
    return {
      language: 'go',
      code: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "${this.requestData.url}"
    jsonBody := []byte(${this.requestData.body ? `"${JSON.stringify(this.requestData.body).replace(/"/g, '\\"')}"` : ""})

    req, err := http.NewRequest("${this.requestData.method.toUpperCase()}", url, bytes.NewBuffer(jsonBody))
    if err != nil {
        panic(err)
    }

    ${Object.entries(this.requestData.headers).map(([key, value]) => `req.Header.Set("${key}", "${value}")`).join("\n    ")}

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}`,
      description: 'Go (net/http)',
      framework: 'Go'
    }
  }

  // Generate PHP (Guzzle)
  private generatePhpGuzzle(): CodeSnippet {
    return {
      language: 'php',
      code: `<?php
$client = new \\GuzzleHttp\\Client(['base_uri' => '${this.requestData.url}']);

$headers = ${JSON.stringify(this.requestData.headers, null, 2)};
${this.requestData.body ? `$body = json_encode(${JSON.stringify(this.requestData.body)});` : ''}

$options = [
    '${this.requestData.method.toUpperCase()}'
];

$request = new \\GuzzleHttp\\Psr7\\MessageFactory\\Request('${this.requestData.method.toUpperCase()}', $headers);
$response = $client->send($request, $options);

echo $response->getBody();
?>`,
      description: 'PHP (Guzzle)',
      framework: 'PHP'
    }
  }

  // Generate Ruby
  private generateRuby(): CodeSnippet {
    return {
      language: 'ruby',
      code: `require 'net/http'
require 'uri'
require 'json'

uri = URI('${this.requestData.url}')
headers = ${JSON.stringify(this.requestData.headers, null, 2)}

request = Net::HTTP::${this.requestData.method.capitalize()}.new(uri, headers)
${this.requestData.body ? `request.body = JSON.generate(${JSON.stringify(this.requestData.body)})` : ''}

response = Net::HTTP.start(uri, request)
body = response.body

puts JSON.parse(body)`,
      description: 'Ruby (Net::HTTP)',
      framework: 'Ruby'
    }
  }

  // Generate C#
  private generateCSharp(): CodeSnippet {
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
        var jsonBody = ${this.requestData.body ? `"${JSON.stringify(this.requestData.body).replace(/"/g, '\\"')}"` : ""};

        var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

        var request = new HttpRequestMessage(
            HttpMethod.${this.requestData.method},
            "${this.requestData.url}",
            content,
            headers: ${JSON.stringify(this.requestData.headers, null, 2)}
        );

        var response = await client.SendAsync(request);
        var responseText = await response.Content.ReadAsStringAsync();

        Console.WriteLine(responseText);
    }
}`,
      description: 'C# (HttpClient)',
      framework: '.NET'
    }
  }

  // Generate PowerShell
  private generatePowerShell(): CodeSnippet {
    return {
      language: 'powershell',
      code: `$headers = @{${Object.entries(this.requestData.headers).map(([key, value]) => `'${key}' = '${value}'`).join("; ")}}
$body = ${this.requestData.body ? `${JSON.stringify(this.requestData.body)}` : "$null"}

try {
    $response = Invoke-RestMethod -Uri "${this.requestData.url}" -Method ${this.requestData.method.toUpperCase()} -Headers $headers -Body $body -UseBasicParsing $false
    $response | ConvertTo-Json
} catch {
    Write-Error "Request failed: $_"
}`,
      description: 'PowerShell (Invoke-RestMethod)',
      framework: 'PowerShell'
    }
  }

  // Generate all code snippets
  public generateAllSnippets(): CodeSnippet[] {
    const snippets: CodeSnippet[] = []

    // JavaScript variants
    snippets.push(this.generateJavaScriptFetch())
    snippets.push(this.generateJavaScriptAxios())

    // Python variants
    snippets.push(this.generatePythonRequests())
    snippets.push(this.generatePythonHttpx())

    // cURL
    snippets.push(this.generateCurl())

    // Java variants
    snippets.push(this.generateJavaOkHttp())
    snippets.push(this.generateJavaUnirest())

    // Go
    snippets.push(this.generateGo())

    // PHP
    snippets.push(this.generatePhpGuzzle())

    // Ruby
    snippets.push(this.generateRuby())

    // C#
    snippets.push(this.generateCSharp())

    // PowerShell
    snippets.push(this.generatePowerShell())

    return snippets
  }
}

// Fungsi helper untuk generate code snippets
export function generateCodeSnippets(requestData: RequestData): CodeSnippet[] {
  const generator = new CodeTemplateGenerator(requestData)
  return generator.generateAllSnippets()
}