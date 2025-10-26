/**
 * Flow State Manager Service
 * Manages flow state, variables, and execution tracking
 */

import { StringUtils, TimeUtils } from '../../../shared/utils/index.js';
import {
  FlowState,
  FlowExecutionContext,
  FlowValidationResult,
  FlowStep,
  FlowConfig
} from '../types.js';

export class FlowStateManager {
  private activeFlows: Map<string, FlowState> = new Map();
  private flowHistory: Map<string, FlowState[]> = new Map();

  /**
   * Create a new flow state
   */
  createFlowState(flowId: string, steps: FlowStep[]): FlowState {
    const state: FlowState = {
      id: flowId,
      status: 'idle',
      totalSteps: steps.length,
      currentStep: 0,
      variables: {},
      results: [],
      errors: []
    };

    this.activeFlows.set(flowId, state);
    return state;
  }

  /**
   * Get flow state by ID
   */
  getFlowState(flowId: string): FlowState | undefined {
    return this.activeFlows.get(flowId);
  }

  /**
   * Update flow state
   */
  updateFlowState(flowId: string, updates: Partial<FlowState>): FlowState | null {
    const state = this.activeFlows.get(flowId);
    if (!state) return null;

    Object.assign(state, updates);
    return state;
  }

  /**
   * Start flow execution
   */
  startFlow(flowId: string): FlowState | null {
    const state = this.activeFlows.get(flowId);
    if (!state) return null;

    state.status = 'running';
    state.startTime = TimeUtils.now();
    state.currentStep = 0;
    state.errors = [];

    return state;
  }

  /**
   * Complete flow execution
   */
  completeFlow(flowId: string, success: boolean): FlowState | null {
    const state = this.activeFlows.get(flowId);
    if (!state) return null;

    state.status = success ? 'completed' : 'failed';
    state.endTime = TimeUtils.now();

    if (state.startTime) {
      state.executionTime = new Date(state.endTime).getTime() - new Date(state.startTime).getTime();
    }

    // Move to history
    this.moveToHistory(flowId);

    return state;
  }

  /**
   * Stop flow execution
   */
  stopFlow(flowId: string): FlowState | null {
    const state = this.activeFlows.get(flowId);
    if (!state) return null;

    state.status = 'stopped';
    state.endTime = TimeUtils.now();

    if (state.startTime) {
      state.executionTime = new Date(state.endTime).getTime() - new Date(state.startTime).getTime();
    }

    this.moveToHistory(flowId);
    return state;
  }

  /**
   * Update flow variables
   */
  updateFlowVariables(flowId: string, variables: Record<string, any>): FlowState | null {
    const state = this.activeFlows.get(flowId);
    if (!state) return null;

    state.variables = { ...state.variables, ...variables };
    return state;
  }

  /**
   * Add step result to flow
   */
  addStepResult(flowId: string, result: any): FlowState | null {
    const state = this.activeFlows.get(flowId);
    if (!state) return null;

    state.results.push(result);
    state.currentStep = (state.currentStep || 0) + 1;

    return state;
  }

  /**
   * Add error to flow
   */
  addFlowError(flowId: string, error: string): FlowState | null {
    const state = this.activeFlows.get(flowId);
    if (!state) return null;

    state.errors.push(error);
    return state;
  }

  /**
   * Get all active flows
   */
  getActiveFlows(): FlowState[] {
    return Array.from(this.activeFlows.values());
  }

  /**
   * Get flow history
   */
  getFlowHistory(flowId: string): FlowState[] {
    return this.flowHistory.get(flowId) || [];
  }

  /**
   * Clean up old flow states
   */
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void { // 24 hours default
    const now = Date.now();
    const toDelete: string[] = [];

    // Clean active flows
    for (const [id, state] of this.activeFlows.entries()) {
      if (state.startTime && (now - new Date(state.startTime).getTime()) > maxAge) {
        toDelete.push(id);
      }
    }

    toDelete.forEach(id => this.activeFlows.delete(id));

    // Clean history (keep only last 10 executions per flow)
    for (const [flowId, history] of this.flowHistory.entries()) {
      if (history.length > 10) {
        this.flowHistory.set(flowId, history.slice(-10));
      }
    }
  }

  /**
   * Validate flow configuration
   */
  validateFlow(steps: FlowStep[], config?: FlowConfig): FlowValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate steps
    if (!steps || steps.length === 0) {
      errors.push('Flow must have at least one step');
    } else {
      const stepIds = new Set<string>();

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        // Validate step ID
        if (!step.id) {
          errors.push(`Step ${i + 1} must have an ID`);
        } else if (stepIds.has(step.id)) {
          errors.push(`Duplicate step ID: ${step.id}`);
        } else {
          stepIds.add(step.id);
        }

        // Validate step name
        if (!step.name) {
          warnings.push(`Step ${step.id} should have a name`);
        }

        // Validate step configuration
        if (!step.method && !step.endpointId) {
          errors.push(`Step ${step.id} must have either method or endpointId`);
        }

        if (step.method && !step.url && !step.endpointId) {
          errors.push(`Step ${step.id} must have URL when method is specified`);
        }

        if (step.timeout && step.timeout < 1000) {
          warnings.push(`Step ${step.id} timeout is very low (${step.timeout}ms)`);
        }
      }
    }

    // Validate config
    if (config) {
      if (config.timeout && config.timeout < 1000) {
        warnings.push('Flow timeout is very low (< 1 second)');
      }

      if (config.parallel && config.maxConcurrency && config.maxConcurrency > 20) {
        warnings.push('High concurrency may cause resource issues');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get flow statistics
   */
  getFlowStats(): {
    active: number;
    completed: number;
    failed: number;
    stopped: number;
    totalExecutions: number;
  } {
    const active = Array.from(this.activeFlows.values()).filter(s => s.status === 'running').length;
    const totalHistory = Array.from(this.flowHistory.values()).reduce((sum, history) => sum + history.length, 0);
    const completed = totalHistory + Array.from(this.activeFlows.values()).filter(s => s.status === 'completed').length;
    const failed = Array.from(this.flowHistory.values())
      .flat()
      .filter(s => s.status === 'failed').length +
      Array.from(this.activeFlows.values()).filter(s => s.status === 'failed').length;
    const stopped = Array.from(this.flowHistory.values())
      .flat()
      .filter(s => s.status === 'stopped').length +
      Array.from(this.activeFlows.values()).filter(s => s.status === 'stopped').length;

    return {
      active,
      completed,
      failed,
      stopped,
      totalExecutions: totalHistory + this.activeFlows.size
    };
  }

  /**
   * Export flow state for persistence
   */
  exportFlowState(flowId: string): any | null {
    const state = this.activeFlows.get(flowId);
    if (!state) return null;

    return {
      ...state,
      exportedAt: TimeUtils.now()
    };
  }

  /**
   * Import flow state
   */
  importFlowState(stateData: any): FlowState | null {
    if (!stateData || !stateData.id) return null;

    const state: FlowState = {
      id: stateData.id,
      status: stateData.status || 'idle',
      totalSteps: stateData.totalSteps || 0,
      currentStep: stateData.currentStep || 0,
      startTime: stateData.startTime,
      endTime: stateData.endTime,
      executionTime: stateData.executionTime,
      variables: stateData.variables || {},
      results: stateData.results || [],
      errors: stateData.errors || []
    };

    this.activeFlows.set(state.id, state);
    return state;
  }

  /**
   * Move flow to history
   */
  private moveToHistory(flowId: string): void {
    const state = this.activeFlows.get(flowId);
    if (!state) return;

    const history = this.flowHistory.get(flowId) || [];
    history.push({ ...state });
    this.flowHistory.set(flowId, history);

    this.activeFlows.delete(flowId);
  }
}