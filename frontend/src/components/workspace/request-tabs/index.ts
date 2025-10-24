// Export main component
export { default as RequestParamsTab } from './RequestParamsTab';

// Export sub-components untuk reusability
export { ParameterActions } from './ParameterActions';
export { ParameterSearch } from './ParameterSearch';
export { ParameterTable } from './ParameterTable';
export { ParameterTemplates, PARAM_TEMPLATES } from './ParameterTemplates';
export { URLPreview } from './URLPreview';

// Export hook
export {
  useParameterManagement,
  type QueryParam,
} from '@/hooks/useParameterManagement';
