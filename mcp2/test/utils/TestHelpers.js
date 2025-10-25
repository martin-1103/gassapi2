/**
 * Test Helpers
 * Common functions for testing (assertions, data generators, validators)
 */

/**
 * Assertion helpers
 */
class Assert {
  static isTrue(condition, message = 'Expected true') {
    if (!condition) {
      throw new Error(message);
    }
  }

  static isFalse(condition, message = 'Expected false') {
    if (condition) {
      throw new Error(message);
    }
  }

  static equals(actual, expected, message) {
    if (actual !== expected) {
      const msg = message || `Expected ${expected}, but got ${actual}`;
      throw new Error(msg);
    }
  }

  static notEquals(actual, unexpected, message) {
    if (actual === unexpected) {
      const msg = message || `Expected not ${unexpected}, but got ${actual}`;
      throw new Error(msg);
    }
  }

  static isNotNull(value, message) {
    if (value === null || value === undefined) {
      const msg = message || `Expected not null/undefined, but got ${value}`;
      throw new Error(msg);
    }
  }

  static isNull(value, message) {
    if (value !== null && value !== undefined) {
      const msg = message || `Expected null/undefined, but got ${value}`;
      throw new Error(msg);
    }
  }

  static contains(string, substring, message) {
    if (!string.includes(substring)) {
      const msg = message || `Expected "${string}" to contain "${substring}"`;
      throw new Error(msg);
    }
  }

  static notContains(string, substring, message) {
    if (string.includes(substring)) {
      const msg = message || `Expected "${string}" not to contain "${substring}"`;
      throw new Error(msg);
    }
  }

  static isArray(value, message) {
    if (!Array.isArray(value)) {
      const msg = message || `Expected array, but got ${typeof value}`;
      throw new Error(msg);
    }
  }

  static isObject(value, message) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      const msg = message || `Expected object, but got ${typeof value}`;
      throw new Error(msg);
    }
  }

  static isString(value, message) {
    if (typeof value !== 'string') {
      const msg = message || `Expected string, but got ${typeof value}`;
      throw new Error(msg);
    }
  }

  static isNumber(value, message) {
    if (typeof value !== 'number' || isNaN(value)) {
      const msg = message || `Expected number, but got ${typeof value}`;
      throw new Error(msg);
    }
  }

  static greaterThan(actual, expected, message) {
    if (actual <= expected) {
      const msg = message || `Expected ${actual} > ${expected}`;
      throw new Error(msg);
    }
  }

  static lessThan(actual, expected, message) {
    if (actual >= expected) {
      const msg = message || `Expected ${actual} < ${expected}`;
      throw new Error(msg);
    }
  }

  static lengthEquals(array, expectedLength, message) {
    Assert.isArray(array);
    if (array.length !== expectedLength) {
      const msg = message || `Expected array length ${expectedLength}, but got ${array.length}`;
      throw new Error(msg);
    }
  }

  static hasProperty(object, property, message) {
    Assert.isObject(object);
    if (!(property in object)) {
      const msg = message || `Expected object to have property "${property}"`;
      throw new Error(msg);
    }
  }

  static async throwsAsync(asyncFunction, expectedError, message) {
    try {
      await asyncFunction();
      throw new Error(message || 'Expected function to throw an error');
    } catch (error) {
      if (expectedError && !error.message.includes(expectedError)) {
        throw new Error(message || `Expected error containing "${expectedError}", but got "${error.message}"`);
      }
    }
  }
}

/**
 * Data generators for testing
 */
class TestDataGenerator {
  static generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateEmail(name = 'test') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `${name}_${timestamp}_${random}@example.com`;
  }

  static generatePhoneNumber() {
    return `+628${Math.floor(Math.random() * 9000000000) + 1000000000}`;
  }

  static generateProjectId() {
    return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  static generateFolderId() {
    return `fld_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  static generateEndpointId() {
    return `ep_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  static generateFlowId() {
    return `flow_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  static generateEnvironmentId() {
    return `env_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  static generateTestUser() {
    const timestamp = Date.now();
    return {
      name: `Test User ${timestamp}`,
      email: this.generateEmail('testuser'),
      password: 'Password123!',
      phone: this.generatePhoneNumber()
    };
  }

  static generateEndpointData() {
    return {
      name: `Test Endpoint ${Date.now()}`,
      method: 'GET',
      url: 'https://api.example.com/test',
      headers: JSON.stringify({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }),
      body: null,
      description: 'Test endpoint description'
    };
  }

  static generateFolderData() {
    return {
      name: `Test Folder ${Date.now()}`,
      description: 'Test folder description',
      parent_id: null
    };
  }

  static generateFlowData() {
    return {
      name: `Test Flow ${Date.now()}`,
      description: 'Test flow description',
      flow_data: JSON.stringify({
        steps: [
          {
            id: 'step1',
            name: 'Test Step',
            type: 'request',
            endpoint_id: this.generateEndpointId(),
            environment_id: this.generateEnvironmentId()
          }
        ]
      })
    };
  }

  static generateEnvironmentVariables() {
    return {
      'API_BASE_URL': 'https://api.example.com',
      'API_VERSION': 'v1',
      'TIMEOUT': '30000',
      'TEST_MODE': 'true'
    };
  }
}

/**
 * Utility functions
 */
class TestUtils {
  /**
   * Wait for specified time
   */
  static async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry function with exponential backoff
   */
  static async retry(fn, maxAttempts = 3, baseDelay = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt === maxAttempts) {
          break;
        }
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await this.wait(delay);
      }
    }

    throw lastError;
  }

  /**
   * Measure execution time
   */
  static async measureTime(fn) {
    const startTime = Date.now();
    const result = await fn();
    const duration = Date.now() - startTime;
    return { result, duration };
  }

  /**
   * Create timeout promise
   */
  static createTimeout(ms, message = 'Operation timed out') {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    });
  }

  /**
   * Run with timeout
   */
  static async withTimeout(promise, ms, message) {
    return Promise.race([
      promise,
      this.createTimeout(ms, message)
    ]);
  }

  /**
   * Validate JSON string
   */
  static isValidJson(str) {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Parse JSON safely
   */
  static safeJsonParse(str, defaultValue = null) {
    try {
      return JSON.parse(str);
    } catch {
      return defaultValue;
    }
  }

  /**
   * Extract token from response
   */
  static extractToken(response, tokenType = 'access_token') {
    try {
      const data = typeof response === 'string' ? JSON.parse(response) : response;
      if (data.data && data.data[tokenType]) {
        return data.data[tokenType];
      }
      if (data[tokenType]) {
        return data[tokenType];
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check if response indicates success
   */
  static isSuccessResponse(response) {
    try {
      const data = typeof response === 'string' ? JSON.parse(response) : response;
      return data.success === true || data.status === 'success';
    } catch {
      return false;
    }
  }

  /**
   * Get error message from response
   */
  static getErrorMessage(response) {
    try {
      const data = typeof response === 'string' ? JSON.parse(response) : response;
      return data.error || data.message || 'Unknown error';
    } catch {
      return 'Failed to parse error response';
    }
  }

  /**
   * Format test name with timestamp
   */
  static formatTestName(baseName) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${baseName}_${timestamp}`;
  }

  /**
   * Generate unique test ID
   */
  static generateTestId() {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  /**
   * Create test context
   */
  static createTestContext(options = {}) {
    return {
      testId: this.generateTestId(),
      startTime: new Date(),
      testData: TestDataGenerator.generateTestUser(),
      projectIds: [TestDataGenerator.generateProjectId()],
      environmentIds: [TestDataGenerator.generateEnvironmentId()],
      folderIds: [TestDataGenerator.generateFolderId()],
      endpointIds: [TestDataGenerator.generateEndpointId()],
      flowIds: [TestDataGenerator.generateFlowId()],
      ...options
    };
  }

  /**
   * Cleanup test context
   */
  static async cleanupTestContext(context, client) {
    // Implementation would depend on what needs to be cleaned up
    // This is a placeholder for future cleanup logic
    console.log(`Cleaning up test context: ${context.testId}`);
  }
}

/**
 * Test decorators and wrappers
 */
function withTimeout(ms) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      return TestUtils.withTimeout(originalMethod.apply(this, args), ms);
    };

    return descriptor;
  };
}

function retry(maxAttempts = 3) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      return TestUtils.retry(() => originalMethod.apply(this, args), maxAttempts);
    };

    return descriptor;
  };
}

function measureTime() {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      const { result, duration } = await TestUtils.measureTime(() =>
        originalMethod.apply(this, args)
      );
      console.log(`${propertyKey} took ${duration}ms`);
      return result;
    };

    return descriptor;
  };
}

// Export commonly used functions
const createTestUser = TestDataGenerator.generateTestUser.bind(TestDataGenerator);
const createEndpointData = TestDataGenerator.generateEndpointData.bind(TestDataGenerator);
const createFolderData = TestDataGenerator.generateFolderData.bind(TestDataGenerator);
const createFlowData = TestDataGenerator.generateFlowData.bind(TestDataGenerator);
const createEnvironmentVariables = TestDataGenerator.generateEnvironmentVariables.bind(TestDataGenerator);

module.exports = {
  Assert,
  TestDataGenerator,
  TestUtils,
  createTestUser,
  createEndpointData,
  createFolderData,
  createFlowData,
  createEnvironmentVariables,
  // Export classes for direct use
  AssertClass: Assert,
  TestDataGeneratorClass: TestDataGenerator,
  TestUtilsClass: TestUtils
};