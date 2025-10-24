/**
 * @deprecated Import from "./sidebar/index" instead
 * File ini dipertahankan untuk backward compatibility
 * Semua komponen telah di-refactor menjadi modul-modul yang lebih kecil dan terfokus
 *
 * Rekomendasi:
 * Gunakan: import { Sidebar, SidebarProvider } from "@/components/ui/sidebar/index"
 * Jangan: import dari file ini langsung
 */

// Re-export dari index untuk menghindari circular import
export * from './sidebar/index';
