import { X, Plus } from 'lucide-react';

import EndpointBuilder from '@/features/endpoints/EndpointBuilder';
import { cn } from '@/lib/utils/cn';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import type { Environment } from '@/types/api';

interface WorkspaceTabsProps {
  projectId: string;
  selectedEnvironment: Environment | null;
}

export default function WorkspaceTabs({
  selectedEnvironment,
}: WorkspaceTabsProps) {
  const openTabs = useWorkspaceStore(state => state.openTabs);
  const activeTabId = useWorkspaceStore(state => state.activeTabId);
  const setActiveTab = useWorkspaceStore(state => state.setActiveTab);
  const closeTab = useWorkspaceStore(state => state.closeTab);

  const activeTab = openTabs.find(tab => tab.id === activeTabId);

  return (
    <div className='flex-1 flex flex-col overflow-hidden'>
      {/* Tabs bar */}
      {openTabs.length > 0 && (
        <div className='bg-white border-b border-gray-200 flex items-center overflow-x-auto'>
          {openTabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 border-r border-gray-200 cursor-pointer group',
                activeTabId === tab.id
                  ? 'bg-gray-50 border-b-2 border-b-blue-600'
                  : 'hover:bg-gray-50',
              )}
            >
              <span className='text-sm font-medium text-gray-900 truncate max-w-[150px]'>
                {tab.title}
              </span>
              <button
                onClick={e => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className='p-0.5 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity'
              >
                <X className='w-3 h-3' />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab content */}
      <div className='flex-1 overflow-hidden'>
        {activeTab ? (
          <div className='h-full'>
            {activeTab.type === 'endpoint' && (
              <EndpointBuilder
                endpoint={activeTab.data}
                environment={selectedEnvironment}
              />
            )}
            {activeTab.type === 'flow' && (
              <div className='h-full flex items-center justify-center text-gray-500'>
                Flow editor (belum diimplementasi)
              </div>
            )}
          </div>
        ) : (
          <div className='h-full flex items-center justify-center'>
            <div className='text-center text-gray-500'>
              <Plus className='w-12 h-12 mx-auto mb-2 text-gray-400' />
              <p>Pilih atau buat endpoint dari sidebar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
