import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { environmentsApi } from '@/lib/api/endpoints'
import { toast } from 'sonner'
import { X } from 'lucide-react'

interface CreateEnvironmentModalProps {
  projectId: string
  onClose: () => void
}

export default function CreateEnvironmentModal({
  projectId,
  onClose,
}: CreateEnvironmentModalProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: '',
    variables: {} as Record<string, string>,
    is_default: false,
  })
  const [variableInput, setVariableInput] = useState({ key: '', value: '' })

  const createMutation = useMutation({
    mutationFn: () => environmentsApi.create(projectId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environments', projectId] })
      toast.success('Environment berhasil dibuat!')
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat environment')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Nama environment harus diisi')
      return
    }
    createMutation.mutate()
  }

  const addVariable = () => {
    if (variableInput.key.trim() && variableInput.value.trim()) {
      setFormData({
        ...formData,
        variables: {
          ...formData.variables,
          [variableInput.key]: variableInput.value,
        },
      })
      setVariableInput({ key: '', value: '' })
    }
  }

  const removeVariable = (key: string) => {
    const newVars = { ...formData.variables }
    delete newVars[key]
    setFormData({ ...formData, variables: newVars })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Environment Baru</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Environment *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Development, Production"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) =>
                  setFormData({ ...formData, is_default: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Set sebagai default</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variables
            </label>
            
            {/* Existing variables */}
            {Object.entries(formData.variables).length > 0 && (
              <div className="space-y-2 mb-3">
                {Object.entries(formData.variables).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="text-sm font-mono flex-1">
                      {key} = {value}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVariable(key)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new variable */}
            <div className="flex gap-2">
              <input
                type="text"
                value={variableInput.key}
                onChange={(e) =>
                  setVariableInput({ ...variableInput, key: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Key (contoh: base_url)"
              />
              <input
                type="text"
                value={variableInput.value}
                onChange={(e) =>
                  setVariableInput({ ...variableInput, value: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Value"
              />
              <button
                type="button"
                onClick={addVariable}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              >
                Tambah
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Membuat...' : 'Buat Environment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
