import React from 'react';

import { Progress } from '@/components/ui/progress';

interface ImportProgressProps {
  progress: number;
  isImporting: boolean;
}

export const ImportProgress: React.FC<ImportProgressProps> = ({
  progress,
  isImporting,
}) => {
  if (!isImporting) return null;

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between text-sm'>
        <span>Importing...</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className='h-2' />
    </div>
  );
};
