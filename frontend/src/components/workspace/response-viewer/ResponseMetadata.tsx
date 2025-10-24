import { ApiResponse } from '@/types/api';
import { getResponseSummary } from '@/lib/response/response-processor';
import { StatusBadge, TimeDisplay } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Download,
  Save,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface ResponseMetadataProps {
  response: ApiResponse | null;
  isFullscreen: boolean;
  setIsFullscreen: (fullscreen: boolean) => void;
  handleCopyResponse: () => void;
  handleDownloadResponse: () => void;
  handleSaveResponse: () => void;
}

export const ResponseMetadata = ({
  response,
  isFullscreen,
  setIsFullscreen,
  handleCopyResponse,
  handleDownloadResponse,
  handleSaveResponse
}: ResponseMetadataProps) => {
  if (!response) return null;

  const summary = getResponseSummary(response);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <StatusBadge status={response.status} />
          <div className="text-sm text-muted-foreground">
            {response.statusText}
          </div>
          <Badge variant="outline" className="text-xs">
            {response.headers?.['content-type']?.split(';')[0] || 'unknown'}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <TimeDisplay time={response.time} showDetailed />
          <span className="text-sm text-muted-foreground">
            {response.size} bytes
          </span>

          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={handleCopyResponse}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDownloadResponse}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleSaveResponse}>
              <Save className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Test Results Summary */}
      {summary?.hasTests && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Tests:</span>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600">
                {summary.testResults.passed} passed
              </span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-red-500" />
              <span className="text-xs text-red-600">
                {summary.testResults.failed} failed
              </span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-yellow-600">
                {summary.testResults.total -
                  summary.testResults.passed -
                  summary.testResults.failed}{' '}
                skipped
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};