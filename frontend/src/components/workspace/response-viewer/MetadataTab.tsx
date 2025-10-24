import { ApiResponse } from '@/types/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge, TimeDisplay } from '@/components/common';
import { getResponseSummary } from '@/lib/response/response-processor';
import { getContentType } from '@/lib/response/response-processor';
import {
  Globe,
  Database,
  Clock,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Link
} from 'lucide-react';

interface MetadataTabProps {
  response: ApiResponse | null;
}

export const MetadataTab = ({ response }: MetadataTabProps) => {
  if (!response) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No response metadata to display
      </div>
    );
  }

  const summary = getResponseSummary(response);

  return (
    <Card className="p-4 h-full overflow-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Response Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={response.status} />
                <span className="text-sm">{response.statusText}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Content Type</div>
              <Badge variant="outline" className="mt-1 text-xs">
                {getContentType(response.headers)}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Response Time</div>
              <div className="mt-1"><TimeDisplay time={response.time} showDetailed={false} /></div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Response Size</div>
              <div className="mt-1">{response.size} bytes</div>
            </div>
          </div>
        </div>

        <Separator />

        {response.request && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Link className="w-5 h-5" />
              Request Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Method</div>
                <div className="font-mono">{response.request.method}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">URL</div>
                <div className="font-mono text-sm break-all">{response.request.url}</div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Content Information
          </h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Content Type</div>
              <div className="font-mono text-sm">{getContentType(response.headers)}</div>
            </div>
            {response.headers && (
              <div>
                <div className="text-sm text-muted-foreground">Headers Count</div>
                <div>{Object.keys(response.headers).length}</div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {summary?.hasTests && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Test Results
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Passed</span>
                </div>
                <div className="text-xl font-semibold text-green-600">{summary.testResults.passed}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm">Failed</span>
                </div>
                <div className="text-xl font-semibold text-red-600">{summary.testResults.failed}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Skipped</span>
                </div>
                <div className="text-xl font-semibold text-yellow-600">{summary.testResults.skipped}</div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Timing Information
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Response Time</span>
              <span className="font-mono"><TimeDisplay time={response.time} showDetailed={false} /></span>
            </div>
            <div className="flex justify-between">
              <span>Response Size</span>
              <span className="font-mono">{response.size} bytes</span>
            </div>
            {response.redirected && (
              <div className="flex justify-between">
                <span>Redirected</span>
                <span className="font-mono">Yes</span>
              </div>
            )}
            {response.redirectUrl && (
              <div className="flex justify-between">
                <span>Redirect URL</span>
                <span className="font-mono break-all text-sm">{response.redirectUrl}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};