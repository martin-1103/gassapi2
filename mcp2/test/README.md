# GASSAPI MCP v2 Test Suite

Modular and well-managed test suite for GASSAPI MCP v2 tools and functionality.

## 📁 Directory Structure

```
test/
├── README.md                    # This file
├── package.json                 # Test dependencies and scripts
├── config/
│   └── test-config.js          # Test configuration
├── utils/
│   ├── McpTestClient.js        # Reusable MCP client for testing
│   ├── TestReporter.js         # Standardized reporting utility
│   └── TestHelpers.js          # Common test functions and assertions
├── unit/                       # Unit tests per tool/kategori
│   ├── auth/
│   │   ├── test-project-context.js
│   │   └── auth-test-runner.js
│   ├── environment/
│   │   └── test-list-environments.js
│   ├── folders/               # TODO: Implement
│   ├── endpoints/               # TODO: Implement
│   ├── flows/                   # TODO: Implement
│   └── testing/                 # TODO: Implement
├── integration/                # Integration tests
│   └── TODO: Implement
├── runners/                    # Test runners
│   ├── run-all-tests.js        # Master test runner
│   ├── run-category-tests.js   # Per-category test runner
│   └── run-quick-check.js      # Quick health check
└── reports/                    # Auto-generated reports
    ├── test-results.json
    └── test-summary.html (optional)
```

## 🚀 Quick Start

### Prerequisites

1. **MCP Server Built**: Ensure the MCP server is built:
   ```bash
   cd mcp2
   npm run build
   ```

2. **Node.js**: Node.js version 16.0.0 or higher

### Running Tests

#### 1. Quick Health Check
Fast check to verify MCP server and basic functionality:
```bash
cd test
node runners/run-quick-check.js
```

#### 2. Run All Tests
Execute all available test categories:
```bash
cd test
node runners/run-all-tests.js
```

#### 3. Run Specific Category
Run tests for a specific tool category:
```bash
cd test
node runners/run-category-tests.js auth        # Authentication tests
node runners/run-category-tests.js environment  # Environment tests
node runners/run-category-tests.js folders      # Folder tests
node runners/run-category-tests.js endpoints    # Endpoint tests
node runners/run-category-tests.js flows        # Flow tests
node runners/run-category-tests.js testing      # Testing tool tests
```

#### 4. Using npm Scripts
If you have npm configured:
```bash
cd test
npm run test              # Run all tests
npm run test:auth         # Run auth tests
npm run test:environment   # Run environment tests
npm run test:quick         # Quick health check
```

## 📋 Available Test Categories

| Category | Description | Status | Tests |
|----------|-------------|---------|-------|
| **auth** | Authentication and authorization | ✅ Implemented | get_project_context |
| **environment** | Environment management | 🚧 In Progress | list_environments, get_environment_details, update_environment_variables |
| **folders** | Folder management | ⏳ Planned | get_folders, create_folder, move_folder, delete_folder |
| **endpoints** | Endpoint management | ⏳ Planned | list_endpoints, get_endpoint_details, create_endpoint, update_endpoint, move_endpoint |
| **flows** | Flow management and execution | ⏳ Planned | create_flow, list_flows, get_flow_detail, update_flow, delete_flow, execute_flow, etc. |
| **testing** | Testing tools functionality | ⏳ Planned | test_endpoint |

## ⚙️ Configuration

### Environment Variables

- `DEBUG=true`: Enable verbose debug output
- `CI=true`: CI/CD mode (parallel execution, no console output)
- `KEEP_TEST_DATA=true`: Keep test data after cleanup
- `TEST_PROJECT_ID`: Override default project ID
- `TEST_ENVIRONMENT_ID`: Override default environment ID

### Test Configuration

Edit `config/test-config.js` to modify:
- Project and environment IDs
- Test user credentials
- Timeout and retry settings
- Reporting options

## 📊 Reporting

### Console Output
- Real-time test progress
- Success/failure indicators
- Performance metrics
- Error details

### JSON Reports
- Structured test results
- Machine-readable format
- Comprehensive metadata
- Location: `reports/test-results.json`

### HTML Reports (Optional)
- Visual test summary
- Interactive charts
- Detailed test information
- Location: `reports/test-summary.html`

Enable HTML reports:
```bash
node runners/run-all-tests.js --html
```

## 🔧 Development

### Adding New Tests

1. **Create Test File**: Add test function in appropriate `unit/` subdirectory
2. **Follow Patterns**: Use `McpTestClient`, `TestReporter`, and `TestHelpers`
3. **Export Functions**: Export test functions from test file
4. **Update Runner**: Add test function to corresponding test runner

### Test Structure Template

```javascript
/**
 * Test [Feature] Description
 * Test specific functionality
 */

import { createTestClient } from '../../utils/McpTestClient.js';
import { Assert, TestUtils } from '../../utils/TestHelpers.js';

export async function test[FeatureName]() {
  const startTime = Date.now();

  await TestUtils.withTimeout(
    (async () => {
      await TestUtils.withTestClient({ debug: false }, async (client) => {
        const result = await client.call('tool_name', {
          // parameters
        });

        // Assertions
        Assert.isTrue(result.success, 'Response should be successful');
        Assert.isNotNull(result.data, 'Response should have data');

        // Test logic
        console.log('✅ Test passed');
      });
    })(),
    15000,
    'Test timed out'
  );

  return {
    name: 'test[FeatureName]',
    status: 'passed',
    duration: Date.now() - startTime,
    message: 'Test description'
  };
}
```

### Utility Classes

#### McpTestClient
- Reusable MCP client for testing
- Built-in error handling and retry logic
- Response parsing and validation
- Automatic connection management

#### TestReporter
- Standardized reporting (console, JSON, HTML)
- Test result aggregation
- Performance metrics
- Success rate calculations

#### TestHelpers
- Assertion utilities (Assert class)
- Test data generators (TestDataGenerator)
- Common utilities (TestUtils)
- Decorators for timeout and retry

## 🐛 Troubleshooting

### Common Issues

#### 1. Server Startup Failed
```bash
💥 Server startup failed: Error: connect ECONNREFUSED
```
**Solution**: Ensure MCP server is built and running:
```bash
cd mcp2
npm run build
node dist/index.js
```

#### 2. Test Timeout
```bash
❌ Test timed out
```
**Solution**: Increase timeout in test or check server performance:
```javascript
await TestUtils.withTimeout(testFunction, 30000); // 30 seconds
```

#### 3. Invalid Project ID
```bash
❌ get_project_context test timed out
```
**Solution**: Update project ID in `config/test-config.js` or verify project exists.

#### 4. Permission Issues
```bash
Error: EACCES: permission denied
```
**Solution**: Check file permissions and ensure test directory is writable.

### Debug Mode

Enable verbose output for detailed debugging:
```bash
DEBUG=true node runners/run-all-tests.js
```

### Test Isolation

Tests are designed to be independent and should not interfere with each other. Each test:
- Uses its own MCP client instance
- Cleans up after execution
- Has configurable timeouts
- Handles errors gracefully

## 📝 Test Best Practices

### DOs
- ✅ Use descriptive test names
- ✅ Include multiple assertions per test
- ✅ Test both success and error cases
- ✅ Use appropriate timeouts
- ✅ Clean up resources after tests
- ✅ Document test purpose and expected behavior

### DON'Ts
- ❌ Don't rely on shared state between tests
- ❌ Don't hardcode test data (use generators)
- ❌ Don't ignore test failures
- ❌ Don't use infinite loops without timeouts
- ❌ Don't test implementation details
- ❌ Don't create interdependent tests

## 🔄 Continuous Integration

### CI/CD Pipeline Integration

1. **Install dependencies**:
   ```bash
   cd test && npm install
   ```

2. **Run tests in CI mode**:
   ```bash
   CI=true node runners/run-all-tests.js
   ```

3. **Check exit codes**:
   - `0`: All tests passed
   - `1`: Some tests failed
   - `2`: Critical errors

### GitHub Actions Example

```yaml
name: MCP Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Build MCP Server
        run: |
          cd mcp2
          npm run build

      - name: Run Tests
        run: |
          cd mcp2/test
          CI=true node runners/run-all-tests.js
```

## 📈 Performance Metrics

### Response Time Targets
- **Quick Health Check**: < 10 seconds total
- **Individual Tests**: < 15 seconds each
- **Tool Responses**: < 5 seconds average
- **Batch Operations**: < 30 seconds

### Success Rate Targets
- **Minimum Success Rate**: 95%
- **Critical Tests**: 100%
- **Optional Tests**: 90%

## 🤝 Contributing

### Adding New Test Categories

1. Create directory: `test/unit/[category]/`
2. Implement test files following existing patterns
3. Create test runner: `test/unit/[category]/[category]-test-runner.js`
4. Update main runners to include new category
5. Update configuration and documentation

### Code Style

- Use ES6+ modules and async/await
- Follow existing naming conventions
- Include comprehensive error handling
- Add descriptive comments and documentation
- Use TypeScript-style JSDoc comments

## 📞 Support

For questions, issues, or contributions:

1. Check existing test files for patterns
2. Review documentation in `config/test-config.js`
3. Enable debug mode for detailed output
4. Check generated reports for detailed information

---

**Test Suite Version**: 1.0.0
**Last Updated**: October 25, 2025
**Compatible with**: GASSAPI MCP v2