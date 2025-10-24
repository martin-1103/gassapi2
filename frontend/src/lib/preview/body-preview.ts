import React from 'react';
import { BodyData, getBodyPreview } from '@/lib/utils/body-utils';

interface BodyPreviewProps {
  bodyData: BodyData;
}

export const BodyPreview: React.FC<BodyPreviewProps> = ({ bodyData }) => {
  if (bodyData.type === 'none' || bodyData.type === 'binary') {
    return null;
  }

  return (
    <div className='p-4 border-t bg-muted/50'>
      <div className='text-sm text-muted-foreground mb-2'>Preview:</div>
      <pre className='text-xs bg-background p-2 rounded overflow-x-auto max-h-32'>
        {getBodyPreview(bodyData)}
      </pre>
    </div>
  );
};