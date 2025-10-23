#!/usr/bin/env node

/**
 * Simple GASSAPI MCP Client Test
 */

const { SimpleMcpClient } = require('./dist/simple.js');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  console.log('🚀 Simple GASSAPI MCP Client Test');
  console.log('');

  const client = new SimpleMcpClient();

  switch (command) {
    case 'init':
      client.createSampleConfig();
      break;

    case 'test':
      await client.testBasicFunctionality();
      break;

    case 'status':
      client.showStatus();
      break;

    case 'help':
      console.log('🚀 Simple GASSAPI MCP Client');
      console.log('');
      console.log('USAGE:');
      console.log('  node simple.js [command]');
      console.log('');
      console.log('COMMANDS:');
      console.log('  init     - Create sample gassapi.json');
      console.log('  test     - Test basic functionality');
      console.log('  status   - Show configuration status');
      console.log('  help     - Show this help message');
      console.log('');
      console.log('EXAMPLES:');
      console.log('  node simple.js init');
      console.log('  node simple.js test');
      console.log('  node simple.js status');
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      console.error('Use "node simple.js help" for usage information');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}