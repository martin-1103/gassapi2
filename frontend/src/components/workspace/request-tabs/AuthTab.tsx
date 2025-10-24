// Re-export dari auth-tab yang sudah di-refactor
export { RequestAuthTab as default } from './auth-tab'

// Export types untuk backward compatibility
export type { AuthData } from './auth-tab/hooks/use-auth-state'