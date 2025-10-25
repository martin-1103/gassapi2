/**
 * @deprecated Import from "./sidebar/index" instead
 * File ini dipertahankan untuk backward compatibility
 * Semua komponen telah di-refactor menjadi modul-modul yang lebih kecil dan terfokus
 *
 * Rekomendasi:
 * Gunakan: import { Sidebar, SidebarProvider } from "@/components/ui/sidebar/index"
 * Jangan: import dari file ini langsung
 */

// Re-export komponen saja untuk React Fast Refresh
export { Sidebar } from './sidebar/index';
export { SidebarProvider } from './sidebar/index';
export {
  SidebarInset,
  SidebarInput,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarContent,
} from './sidebar/index';
export { SidebarTrigger } from './sidebar/index';
export { SidebarRail } from './sidebar/index';
export {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
} from './sidebar/index';
export {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
} from './sidebar/index';
export {
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from './sidebar/index';
