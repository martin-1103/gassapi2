/**
 * Simple Dependency Injection Container
 * Eliminates singleton pattern repetition across modules
 */

export type ServiceFactory<T = any> = () => T | Promise<T>;

export class DIContainer {
  private services: Map<string, any> = new Map();
  private factories: Map<string, ServiceFactory> = new Map();
  private singletons: Map<string, boolean> = new Map();

  /**
   * Register a service factory
   */
  register<T>(name: string, factory: ServiceFactory<T>, singleton: boolean = true): void {
    this.factories.set(name, factory);
    this.singletons.set(name, singleton);

    if (singleton) {
      this.services.delete(name); // Clear cached instance
    }
  }

  /**
   * Register an instance directly
   */
  registerInstance<T>(name: string, instance: T): void {
    this.services.set(name, instance);
    this.singletons.set(name, true);
  }

  /**
   * Get a service instance
   */
  async get<T>(name: string): Promise<T> {
    // Check if instance already exists
    if (this.services.has(name)) {
      return this.services.get(name);
    }

    // Get factory
    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`Service '${name}' not registered`);
    }

    // Create instance
    const instance = await factory();

    // Cache if singleton
    if (this.singletons.get(name)) {
      this.services.set(name, instance);
    }

    return instance;
  }

  /**
   * Check if service is registered
   */
  has(name: string): boolean {
    return this.factories.has(name) || this.services.has(name);
  }

  /**
   * Clear a service instance (useful for testing or refresh)
   */
  clear(name?: string): void {
    if (name) {
      this.services.delete(name);
    } else {
      this.services.clear();
    }
  }

  /**
   * Get all registered service names
   */
  getRegisteredServices(): string[] {
    return Array.from(new Set([...this.factories.keys(), ...this.services.keys()]));
  }
}

// Global container instance
export const container = new DIContainer();

/**
 * Decorator for easy service registration
 */
export function Service(name?: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    const serviceName = name || constructor.name;
    container.register(serviceName, () => new constructor(), true);
    return constructor;
  };
}

/**
 * Helper function to get service from global container
 */
export function getService<T>(name: string): Promise<T> {
  return container.get<T>(name);
}