import { logger, initializeLogger } from './Logger';
/**
 * Simple test to validate the logging infrastructure
 */
export function testLogger() {
    console.log('=== Testing Logger Infrastructure ===');
    // Initialize logger
    initializeLogger();
    // Test different log levels
    logger.debug('This is a debug message', { test: 'debug' }, 'TestModule');
    logger.info('This is an info message', { test: 'info' }, 'TestModule');
    logger.warn('This is a warning message', { test: 'warn' }, 'TestModule');
    logger.error('This is an error message', { test: 'error' }, 'TestModule');
    // Test CLI logging
    logger.cli('This is a CLI info message', 'info');
    logger.cli('This is a CLI success message', 'success');
    logger.cli('This is a CLI warning message', 'warning');
    logger.cli('This is a CLI error message', 'error');
    // Test child logger
    const childLogger = logger.child('ChildModule');
    childLogger.info('This is from a child logger', { child: true });
    console.log('=== Logger Test Complete ===');
}
// Run test if called directly
if (require.main === module) {
    testLogger();
}
//# sourceMappingURL=LoggerTest.js.map