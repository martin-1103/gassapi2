import { Terminal } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { ConsoleStats as ConsoleStatsType } from '@/lib/console/console-utils';

interface ConsoleStatsComponentProps {
  stats: ConsoleStatsType;
  totalEntries: number;
}

export default function ConsoleStats({
  stats,
  totalEntries,
}: ConsoleStatsComponentProps) {
  return (
    <div className='flex items-center gap-3'>
      <h3 className='font-semibold flex items-center gap-2'>
        <Terminal className='w-5 h-5' />
        Console
      </h3>
      <Badge variant='outline'>{totalEntries} entries</Badge>

      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        <span>Total: {stats.total}</span>
        <span className='text-green-600'>{stats.info} info</span>
        <span className='text-yellow-600'>{stats.warn} warn</span>
        <span className='text-red-600'>{stats.error} error</span>
        <span className='text-purple-600'>{stats.debug} debug</span>
        <span className='text-gray-600'>{stats.log} log</span>
      </div>
    </div>
  );
}
