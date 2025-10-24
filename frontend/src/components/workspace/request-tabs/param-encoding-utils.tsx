// Utility functions for parameter encoding
// These will be used when implementing the encode/decode functionality

interface ParamEncodingUtilsProps {
  onEncodeAll: () => void;
  onDecodeAll: () => void;
  onClearDisabled: () => void;
}

// Component untuk parameter encoding utilities
export function ParamEncodingUtils({
  onEncodeAll,
  onDecodeAll,
  onClearDisabled,
}: ParamEncodingUtilsProps) {
  return (
    <div className='flex items-center gap-2'>
      <button
        type='button'
        onClick={onEncodeAll}
        className='px-3 py-1.5 text-sm border rounded hover:bg-accent'
      >
        URL Encode All
      </button>
      <button
        type='button'
        onClick={onDecodeAll}
        className='px-3 py-1.5 text-sm border rounded hover:bg-accent'
      >
        URL Decode All
      </button>
      <button
        type='button'
        onClick={onClearDisabled}
        className='px-3 py-1.5 text-sm border rounded hover:bg-accent'
      >
        Clear Disabled
      </button>
    </div>
  );
}

// Utility functions dipisahkan ke file terpisah untuk Fast Refresh
// Export komponen saja
export { ParamEncodingUtils };
