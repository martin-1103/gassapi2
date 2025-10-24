import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { endpointsApi } from '@/lib/api/endpoints';

interface CreateEndpointModalProps {
  collectionId: string;
  onClose: () => void;
  onSuccess?: (endpoint: {
    id: string;
    name: string;
    method: string;
    url: string;
  }) => void;
}

export default function CreateEndpointModal({
  collectionId,
  onClose,
  onSuccess,
}: CreateEndpointModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    method: 'GET' as const,
    url: '',
  });

  const createMutation = useMutation({
    mutationFn: () => endpointsApi.create(collectionId, formData),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['endpoints', collectionId] });
      toast.success('Endpoint berhasil dibuat!');
      if (onSuccess) onSuccess(response.data.data);
      onClose();
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Gagal membuat endpoint');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim()) {
      toast.error('Nama dan URL harus diisi');
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md'>
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h2 className='text-xl font-bold text-gray-900'>Endpoint Baru</h2>
          <button
            onClick={onClose}
            className='p-1 hover:bg-gray-100 rounded transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <div>
            <label
              htmlFor='endpoint-name'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Nama Endpoint *
            </label>
            <input
              id='endpoint-name'
              type='text'
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Contoh: Get Users'
              required
            />
          </div>

          <div>
            <label
              htmlFor='endpoint-method'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              HTTP Method *
            </label>
            <select
              id='endpoint-method'
              value={formData.method}
              onChange={e =>
                setFormData({
                  ...formData,
                  method: e.target.value as
                    | 'GET'
                    | 'POST'
                    | 'PUT'
                    | 'DELETE'
                    | 'PATCH'
                    | 'HEAD'
                    | 'OPTIONS',
                })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='GET'>GET</option>
              <option value='POST'>POST</option>
              <option value='PUT'>PUT</option>
              <option value='DELETE'>DELETE</option>
              <option value='PATCH'>PATCH</option>
              <option value='HEAD'>HEAD</option>
              <option value='OPTIONS'>OPTIONS</option>
            </select>
          </div>

          <div>
            <label
              htmlFor='endpoint-url'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              URL *
            </label>
            <input
              id='endpoint-url'
              type='text'
              value={formData.url}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm'
              placeholder='https://api.example.com/users atau {{base_url}}/users'
              required
            />
            <p className='text-xs text-gray-500 mt-1'>
              Gunakan {'{{'} {'}}'} untuk variables, contoh: {'{{base_url}}'}
              /endpoint
            </p>
          </div>

          <div className='flex gap-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
            >
              Batal
            </button>
            <button
              type='submit'
              disabled={createMutation.isPending}
              className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
            >
              {createMutation.isPending ? 'Membuat...' : 'Buat Endpoint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
