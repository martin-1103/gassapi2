import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import WorkspaceLayout from '@/components/workspace/workspace-layout';
import { projectsApi, collectionsApi } from '@/lib/api/endpoints';
import { useProjectStore } from '@/stores/projectStore';

export default function WorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const setCurrentProject = useProjectStore(state => state.setCurrentProject);

  // Fetch project detail
  const { data: projectResponse, isLoading: isLoadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const response = await projectsApi.get(projectId);
      return response.data;
    },
    enabled: !!projectId,
  });

  // Fetch collections
  const { isLoading: isLoadingCollections } = useQuery({
    queryKey: ['collections', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const response = await collectionsApi.list(projectId);
      return response.data;
    },
    enabled: !!projectId,
  });

  // Note: Environments query removed as it's unused currently
  // Can be re-added when environment features are implemented

  // Set current project in store
  useEffect(() => {
    if (projectResponse?.data) {
      setCurrentProject(projectResponse.data);
    }
  }, [projectResponse, setCurrentProject]);

  if (isLoadingProject || isLoadingCollections) {
    return (
      <div className='h-full flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    );
  }

  const project = projectResponse?.data;

  if (!project) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-gray-600'>Project tidak ditemukan</p>
      </div>
    );
  }

  return <WorkspaceLayout />;
}
