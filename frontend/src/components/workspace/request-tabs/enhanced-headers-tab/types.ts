// Types untuk EnhancedHeadersTab component

export interface RequestHeader {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface EnhancedHeadersTabProps {
  headers: RequestHeader[];
  onHeadersChange: (headers: RequestHeader[]) => void;
  disabled?: boolean;
}
