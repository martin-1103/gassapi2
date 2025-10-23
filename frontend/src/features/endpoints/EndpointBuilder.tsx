import { useState } from 'react'
import { Send, Save, Loader2 } from 'lucide-react'
import type { Endpoint, Environment, EndpointResponse } from '@/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { endpointsApi } from '@/lib/api/endpoints'
import { toast } from 'sonner'
import axios from 'axios'

interface EndpointBuilderProps {
  endpoint: Endpoint
  environment: Environment | null
}

export default function EndpointBuilder({
  endpoint: initialEndpoint,
  environment,
}: EndpointBuilderProps) {
  const queryClient = useQueryClient()
  const [endpoint, setEndpoint] = useState(initialEndpoint)
  const [response, setResponse] = useState<EndpointResponse | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [activeTab, setActiveTab] = useState<'headers' | 'body' | 'response'>('headers')

  // Update endpoint mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Endpoint>) =>
      endpointsApi.update(endpoint.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoints', endpoint.collection_id] })
      toast.success('Endpoint berhasil disimpan!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menyimpan endpoint')
    },
  })

  // Interpolate variables dalam URL
  const interpolateUrl = (url: string): string => {
    if (!environment) return url
    
    let interpolated = url
    Object.entries(environment.variables).forEach(([key, value]) => {
      interpolated = interpolated.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    return interpolated
  }

  // Send request
  const handleSend = async () => {
    setIsSending(true)
    const startTime = Date.now()

    try {
      const url = interpolateUrl(endpoint.url)
      const headers = endpoint.headers || {}
      const body = endpoint.body ? JSON.parse(endpoint.body) : undefined

      const axiosResponse = await axios({
        method: endpoint.method,
        url,
        headers,
        data: body,
      })

      const endTime = Date.now()

      setResponse({
        status: axiosResponse.status,
        statusText: axiosResponse.statusText,
        headers: axiosResponse.headers as Record<string, string>,
        data: axiosResponse.data,
        time: endTime - startTime,
      })

      setActiveTab('response')
      toast.success(`Request berhasil - ${axiosResponse.status}`)
    } catch (error: any) {
      const endTime = Date.now()
      
      if (error.response) {
        setResponse({
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data,
          time: endTime - startTime,
        })
        setActiveTab('response')
      } else {
        toast.error(error.message || 'Request gagal')
      }
    } finally {
      setIsSending(false)
    }
  }

  const handleSave = () => {
    updateMutation.mutate({
      name: endpoint.name,
      method: endpoint.method,
      url: endpoint.url,
      headers: endpoint.headers,
      body: endpoint.body,
    })
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header: Name, Method, URL, Actions */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <input
          type="text"
          value={endpoint.name}
          onChange={(e) => setEndpoint({ ...endpoint, name: e.target.value })}
          className="w-full px-3 py-2 text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nama endpoint"
        />

        <div className="flex gap-2">
          <select
            value={endpoint.method}
            onChange={(e) =>
              setEndpoint({ ...endpoint, method: e.target.value as any })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>

          <input
            type="text"
            value={endpoint.url}
            onChange={(e) => setEndpoint({ ...endpoint, url: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://api.example.com/endpoint atau {{base_url}}/endpoint"
          />

          <button
            onClick={handleSend}
            disabled={isSending || !endpoint.url}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send</span>
              </>
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Tabs: Headers, Body, Response */}
      <div className="border-b border-gray-200 flex">
        <button
          onClick={() => setActiveTab('headers')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'headers'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Headers
        </button>
        <button
          onClick={() => setActiveTab('body')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'body'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Body
        </button>
        <button
          onClick={() => setActiveTab('response')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'response'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Response {response && `(${response.status})`}
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'headers' && (
          <div>
            <textarea
              value={JSON.stringify(endpoint.headers || {}, null, 2)}
              onChange={(e) => {
                try {
                  const headers = JSON.parse(e.target.value)
                  setEndpoint({ ...endpoint, headers })
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder='{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer {{token}}"\n}'
            />
          </div>
        )}

        {activeTab === 'body' && (
          <div>
            <textarea
              value={endpoint.body || ''}
              onChange={(e) => setEndpoint({ ...endpoint, body: e.target.value })}
              className="w-full h-96 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder='{\n  "key": "value"\n}'
            />
          </div>
        )}

        {activeTab === 'response' && (
          <div>
            {response ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded font-medium ${
                      response.status >= 200 && response.status < 300
                        ? 'bg-green-100 text-green-800'
                        : response.status >= 400
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {response.status} {response.statusText}
                  </span>
                  <span className="text-gray-600">Time: {response.time}ms</span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Response Body</h3>
                  <pre className="bg-gray-50 border border-gray-300 rounded-lg p-4 overflow-x-auto text-xs">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Belum ada response. Klik "Send" untuk mengirim request.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
