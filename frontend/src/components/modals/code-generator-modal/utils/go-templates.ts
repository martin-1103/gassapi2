import { escapeJsonString, formatHeadersForCode } from './code-gen-utils';
import type { CodeSnippet, RequestData } from './types';

export function generateGo(requestData: RequestData): CodeSnippet {
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
    url := "${requestData.url}"
    jsonBody := []byte(${requestData.body ? `"${escapeJsonString(requestData.body)}"` : ''})

    req, err := http.NewRequest("${requestData.method.toUpperCase()}", url, bytes.NewBuffer(jsonBody))
    if err != nil {
        panic(err)
    }

    ${formatHeadersForCode(requestData.headers, '    ')}

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
    framework: 'Go',
  };
}
