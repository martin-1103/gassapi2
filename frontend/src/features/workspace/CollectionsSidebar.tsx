import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collectionsApi, endpointsApi } from '@/lib/api/endpoints'
import type { Collection } from '@/types/api'
import { FolderOpen, Plus, ChevronRight, ChevronDown, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import CreateEndpointModal from '@/features/endpoints/CreateEndpointModal'

interface CollectionsSidebarProps {
  projectId: string
  collections: Collection[]
}

export default function CollectionsSidebar({
  projectId,
  collections,
}: CollectionsSidebarProps) {
  const queryClient = useQueryClient()
  const openTab = useWorkspaceStore((state) => state.openTab)
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(
    new Set(collections.map((c) => c.id))
  )
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [showCreateEndpointModal, setShowCreateEndpointModal] = useState<string | null>(null)

  // Create collection mutation
  const createCollectionMutation = useMutation({
    mutationFn: (name: string) =>
      collectionsApi.create(projectId, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections', projectId] })
      toast.success('Collection berhasil dibuat!')
      setShowCreateModal(false)
      setNewCollectionName('')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat collection')
    },
  })

  const toggleExpand = (collectionId: string) => {
    setExpandedCollections((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId)
      } else {
        newSet.add(collectionId)
      }
      return newSet
    })
  }

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCollectionName.trim()) {
      toast.error('Nama collection harus diisi')
      return
    }
    createCollectionMutation.mutate(newCollectionName)
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Collections</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Buat collection baru"
        >
          <Plus className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Collections tree */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {collections.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Belum ada collection.<br />
            Klik + untuk membuat.
          </div>
        ) : (
          collections.map((collection) => (
            <CollectionItem
              key={collection.id}
              collection={collection}
              projectId={projectId}
              isExpanded={expandedCollections.has(collection.id)}
              onToggleExpand={toggleExpand}
              onOpenTab={openTab}
              onCreateEndpoint={() => setShowCreateEndpointModal(collection.id)}
            />
          ))
        )}
      </div>

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Collection Baru
            </h2>

            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Collection *
                </label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: User API"
                  autoFocus
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewCollectionName('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createCollectionMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createCollectionMutation.isPending ? 'Membuat...' : 'Buat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Endpoint Modal */}
      {showCreateEndpointModal && (
        <CreateEndpointModal
          collectionId={showCreateEndpointModal}
          onClose={() => setShowCreateEndpointModal(null)}
          onSuccess={(endpoint) => {
            openTab({
              id: endpoint.id,
              type: 'endpoint',
              title: endpoint.name,
              data: endpoint,
            })
          }}
        />
      )}
    </div>
  )
}

// Collection item component with endpoints
function CollectionItem({
  collection,
  isExpanded,
  onToggleExpand,
  onOpenTab,
  onCreateEndpoint,
}: {
  collection: Collection
  projectId: string
  isExpanded: boolean
  onToggleExpand: (id: string) => void
  onOpenTab: (tab: any) => void
  onCreateEndpoint: () => void
}) {
  const { data: endpointsResponse } = useQuery({
    queryKey: ['endpoints', collection.id],
    queryFn: async () => {
      const response = await endpointsApi.list(collection.id)
      return response.data
    },
    enabled: isExpanded,
  })

  const endpoints = endpointsResponse?.data || []

  return (
    <div>
      <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 group">
        <div
          onClick={() => onToggleExpand(collection.id)}
          className="flex items-center gap-2 flex-1 cursor-pointer"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <FolderOpen className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-900 flex-1 truncate">
            {collection.name}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onCreateEndpoint()
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
          title="Tambah endpoint"
        >
          <Plus className="w-3 h-3 text-gray-600" />
        </button>
      </div>

      {isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {endpoints.map((endpoint) => (
            <div
              key={endpoint.id}
              onClick={() =>
                onOpenTab({
                  id: endpoint.id,
                  type: 'endpoint',
                  title: endpoint.name,
                  data: endpoint,
                })
              }
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-blue-600 w-12">
                {endpoint.method}
              </span>
              <span className="text-sm text-gray-700 flex-1 truncate">
                {endpoint.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
