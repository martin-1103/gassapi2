// import * as React from 'react'; // Removed unused React import

import Badge from '@/components/ui/badge';
import { cn } from '@/lib/utils/index';

interface TimeDisplayProps {
  time: number; // in milliseconds
  showDetailed?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function TimeDisplay({
  time,
  showDetailed = false,
  size = 'md',
}: TimeDisplayProps) {
  const formatTime = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)}s`;
    } else {
      const minutes = Math.floor(ms / 60000);
      const seconds = ((ms % 60000) / 1000).toFixed(2);
      return `${minutes}m ${seconds}s`;
    }
  };

  const getPerformanceColor = (ms: number) => {
    if (ms < 200) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (ms < 1000) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else {
      return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const colorClass = getPerformanceColor(time);
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  // Validate size prop to prevent injection
  const validSize =
    size === 'sm' || size === 'md' || size === 'lg' ? size : 'md';

  const getPerformanceLabel = (ms: number) => {
    if (ms < 200) return 'Fast';
    if (ms < 1000) return 'Normal';
    return 'Slow';
  };

  if (showDetailed) {
    return (
      <div className='flex items-center gap-2'>
        <Badge
          variant='outline'
          className={cn(
            sizeClasses[validSize],
            colorClass,
            'flex items-center gap-1',
          )}
        >
          <span className='font-mono'>{formatTime(time)}</span>
        </Badge>
        <span className='text-xs text-muted-foreground'>
          {getPerformanceLabel(time)}
        </span>
      </div>
    );
  }

  return (
    <Badge
      variant='outline'
      className={cn(sizeClasses[validSize], colorClass, 'font-mono')}
    >
      {formatTime(time)}
    </Badge>
  );
}
