/**
 * Handler for create endpoint tool
 */

import { McpToolResponse } from '../../../types.js';
import { HttpMethod } from '../types.js';
import { EndpointCreateResponse } from '../types.js';
import {
  getEndpointDependencies
} from '../dependencies.js';
import {
  formatHeaders,
  formatBody,
  validateEndpointData,
  formatEndpointCreateText
} from '../utils.js';
import { getApiEndpoints } from '../../../lib/api/endpoints.js';

/**
 * Get folder suggestions with hierarchy and create instructions
 */
async function getFolderSuggestions(configManager: any, backendClient: any): Promise<string> {
  try {
    // Get project ID
    const projectConfig = await configManager.detectProjectConfig();
    const projectId = projectConfig?.project?.id;

    if (!projectId) {
      return `⚠️  Tidak bisa mendapatkan project ID. Pastikan MCP config sudah diatur dengan benar.

💡 Solusi:
1. Pastikan file .gassapi/mcp-config.json ada dan valid
2. Gunakan get_project_context untuk cek project config
3. Jika masih error, create ulang project config`;
    }

    // Get folders with tree structure
    const foldersResponse = await backendClient.makeRequest(`/?act=project_folders&id=${projectId}&is_active=true`, {
      method: 'GET'
    });

    if (!foldersResponse.success || !foldersResponse.data) {
      return `📁 **Cara dapatkan Folder ID:**

🔧 **Option 1: List folders yang ada**
   Gunakan tool: list_folders
   Parameter:
   - projectId: "${projectId}"
   - parentId: null (untuk root folders)
   - activeOnly: true

🆕 **Option 2: Create folder baru**
   Gunakan tool: create_folder
   Parameter:
   - projectId: "${projectId}"
   - name: "Nama Folder Baru"
   - description: "Deskripsi folder"

📋 **Contoh penggunaan:**
   list_folders → dapatkan folder ID → create_endpoint dengan folder_id tersebut`;
    }

    // Build folder hierarchy
    const folders = foldersResponse.data.data || foldersResponse.data || [];

    if (folders.length === 0) {
      return `📂 **Project ini belum punya folder**

🆕 **Buat folder dulu:**
   create_folder dengan parameter:
   - projectId: "${projectId}"
   - name: "API Endpoints"
   - description: "Folder untuk menyimpan API endpoints"

📋 **Setelah punya folder:**
   Gunakan folder_id dari hasil create_folder untuk membuat endpoint`;
    }

    // Format folder list
    let folderMessage = `📁 **Folder yang tersedia:**\n\n`;

    folders.forEach((folder: any, index: number) => {
      const indent = '  ';
      folderMessage += `${index + 1}. ${folder.name}\n`;
      folderMessage += `${indent}🆔 ID: ${folder.id}\n`;
      if (folder.description) {
        folderMessage += `${indent}📝 Deskripsi: ${folder.description}\n`;
      }
      folderMessage += `${indent}📊 Endpoint: ${folder.endpoint_count || 0} endpoint\n`;
      folderMessage += `${indent}📅 Dibuat: ${new Date(folder.created_at).toLocaleDateString('id-ID')}\n\n`;
    });

    folderMessage += `💡 **Cara pakai:**\n`;
    folderMessage += `Pilih salah satu folder_id di atas, atau:\n\n`;
    folderMessage += `🆕 **Buat folder baru:** create_folder\n`;
    folderMessage += `📋 **List ulang:** list_folders (untuk refresh)\n`;
    folderMessage += `🔍 **Detail folder:** get_folder_details dengan folder_id pilihan`;

    return folderMessage;

  } catch (error: any) {
    return `⚠️  Error mendapatkan folder: ${error.message}

📁 **Cara manual dapatkan folder:**\n\n
🔧 **Gunakan list_folders:**
   - projectId: "dapatkan dari get_project_context"
   - parentId: null
   - activeOnly: true

🆕 **Atau create folder baru:**
   - create_folder dengan projectId yang valid

💬 **Tip:** Gunakan get_project_context dulu untuk dapatkan projectId yang valid`;
  }
}

/**
 * Handle create endpoint request
 */
export async function handleCreateEndpoint(args: Record<string, any>): Promise<McpToolResponse> {
  try {
    const { configManager, backendClient } = await getEndpointDependencies();

    const name = args.name as string;
    const method = args.method as HttpMethod;
    const url = args.url as string;
    const folderId = args.folder_id as string;
    const description = args.description as string | undefined;
    const headers = args.headers as Record<string, string> | undefined;
    const body = args.body as string | undefined;

    // Validate input
    const validationErrors = validateEndpointData({ name, method, url, folder_id: folderId });
    if (validationErrors.length > 0) {
      // Check if folder_id is the only error and provide helpful suggestions
      if (validationErrors.length === 1 && validationErrors[0] === 'Folder ID is required') {
        const foldersMessage = await getFolderSuggestions(configManager, backendClient);
        throw new Error(`Folder ID is required\n\n${foldersMessage}`);
      }
      throw new Error(validationErrors.join('\n'));
    }

    // Create endpoint
    const apiEndpoints = getApiEndpoints();
    const endpoint = apiEndpoints.getEndpoint('endpointCreate', { id: folderId });

    const requestBody = JSON.stringify({
      name: name.trim(),
      method,
      url: url.trim(),
      description: description?.trim() || null,
      headers: formatHeaders(headers || {}),
      body: formatBody(body) || null
    });

    console.error(`[EndpointTools] Creating endpoint at: ${endpoint}`);
    console.error(`[EndpointTools] Folder ID: ${folderId}`);
    console.error(`[EndpointTools] Base URL: ${backendClient.getBaseUrl()}`);
    console.error(`[EndpointTools] Token: ${backendClient.getToken().substring(0, 20)}...`);
    console.error(`[EndpointTools] Request Body: ${requestBody}`);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let apiResponse;
    try {
      const result = await fetch(`${backendClient.getBaseUrl()}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${backendClient.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: requestBody,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!result.ok) {
        throw new Error(`HTTP ${result.status}: ${result.statusText}`);
      }

      const data = await result.json() as EndpointCreateResponse;

      apiResponse = {
        success: data.success,
        data: data.data,
        message: data.message,
        status: result.status
      };
    } catch (networkError) {
      clearTimeout(timeoutId);
      throw networkError;
    }

    if (!apiResponse.success) {
      let errorMessage = `Failed to create endpoint: ${apiResponse.message || 'Unknown error'}`;

      // Provide helpful error messages for common scenarios
      if (apiResponse.status === 404) {
        errorMessage = `Folder with ID '${folderId}' not found. Cannot create endpoint.\n\n`;
        errorMessage += `Please check:\n`;
        errorMessage += `• Folder ID '${folderId}' is correct\n`;
        errorMessage += `• You have access to this folder\n`;
        errorMessage += `• Folder exists in the project\n\n`;
        errorMessage += `Use get_folders to see available folders, or create a new folder first.`;
      } else if (apiResponse.status === 403) {
        errorMessage = `Access denied. You don't have permission to create endpoints in this folder.\n\n`;
        errorMessage += `Please check:\n`;
        errorMessage += `• You are a member of the project\n`;
        errorMessage += `• Your account has write permissions for this folder`;
      } else if (apiResponse.status === 400) {
        errorMessage = `Invalid endpoint data. Please check:\n`;
        errorMessage += `• Endpoint name is not empty\n`;
        errorMessage += `• URL is valid and properly formatted\n`;
        errorMessage += `• HTTP method is valid (GET, POST, PUT, DELETE, PATCH)\n`;
        errorMessage += `• Headers are valid JSON if provided`;
      }

      throw new Error(errorMessage);
    }

    if (apiResponse.success && apiResponse.data) {
      const createText = formatEndpointCreateText(apiResponse.data);

      return {
        content: [
          {
            type: 'text',
            text: createText
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to create endpoint: ${apiResponse.message || 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Endpoint creation error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}