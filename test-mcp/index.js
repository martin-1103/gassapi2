#!/usr/bin/env node

/**
 * MCP2 Error Reproduction Main Entry Point
 *
 * Script utama untuk menjalankan semua test reproduksi error MCP2.
 */

const FixedErrorsTester = require('./test-fixed-errors.js');
const CurrentIssuesTester = require('./test-current-issues.js');
const EndpointDebugger = require('./debug-endpoints.js');
const FlowDebugger = require('./debug-flows.js');

class MCP2ErrorTester {
  constructor() {
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🧪 MCP2 GASSAPI Error Reproduction Suite');
    console.log('====================================');
    console.log(`Started at: ${new Date().toISOString()}`);
    console.log('');

    const results = {
      fixedErrors: null,
      currentIssues: null,
      endpointDebug: null,
      flowDebug: null,
      summary: {
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0,
        overallSuccessRate: 0
      }
    };

    try {
      // Test 1: Fixed Errors (Regression Testing)
      console.log('📋 PHASE 1: Fixed Errors Regression Testing');
      console.log('==========================================');
      results.fixedErrors = await new FixedErrorsTester().runAllTests();
      results.summary.totalTests += results.fixedErrors.passed + results.fixedErrors.failed;
      results.summary.totalPassed += results.fixedErrors.passed;
      results.summary.totalFailed += results.fixedErrors.failed;

      console.log('\n');

      // Test 2: Current Issues
      console.log('📋 PHASE 2: Current Issues Testing');
      console.log('=================================');
      results.currentIssues = await new CurrentIssuesTester().runAllTests();
      results.summary.totalTests += results.currentIssues.passed + results.currentIssues.failed;
      results.summary.totalPassed += results.currentIssues.passed;
      results.summary.totalFailed += results.currentIssues.failed;

      console.log('\n');

      // Test 3: Endpoint Debugging (if needed)
      console.log('📋 PHASE 3: Endpoint Debugging');
      console.log('==========================');
      results.endpointDebug = await new EndpointDebugger().runDebugTests();
      // Debug tests don't return pass/fail count, just run diagnostics

      console.log('\n');

      // Test 4: Flow Debugging (if needed)
      console.log('📋 PHASE 4: Flow Debugging');
      console.log('========================');
      results.flowDebug = await new FlowDebugger().runFlowDebugTests();
      // Debug tests don't return pass/fail count, just run diagnostics

    } catch (error) {
      console.error('❌ CRITICAL ERROR: Test suite failed');
      console.error('Error:', error.message);
      results.summary.totalFailed++;
    }

    // Calculate overall success rate
    if (results.summary.totalTests > 0) {
      results.summary.overallSuccessRate = Math.round(
        (results.summary.totalPassed / results.summary.totalTests) * 100
      );
    }

    // Generate final report
    this.generateFinalReport(results);

    return results;
  }

  generateFinalReport(results) {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 1000);

    console.log('\n🎯 FINAL ERROR REPRODUCTION REPORT');
    console.log('=================================');
    console.log(`Duration: ${duration} seconds`);
    console.log(`Completed at: ${new Date().toISOString()}`);

    console.log('\n📊 OVERALL RESULTS:');
    console.log(`Total Tests: ${results.summary.totalTests}`);
    console.log(`Passed: ${results.summary.totalPassed}`);
    console.log(`Failed: ${results.summary.totalFailed}`);
    console.log(`Success Rate: ${results.summary.overallSuccessRate}%`);

    console.log('\n📋 DETAILED RESULTS:');

    if (results.fixedErrors) {
      console.log('  🔧 Fixed Errors (Regression Testing):');
      console.log(`     Passed: ${results.fixedErrors.passed}`);
      console.log(`     Failed: ${results.fixedErrors.failed}`);
      console.log(`     Success Rate: ${results.fixedErrors.successRate}%`);
      console.log(`     Status: ${results.fixedErrors.failed === 0 ? '✅ NO REGRESSION' : '⚠️ REGRESSION DETECTED'}`);
    }

    if (results.currentIssues) {
      console.log('  🐛 Current Issues:');
      console.log(`     Passed: ${results.currentIssues.passed}`);
      console.log(`     Failed: ${results.currentIssues.failed}`);
      console.log(`     Success Rate: ${results.currentIssues.successRate}%`);
      console.log(`     Status: ${results.currentIssues.failed === 0 ? '✅ ALL RESOLVED' : '⚠️ ISSUES STILL EXIST'}`);
    }

    console.log('\n💡 RECOMMENDATIONS:');

    if (results.fixedErrors.failed > 0) {
      console.log('  🔴 REGRESSION ALERT:');
      console.log('     - Some previously fixed errors have returned');
      console.log('     - Review recent changes that might have broken fixes');
      console.log('     - Run git diff to identify problematic changes');
    }

    if (results.currentIssues.failed > 0) {
      console.log('  🟡 DEBUGGING NEEDED:');
      console.log('     - Current issues still exist and need debugging');
      console.log('     - Run individual debug scripts for detailed analysis');
      console.log('     - Focus on create_endpoint and flow management');
    }

    if (results.summary.overallSuccessRate >= 90) {
      console.log('  🎉 EXCELLENT: MCP2 system is highly stable!');
    } else if (results.summary.overallSuccessRate >= 70) {
      console.log('  ✅ GOOD: MCP2 system is mostly stable');
    } else if (results.summary.overallSuccessRate >= 50) {
      console.log('  ⚠️  MARGINAL: MCP2 system needs improvement');
    } else {
      console.log('  ❌ CRITICAL: MCP2 system has significant issues');
    }

    // Save results to file
    this.saveResultsToFile(results);
  }

  saveResultsToFile(results) {
    const fs = require('fs');
    const path = require('path');

    const reportData = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      results: results,
      summary: {
        overallStatus: results.summary.overallSuccessRate >= 90 ? 'EXCELLENT' :
                     results.summary.overallSuccessRate >= 70 ? 'GOOD' :
                     results.summary.overallSuccessRate >= 50 ? 'MARGINAL' : 'CRITICAL',
        recommendations: this.getRecommendations(results)
      }
    };

    const reportFile = path.join(__dirname, 'reports', `error-reproduction-report-${Date.now()}.json`);

    // Create reports directory if it doesn't exist
    const reportsDir = path.dirname(reportFile);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportFile}`);
  }

  getRecommendations(results) {
    const recommendations = [];

    if (results.fixedErrors.failed > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Regression',
        action: 'Review recent changes and revert if necessary'
      });
    }

    if (results.currentIssues.failed > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Current Issues',
        action: 'Run debug scripts to identify root causes'
      });
    }

    if (results.summary.overallSuccessRate < 90) {
      recommendations.push({
        priority: 'LOW',
        category: 'General Improvement',
        action: 'Continue debugging and fixing remaining issues'
      });
    }

    return recommendations;
  }

  async runQuickCheck() {
    console.log('⚡ Quick MCP2 Health Check...');

    const quickTests = [
      // Test basic connectivity
      async () => {
        const axios = require('axios');
        try {
          const response = await axios.get(`${require('./config').backend.baseURL}/gassapi2/backend/?act=health`, {
              timeout: 5000
          });
          console.log('✅ Backend connectivity: OK');
          return true;
        } catch (error) {
          console.log('❌ Backend connectivity: FAILED');
          console.log(`   Error: ${error.message}`);
          return false;
        }
      },
      // Test MCP validation
      async () => {
        const CurrentIssuesTester = require('./test-current-issues.js');
        const tester = new CurrentIssuesTester();
        const result = await tester.makeRequest('GET', '/gassapi2/backend/?act=mcp_validate');

        if (result.success) {
          console.log('✅ MCP validation: OK');
          return true;
        } else {
          console.log('❌ MCP validation: FAILED');
          console.log(`   Error: ${result.error.message || result.error}`);
          return false;
        }
      }
    ];

    let passed = 0;
    for (const test of quickTests) {
      if (await test()) passed++;
    }

    console.log(`Quick Check Result: ${passed}/2 tests passed`);

    if (passed === 2) {
      console.log('🎉 MCP2 system is healthy! Run full test suite for comprehensive analysis.');
    } else {
      console.log('⚠️  MCP2 system has issues detected. Run full test suite for detailed analysis.');
    }

    return passed === 2;
  }
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

const tester = new MCP2ErrorTester();

async function main() {
  switch (command) {
    case 'quick':
      await tester.runQuickCheck();
      break;
    case 'fixed':
      await new FixedErrorsTester().runAllTests();
      break;
    case 'current':
      await new CurrentIssuesTester().runAllTests();
      break;
    case 'debug-endpoints':
      await new EndpointDebugger().runDebugTests();
      break;
    case 'debug-flows':
      await new FlowDebugger().runFlowDebugTests();
      break;
    case 'all':
    default:
      await tester.runAllTests();
      break;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ FATAL ERROR:', error.message);
    process.exit(1);
  });
}