/**
 * Variable Interpolation Engine
 * Support untuk {{variable}} syntax di URL, headers, dan body
 * 
 * Priority order: environment > collection > global
 */

import type { VariableContext, InterpolationResult } from '@/types/http-client'

export class VariableInterpolator {
  private context: VariableContext

  constructor(context: VariableContext = {}) {
    this.context = context
  }

  /**
   * Update context dengan variable baru
   */
  updateContext(context: Partial<VariableContext>): void {
    this.context = { ...this.context, ...context }
  }

  /**
   * Interpolate string yang mengandung {{variable}}
   */
  interpolate(input: string): InterpolationResult {
    const result: InterpolationResult = {
      value: input,
      variables: [],
      errors: [],
    }

    // Regex untuk match {{variable}} atau {{nested.property}}
    const variablePattern = /\{\{([^}]+)\}\}/g
    let match: RegExpExecArray | null

    while ((match = variablePattern.exec(input)) !== null) {
      const fullMatch = match[0]
      const variablePath = match[1].trim()

      try {
        const resolved = this.resolveVariable(variablePath)
        
        if (resolved.found) {
          result.value = result.value.replace(fullMatch, resolved.value)
          result.variables.push({
            name: variablePath,
            value: resolved.value,
            source: resolved.source,
          })
        } else {
          result.errors.push({
            variable: variablePath,
            message: `Variable '${variablePath}' tidak ditemukan`,
          })
          // Keep original {{variable}} kalau ga ketemu
        }
      } catch (error) {
        result.errors.push({
          variable: variablePath,
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return result
  }

  /**
   * Interpolate object (untuk headers, body, etc)
   */
  interpolateObject<T extends Record<string, any>>(obj: T): T {
    const result = { ...obj }

    for (const key in result) {
      const value = result[key]
      
      if (typeof value === 'string') {
        const interpolated = this.interpolate(value)
        result[key] = interpolated.value as any
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = this.interpolateObject(value)
      } else if (Array.isArray(value)) {
        result[key] = value.map((item: any) => 
          typeof item === 'string' ? this.interpolate(item).value : item
        ) as any
      }
    }

    return result
  }

  /**
   * Resolve variable dengan priority: environment > collection > global
   * Support untuk nested properties: user.name, api.endpoints.base
   */
  private resolveVariable(path: string): {
    found: boolean
    value: string
    source: 'environment' | 'collection' | 'global'
  } {
    // Cek environment variables
    if (this.context.environment?.variables) {
      const value = this.getNestedValue(this.context.environment.variables, path)
      if (value !== undefined) {
        return { found: true, value: String(value), source: 'environment' }
      }
    }

    // Cek collection variables
    if (this.context.collection) {
      const value = this.getNestedValue(this.context.collection, path)
      if (value !== undefined) {
        return { found: true, value: String(value), source: 'collection' }
      }
    }

    // Cek global variables
    if (this.context.global) {
      const value = this.getNestedValue(this.context.global, path)
      if (value !== undefined) {
        return { found: true, value: String(value), source: 'global' }
      }
    }

    return { found: false, value: '', source: 'global' }
  }

  /**
   * Get nested value dari object using dot notation
   * Example: getNestedValue({user: {name: 'John'}}, 'user.name') => 'John'
   */
  private getNestedValue(obj: Record<string, any>, path: string): any {
    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return undefined
      }
    }

    return current
  }

  /**
   * Get semua available variables
   */
  getAvailableVariables(): Array<{
    name: string
    value: string
    source: 'environment' | 'collection' | 'global'
  }> {
    const variables: Array<{
      name: string
      value: string
      source: 'environment' | 'collection' | 'global'
    }> = []

    // Global variables
    if (this.context.global) {
      Object.entries(this.context.global).forEach(([key, value]) => {
        variables.push({ name: key, value: String(value), source: 'global' })
      })
    }

    // Collection variables
    if (this.context.collection) {
      Object.entries(this.context.collection).forEach(([key, value]) => {
        variables.push({ name: key, value: String(value), source: 'collection' })
      })
    }

    // Environment variables (highest priority)
    if (this.context.environment?.variables) {
      Object.entries(this.context.environment.variables).forEach(([key, value]) => {
        variables.push({ name: key, value: String(value), source: 'environment' })
      })
    }

    return variables
  }

  /**
   * Validate apakah ada undefined variables dalam string
   */
  validateString(input: string): { valid: boolean; missingVariables: string[] } {
    const result = this.interpolate(input)
    return {
      valid: result.errors.length === 0,
      missingVariables: result.errors.map(e => e.variable),
    }
  }
}

/**
 * Helper function untuk quick interpolation
 */
export function interpolateString(
  input: string,
  context: VariableContext
): string {
  const interpolator = new VariableInterpolator(context)
  return interpolator.interpolate(input).value
}

/**
 * Helper function untuk interpolate object
 */
export function interpolateVariables<T extends Record<string, any>>(
  obj: T,
  context: VariableContext
): T {
  const interpolator = new VariableInterpolator(context)
  return interpolator.interpolateObject(obj)
}
