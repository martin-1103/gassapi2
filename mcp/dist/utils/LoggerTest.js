"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testLogger = testLogger;
const Logger_1 = require("./Logger");
/**
 * Simple test to validate the logging infrastructure
 */
function testLogger() {
    console.log('=== Testing Logger Infrastructure ===');
    // Initialize logger
    (0, Logger_1.initializeLogger)();
    // Test different log levels
    Logger_1.logger.debug('This is a debug message', { test: 'debug' }, 'TestModule');
    Logger_1.logger.info('This is an info message', { test: 'info' }, 'TestModule');
    Logger_1.logger.warn('This is a warning message', { test: 'warn' }, 'TestModule');
    Logger_1.logger.error('This is an error message', { test: 'error' }, 'TestModule');
    // Test CLI logging
    Logger_1.logger.cli('This is a CLI info message', 'info');
    Logger_1.logger.cli('This is a CLI success message', 'success');
    Logger_1.logger.cli('This is a CLI warning message', 'warning');
    Logger_1.logger.cli('This is a CLI error message', 'error');
    // Test child logger
    const childLogger = Logger_1.logger.child('ChildModule');
    childLogger.info('This is from a child logger', { child: true });
    console.log('=== Logger Test Complete ===');
}
// Run test if called directly
if (require.main === module) {
    testLogger();
}
//# sourceMappingURL=LoggerTest.js.map