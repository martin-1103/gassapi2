import { useState, useCallback } from 'react';

import { QueryParam } from '@/components/workspace/request-tabs/params-tab';
import {
  addNewParam,
  updateParamById,
  removeParamById,
  moveParam,
  generateQueryString,
  countEnabledParams,
  copyAsCurl,
} from '@/lib/utils/param-building-utils';

interface UseUrlParamsStateReturn {
  params: QueryParam[];
  addParam: () => void;
  updateParam: (id: string, updates: Partial<QueryParam>) => void;
  deleteParam: (id: string) => void;
  moveParam: (id: string, direction: 'up' | 'down') => void;
  generateQueryString: () => string;
  copyAsCurl: () => void;
  enabledCount: number;
  setParams: (params: QueryParam[]) => void;
}

export function useUrlParamsState(
  initialParams: QueryParam[],
  onChange?: (params: QueryParam[]) => void,
): UseUrlParamsStateReturn {
  const [params, setParams] = useState<QueryParam[]>(initialParams);

  // Update parent when params change
  const updateParent = useCallback(
    (newParams: QueryParam[]) => {
      setParams(newParams);
      if (onChange) {
        onChange(newParams);
      }
    },
    [onChange],
  );

  const addParam = useCallback(() => {
    const newParams = addNewParam(params);
    updateParent(newParams);
  }, [params, updateParent]);

  const updateParam = useCallback(
    (id: string, updates: Partial<QueryParam>) => {
      const newParams = updateParamById(params, id, updates);
      updateParent(newParams);
    },
    [params, updateParent],
  );

  const deleteParam = useCallback(
    (id: string) => {
      const newParams = removeParamById(params, id);
      updateParent(newParams);
    },
    [params, updateParent],
  );

  const moveParamHandler = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const newParams = moveParam(params, id, direction);
      updateParent(newParams);
    },
    [params, updateParent],
  );

  const generateQueryStringHandler = useCallback(() => {
    return generateQueryString(params);
  }, [params]);

  const copyAsCurlHandler = useCallback(() => {
    copyAsCurl(params);
  }, [params]);

  const enabledCount = countEnabledParams(params);

  return {
    params,
    addParam,
    updateParam,
    deleteParam,
    moveParam: moveParamHandler,
    generateQueryString: generateQueryStringHandler,
    copyAsCurl: copyAsCurlHandler,
    enabledCount,
    setParams: updateParent,
  };
}
