import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const BinaryBodyEditor: React.FC = () => {
  return (
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
  );
};