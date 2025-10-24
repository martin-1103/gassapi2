import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useUrlParamsState } from '@/lib/hooks/useUrlParamsState';
import { encodeParamValue } from '@/lib/utils/param-building-utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ParamBuilderForm } from './param-builder-form';

export interface QueryParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

interface RequestParamsTabProps {
  params: QueryParam[];
  onChange: (params: QueryParam[]) => void;
}

export function RequestParamsTab({ params, onChange }: RequestParamsTabProps) {
  const {
    params: internalParams,
    addParam,
    updateParam,
    deleteParam,
    moveParam,
    generateQueryString,
    copyAsCurl,
    enabledCount,
    setParams,
  } = useUrlParamsState(params, onChange);

  // Update internal state when props change
  useEffect(() => {
    setParams(params);
  }, [params, setParams]);

  const encodeParam = (id: string) => {
    const param = internalParams.find(p => p.id === id);
    if (param) {
      updateParam(id, { value: encodeParamValue(param.value) });
    }
  };

  const duplicateParam = (id: string) => {
    const param = internalParams.find(p => p.id === id);
    if (param) {
      const duplicatedParam: QueryParam = {
        ...param,
        id: Date.now().toString(),
        key: `${param.key}_copy`,
      };
      setParams([...internalParams, duplicatedParam]);
    }
  };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        <ParamBuilderForm
          params={internalParams}
          enabledCount={enabledCount}
          onAddParam={addParam}
          onUpdateParam={updateParam}
          onDeleteParam={deleteParam}
          onMoveParam={moveParam}
          onCopyAsCurl={copyAsCurl}
          onEncodeParam={encodeParam}
          onDuplicateParam={duplicateParam}
        />

        {/* Footer */}
        <div className="p-4 border-t bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Generated URL:&nbsp;
              <code className="ml-2 px-2 py-1 bg-background rounded text-xs">
                {generateQueryString()
                  ? `?${generateQueryString()}`
                  : 'No parameters'}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  const encodedParams = internalParams.map(param => ({
                    ...param,
                    value: encodeParamValue(param.value)
                  }));
                  setParams(encodedParams);
                }}
              >
                URL Encode All
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  const enabledParams = internalParams.filter(param => param.enabled);
                  setParams(enabledParams);
                }}
              >
                Clear Disabled
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}