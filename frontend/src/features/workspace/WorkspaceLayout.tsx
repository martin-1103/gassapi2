import { Plus } from 'lucide-react';
import { useState } from 'react';

import CreateEnvironmentModal from '@/features/environments/CreateEnvironmentModal';
import type { Project, Collection, Environment } from '@/types/api';

import CollectionsSidebar from './CollectionsSidebar';
import WorkspaceTabs from './WorkspaceTabs';

interface WorkspaceLayoutProps {
  project: Project;
  collections: Collection[];
  environments: Environment[];
}

export default function WorkspaceLayout({
  project,
  collections,
  environments,
}: WorkspaceLayoutProps) {
  const [selectedEnvironment, setSelectedEnvironment] =
    useState<Environment | null>(
      environments.find(env => env.is_default) || environments[0] || null,
    );
  const [showCreateEnvModal, setShowCreateEnvModal] = useState(false);

  return (
    <div className='h-full flex'>
      {/* Collections Sidebar */}
      <CollectionsSidebar projectId={project.id} collections={collections} />

      {/* Main content area dengan tabs */}
      <div className='flex-1 flex flex-col bg-gray-50'>
        {/* Environment selector bar */}
        <div className='bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-4'>
          <span className='text-sm text-gray-600'>Environment:</span>
          {environments.length > 0 ? (
            <select
              value={selectedEnvironment?.id || ''}
              onChange={e => {
                const env = environments.find(env => env.id === e.target.value);
                setSelectedEnvironment(env || null);
              }}
              className='px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              {environments.map(env => (
                <option key={env.id} value={env.id}>
                  {env.name} {env.is_default && '(Default)'}
                </option>
              ))}
            </select>
          ) : (
            <span className='text-sm text-gray-500'>Belum ada environment</span>
          )}
          <button
            onClick={() => setShowCreateEnvModal(true)}
            className='ml-auto flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors'
          >
            <Plus className='w-4 h-4' />
            <span>Buat Environment</span>
          </button>
        </div>

        {/* Tabs dan content */}
        <WorkspaceTabs
          projectId={project.id}
          selectedEnvironment={selectedEnvironment}
        />
      </div>

      {/* Create Environment Modal */}
      {showCreateEnvModal && (
        <CreateEnvironmentModal
          projectId={project.id}
          onClose={() => setShowCreateEnvModal(false)}
        />
      )}
    </div>
  );
}
