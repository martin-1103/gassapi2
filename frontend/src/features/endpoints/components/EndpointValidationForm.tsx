import React from 'react';
import { MethodSelector } from './MethodSelector';

interface EndpointValidationFormProps {
  endpoint: {
    name: string;
    method: string;
    url: string;
  };
  onEndpointChange: (field: 'name' | 'method' | 'url', value: string) => void;
}

export const EndpointValidationForm: React.FC<EndpointValidationFormProps> = ({ 
  endpoint, 
  onEndpointChange 
}) => {
  return (
    <div className="p-4 border-b border-gray-200 space-y-3">
      <input
        type="text"
        value={endpoint.name}
        onChange={(e) => onEndpointChange('name', e.target.value)}
        className="w-full px-3 py-2 text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Nama endpoint"
      />

      <div className="flex gap-2">
        <MethodSelector 
          method={endpoint.method} 
          onMethodChange={(method) => onEndpointChange('method', method)} 
        />
        <input
          type="text"
          value={endpoint.url}
          onChange={(e) => onEndpointChange('url', e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://api.example.com/endpoint atau {{base_url}}/endpoint"
        />
      </div>
    </div>
  );
};