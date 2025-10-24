import { encodeParamValue, decodeParamValue } from '@/lib/utils/param-building-utils';

interface ParamEncodingUtilsProps {
  onEncodeAll: () => void;
  onDecodeAll: () => void;
  onClearDisabled: () => void;
}

export function ParamEncodingUtils({
  onEncodeAll,
  onDecodeAll,
  onClearDisabled,
}: ParamEncodingUtilsProps) {
  return (
    <div className="flex items-center gap-2">
      <button 
        type="button"
        onClick={onEncodeAll}
        className="px-3 py-1.5 text-sm border rounded hover:bg-accent"
      >
        URL Encode All
      </button>
      <button 
        type="button"
        onClick={onDecodeAll}
        className="px-3 py-1.5 text-sm border rounded hover:bg-accent"
      >
        URL Decode All
      </button>
      <button 
        type="button"
        onClick={onClearDisabled}
        className="px-3 py-1.5 text-sm border rounded hover:bg-accent"
      >
        Clear Disabled
      </button>
    </div>
  );
}

// Export utility functions for encoding/decoding
export { encodeParamValue, decodeParamValue };