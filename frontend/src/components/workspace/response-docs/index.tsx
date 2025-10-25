import { useState } from 'react';

import { useToast } from '@/hooks/use-toast';

import { DocumentationViewer } from './DocumentationViewer';
import { ExportManager } from './ExportManager';
import { SchemaGenerator } from './SchemaGenerator';
import { ResponseDocsTabProps } from './types';
import {
  generateMarkdownDocumentation,
  copyToClipboard,
  downloadDocumentation,
} from './utils/export-utils';
import { generateSchemaFromResponse } from './utils/schema-utils';

/**
 * Komponen ResponseDocsTab yang telah direfaktor
 * Memisahkan responsibility menjadi beberapa komponen terfokus
 */
export function ResponseDocsTab({
  response,
  requestInfo,
}: ResponseDocsTabProps) {
  const [showSchema, setShowSchema] = useState(false);
  const [activeSection, setActiveSection] = useState('viewer');
  const { toast } = useToast();

  // Generate endpoint documentation dari request dan response
  const generateEndpointDocumentation = () => {
    if (!requestInfo || !response) {
      return {
        method: 'GET',
        url: '/example',
        responses: {
          '200': {
            description: 'Success response',
            content: {
              'application/json': {
                schema: {
                  type: 'object' as const,
                  properties: {},
                },
              },
            },
          },
        },
      };
    }

    const method = requestInfo.method.toUpperCase();
    const url = new URL(requestInfo.url);
    const contentType =
      requestInfo.headers['content-type'] ||
      response.headers['content-type'] ||
      'application/json';

    const endpoint = {
      method: method,
      url: url.pathname + url.search,
      description: `Auto-generated documentation for ${method} ${url.pathname}`,
      parameters: [] as Array<{
        name: string;
        in: 'query' | 'path' | 'header';
        required: boolean;
        type: string;
        description?: string;
      }>,
      responses: {
        [response.status.toString()]: {
          description: response.statusText || 'Response',
          content: {
            [contentType]: {
              schema: generateSchemaFromResponse(response.data),
            },
          },
        },
      },
    };

    // Extract query parameters
    url.searchParams.forEach((value, key) => {
      endpoint.parameters?.push({
        name: key,
        in: 'query',
        required: false,
        type: typeof value === 'string' ? 'string' : typeof value,
        description: `Query parameter: ${key}`,
      });
    });

    return endpoint;
  };

  const endpoint = generateEndpointDocumentation();

  // Event handlers
  const handleCopySchema = async () => {
    // Delegate ke DocumentationViewer
  };

  const handleCopyDocumentation = async () => {
    try {
      const docs = {
        endpoint,
        response,
        request: requestInfo,
        generatedAt: new Date().toISOString(),
      };
      const docsText = JSON.stringify(docs, null, 2);
      await copyToClipboard(docsText);
      toast({
        title: 'Documentation Disalin',
        description: 'API documentation berhasil disalin ke clipboard',
      });
    } catch {
      toast({
        title: 'Gagal Menyalin',
        description: 'Tidak dapat menyalin documentation',
        variant: 'destructive',
      });
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      const markdown = generateMarkdownDocumentation(endpoint);
      await copyToClipboard(markdown);
      toast({
        title: 'Markdown Disalin',
        description: 'API documentation berhasil disalin sebagai Markdown',
      });
    } catch {
      toast({
        title: 'Gagal Menyalin',
        description: 'Tidak dapat menyalin Markdown',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    try {
      const docs = {
        endpoint,
        response,
        request: requestInfo,
        generatedAt: new Date().toISOString(),
      };
      downloadDocumentation(docs);
      toast({
        title: 'Documentation Diunduh',
        description: 'API documentation berhasil diunduh',
      });
    } catch {
      toast({
        title: 'Gagal Mengunduh',
        description: 'Tidak dapat mengunduh documentation',
        variant: 'destructive',
      });
    }
  };

  const handleToggleSchema = () => {
    setShowSchema(!showSchema);
  };

  return (
    <div className='h-full'>
      {/* Section Navigation */}
      <div className='border-b p-4'>
        <div className='flex gap-2'>
          <button
            onClick={() => setActiveSection('viewer')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'viewer'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Documentation
          </button>
          <button
            onClick={() => setActiveSection('schema')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'schema'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Schema Details
          </button>
          <button
            onClick={() => setActiveSection('export')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'export'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Export & Examples
          </button>
        </div>
      </div>

      {/* Section Content */}
      <div className='h-[calc(100%-73px)]'>
        {activeSection === 'viewer' && (
          <DocumentationViewer
            endpoint={endpoint}
            response={response}
            showSchema={showSchema}
            onToggleSchema={handleToggleSchema}
            onCopySchema={handleCopySchema}
            onCopyDocs={handleCopyDocumentation}
            onCopyMarkdown={handleCopyMarkdown}
            onDownload={handleDownload}
          />
        )}

        {activeSection === 'schema' && (
          <div className='h-full p-4'>
            <div className='h-full bg-card rounded-lg border'>
              <SchemaGenerator
                endpoint={endpoint}
                showSchema={showSchema}
                onCopySchema={handleCopySchema}
              />
            </div>
          </div>
        )}

        {activeSection === 'export' && (
          <div className='h-full p-4'>
            <div className='h-full bg-card rounded-lg border'>
              <ExportManager
                endpoint={endpoint}
                response={response}
                requestInfo={requestInfo}
                onCopyDocumentation={handleCopyDocumentation}
                onCopyMarkdown={handleCopyMarkdown}
                onDownload={handleDownload}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
