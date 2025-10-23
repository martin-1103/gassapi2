/**
 * Direct HTTP Client
 * Kirim request langsung ke target API tanpa melalui backend proxy
 * 
 * Features:
 * - Support semua HTTP methods
 * - Variable interpolation
 * - Request/response timing
 * - File upload
 * - Cookie handling
 * - CORS handling untuk web/electron
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios'
import { corsHandler } from './cors-handler'
import { VariableInterpolator } from '../variables/variable-interpolator'
import type {
  HttpRequestConfig,
  HttpResponseData,
  HttpError,
  HttpHeader,
  HttpQueryParam,
  VariableContext,
} from '@/types/http-client'

export class DirectApiClient {
  private axiosInstance: AxiosInstance
  private interpolator: VariableInterpolator

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000,
      validateStatus: () => true, // Accept semua status code, jangan throw error
    })

    this.interpolator = new VariableInterpolator()

    // Setup interceptors untuk timing
    this.setupInterceptors()
  }

  /**
   * Setup axios interceptors untuk timing dan logging
   */
  private setupInterceptors(): void {
    // Request interceptor - add timing
    this.axiosInstance.interceptors.request.use(
      (config: any) => {
        config.metadata = { startTime: Date.now() }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor - calculate duration
    this.axiosInstance.interceptors.response.use(
      (response: any) => {
        const endTime = Date.now()
        const startTime = response.config.metadata?.startTime || endTime
        response.duration = endTime - startTime
        return response
      },
      (error: any) => {
        const endTime = Date.now()
        const startTime = error.config?.metadata?.startTime || endTime
        error.duration = endTime - startTime
        return Promise.reject(error)
      }
    )
  }

  /**
   * Update variable context untuk interpolation
   */
  setVariableContext(context: VariableContext): void {
    this.interpolator.updateContext(context)
  }

  /**
   * Send HTTP request dengan full configuration
   */
  async sendRequest(config: HttpRequestConfig): Promise<HttpResponseData> {
    const startTime = Date.now()

    try {
      // Interpolate URL
      const interpolatedUrl = this.interpolator.interpolate(config.url).value
      
      // Transform URL untuk CORS handling
      const finalUrl = corsHandler.transformUrl(interpolatedUrl)

      // Build headers
      const headers = this.buildHeaders(config.headers)

      // Build query params
      const params = this.buildQueryParams(config.queryParams)

      // Build request body
      const requestBody = await this.buildRequestBody(config.body, headers)

      // Build axios config
      const axiosConfig: AxiosRequestConfig = {
        url: finalUrl,
        method: config.method,
        headers,
        params,
        data: requestBody,
        timeout: config.timeout || 30000,
        maxRedirects: config.followRedirects ? 5 : 0,
        validateStatus: () => true,
      }

      // Add proxy kalau ada
      if (config.proxyUrl) {
        const proxyUrl = new URL(config.proxyUrl)
        axiosConfig.proxy = {
          host: proxyUrl.hostname,
          port: parseInt(proxyUrl.port) || 80,
          protocol: proxyUrl.protocol,
        }
      }

      // Send request
      const response = await this.axiosInstance.request(axiosConfig)
      const endTime = Date.now()

      // Build response data
      return this.buildResponse(response, endTime - startTime)

    } catch (error) {
      const endTime = Date.now()
      throw this.buildError(error, endTime - startTime)
    }
  }

  /**
   * Build headers dari config
   */
  private buildHeaders(headers?: HttpHeader[]): Record<string, string> {
    if (!headers || headers.length === 0) {
      return {}
    }

    const result: Record<string, string> = {}

    headers
      .filter(h => h.enabled)
      .forEach(header => {
        const interpolated = this.interpolator.interpolate(header.value).value
        result[header.key] = interpolated
      })

    return result
  }

  /**
   * Build query params dari config
   */
  private buildQueryParams(params?: HttpQueryParam[]): Record<string, string> {
    if (!params || params.length === 0) {
      return {}
    }

    const result: Record<string, string> = {}

    params
      .filter(p => p.enabled)
      .forEach(param => {
        const interpolated = this.interpolator.interpolate(param.value).value
        result[param.key] = interpolated
      })

    return result
  }

  /**
   * Build request body berdasarkan type
   */
  private async buildRequestBody(
    body: HttpRequestConfig['body'],
    headers: Record<string, string>
  ): Promise<any> {
    if (!body || body.type === 'none') {
      return undefined
    }

    switch (body.type) {
      case 'json':
        headers['Content-Type'] = 'application/json'
        return body.json

      case 'raw':
        if (!headers['Content-Type']) {
          headers['Content-Type'] = 'text/plain'
        }
        return this.interpolator.interpolate(body.raw || '').value

      case 'x-www-form-urlencoded':
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
        const urlEncodedData = new URLSearchParams()
        body.urlEncoded?.filter(f => f.enabled).forEach(field => {
          const value = this.interpolator.interpolate(field.value).value
          urlEncodedData.append(field.key, value)
        })
        return urlEncodedData

      case 'form-data':
        headers['Content-Type'] = 'multipart/form-data'
        const formData = new FormData()
        body.formData?.filter(f => f.enabled).forEach(field => {
          if (field.type === 'file' && field.value instanceof File) {
            formData.append(field.key, field.value)
          } else {
            const value = this.interpolator.interpolate(String(field.value)).value
            formData.append(field.key, value)
          }
        })
        return formData

      case 'binary':
        if (body.binary instanceof File) {
          headers['Content-Type'] = body.binary.type || 'application/octet-stream'
          return body.binary
        }
        return undefined

      default:
        return undefined
    }
  }

  /**
   * Build response object dari axios response
   */
  private buildResponse(response: any, duration: number): HttpResponseData {
    // Calculate response size
    const responseSize = this.calculateResponseSize(response)

    // Extract cookies
    const cookies = this.extractCookies(response.headers)

    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      time: duration,
      size: responseSize,
      cookies,
    }
  }

  /**
   * Calculate response size dalam bytes
   */
  private calculateResponseSize(response: any): number {
    try {
      if (response.headers['content-length']) {
        return parseInt(response.headers['content-length'])
      }
      
      // Estimate dari data
      const dataStr = JSON.stringify(response.data)
      return new Blob([dataStr]).size
    } catch {
      return 0
    }
  }

  /**
   * Extract cookies dari response headers
   */
  private extractCookies(headers: Record<string, string>): Array<{
    name: string
    value: string
    domain?: string
    path?: string
  }> {
    const setCookieHeader = headers['set-cookie']
    if (!setCookieHeader) return []

    const cookies: Array<{
      name: string
      value: string
      domain?: string
      path?: string
    }> = []

    // Parse Set-Cookie header
    const cookieStrings = Array.isArray(setCookieHeader) 
      ? setCookieHeader 
      : [setCookieHeader]

    cookieStrings.forEach(cookieStr => {
      const parts = cookieStr.split(';')
      const [nameValue] = parts
      const [name, value] = nameValue.split('=')

      const cookie: any = { name: name.trim(), value: value.trim() }

      // Parse attributes
      parts.slice(1).forEach((part: string) => {
        const [key, val] = part.trim().split('=')
        if (key.toLowerCase() === 'domain') {
          cookie.domain = val
        } else if (key.toLowerCase() === 'path') {
          cookie.path = val
        }
      })

      cookies.push(cookie)
    })

    return cookies
  }

  /**
   * Build error object dari axios error
   */
  private buildError(error: any, _duration: number): HttpError {
    // Check kalau CORS error
    if (corsHandler.isCorsError(error)) {
      const axiosError = error as AxiosError
      const url = axiosError.config?.url || ''
      const corsMessage = corsHandler.getCorsErrorMessage(url)

      return {
        type: 'cors',
        message: `${corsMessage.title}: ${corsMessage.message}`,
        originalError: error,
      }
    }

    // Check kalau timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        type: 'timeout',
        message: 'Request timeout. Server tidak merespon dalam waktu yang ditentukan.',
        originalError: error,
      }
    }

    // Check kalau network error
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message?.includes('Network'))) {
      return {
        type: 'network',
        message: 'Network error. Pastikan koneksi internet dan server target berjalan.',
        originalError: error,
      }
    }

    // Check kalau SSL error
    if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || 
        error.message?.includes('certificate') ||
        error.message?.includes('SSL')) {
      return {
        type: 'ssl',
        message: 'SSL certificate error. Server menggunakan sertifikat yang tidak valid.',
        originalError: error,
      }
    }

    // Generic error dengan response
    if (error.response) {
      return {
        type: 'unknown',
        message: error.message || 'Request failed',
        originalError: error,
        response: {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        },
      }
    }

    // Unknown error
    return {
      type: 'unknown',
      message: error.message || 'Unknown error occurred',
      originalError: error,
    }
  }

  /**
   * Quick helper method untuk testing endpoint
   */
  async quickRequest(
    method: HttpRequestConfig['method'],
    url: string,
    options?: {
      headers?: Record<string, string>
      body?: any
      timeout?: number
    }
  ): Promise<HttpResponseData> {
    const config: HttpRequestConfig = {
      method,
      url,
      headers: options?.headers 
        ? Object.entries(options.headers).map(([key, value]) => ({
            key,
            value,
            enabled: true,
          }))
        : [],
      body: options?.body 
        ? {
            type: 'json',
            json: options.body,
          }
        : undefined,
      timeout: options?.timeout,
    }

    return this.sendRequest(config)
  }
}

// Singleton instance
export const directApiClient = new DirectApiClient()
