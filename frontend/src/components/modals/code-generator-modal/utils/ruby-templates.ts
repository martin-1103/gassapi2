import { CodeSnippet, RequestData } from './types'
import { formatHeaders } from './code-gen-utils'

export function generateRuby(requestData: RequestData): CodeSnippet {
  return {
    language: 'ruby',
    code: `require 'net/http'
require 'uri'
require 'json'

uri = URI('${requestData.url}')
headers = ${formatHeaders(requestData.headers)}

request = Net::HTTP::${requestData.method.charAt(0).toUpperCase() + requestData.method.slice(1)}.new(uri, headers)
${requestData.body ? `request.body = JSON.generate(${JSON.stringify(requestData.body)})` : ''}

response = Net::HTTP.start(uri, request)
body = response.body

puts JSON.parse(body)`,
    description: 'Ruby (Net::HTTP)',
    framework: 'Ruby'
  }
}