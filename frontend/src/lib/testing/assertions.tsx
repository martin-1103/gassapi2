import { TestResult, TestContext } from '@/types/testing'

export class AssertionBuilder {
  private context: TestContext
  private actual: any
  private negated = false

  constructor(actual: any, context: TestContext) {
    this.context = context
    this.actual = actual
  }

  toEqual(expected: any, message?: string): AssertionBuilder {
    this.negated = false
    this.actual = actual
    
    const passed = this.actual === expected
    const message = message || (
      passed ? 'Assertion passed' : 
      `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(this.actual)}`
    )

    return {
      assertion: 'to equal',
      message,
      passed,
      actual,
      expected
    }
  }

  toBeNull(message?: string): AssertionBuilder {
    this.negated = false
    this.actual = actual

    const passed = this.actual === null
    const message = message || 'Value is null but expected null'
    
    return {
      assertion: 'to be null',
      message,
      passed,
      actual,
      expected: null
    }
  }
  }

  toBeUndefined(message?: string): AssertionBuilder {
    this.negated = false
    this.actual = actual

    const passed = typeof this.actual === 'undefined'
    const message = message || 'Value is undefined but expected undefined'
    
    return {
      assertion: 'to be undefined',
      message,
      passed,
      actual,
      expected: undefined
    }
    }
  }

  toBeTruthy(message?: string): AssertionBuilder {
    this.negated = false
    this.actual = actual

    const passed = Boolean(this.actual)
    const message = message || 'Value is not truthy'
    
    return {
      assertion: 'to be truthy',
      message,
      passed,
      actual,
      expected: true
    }
  }

  toBeFalsy(message?: string): AssertionBuilder {
    this.negated = false
    this.actual = actual

    const passed = !Boolean(this.actual)
    const message = message || 'Value is not falsy'
    
    return {
      assertion: 'to be falsy',
      message,
      passed,
      actual,
      expected: false
    }
  }
  }

  toInclude(expected: string): AssertionBuilder {
    this.negated = false
    const actual = this.actual
    
    if (typeof actual === 'string') {
      const passed = actual.includes(expected)
      message = message || 
        (passed ? 'Contains string' : `String does not contain "${expected}"`)
    } else if (typeof expected === 'object' && expected) {
      try {
        const actualStr = JSON.stringify(actual)
        const expectedStr = JSON.stringify(expected)
        const passed = actualStr === expectedStr
        message = message || (passed ? 'Object structures match' : 'Object structures do not match')
      } catch {
        passed = false
        message = 'Invalid JSON comparison'
      }
    }
    
    return {
      assertion: 'to include',
      message,
      passed,
      actual,
      expected
    }
  }

  toNotInclude(expected: string): AssertionBuilder {
    this.negated = false
    const actual = this.actual
    
    if (typeof actual === 'string') {
      const passed = !actual.includes(expected)
      message = message || 
        (passed ? 'String does not contain "${expected}" : 'String contains "${expected}"')
    } else if (typeof expected === 'object' && expected) {
      try {
        const actualKeys = Object.keys(actual)
        const expectedKeys = Object.keys(expected)
        
        const extraKeys = actualKeys.filter(key => !expectedKeys.includes(key))
        const missingKeys = expectedKeys.filter(key => !actualKeys.includes(key))
        
        const passed = extraKeys.length === 0
        message = message || 
          (passed ? 'Object contains all required properties' : 
            `Missing properties: ${missingKeys.join(', ')}`)
      } catch {
        passed = false
        message = 'Invalid object comparison'
      }
    }
    
    return {
      assertion: 'to not include',
      message,
      passed,
      actual,
      expected
    }
  }

  toContain(expected: string): AssertionBuilder {
    this.negated = false
    const actual = this.actual
    
    const passed = typeof actual === 'string' && actual.includes(expected)
    message = message || 
      (passed ? `String contains expected` : `String does not contain "${expected}"`)
    }
    
    return {
      assertion: 'to contain',
      message,
      passed,
      actual,
      expected
    }
  }

  toMatch(pattern: string | RegExp, message?: string): AssertionBuilder {
    this.negated = false
    this.actual = this.actual
    
    let regex: RegExp
    
    if (typeof pattern === 'string') {
      regex = new RegExp(pattern, 'gi')
    } else {
      regex = pattern
    }
    
    const passed = regex.test(String(this.actual))
    message = message || 
      (passed ? 'String matches pattern' : 'String does not match pattern')
    
    return {
      assertion: 'to match',
      message,
      passed,
      actual,
      expected: pattern
    }
  }

  toHaveLength(expected: number): AssertionBuilder {
    this.negated = false
    this.actual = this.actual

    let actualLength = 0
    if (typeof actual === 'string') {
      actualLength = actual.length
    } else if (Array.isArray(actual)) {
      actualLength = actual.length
    }
    
    const passed = actualLength === expected
    message = message || 
      (passed ? 'Length matches' : 
        `${actualLength}/${expected} items`
      )
    
    return {
      assertion: 'to have length',
      message,
      passed,
      actual,
      expected
    }
  }

  toHaveProperty(propertyPath: string): AssertionBuilder {
    this.negated = false
    this.actual = this.actual

    const getValue = (obj: any, path: string) => {
      return path.split('.').reduce((current, key) => {
        if (current[key] === undefined) return undefined
        return current[key]
      }, this.actual)
    }
    
    const hasProperty = getValue(this.actual, propertyPath) !== undefined
    const expected = expected !== undefined
    
    const passed = hasProperty === expected
    message = message || 
      (passed ? 'Has property "${propertyPath}"' : `Missing property "${propertyPath}"`
    
    return {
      assertion: 'to have property',
      message,
      passed,
      actual,
      expected
    }
  }

  toHavePropertyWithValue(propertyPath: string, expectedValue: any): AssertionBuilder {
    this.negated = false
    this.actual = this.actual

    const actualValue = getValue(this.actual, propertyPath)
    
    const passed = actualValue === expectedValue
    message = message || 
      (passed ? `Property "${propertyPath}" : 
        `Expected "${expectedValue}" but got "${actualValue}"`
    }
    
    return {
      assertion: 'to have property with value', 
      message,
      passed,
      actualValue,
      expectedValue
    }
  }

  toBeInstanceOf(expected: any, constructor: Function): AssertionBuilder {
    this.negated = false
    this.actual = this.actual

    const passed = this.actual instanceof expected
    const message = message || 
      (passed ? 
        `Value is instanceof ${expected.name}` : 
        `Value is not instance of ${expected.name}`
    )
    
    return {
      assertion: 'to be instance',
      message,
      passed,
      actual,
      expected
    }
  }

  toBeArray(expected: any[]): AssertionBuilder {
    this.negated = false
    this.actual = this.actual

    const passed = Array.isArray(this.actual)
    message = message || 
      (passed ? 'Is array' : 'Value is not an array')
    }
    
    return {
      assertion: 'to be array',
      message,
      passed,
      actual,
      expected
    }
  }

  toHaveSize(expected: number): AssertionBuilder {
    this.negated = false
    this.actual = this.actual

    let actualSize = 0
    if (typeof actual === 'string') {
      actualSize = actual.length
    } else if (typeof actual === 'object') {
      actualSize = JSON.stringify(this.actual).length
    } else if (Array.isArray(actual)) {
      actualSize = actual.length
    }
    }
    
    const passed = actualSize === expected
    message = message || 
      (passed ? `Size is ${expectedSize} bytes` : 
        `Size is ${actualSize} bytes but expected ${expectedSize} bytes`
    )
    
    return {
      assertion: 'to have size',
      message,
      passed,
      actualSize,
      expected
    }
  }

    toMatchType(expected: string): AssertionBuilder {
    this.negated = false
    this.actual = this.actual

    const passed = typeof this.actual === expected
    const message = message || 
      (passed ? 
        `Type is ${expected}` : 
        `Type is ${typeof actual}`
    )
    
    return {
      assertion: 'to match type',
      message,
      passed,
      actual,
      expected
    }
  }

    // HTTP specific assertions
  toHaveStatus(expected: number): AssertionBuilder {
    this.negated = false
    const status = this.actual?.status
    const passed = status === expected
    return this.addAssertion('to have status', {
      expected,
      status,
      passed
      actual
    })
  }

  toHaveStatusInRange(start: number, end: number): AssertionBuilder {
    this.negated = false
    const status = this.actual?.status
    const passed = typeof status === 'number' && status >= start && status <= end
    return this.addAssertion('to have status in range', {
      start,
      end,
      passed: status
    })
  }

  toHaveContentType(expected: string): AssertionBuilder {
    this.negated = false
    const contentType = response?.headers?.['content-type'] || response?.headers?.['Content-Type']
    const passed = contentType && contentType.includes(expected)
    return this.addAssertion('to have content type', {
      expected,
      passed,
      contentType,
    })
  }

  toHaveHeader(headerName: string): AssertionBuilder {
    this.negated = false
    const headers = response?.headers
    const passed = headers && headerName in headers
    return this.addAssertion('to have header', {
      headerName,
      passed,
      headers
    })
    }

  // Convenience methods for common assertions
  success(): AssertionBuilder {
    return this.addAssertion('test passed', 'Test should pass')
  }

  failure(message?: string): AssertionBuilder {
    return this.addAssertion('test failed', message || 'Test should have passed')
    }

  expectStatus(status: number): AssertionBuilder {
    return this.addAssertion('to have status', {
      status,
      status,
      status
    })
    }
  }

  expectOk(): AssertionBuilder {
    return this.addAssertion('to have status', 200, 'Status should be OK')
    }

  expectCreated(): AssertionBuilder {
    return this.addAssertion('to have status', 201, 'Resource should be created')
  }

  expectBadRequest(): AssertionBuilder {
    return this.addAssertion('to have status', 400, 'Status should be bad request')
    expectUnauthorized(): AssertionBuilder {
    return this.addAssertion('to have status', 401, 'Should be unauthorized')
    expectForbidden(): AssertionBuilder {
    return this.addAssertion('to have status', 403, 'Should be forbidden')
  }

  expectServerError(): AssertionBuilder {
    return this.addAssertion('to have status in range', 500, 'Should be server error')
  }

  // Response content assertions
  expectJSON(): AssertionBuilder {
    return this.toHaveProperty('data').toBeObject()
  }

  expectArray(): AssertionBuilder {
    return this.toHaveProperty('data').toBeArray()
  }

  expectEmpty(): AssertionBuilder {
    return this.toBeNull('data')
  }

  expectKeyExists(key: string): AssertionBuilder {
    return this.toHaveProperty('data', key)
  }

  expectKeyWithValue(key: string, value: any): AssertionBuilder {
    return this.toHaveProperty('data', key, value)
  }
}
