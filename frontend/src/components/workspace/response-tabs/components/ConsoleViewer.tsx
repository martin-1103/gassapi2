import {
  AlertCircle,
  List,
} from 'lucide-react';
import * as React from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';

import type { ConsoleEntry } from '../types';
import { getConsoleIcon, getConsoleColor, formatConsoleMessage } from '../utils';

interface ConsoleViewerProps {
  console: ConsoleEntry[];
}

/**
 * Komponen untuk menampilkan console output dari test execution
 * Menampilkan log, info, warning, error, dan debug messages
 */
export function ConsoleViewer({ console }: ConsoleViewerProps) {
  return (
    <ScrollArea className='h-full'>
      <div className='space-y-2'>
        {console.length === 0 ? (
          <div className='text-center text-muted-foreground py-8'>
            <List className='w-12 h-12 mx-auto mb-4 opacity-50' />
            <h3 className='text-lg font-semibold mb-2'>
              No Console Output
            </h3>
            <p className='text-sm'>
              Test scripts console output will appear here
            </p>
          </div>
        ) : (
          console.map((entry, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${getConsoleColor(entry.level)}`}
            >
              <div className='flex items-start gap-2'>
                {getConsoleIcon(entry.level)}
                <div className='flex-1'>
                  <div className='font-mono text-xs mb-1'>
                    {formatConsoleMessage(entry)}
                  </div>
                  {entry.data && (
                    <div className='text-xs mt-1 font-mono bg-black/5 p-2 rounded'>
                      {typeof entry.data === 'string'
                        ? entry.data
                        : JSON.stringify(entry.data, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}