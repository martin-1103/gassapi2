/**
 * Type definitions untuk testing framework
 * Mendefinisikan tipe data yang digunakan dalam test runner dan assertions
 */

export interface TestResult {
  id?: string
  name: string
  status: 'pass' | 'fail' | 'skip' | 'error'
  message?: string
  duration: number
  error?: Error
  actual?: any
  expected?: any
}

export interface TestContext {
  request: {
    url: string
    method: string
    headers?: Record<string, string>
    body?: any
  }
  response: {
    status?: number
    statusText?: string
    headers?: Record<string, string>
    data?: any
  }
  variables: Map<string, any>
  globals: Map<string, any>
  tests: Map<string, boolean>
  assertions: TestResult[]
  console: ConsoleEntry[]
  environment: Record<string, any>
  results?: TestResult[]
}

export interface ConsoleEntry {
  level: 'log' | 'info' | 'warn' | 'error' | 'debug'
  message: string
  timestamp: number
  source: string
  error?: Error
}