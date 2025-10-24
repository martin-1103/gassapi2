import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Project } from '@/types/api';

interface ProjectState {
  currentProject: Project | null;
}

interface ProjectActions {
  setCurrentProject: (project: Project | null) => void;
}

type ProjectStore = ProjectState & ProjectActions;

export const useProjectStore = create<ProjectStore>()(
  persist(
    set => ({
      // State
      currentProject: null,

      // Actions
      setCurrentProject: (project: Project | null) =>
        set({ currentProject: project }),
    }),
    {
      name: 'project-storage',
    },
  ),
);
