import * as React from 'react';

import { useIsMobile } from '@/hooks/use-mobile';

// Konstanta untuk sidebar cookie dan keyboard shortcut
const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

export type SidebarState = 'expanded' | 'collapsed';

export interface UseSidebarStateProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface UseSidebarStateReturn {
  state: SidebarState;
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

/**
 * Custom hook untuk mengelola state sidebar
 * Handles desktop/mobile states, cookie persistence, dan keyboard shortcuts
 */
export function useSidebarState({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
}: UseSidebarStateProps = {}): UseSidebarStateReturn {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // State internal sidebar
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // Simpan state ke cookie untuk persistensi
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  // Helper untuk toggle sidebar (desktop/mobile)
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile(open => !open) : setOpen(open => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Keyboard shortcut untuk toggle sidebar (Ctrl/Cmd + B)
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // State untuk styling data-state attribute
  const state = open ? 'expanded' : 'collapsed';

  return {
    state,
    open,
    setOpen,
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar,
  };
}
