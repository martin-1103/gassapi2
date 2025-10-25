/**
 * Test Configuration
 * Centralized configuration for all test scripts
 */

const TEST_CONFIG = {
  // Project configuration (MCP server will use gassapi.json, tests use defaults)
  project: {
    id: process.env.TEST_PROJECT_ID || 'proj_1761288753_1587448b',
    name: 'GASSAPI Test Project'
  },

  // Environment configuration
  environments: {
    default: {
      id: process.env.TEST_ENVIRONMENT_ID || 'env_1761288753_e4e1788a',
      name: 'Test Environment',
      variables: {
        'BASE_URL': 'http://localhost:8000/gassapi2/backend/',
        'API_VERSION': 'v1',
        'TIMEOUT': '30000',
        'TEST_MODE': 'true'
      }
    }
  },

  // Collection configuration
  collections: {
    test: {
      id: process.env.TEST_COLLECTION_ID || null,
      name: 'Test Collection',
      createIfNotExists: true
    }
  },

  // Test user credentials
  testUsers: {
    admin: {
      email: 'admin@gassapi.com',
      password: 'password'
    },
    new: {
      // Will be generated dynamically
      name: '',
      email: '',
      password: 'Password123!',
      phone: ''
    }
  },

  // Known endpoints for testing
  endpoints: {
    login: 'ep_bccaf9721d41924f47e43e771317d873',
    // Other endpoints will be discovered dynamically
  },

  // Known flows for testing
  flows: {
    simple: 'flow_478342802b295a4de72e345d3867e35c',
    // Other flows will be discovered dynamically
  },

  // Test execution settings
  execution: {
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
    parallel: false, // Run tests sequentially by default
    verbose: process.env.DEBUG === 'true',
    debug: process.env.DEBUG === 'true'
  },

  // Reporting settings
  reporting: {
    outputDir: 'reports',
    console: true,
    json: true,
    html: false,
    verbose: false
  },

  // Server settings
  server: {
    path: 'dist/index.js',
    startupTimeout: 10000,
    shutdownTimeout: 5000
  },

  // Test categories
  categories: {
    auth: {
      name: 'Authentication Tests',
      description: 'Test authentication and authorization functionality',
      required: true,
      tests: [
        'get_project_context'
      ]
    },

    environment: {
      name: 'Environment Tests',
      description: 'Test environment management functionality',
      required: true,
      tests: [
        'list_environments',
        'get_environment_details',
        'update_environment_variables'
      ]
    },

    collections: {
      name: 'Collection Tests',
      description: 'Test collection management functionality',
      required: true,
      tests: [
        'get_collections',
        'create_collection',
        'move_collection',
        'delete_collection'
      ]
    },

    endpoints: {
      name: 'Endpoint Tests',
      description: 'Test endpoint management functionality',
      required: true,
      tests: [
        'list_endpoints',
        'get_endpoint_details',
        'create_endpoint',
        'update_endpoint',
        'move_endpoint'
      ]
    },

    flows: {
      name: 'Flow Tests',
      description: 'Test flow management and execution functionality',
      required: true,
      tests: [
        'create_flow',
        'list_flows',
        'get_flow_detail',
        'update_flow',
        'delete_flow',
        'set_environment_variables',
        'set_flow_inputs',
        'set_runtime_variables',
        'get_session_state',
        'clear_session_state',
        'execute_flow'
      ]
    },

    testing: {
      name: 'Testing Tools',
      description: 'Test endpoint testing functionality',
      required: true,
      tests: [
        'test_endpoint'
      ]
    }
  },

  // Integration test scenarios
  integrationScenarios: {
    authWorkflow: {
      name: 'Authentication Workflow',
      description: 'Test complete authentication flow',
      enabled: true,
      steps: [
        'get_project_context',
        'test_endpoint_login',
        'extract_jwt_token',
        'set_session_variables'
      ]
    },

    flowLifecycle: {
      name: 'Flow Lifecycle',
      description: 'Test complete flow create → execute → update → delete cycle',
      enabled: true,
      steps: [
        'create_flow',
        'execute_flow',
        'update_flow',
        'delete_flow'
      ]
    },

    endToEnd: {
      name: 'End-to-End Scenario',
      description: 'Test complete workflow with multiple tools',
      enabled: true,
      steps: [
        'create_collection',
        'create_endpoint',
        'create_flow',
        'execute_flow',
        'cleanup_resources'
      ]
    }
  },

  // Cleanup settings
  cleanup: {
    autoCleanup: true,
    keepTestData: process.env.KEEP_TEST_DATA === 'true',
    cleanupDelay: 1000 // 1 second delay before cleanup
  },

  // Validation rules
  validation: {
    responseTimeout: 5000,
    maxResponseSize: 1024 * 1024, // 1MB
    requiredFields: {
      project: ['id', 'name'],
      environment: ['id', 'name'],
      collection: ['id', 'name'],
      endpoint: ['id', 'name', 'method', 'url'],
      flow: ['id', 'name', 'flow_data']
    }
  },

  // Mock data settings
  mockData: {
    generate: true,
    seed: Date.now(),
    locale: 'en-US'
  }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'development') {
  TEST_CONFIG.execution.verbose = true;
  TEST_CONFIG.reporting.verbose = true;
  TEST_CONFIG.reporting.html = true;
}

if (process.env.CI === 'true') {
  TEST_CONFIG.execution.parallel = true;
  TEST_CONFIG.reporting.console = false;
  TEST_CONFIG.cleanup.autoCleanup = true;
  TEST_CONFIG.cleanup.keepTestData = false;
}

// Export helper functions
function getProjectConfig() {
  return TEST_CONFIG.project;
}

function getEnvironmentConfig(envName = 'default') {
  return TEST_CONFIG.environments[envName];
}

function getTestCategoryConfig(categoryName) {
  return TEST_CONFIG.categories[categoryName];
}

function getIntegrationScenarioConfig(scenarioName) {
  return TEST_CONFIG.integrationScenarios[scenarioName];
}

function getTestUserConfig(userType = 'admin') {
  return TEST_CONFIG.testUsers[userType];
}

function isCategoryEnabled(categoryName) {
  const config = getTestCategoryConfig(categoryName);
  return config && config.required !== false;
}

function isIntegrationScenarioEnabled(scenarioName) {
  const config = getIntegrationScenarioConfig(scenarioName);
  return config && config.enabled !== false;
}

// Export all configurations
module.exports = {
  TEST_CONFIG,
  getProjectConfig,
  getEnvironmentConfig,
  getTestCategoryConfig,
  getIntegrationScenarioConfig,
  getTestUserConfig,
  isCategoryEnabled,
  isIntegrationScenarioEnabled
};