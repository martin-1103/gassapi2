import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
// import * as React from 'react'; // Removed unused React import

import Badge from '@/components/ui/badge';
import { cn } from '@/lib/utils/index';

interface StatusBadgeProps {
  status: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function StatusBadge({
  status,
  size = 'md',
  showText = false,
}: StatusBadgeProps) {
  const getStatusInfo = (status: number) => {
    if (status >= 200 && status < 300) {
      return {
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 border-green-200',
        label: 'Success',
        icon: CheckCircle,
      };
    } else if (status >= 300 && status < 400) {
      return {
        variant: 'secondary' as const,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Redirect',
        icon: Clock,
      };
    } else if (status >= 400 && status < 500) {
      return {
        variant: 'outline' as const,
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        label: 'Client Error',
        icon: XCircle,
      };
    } else if (status >= 500) {
      return {
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800 border-red-200',
        label: 'Server Error',
        icon: XCircle,
      };
    }
    return {
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      label: 'Unknown',
      icon: AlertCircle,
    };
  };

  const { variant, className, label, icon: Icon } = getStatusInfo(status);
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  // Validate size prop to prevent injection
  const validSize =
    size === 'sm' || size === 'md' || size === 'lg' ? size : 'md';

  return (
    <div className='flex items-center gap-2'>
      <Badge
        variant={variant}
        className={cn(
          sizeClasses[validSize],
          className,
          'flex items-center gap-1',
        )}
      >
        <Icon className='w-3 h-3' />
        {status}
      </Badge>
      {showText && (
        <span className='text-sm text-muted-foreground'>{label}</span>
      )}
    </div>
  );
}
