export interface ConsoleEntry {
  level: 'info' | 'warn' | 'error' | 'debug' | 'log';
  message: string;
  timestamp: number;
  source?: string;
  data?: any;
  duration?: number;
  stackTrace?: string;
}