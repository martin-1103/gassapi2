/**
 * History Types and Interfaces
 * Type definitions untuk history management
 */

import { DirectResponse } from '../api/direct-client';

export interface RequestHistoryItem {
  id: string;
  name?: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  response?: DirectResponse;
  timestamp: number;
  duration: number;
  status: 'success' | 'error' | 'pending';
  projectId?: string;
  collectionId?: string;
  endpointId?: string;
  environment?: string;
  tags?: string[];
}

export interface HistoryFilter {
  method?: string;
  status?: 'success' | 'error' | 'pending';
  projectId?: string;
  collectionId?: string;
  environment?: string;
  dateFrom?: number;
  dateTo?: number;
  search?: string;
}

export interface HistoryStatistics {
  total: number;
  success: number;
  error: number;
  byMethod: Record<string, number>;
  recentActivity: RequestHistoryItem[];
}

export interface HistoryExportData {
  version: string;
  exportedAt: string;
  totalItems: number;
  history: RequestHistoryItem[];
}

export type HistoryUpdateAction =
  | { action: 'added'; item: RequestHistoryItem }
  | { action: 'updated'; item: RequestHistoryItem }
  | { action: 'deleted'; id: string }
  | { action: 'cleared' }
  | { action: 'cleared-project'; projectId: string }
  | { action: 'imported'; count: number };
