// Main sidebar components only for React Fast Refresh
export { Sidebar } from './Sidebar';
export { SidebarProvider } from './SidebarProvider';

// Layout components
export {
  SidebarInset,
  SidebarInput,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarContent,
} from './SidebarLayout';

// Interactive components
export { SidebarTrigger } from './SidebarTrigger';
export { SidebarRail } from './SidebarRail';

// Group components
export {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
} from './SidebarGroup';

// Menu components
export {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
} from './SidebarMenu';

// Menu extras
export {
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from './SidebarMenuExtras';

// Re-export types
export type { SidebarProps, SidebarProviderProps } from './Sidebar';

export type {
  UseSidebarStateProps,
  UseSidebarStateReturn,
  SidebarState,
} from './hooks/use-sidebar-state';
