import { Plus } from 'lucide-react';
import { QueryParam } from '@/components/workspace/request-tabs/params-tab';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { QueryParamEditor } from './query-param-editor';

interface ParamBuilderFormProps {
  params: QueryParam[];
  enabledCount: number;
  onAddParam: () => void;
  onUpdateParam: (id: string, updates: Partial<QueryParam>) => void;
  onDeleteParam: (id: string) => void;
  onMoveParam: (id: string, direction: 'up' | 'down') => void;
  onCopyAsCurl: () => void;
  onEncodeParam: (id: string) => void;
  onDuplicateParam: (id: string) => void;
}

export function ParamBuilderForm({
  params,
  enabledCount,
  onAddParam,
  onUpdateParam,
  onDeleteParam,
  onMoveParam,
  onCopyAsCurl,
  onEncodeParam,
  onDuplicateParam,
}: ParamBuilderFormProps) {
  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold">Query Parameters</h3>
            <Badge variant="outline">{enabledCount} active</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onCopyAsCurl}
                  disabled={enabledCount === 0}
                >
                  Copy as cURL
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy parameters as cURL command</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline">
                  Bulk Edit
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit parameters in bulk format</p>
              </TooltipContent>
            </Tooltip>

            <Button size="sm" onClick={onAddParam}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Parameters Table */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Enabled</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {params.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center">
                      <Plus className="w-8 h-8 mb-2 opacity-50" />
                      <p>No parameters added yet</p>
                      <p className="text-sm">
                        Click "Add" to create your first parameter
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                params.map((param, index) => (
                  <QueryParamEditor
                    key={param.id}
                    param={param}
                    index={index}
                    total={params.length}
                    onUpdate={updates => onUpdateParam(param.id, updates)}
                    onDelete={() => onDeleteParam(param.id)}
                    onMove={direction => onMoveParam(param.id, direction)}
                    onEncode={() => onEncodeParam(param.id)}
                    onDuplicate={() => onDuplicateParam(param.id)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
}