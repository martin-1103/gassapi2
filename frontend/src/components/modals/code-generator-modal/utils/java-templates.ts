import { escapeJsonString, formatHeadersForCode } from './code-gen-utils';
import type { CodeSnippet, RequestData } from './types';

export function generateJavaOkHttp(requestData: RequestData): CodeSnippet {
  return {
    language: 'java',
    code: `import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;

public class ApiClient {
    public static void main(String[] args) throws Exception {
        String url = "${requestData.url}";
        String jsonBody = ${requestData.body ? `"${escapeJsonString(requestData.body)}"` : ''};

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .method(HttpMethod.${requestData.method.toUpperCase()})
            .header("Content-Type", "application/json")
            ${formatHeadersForCode(requestData.headers, '            ')}
            ${requestData.body ? `.POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))` : ''}
            .build();

        HttpResponse<String> response = client.send(request);
        System.out.println(response.body());
    }
}`,
    description: 'Java (OkHttp)',
    framework: 'Java',
  };
}

export function generateJavaUnirest(requestData: RequestData): CodeSnippet {
  return {
    language: 'java',
    code: `import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;

public class ApiClient {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static void main(String[] args) throws Exception {
        String url = "${requestData.url}";
        String jsonBody = ${requestData.body ? `"${escapeJsonString(requestData.body)}"` : ''};

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .method(HttpMethod.${requestData.method.toUpperCase()})
            .header("Content-Type", "application/json")
            ${formatHeadersForCode(requestData.headers, '            ')}
            .${requestData.body ? `POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))` : ''}
            .build();

        HttpResponse<String> response = client.send(request);

        // Parse and print JSON response
        Object jsonResponse = mapper.readValue(response.body(), Object.class);
        System.out.println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonResponse));
    }
}`,
    description: 'Java (Unirest with Jackson)',
    framework: 'Java',
  };
}
