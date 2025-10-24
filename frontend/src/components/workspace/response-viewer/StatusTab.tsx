import { ApiResponse } from '@/types/api';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, TimeDisplay } from '@/components/common';
import { getResponseSummary } from '@/lib/response/response-processor';
import { Monitor, Smartphone, Globe, Database, Clock, Zap } from 'lucide-react';

interface StatusTabProps {
  response: ApiResponse | null;
}

export const StatusTab = ({ response }: StatusTabProps) => {
  if (!response) return null;

  const summary = getResponseSummary(response);

  return (
    <Card className="p-4 h-full overflow-auto">
      <div className="space-y-6">
        {/* Basic Response Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Response Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Status Code</div>
              <div className="font-mono">{response.status}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status Text</div>
              <div>{response.statusText}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Response Time</div>
              <div><TimeDisplay time={response.time} showDetailed={false} /></div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Response Size</div>
              <div>{response.size} bytes</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Content Type */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Content Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Content Type</div>
              <Badge variant="outline" className="text-xs">
                {summary?.contentType || 'unknown'}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Redirected</div>
              <div>{response.redirected ? 'Yes' : 'No'}</div>
            </div>
            {response.redirectUrl && (
              <div className="col-span-2">
                <div className="text-sm text-muted-foreground">Redirect URL</div>
                <div className="font-mono text-sm break-all">{response.redirectUrl}</div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Performance */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Performance
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Time</span>
              <span><TimeDisplay time={response.time} showDetailed={false} /></span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Response Size</span>
              <span>{response.size} bytes</span>
            </div>
          </div>
        </div>

        {summary?.hasTests && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Test Results
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                  <div className="text-green-600 font-semibold">{summary.testResults.passed}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                  <div className="text-red-600 font-semibold">{summary.testResults.failed}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Skipped</div>
                  <div className="text-yellow-600 font-semibold">{summary.testResults.skipped}</div>
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Request Information */}
        {response.request && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Request Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Method</div>
                <div className="font-mono">{response.request.method}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">URL</div>
                <div className="font-mono break-all text-sm">{response.request.url}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};