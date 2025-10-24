/**
 * Type definitions untuk Postman Collection v2.1 format
 */

export interface PostmanCollection {
  info: {
    name: string;
    description?: string;
    version?: string;
    schema?: string;
  };
  item: PostmanItem[];
  variable?: PostmanVariable[];
  event?: PostmanEvent[];
}

export interface PostmanItem {
  name: string;
  description?: string;
  request?: PostmanRequest;
  item?: PostmanItem[];
  event?: PostmanEvent[];
}

export interface PostmanRequest {
  method?: string;
  header?: PostmanHeader[];
  body?: PostmanBody;
  url?: PostmanUrl;
  description?: string;
}

export interface PostmanHeader {
  key: string;
  value: string;
  disabled?: boolean;
  description?: string;
}

export interface PostmanBody {
  mode?: 'raw' | 'urlencoded' | 'formdata' | 'file';
  raw?: string;
  urlencoded?: PostmanUrlEncodedParam[];
  formdata?: PostmanFormDataParam[];
}

export interface PostmanUrlEncodedParam {
  key: string;
  value?: string;
  disabled?: boolean;
  description?: string;
}

export interface PostmanFormDataParam {
  key: string;
  value?: string;
  type?: 'text' | 'file';
  disabled?: boolean;
  description?: string;
  src?: string;
}

export interface PostmanUrl {
  raw?: string;
  host?: string[];
  path?: string[];
  query?: PostmanQueryParam[];
  variable?: PostmanUrlVariable[];
}

export interface PostmanQueryParam {
  key: string;
  value?: string;
  disabled?: boolean;
  description?: string;
}

export interface PostmanUrlVariable {
  key: string;
  value?: string;
  disabled?: boolean;
  description?: string;
}

export interface PostmanVariable {
  key: string;
  value?: string;
  type?: 'string';
  description?: string;
}

export interface PostmanEvent {
  listen: string;
  script?: {
    type?: string;
    exec?: string[];
  };
}
