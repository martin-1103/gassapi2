import { TestContext, ConsoleEntry, TestResult } from './types'
import { TestSandbox } from './test-sandbox'

/**
 * Script Executor
 * Menangani execution coordination untuk pre/post request scripts
 */
export class ScriptExecutor {
  private testSandbox: TestSandbox

  constructor(testSandbox?: TestSandbox) {
    this.testSandbox = testSandbox || new TestSandbox()
  }

  /**
   * Execute pre-request script dengan proper error handling
   */
  async executePreRequest(
    script: string,
    context: TestContext
  ): Promise<{ success: boolean; error?: Error }> {
    try {
      await this.executeScript(script, context)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error as Error
      }
    }
  }

  /**
   * Execute post-response script untuk testing
   */
  async executePostResponse(
    script: string,
    context: TestContext,
    timeout: number = 5000
  ): Promise<{ success: boolean; error?: Error; duration?: number }> {
    const startTime = Date.now()

    try {
      await this.executeScriptWithTimeout(script, context, timeout)
      const endTime = Date.now()

      return {
        success: true,
        duration: endTime - startTime
      }
    } catch (error) {
      const endTime = Date.now()

      return {
        success: false,
        error: error as Error,
        duration: endTime - startTime
      }
    }
  }

  /**
   * Execute multiple scripts dalam sequence
   */
  async executeScriptSequence(
    scripts: Array<{ id: string; name: string; script: string; enabled: boolean }>,
    context: TestContext
  ): Promise<Array<{ id: string; success: boolean; error?: Error; duration?: number }>> {
    const results = []

    for (const script of scripts) {
      if (!script.enabled) {
        results.push({
          id: script.id,
          success: true, // Skip = success for sequence purposes
          duration: 0
        })
        continue
      }

      const result = await this.executePostResponse(script.script, context)
      results.push({
        id: script.id,
        ...result
      })

      // Stop sequence on first failure
      if (!result.success) {
        break
      }
    }

    return results
  }

  /**
   * Execute script dengan timeout protection
   */
  private async executeScriptWithTimeout(
    script: string,
    context: TestContext,
    timeout: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Script execution timeout (${timeout}ms)`))
      }, timeout)

      this.executeScript(script, context)
        .then(() => {
          clearTimeout(timer)
          resolve()
        })
        .catch((error) => {
          clearTimeout(timer)
          reject(error)
        })
    })
  }

  /**
   * Core script execution logic
   */
  private async executeScript(script: string, context: TestContext): Promise<void> {
    try {
      // Execute script in sandbox
      await this.testSandbox.runInSandbox(
        script,
        this.testSandbox.createSandbox(context)
      )
    } catch (error) {
      // Handle script errors dengan enhanced context
      context.console.push({
        level: 'error',
        message: `Script execution failed: ${(error as Error).message}`,
        timestamp: Date.now(),
        source: 'script-executor',
        error: error as Error
      })
      throw error
    }
  }

  /**
   * Validate script syntax sebelum execution
   */
  validateScript(script: string): { valid: boolean; error?: string } {
    try {
      // Basic syntax validation
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
      new AsyncFunction(script)
      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: `Script syntax error: ${(error as Error).message}`
      }
    }
  }

  /**
   * Extract console logs dari context
   */
  extractConsoleLogs(context: TestContext): ConsoleEntry[] {
    return [...context.console]
  }

  /**
   * Clear console logs dari context
   */
  clearConsoleLogs(context: TestContext): void {
    context.console = []
  }

  /**
   * Setup script execution environment variables
   */
  setupEnvironment(context: TestContext, env: Record<string, any>): void {
    context.environment = { ...context.environment, ...env }
  }

  /**
   * Get execution summary
   */
  getExecutionSummary(context: TestContext): {
    testsRun: number
    testsPassed: number
    assertionsCount: number
    consoleEntries: number
    variablesCount: number
    globalsCount: number
  } {
    const testsPassed = Array.from(context.tests.values())
      .filter(passed => passed).length

    return {
      testsRun: context.tests.size,
      testsPassed,
      assertionsCount: context.assertions.length,
      consoleEntries: context.console.length,
      variablesCount: context.variables.size,
      globalsCount: context.globals.size
    }
  }
}