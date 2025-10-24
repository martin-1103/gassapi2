export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
  size: number;
  redirected?: boolean;
  redirectUrl?: string;
  cookies?: Record<string, any>;
  testResults?: any[];
  console?: any[];
  request?: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: any;
  };
}