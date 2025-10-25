// Konfigurasi untuk testing MCP2 errors
const CONFIG = {
  // Backend API configuration
  backend: {
    baseURL: 'http://localhost:8080',
    timeout: 10000
  },

  // MCP Credentials (dari gassapi.json)
  mcp: {
    projectId: 'proj_1761385246_5ec798d9',
    token: '2032781cbb63ea282749778091b2170a5a18d0491a519bad4ab488ab463e885d'
  },

  // JWT Credentials (untuk testing authentication)
  jwt: {
    email: 'testuser@gassapi.com',
    password: 'Password123'
  },

  // Test Data
  testData: {
    folder: {
      name: 'Test Error Reproduction Folder',
      description: 'Folder untuk mereproduksi error'
    },
    endpoint: {
      name: 'Test Error Endpoint',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      description: 'Endpoint untuk error testing'
    },
    flow: {
      name: 'Test Error Flow',
      description: 'Flow untuk error testing',
      input: {
        name: 'test_param',
        type: 'string',
        required: true,
        description: 'Test parameter'
      },
      steps: [
        {
          id: 'step_1',
          name: 'Test Step',
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/posts/1',
          outputs: {
            response: 'response.body'
          }
        }
      ]
    }
  }
};

module.exports = CONFIG;