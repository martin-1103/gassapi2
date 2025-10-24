import { useQuery } from '@tanstack/react-query';
import { FolderOpen, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { projectsApi } from '@/lib/api/endpoints';
import { useAuthStore } from '@/stores/authStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  const { data: projectsResponse, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsApi.list();
      return response.data;
    },
  });

  const projects = projectsResponse?.data || [];

  return (
    <div className='p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>
          Halo, {user?.name || 'User'}! 👋
        </h1>
        <p className='text-gray-600 mt-2'>
          Selamat datang di GASS API. Pilih atau buat project untuk mulai
          testing API.
        </p>
      </div>

      <div className='bg-white rounded-lg shadow-sm p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-semibold text-gray-900'>Projects Kamu</h2>
          <button
            onClick={() => navigate('/projects')}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            <Plus className='w-4 h-4' />
            <span>Project Baru</span>
          </button>
        </div>

        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
          </div>
        ) : projects.length === 0 ? (
          <div className='text-center py-12'>
            <FolderOpen className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-600 mb-4'>Belum ada project nih</p>
            <button
              onClick={() => navigate('/projects')}
              className='text-blue-600 hover:text-blue-700 font-medium'
            >
              Buat project pertama →
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {projects.map(project => (
              <div
                key={project.id}
                onClick={() => navigate(`/workspace/${project.id}`)}
                className='p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md cursor-pointer transition-all'
              >
                <div className='flex items-start gap-3'>
                  <FolderOpen className='w-5 h-5 text-blue-600 flex-shrink-0 mt-1' />
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-semibold text-gray-900 truncate'>
                      {project.name}
                    </h3>
                    <p className='text-sm text-gray-500 mt-1 line-clamp-2'>
                      {project.description || 'Tidak ada deskripsi'}
                    </p>
                    <p className='text-xs text-gray-400 mt-2'>
                      {new Date(project.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
