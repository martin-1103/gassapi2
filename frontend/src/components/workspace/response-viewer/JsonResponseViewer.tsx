import { ChevronDown, ChevronRight, Code, FileText } from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { highlightSearch, filterArray, filterObjectKeys } from '@/lib/response/response-search';
import { useResponseViewState } from '@/hooks/use-response-view-state';

interface JsonResponseViewerProps {
  data: any;
  formatMode: 'pretty' | 'raw';
  formattedData: string;
  searchQuery: string;
  lineNumbers: boolean;
  wrapLines: boolean;
  getSyntaxHighlighterClass: () => string;
}

export const JsonResponseViewer = ({
  data,
  formatMode,
  formattedData,
  searchQuery,
  lineNumbers,
  wrapLines,
  getSyntaxHighlighterClass,
}: JsonResponseViewerProps) => {
  const { expandedPaths, togglePath } = useResponseViewState();

  const renderTreeView = (
    data: any,
    path: string = 'root',
    level: number = 0,
    searchTerm: string = '',
  ) => {
    if (data === null) return <span className='text-purple-600'>null</span>;
    if (data === undefined) return <span className='text-purple-600'>undefined</span>;

    if (typeof data === 'string') {
      return (
        <span className='text-green-600'>
          "{searchTerm ? highlightSearch(data, searchTerm) : data}"
        </span>
      );
    }

    if (typeof data === 'number') {
      return <span className='text-blue-600'>{data}</span>;
    }

    if (typeof data === 'boolean') {
      return <span className='text-orange-600'>{data.toString()}</span>;
    }

    if (Array.isArray(data)) {
      const isExpanded = expandedPaths.has(path);
      const filteredData = searchTerm ? filterArray(data, searchTerm) : data;

      return (
        <div className={`${level > 0 ? 'ml-4' : ''}`}>
          <span
            className='cursor-pointer select-none hover:bg-muted/50 rounded p-1'
            onClick={() => togglePath(path)}
          >
            {isExpanded ? (
              <ChevronDown className='inline w-3 h-3 mr-1' />
            ) : (
              <ChevronRight className='inline w-3 h-3 mr-1' />
            )}
            <span className='text-gray-600'>[{filteredData.length}]</span>
            {filteredData.length < data.length && (
              <span className='text-yellow-600 ml-2'>
                ({data.length - filteredData.length} hidden)
              </span>
            )}
          </span>
          {isExpanded && filteredData.length > 0 && (
            <div className='mt-1 border-l-2 border-gray-200 ml-2'>
              {filteredData.map((item, index) => (
                <div key={index} className='ml-4'>
                  <span className='text-gray-500'>{index}:</span>
                  {renderTreeView(
                    item,
                    `${path}[${index}]`,
                    level + 1,
                    searchTerm,
                  )}
                  {index < filteredData.length - 1 && (
                    <span className='text-gray-400'>,</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof data === 'object') {
      const isExpanded = expandedPaths.has(path);
      const keys = Object.keys(data);
      const filteredKeys = searchTerm
        ? filterObjectKeys(data, searchTerm)
        : keys;

      return (
        <div className={`${level > 0 ? 'ml-4' : ''}`}>
          <span
            className='cursor-pointer select-none hover:bg-muted/50 rounded p-1'
            onClick={() => togglePath(path)}
          >
            {isExpanded ? (
              <ChevronDown className='inline w-3 h-3 mr-1' />
            ) : (
              <ChevronRight className='inline w-3 h-3 mr-1' />
            )}
            <span className='text-gray-600'>
              {'{' + filteredKeys.length + '}'}
            </span>
            {filteredKeys.length < keys.length && (
              <span className='text-yellow-600 ml-2'>
                ({keys.length - filteredKeys.length} hidden)
              </span>
            )}
          </span>
          {isExpanded && filteredKeys.length > 0 && (
            <div className='mt-1 border-l-2 border-gray-200 ml-2'>
              {filteredKeys.map(key => (
                <div key={key} className='ml-4'>
                  <span className='text-blue-600 font-mono'>
                    "{searchTerm &&
                    key.toLowerCase().includes(searchTerm.toLowerCase())
                      ? highlightSearch(key, searchTerm)
                      : key}":
                  </span>
                  {renderTreeView(
                    data[key],
                    `${path}.${key}`,
                    level + 1,
                    searchTerm,
                  )}
                  <span className='text-gray-400'>,</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Tabs defaultValue='tree' className='h-full flex flex-col'>
      <div className='px-4'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='tree' className='flex items-center gap-2'>
            <FileText className='w-4 h-4' />
            Tree
          </TabsTrigger>
          <TabsTrigger value='code' className='flex items-center gap-2'>
            <Code className='w-4 h-4' />
            Code
          </TabsTrigger>
        </TabsList>
      </div>

      <div className='flex-1 mt-4'>
        <TabsContent value='tree' className='h-full mt-0'>
          <ScrollArea className='h-full px-4'>
            <div className='font-mono text-sm'>
              {renderTreeView(data, 'root', 0, searchQuery)}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value='code' className='h-full mt-0'>
          <ScrollArea className='h-full px-4'>
            <pre
              className={`
                ${getSyntaxHighlighterClass()}
                ${lineNumbers ? 'line-numbers' : ''}
                ${wrapLines ? 'wrap-lines' : ''}
                text-xs
                p-4
                overflow-x-auto
                bg-background
                rounded
              `}
            >
              <code>{formattedData}</code>
            </pre>
          </ScrollArea>
        </TabsContent>
      </div>
    </Tabs>
  );
};