import * as React from 'react';

import { SidebarContext } from '../context';
import type { SidebarContextProps } from '../context';

/**
 * Hook untuk menggunakan sidebar context
 * @throws Error jika digunakan di luar SidebarProvider
 */
export function useSidebar(): SidebarContextProps {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}
