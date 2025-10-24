import { Send, Save, Loader2 } from 'lucide-react';
import type { Endpoint } from '@/types/api';
import { EndpointValidationForm } from './EndpointValidationForm';

interface EndpointBuilderHeaderProps {
  endpoint: Endpoint;
  isSending: boolean;
  isSaving: boolean;
  onEndpointChange: (field: 'name' | 'method' | 'url', value: string) => void;
  onSend: () => void;
  onSave: () => void;
}

export function EndpointBuilderHeader({
  endpoint,
  isSending,
  isSaving,
  onEndpointChange,
  onSend,
  onSave,
}: EndpointBuilderHeaderProps) {
  return (
    <>
      {/* Form validation dan endpoint configuration */}
      <EndpointValidationForm
        endpoint={{ name: endpoint.name, method: endpoint.method, url: endpoint.url }}
        onEndpointChange={onEndpointChange}
      />

      {/* Action buttons */}
      <div className='flex gap-2 p-4'>
        <button
          onClick={onSend}
          disabled={isSending || !endpoint.url}
          className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
        >
          {isSending ? (
            <>
              <Loader2 className='w-4 h-4 animate-spin' />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className='w-4 h-4' />
              <span>Send</span>
            </>
          )}
        </button>

        <button
          onClick={onSave}
          disabled={isSaving}
          className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2'
        >
          <Save className='w-4 h-4' />
          <span>Save</span>
        </button>
      </div>
    </>
  );
}