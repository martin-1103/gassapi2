import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Tab {
  id: string;
  type: 'endpoint' | 'flow' | 'collection';
  title: string;
  data?: Record<string, unknown>;
}

interface WorkspaceState {
  sidebarCollapsed: boolean;
  activeTabId: string | null;
  openTabs: Tab[];
}

interface WorkspaceActions {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openTab: (tab: Tab) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  closeAllTabs: () => void;
}

type WorkspaceStore = WorkspaceState & WorkspaceActions;

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      // State
      sidebarCollapsed: false,
      activeTabId: null,
      openTabs: [],

      // Actions
      toggleSidebar: () =>
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed: boolean) =>
        set({ sidebarCollapsed: collapsed }),

      openTab: (tab: Tab) => {
        const { openTabs } = get();
        const existingTab = openTabs.find(t => t.id === tab.id);

        if (existingTab) {
          // Tab sudah ada, set sebagai active
          set({ activeTabId: tab.id });
        } else {
          // Tambah tab baru
          set({
            openTabs: [...openTabs, tab],
            activeTabId: tab.id,
          });
        }
      },

      closeTab: (tabId: string) => {
        const { openTabs, activeTabId } = get();
        const newTabs = openTabs.filter(t => t.id !== tabId);

        let newActiveId = activeTabId;
        if (activeTabId === tabId) {
          // Kalau tab yang ditutup adalah active tab, pilih tab sebelah
          const closedIndex = openTabs.findIndex(t => t.id === tabId);
          if (newTabs.length > 0) {
            const newIndex = closedIndex > 0 ? closedIndex - 1 : 0;
            // Validate array index to prevent injection
            if (newIndex >= 0 && newIndex < newTabs.length) {
              newActiveId = newTabs[newIndex]?.id || null;
            } else {
              newActiveId = newTabs[0]?.id || null;
            }
          } else {
            newActiveId = null;
          }
        }

        set({
          openTabs: newTabs,
          activeTabId: newActiveId,
        });
      },

      setActiveTab: (tabId: string) => set({ activeTabId: tabId }),

      closeAllTabs: () => set({ openTabs: [], activeTabId: null }),
    }),
    {
      name: 'workspace-storage',
    },
  ),
);
