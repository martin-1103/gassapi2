#!/usr/bin/env node

/**
 * Run Integration Tests
 * Master test runner for integration test scenarios
 */

const { createTestReporter } = require('../utils/TestReporter.js');
const { TEST_CONFIG, getIntegrationScenarioConfig, isIntegrationScenarioEnabled } = require('../config/test-config.js');

// Import scenario implementations (when they exist)
// import { runAuthWorkflow } from '../integration/auth-workflow.js';
// import { runFlowLifecycle } from '../integration/flow-lifecycle.js';
// import { runEndToEndScenario } from '../integration/end-to-end-scenario.js';

/**
 * Get available integration scenarios
 */
function getAvailableScenarios() {
  const scenarios = [];

  for (const [name, config] of Object.entries(TEST_CONFIG.integrationScenarios)) {
    if (isIntegrationScenarioEnabled(name)) {
      scenarios.push({ name, ...config });
    }
  }

  return scenarios;
}

/**
 * Run all enabled integration scenarios
 */
async function runIntegrationTests(options = {}) {
  const reporter = createTestReporter({
    suite: 'Integration Tests - End-to-End Scenarios',
    verbose: options.verbose || false,
    console: options.console !== false,
    json: options.json || false,
    html: options.html || false
  });

  const availableScenarios = getAvailableScenarios();

  if (availableScenarios.length === 0) {
    reporter.addTestResult({
      name: 'Integration Tests',
      status: 'skipped',
      duration: 0,
      message: 'No integration scenarios are enabled or implemented'
    });
  } else {
    console.log(`🔗 Running ${availableScenarios.length} integration scenarios...`);

    for (const scenario of availableScenarios) {
      console.log(`\n📋 Running scenario: ${scenario.name}`);

      try {
        const result = await runScenario(scenario.name, options);
        reporter.addTestResult(result);
        console.log(`✅ ${scenario.name} completed`);
      } catch (error) {
        const errorResult = {
          name: scenario.name,
          status: 'error',
          duration: 0,
          error: error.message,
          details: error.stack
        };
        reporter.addTestResult(errorResult);
        console.log(`❌ ${scenario.name} failed: ${error.message}`);
      }
    }
  }

  reporter.generateReports();

  return {
    success: reporter.allTestsPassed(),
    reporter,
    summary: reporter.results.summary
  };
}

/**
 * Run specific integration scenario
 */
async function runScenario(scenarioName, options = {}) {
  const scenarioConfig = getIntegrationScenarioConfig(scenarioName);
  if (!scenarioConfig) {
    throw new Error(`Unknown integration scenario: ${scenarioName}`);
  }

  const startTime = Date.now();

  switch (scenarioName) {
    case 'authWorkflow':
      return await runAuthWorkflowTest(scenarioConfig, startTime);

    case 'flowLifecycle':
      return await runFlowLifecycleTest(scenarioConfig, startTime);

    case 'endToEnd':
      return await runEndToEndTest(scenarioConfig, startTime);

    default:
      throw new Error(`Integration scenario '${scenarioName}' is not implemented yet`);
  }
}

/**
 * Run authentication workflow test (placeholder)
 */
async function runAuthWorkflowTest(scenarioConfig, startTime) {
  // TODO: Implement actual auth workflow test
  // This would test: get_project_context → extract_jwt_token → set_session_variables

  return {
    name: scenarioConfig.name,
    status: 'skipped',
    duration: Date.now() - startTime,
    message: 'Auth workflow test not implemented yet'
  };
}

/**
 * Run flow lifecycle test (placeholder)
 */
async function runFlowLifecycleTest(scenarioConfig, startTime) {
  // TODO: Implement actual flow lifecycle test
  // This would test: create_flow → execute_flow → update_flow → delete_flow

  return {
    name: scenarioConfig.name,
    status: 'skipped',
    duration: Date.now() - startTime,
    message: 'Flow lifecycle test not implemented yet'
  };
}

/**
 * Run end-to-end test (placeholder)
 */
async function runEndToEndTest(scenarioConfig, startTime) {
  // TODO: Implement actual end-to-end test
  // This would test: create_collection → create_endpoint → create_flow → execute_flow → cleanup

  return {
    name: scenarioConfig.name,
    status: 'skipped',
    duration: Date.now() - startTime,
    message: 'End-to-end test not implemented yet'
  };
}

// Allow running this file directly
if (require.main === module) {
  const options = {
    verbose: process.argv.includes('--verbose'),
    console: true,
    json: !process.argv.includes('--no-json'),
    html: process.argv.includes('--html')
  };

  runIntegrationTests(options).then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('💥 Integration test runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runIntegrationTests,
  runScenario,
  getAvailableScenarios
};