export interface BodyData {
  type:
    | 'none'
    | 'form-data'
    | 'x-www-form-urlencoded'
    | 'raw'
    | 'binary'
    | 'graphql';
  rawType: 'text' | 'javascript' | 'json' | 'html' | 'xml';
  formData: Array<{
    id: string;
    key: string;
    value: string;
    type: 'text' | 'file';
    enabled: boolean;
  }>;
  rawContent: string;
  graphqlQuery: string;
  graphqlVariables: string;
  binaryFile?: File;
}

export const getContentType = (bodyData: BodyData): string | null => {
  switch (bodyData.type) {
    case 'form-data':
      return 'multipart/form-data';
    case 'x-www-form-urlencoded':
      return 'application/x-www-form-urlencoded';
    case 'raw':
      switch (bodyData.rawType) {
        case 'json':
          return 'application/json';
        case 'xml':
          return 'application/xml';
        case 'html':
          return 'text/html';
        case 'javascript':
          return 'application/javascript';
        default:
          return 'text/plain';
      }
    case 'graphql':
      return 'application/json';
    case 'binary':
      return 'application/octet-stream';
    default:
      return null;
  }
};

export const getBodyPreview = (bodyData: BodyData): string => {
  switch (bodyData.type) {
    case 'form-data':
      return bodyData.formData
        .filter(item => item.enabled)
        .map(item => `${item.key}: ${item.value || '(file)'}`)
        .join('\n');
    case 'x-www-form-urlencoded':
      return bodyData.formData
        .filter(item => item.enabled)
        .map(
          item =>
            `${encodeURIComponent(item.key)}=${encodeURIComponent(item.value)}`,
        )
        .join('&');
    case 'raw':
      return bodyData.rawContent;
    case 'graphql':
      try {
        return JSON.stringify(
          {
            query: bodyData.graphqlQuery,
            variables: bodyData.graphqlVariables
              ? JSON.parse(bodyData.graphqlVariables)
              : {},
          },
          null,
          2,
        );
      } catch (e) {
        return JSON.stringify(
          {
            query: bodyData.graphqlQuery,
            variables: {},
          },
          null,
          2,
        );
      }
    default:
      return 'No body';
  }
};