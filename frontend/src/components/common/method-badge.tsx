// import * as React from 'react'; // Removed unused React import

import Badge from '@/components/ui/badge';
import { cn } from '@/lib/utils/index';

interface MethodBadgeProps {
  method: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MethodBadge({ method, size = 'md' }: MethodBadgeProps) {
  const getMethodConfig = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return {
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'POST':
        return {
          variant: 'default' as const,
          className: 'bg-green-600 text-white',
        };
      case 'PUT':
        return {
          variant: 'outline' as const,
          className: 'bg-orange-100 text-orange-800 border-orange-200',
        };
      case 'PATCH':
        return {
          variant: 'outline' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      case 'DELETE':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-600 text-white',
        };
      case 'HEAD':
        return {
          variant: 'secondary' as const,
          className: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'OPTIONS':
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
      default:
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const config = getMethodConfig(method);
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  // Validate size prop to prevent injection
  const validSize =
    size === 'sm' || size === 'md' || size === 'lg' ? size : 'md';

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'font-mono font-semibold',
        config.className,
        sizeClasses[validSize],
      )}
    >
      {method.toUpperCase()}
    </Badge>
  );
}
