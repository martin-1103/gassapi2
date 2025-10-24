import { Terminal } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ConsoleFilterProps {
  activeTab: string;
  searchQuery: string;
  onTabChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export default function ConsoleFilter({
  activeTab,
  searchQuery,
  onTabChange,
  onSearchChange,
}: ConsoleFilterProps) {
  return (
    <>
      {/* Log Level Tabs */}
      <div className='px-4 pt-4'>
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className='grid w-full grid-cols-6'>
            <TabsTrigger value='all'>All</TabsTrigger>
            <TabsTrigger value='info'>Info</TabsTrigger>
            <TabsTrigger value='warn'>Warning</TabsTrigger>
            <TabsTrigger value='error'>Error</TabsTrigger>
            <TabsTrigger value='debug'>Debug</TabsTrigger>
            <TabsTrigger value='log'>Log</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Search Bar */}
      <div className='px-4 mb-4'>
        <div className='flex items-center gap-2'>
          <Terminal className='w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Search console logs...'
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className='w-64 h-8'
          />
        </div>
      </div>
    </>
  );
}
