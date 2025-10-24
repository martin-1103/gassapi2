import { Upload, FileText, Binary, Code, Plus } from 'lucide-react';
import { useState } from 'react';

import { CodeEditor } from '@/components/common/code-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface BodyData {
  type:
    | 'none'
    | 'form-data'
    | 'x-www-form-urlencoded'
    | 'raw'
    | 'binary'
    | 'graphql';
  rawType: 'text' | 'javascript' | 'json' | 'html' | 'xml';
  formData: Array<{
    id: string;
    key: string;
    value: string;
    type: 'text' | 'file';
    enabled: boolean;
  }>;
  rawContent: string;
  graphqlQuery: string;
  graphqlVariables: string;
  binaryFile?: File;
}

interface RequestBodyTabProps {
  bodyData: BodyData;
  onChange: (bodyData: BodyData) => void;
}

export function RequestBodyTab({ bodyData, onChange }: RequestBodyTabProps) {
  const updateBodyType = (type: BodyData['type']) => {
    onChange({ ...bodyData, type });
  };

  const updateRawType = (rawType: BodyData['rawType']) => {
    onChange({ ...bodyData, rawType });
  };

  const updateRawContent = (content: string) => {
    onChange({ ...bodyData, rawContent: content });
  };

  const updateGraphQLQuery = (query: string) => {
    onChange({ ...bodyData, graphqlQuery: query });
  };

  const updateGraphQLVariables = (variables: string) => {
    onChange({ ...bodyData, graphqlVariables: variables });
  };

  const addFormField = () => {
    const newField = {
      id: Date.now().toString(),
      key: '',
      value: '',
      type: 'text' as const,
      enabled: true,
    };
    onChange({ ...bodyData, formData: [...bodyData.formData, newField] });
  };

  const updateFormField = (id: string, updates: any) => {
    onChange({
      ...bodyData,
      formData: bodyData.formData.map(field =>
        field.id === id ? { ...field, ...updates } : field,
      ),
    });
  };

  const deleteFormField = (id: string) => {
    onChange({
      ...bodyData,
      formData: bodyData.formData.filter(field => field.id !== id),
    });
  };

  const handleFileUpload = (id: string, file: File) => {
    updateFormField(id, { value: file.name });
  };

  const getContentType = () => {
    switch (bodyData.type) {
      case 'form-data':
        return 'multipart/form-data';
      case 'x-www-form-urlencoded':
        return 'application/x-www-form-urlencoded';
      case 'raw':
        switch (bodyData.rawType) {
          case 'json':
            return 'application/json';
          case 'xml':
            return 'application/xml';
          case 'html':
            return 'text/html';
          case 'javascript':
            return 'application/javascript';
          default:
            return 'text/plain';
        }
      case 'graphql':
        return 'application/json';
      case 'binary':
        return 'application/octet-stream';
      default:
        return null;
    }
  };

  const getBodyPreview = () => {
    switch (bodyData.type) {
      case 'form-data':
        return bodyData.formData
          .filter(item => item.enabled)
          .map(item => `${item.key}: ${item.value || '(file)'}`)
          .join('\n');
      case 'x-www-form-urlencoded':
        return bodyData.formData
          .filter(item => item.enabled)
          .map(
            item =>
              `${encodeURIComponent(item.key)}=${encodeURIComponent(item.value)}`,
          )
          .join('&');
      case 'raw':
        return bodyData.rawContent;
      case 'graphql':
        return JSON.stringify(
          {
            query: bodyData.graphqlQuery,
            variables: bodyData.graphqlVariables
              ? JSON.parse(bodyData.graphqlVariables)
              : {},
          },
          null,
          2,
        );
      default:
        return 'No body';
    }
  };

  return (
    <TooltipProvider>
      <div className='h-full flex flex-col'>
        {/* Body Type Selector */}
        <div className='flex items-center justify-between p-4 border-b'>
          <div className='flex items-center gap-4'>
            <h3 className='font-semibold'>Body</h3>
            {getContentType() && (
              <Badge variant='outline'>{getContentType()}</Badge>
            )}
          </div>

          <Select value={bodyData.type} onValueChange={updateBodyType}>
            <SelectTrigger className='w-48'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='none'>none</SelectItem>
              <SelectItem value='form-data'>form-data</SelectItem>
              <SelectItem value='x-www-form-urlencoded'>
                x-www-form-urlencoded
              </SelectItem>
              <SelectItem value='raw'>raw</SelectItem>
              <SelectItem value='binary'>binary</SelectItem>
              <SelectItem value='graphql'>GraphQL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Body Content */}
        <div className='flex-1 p-4'>
          {bodyData.type === 'none' && (
            <div className='h-full flex items-center justify-center text-muted-foreground'>
              <div className='text-center'>
                <FileText className='w-12 h-12 mx-auto mb-4 opacity-50' />
                <p className='text-lg mb-2'>
                  This request does not have a body
                </p>
                <p className='text-sm'>
                  Select a body type to add request data
                </p>
              </div>
            </div>
          )}

          {bodyData.type === 'raw' && (
            <div className='h-full flex flex-col'>
              <div className='flex items-center justify-between mb-4'>
                <Select value={bodyData.rawType} onValueChange={updateRawType}>
                  <SelectTrigger className='w-32'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='text'>Text</SelectItem>
                    <SelectItem value='javascript'>JavaScript</SelectItem>
                    <SelectItem value='json'>JSON</SelectItem>
                    <SelectItem value='html'>HTML</SelectItem>
                    <SelectItem value='xml'>XML</SelectItem>
                  </SelectContent>
                </Select>

                <div className='text-sm text-muted-foreground'>
                  {getContentType()}
                </div>
              </div>

              <div className='flex-1'>
                <CodeEditor
                  value={bodyData.rawContent}
                  onChange={updateRawContent}
                  language={
                    bodyData.rawType === 'javascript'
                      ? 'javascript'
                      : bodyData.rawType === 'xml'
                        ? 'xml'
                        : bodyData.rawType === 'html'
                          ? 'html'
                          : 'json'
                  }
                  placeholder='Enter request body...'
                  rows={20}
                />
              </div>
            </div>
          )}

          {bodyData.type === 'form-data' && (
            <div className='h-full'>
              <div className='flex items-center justify-between mb-4'>
                <h4 className='font-medium'>Form Data</h4>
                <Button size='sm' onClick={addFormField}>
                  <Plus className='w-4 h-4 mr-2' />
                  Add Field
                </Button>
              </div>

              {bodyData.formData.length === 0 ? (
                <div className='flex flex-col items-center justify-center h-full text-muted-foreground'>
                  <Plus className='w-8 h-8 mb-2 opacity-50' />
                  <p>No form fields added</p>
                  <p className='text-sm'>
                    Click "Add Field" to create form data
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-12'>Enabled</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className='w-20'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bodyData.formData.map(field => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <Checkbox
                            checked={field.enabled}
                            onCheckedChange={checked =>
                              updateFormField(field.id, { enabled: !!checked })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type='text'
                            placeholder='Key'
                            value={field.key}
                            onChange={e =>
                              updateFormField(field.id, { key: e.target.value })
                            }
                            className='font-mono text-sm'
                          />
                        </TableCell>
                        <TableCell>
                          {field.type === 'text' ? (
                            <Input
                              type='text'
                              placeholder='Value'
                              value={field.value}
                              onChange={e =>
                                updateFormField(field.id, {
                                  value: e.target.value,
                                })
                              }
                              className='font-mono text-sm'
                            />
                          ) : (
                            <div className='flex items-center gap-2'>
                              <Input
                                type='file'
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(field.id, file);
                                }}
                                className='text-sm'
                              />
                              {field.value && (
                                <span className='text-xs text-muted-foreground'>
                                  {field.value}
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={field.type}
                            onValueChange={(type: 'text' | 'file') =>
                              updateFormField(field.id, { type })
                            }
                          >
                            <SelectTrigger className='w-24'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='text'>Text</SelectItem>
                              <SelectItem value='file'>File</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => deleteFormField(field.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {bodyData.type === 'binary' && (
            <div className='h-full flex items-center justify-center'>
              <Card className='w-96'>
                <CardContent className='pt-6'>
                  <div className='text-center'>
                    <Upload className='w-12 h-12 mx-auto mb-4 text-muted-foreground' />
                    <h4 className='text-lg font-semibold mb-2'>Select File</h4>
                    <p className='text-sm text-muted-foreground mb-4'>
                      Choose a file to send as binary data
                    </p>
                    <Button className='w-full'>
                      <Upload className='w-4 h-4 mr-2' />
                      Choose File
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {bodyData.type === 'graphql' && (
            <div className='h-full'>
              <Tabs defaultValue='query' className='h-full flex flex-col'>
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='query'>QUERY</TabsTrigger>
                  <TabsTrigger value='variables'>VARIABLES</TabsTrigger>
                </TabsList>

                <div className='flex-1 mt-4'>
                  <TabsContent value='query' className='h-full'>
                    <CodeEditor
                      value={bodyData.graphqlQuery}
                      onChange={updateGraphQLQuery}
                      language='javascript'
                      placeholder='query {\n  users {\n    id\n    name\n  }\n}'
                      rows={15}
                    />
                  </TabsContent>

                  <TabsContent value='variables' className='h-full'>
                    <CodeEditor
                      value={bodyData.graphqlVariables}
                      onChange={updateGraphQLVariables}
                      language='json'
                      placeholder='{\n  "limit": 10\n}'
                      rows={10}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </div>

        {/* Preview */}
        {bodyData.type !== 'none' && bodyData.type !== 'binary' && (
          <div className='p-4 border-t bg-muted/50'>
            <div className='text-sm text-muted-foreground mb-2'>Preview:</div>
            <pre className='text-xs bg-background p-2 rounded overflow-x-auto max-h-32'>
              {getBodyPreview()}
            </pre>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
