import * as React from 'react';

import { cn } from '@/lib/utils/index';

import { badgeVariants, type BadgeVariants } from './badge-variants';

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    BadgeVariants {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// Export component both as default and named
export { Badge };
export default Badge;

// Export variant types separately
// BadgeProps is already exported above in the interface declaration
