import React from 'react';

interface MethodSelectorProps {
  method: string;
  onMethodChange: (method: string) => void;
}

const HTTP_METHODS = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'HEAD',
  'OPTIONS',
];

export const MethodSelector: React.FC<MethodSelectorProps> = ({
  method,
  onMethodChange,
}) => {
  return (
    <select
      id='endpoint-method'
      value={method}
      onChange={e => onMethodChange(e.target.value)}
      className='px-3 py-2 border border-gray-300 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
      aria-label='HTTP method'
    >
      {HTTP_METHODS.map(methodOption => (
        <option key={methodOption} value={methodOption}>
          {methodOption}
        </option>
      ))}
    </select>
  );
};
