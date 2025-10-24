import { TestContext, ConsoleEntry } from './types'
import { AssertionBuilder } from './assertion-builder'

/**
 * Test Sandbox Engine
 * Menyediakan isolated execution environment untuk test scripts
 */
export class TestSandbox {
  /**
   * Create sandboxed environment dengan Postman-like API
   */
  createSandbox(context: TestContext): any {
    // Built-in API helpers
    const pm = {
      request: {
        url: context.request.url,
        method: context.request.method,
        headers: context.request.headers || {},
        body: context.request.body
      },
      response: {
        status: context.response.status || 200,
        statusText: context.response.statusText || 'OK',
        headers: context.response.headers || {},
        data: context.response.data
      },
      environment: context.environment,
      variables: {
        get: (key: string) => {
          const value = context.variables.get(key)
          return value !== undefined ? value : ''
        },
        set: (key: string, value: string) => {
          context.variables.set(key, value)
        },
        unset: (key: string) => {
          context.variables.delete(key)
        },
        clear: () => {
          context.variables.clear()
        }
      },
      globals: {
        get: (key: string) => {
          const value = context.globals.get(key)
          return value !== undefined ? value : ''
        },
        set: (key: string, value: string) => {
          context.globals.set(key, value)
        },
        clear: () => {
          context.globals.clear()
        }
      },
      tests: {
        test: (name: string, fn: () => void | Promise<void>) => {
          try {
            const result = fn()
            context.tests.set(name, true)
          } catch (error) {
            context.tests.set(name, false)
            console.log(`Test "${name}" failed: ${error.message}`)
          }
        }
      },
      expect: (actual: any) => new AssertionBuilder(actual, context.assertions),
      console: this.createConsoleProxy(context),
      // Additional Postman-like utilities
      _ : context.environment, // shortcut for environment variables
      responseJSON: context.response.data,
      responseBody: typeof context.response.data === 'string'
        ? context.response.data
        : JSON.stringify(context.response.data),
      responseHeaders: context.response.headers || {},
      responseCode: {
        code: context.response.status || 200,
        name: context.response.statusText || 'OK',
        detail: ''
      },
      requestJSON: context.request.body,
      requestBody: typeof context.request.body === 'string'
        ? context.request.body
        : JSON.stringify(context.request.body),
      requestHeaders: context.request.headers || {},
      requestMethod: context.request.method,
      requestUrl: context.request.url
    }

    return pm
  }

  /**
   * Create console proxy untuk logging dalam sandbox
   */
  private createConsoleProxy(context: TestContext): any {
    return {
      log: (...args: any[]) => {
        const message = args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')
        context.console.push({
          level: 'log',
          message,
          timestamp: Date.now(),
          source: 'test-script'
        })
      },
      info: (...args: any[]) => {
        const message = args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')
        context.console.push({
          level: 'info',
          message,
          timestamp: Date.now(),
          source: 'test-script'
        })
      },
      warn: (...args: any[]) => {
        const message = args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')
        context.console.push({
          level: 'warn',
          message,
          timestamp: Date.now(),
          source: 'test-script'
        })
      },
      error: (...args: any[]) => {
        const message = args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')
        context.console.push({
          level: 'error',
          message,
          timestamp: Date.now(),
          source: 'test-script'
        })
      },
      debug: (...args: any[]) => {
        const message = args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')
        context.console.push({
          level: 'debug',
          message,
          timestamp: Date.now(),
          source: 'test-script'
        })
      }
    }
  }

  /**
   * Execute script dalam sandboxed environment
   * Note: Saat ini menggunakan eval, akan diganti dengan proper sandboxing
   */
  async runInSandbox(script: string, sandbox: any): Promise<any> {
    try {
      // Wrap script dengan proper error handling
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor

      // Extract sandbox globals untuk function parameters
      const sandboxGlobals = Object.keys(sandbox)
      const sandboxValues = sandboxGlobals.map(key => sandbox[key])

      // Create dan execute async function
      const fn = new AsyncFunction(...sandboxGlobals, script)
      return await fn(...sandboxValues)
    } catch (error) {
      // Enhanced error reporting
      const enhancedError = new Error(`Sandbox execution failed: ${error.message}`)
      enhancedError.stack = error.stack
      throw enhancedError
    }
  }

  /**
   * Create secure sandbox dengan timeout
   */
  async runInSecureSandbox(
    script: string,
    sandbox: any,
    timeout: number = 5000
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Script execution timeout (${timeout}ms)`))
      }, timeout)

      this.runInSandbox(script, sandbox)
        .then(result => {
          clearTimeout(timer)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timer)
          reject(error)
        })
    })
  }

  /**
   * Validate script syntax sebelum execution
   */
  validateScript(script: string): { valid: boolean; error?: string } {
    try {
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
      new AsyncFunction(script)
      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: `Script syntax error: ${error.message}`
      }
    }
  }

  /**
   * Create context dengan default values
   */
  createDefaultContext(): Partial<TestContext> {
    return {
      request: {
        url: '',
        method: 'GET',
        headers: {},
        body: undefined
      },
      response: {
        status: 200,
        statusText: 'OK',
        headers: {},
        data: null
      },
      variables: new Map(),
      globals: new Map(),
      tests: new Map(),
      assertions: [],
      console: [],
      environment: {}
    }
  }
}