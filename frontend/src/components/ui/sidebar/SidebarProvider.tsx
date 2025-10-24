import * as React from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils/index';

import { SidebarContext } from './context';
import type { SidebarContextProps } from './context';
import { useSidebarState } from './hooks/use-sidebar-state';

// Konstanta untuk sidebar styling
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_ICON = '3rem';

export interface SidebarProviderProps extends React.ComponentProps<'div'> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Provider component untuk sidebar state dan konteks
 * Menyediakan state management dan keyboard shortcuts untuk sidebar
 */
export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  SidebarProviderProps
>(
  (
    {
      defaultOpen = true,
      open,
      onOpenChange,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const sidebarState = useSidebarState({
      defaultOpen,
      open,
      onOpenChange,
    });

    const contextValue = React.useMemo<SidebarContextProps>(
      () => sidebarState,
      [sidebarState],
    );

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                '--sidebar-width': SIDEBAR_WIDTH,
                '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              'group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar',
              className,
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    );
  },
);

SidebarProvider.displayName = 'SidebarProvider';
