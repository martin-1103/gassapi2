import { Clock, Zap, Database } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ApiResponse } from '@/types/api';

interface TimelineTabProps {
  response: ApiResponse | null;
}

export const TimelineTab = ({ response }: TimelineTabProps) => {
  if (!response) {
    return (
      <div className='h-full flex items-center justify-center text-muted-foreground'>
        No response timeline to display
      </div>
    );
  }

  // Mock timeline data - in a real implementation, this would come from the response
  const timelineData = [
    { name: 'DNS Lookup', time: 5, color: 'bg-blue-500' },
    { name: 'TCP Connection', time: 15, color: 'bg-green-500' },
    { name: 'SSL/TLS Handshake', time: 20, color: 'bg-yellow-500' },
    { name: 'Server Processing', time: 50, color: 'bg-purple-500' },
    { name: 'Content Transfer', time: 30, color: 'bg-red-500' },
  ];

  const totalTime = timelineData.reduce((sum, item) => sum + item.time, 0);
  const totalResponseTime = response.time;
  const timeDifference = totalResponseTime - totalTime; // Account for any other overhead

  return (
    <Card className='p-4 h-full overflow-auto'>
      <div className='space-y-6'>
        <div>
          <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <Clock className='w-5 h-5' />
            Response Timeline
          </h3>

          <div className='space-y-4'>
            <div className='flex justify-between text-sm'>
              <span>Total Response Time</span>
              <span className='font-medium'>{response.time}ms</span>
            </div>

            <div className='space-y-2'>
              {timelineData.map((phase, index) => (
                <div key={index} className='space-y-1'>
                  <div className='flex justify-between text-sm'>
                    <span>{phase.name}</span>
                    <span>{phase.time}ms</span>
                  </div>
                  <Progress
                    value={(phase.time / totalResponseTime) * 100}
                    className='h-2'
                  />
                </div>
              ))}

              {timeDifference > 0 && (
                <div className='space-y-1'>
                  <div className='flex justify-between text-sm'>
                    <span>Other</span>
                    <span>{timeDifference}ms</span>
                  </div>
                  <Progress
                    value={(timeDifference / totalResponseTime) * 100}
                    className='h-2'
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-muted/50 p-3 rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <Zap className='w-4 h-4' />
              <span className='text-sm font-medium'>Performance</span>
            </div>
            <div className='text-2xl font-semibold'>{response.time}ms</div>
            <div className='text-xs text-muted-foreground'>
              Total response time
            </div>
          </div>

          <div className='bg-muted/50 p-3 rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <Database className='w-4 h-4' />
              <span className='text-sm font-medium'>Size</span>
            </div>
            <div className='text-2xl font-semibold'>{response.size} bytes</div>
            <div className='text-xs text-muted-foreground'>Transfer size</div>
          </div>
        </div>

        <div>
          <h3 className='text-lg font-semibold mb-3'>Status Information</h3>
          <div className='flex items-center gap-3'>
            <Badge variant='outline' className='text-lg px-3 py-1'>
              {response.status} {response.statusText}
            </Badge>
            <div className='text-sm text-muted-foreground'>
              {response.headers?.['content-type']?.split(';')[0] ||
                'unknown content type'}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
