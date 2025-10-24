import { QueryParam } from '@/components/workspace/request-tabs/params-tab';

/**
 * Generates a query string from enabled parameters
 */
export function generateQueryString(params: QueryParam[]): string {
  const enabledParams = params.filter(
    param => param.enabled && param.key && param.value,
  );
  const searchParams = new URLSearchParams();

  enabledParams.forEach(param => {
    searchParams.append(param.key, param.value);
  });

  return searchParams.toString();
}

/**
 * Counts enabled parameters
 */
export function countEnabledParams(params: QueryParam[]): number {
  return params.filter(p => p.enabled).length;
}

/**
 * Adds a new parameter to the list
 */
export function addNewParam(params: QueryParam[]): QueryParam[] {
  const newParam: QueryParam = {
    id: Date.now().toString(),
    key: '',
    value: '',
    enabled: true,
  };
  return [...params, newParam];
}

/**
 * Updates a parameter with the given id and updates
 */
export function updateParamById(
  params: QueryParam[],
  id: string,
  updates: Partial<QueryParam>,
): QueryParam[] {
  return params.map(param => (param.id === id ? { ...param, ...updates } : param));
}

/**
 * Removes a parameter with the given id
 */
export function removeParamById(params: QueryParam[], id: string): QueryParam[] {
  return params.filter(param => param.id !== id);
}

/**
 * Moves a parameter up or down in the list
 */
export function moveParam(
  params: QueryParam[],
  id: string,
  direction: 'up' | 'down',
): QueryParam[] {
  const index = params.findIndex(param => param.id === id);
  if (
    (direction === 'up' && index === 0) ||
    (direction === 'down' && index === params.length - 1)
  ) {
    return params;
  }

  const newParams = [...params];
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  [newParams[index], newParams[targetIndex]] = [
    newParams[targetIndex],
    newParams[index],
  ];
  return newParams;
}

/**
 * Encodes a parameter value for URL usage
 */
export function encodeParamValue(value: string): string {
  return encodeURIComponent(value);
}

/**
 * Decodes a parameter value from URL usage
 */
export function decodeParamValue(value: string): string {
  return decodeURIComponent(value);
}

/**
 * Copies parameters as a cURL command
 */
export function copyAsCurl(params: QueryParam[]): void {
  const queryString = generateQueryString(params);
  if (!queryString) return;

  const curl = `curl -G -d "${queryString}" "https://example.com"`;
  navigator.clipboard.writeText(curl);
}