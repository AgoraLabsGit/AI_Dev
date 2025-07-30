/**
 * State Manager
 * 
 * Manages shared state between AVCA and DIAS systems
 */

import { EventBus } from '../avca/services/event-bus';
import { DIAS } from '../dias';
import { 
  EventFactory, 
  EventCategory, 
  IntegrationEventType 
} from '../dias/events/event-types';

export interface ProjectState {
  projectId: string;
  currentStage?: string;
  blueprints: any[];
  components: any[];
  metadata: Record<string, any>;
  lastModified: Date;
  version: number;
}

export interface StateUpdate {
  projectId: string;
  field: string;
  value: any;
  source: 'avca' | 'dias';
  timestamp: Date;
}

export interface StateSnapshot {
  timestamp: Date;
  projects: Record<string, ProjectState>;
  globalState: Record<string, any>;
}

export class StateManager {
  private eventBus: EventBus;
  private dias: DIAS;
  private projectStates: Map<string, ProjectState> = new Map();
  private globalState: Record<string, any> = {};
  private stateHistory: StateUpdate[] = [];
  private maxHistorySize = 1000;
  private subscribers: Map<string, ((state: ProjectState) => void)[]> = new Map();

  constructor(eventBus: EventBus, dias: DIAS) {
    this.eventBus = eventBus;
    this.dias = dias;
    
    // Subscribe to state-changing events
    this.subscribeToEvents();
  }

  /**
   * Get project state
   */
  getProjectState(projectId: string): ProjectState | undefined {
    return this.projectStates.get(projectId);
  }

  /**
   * Update project state
   */
  updateProjectState(
    projectId: string, 
    updates: Partial<ProjectState>,
    source: 'avca' | 'dias'
  ): void {
    const currentState = this.projectStates.get(projectId) || this.createProjectState(projectId);
    
    // Apply updates
    const newState: ProjectState = {
      ...currentState,
      ...updates,
      lastModified: new Date(),
      version: currentState.version + 1
    };
    
    this.projectStates.set(projectId, newState);
    
    // Record history
    Object.keys(updates).forEach(field => {
      this.addToHistory({
        projectId,
        field,
        value: (updates as any)[field],
        source,
        timestamp: new Date()
      });
    });
    
    // Notify subscribers
    this.notifySubscribers(projectId, newState);
    
    // Emit sync event
    this.emitSyncEvent(projectId, updates, source);
  }

  /**
   * Subscribe to state changes
   */
  subscribe(projectId: string, callback: (state: ProjectState) => void): () => void {
    const subscribers = this.subscribers.get(projectId) || [];
    subscribers.push(callback);
    this.subscribers.set(projectId, subscribers);
    
    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(projectId) || [];
      const index = subs.indexOf(callback);
      if (index > -1) {
        subs.splice(index, 1);
      }
    };
  }

  /**
   * Get state snapshot
   */
  getSnapshot(): StateSnapshot {
    const projects: Record<string, ProjectState> = {};
    
    for (const [id, state] of this.projectStates) {
      projects[id] = { ...state };
    }
    
    return {
      timestamp: new Date(),
      projects,
      globalState: { ...this.globalState }
    };
  }

  /**
   * Restore from snapshot
   */
  restoreSnapshot(snapshot: StateSnapshot): void {
    // Clear current state
    this.projectStates.clear();
    
    // Restore project states
    Object.entries(snapshot.projects).forEach(([id, state]) => {
      this.projectStates.set(id, state);
    });
    
    // Restore global state
    this.globalState = { ...snapshot.globalState };
  }

  /**
   * Get state history
   */
  getHistory(projectId?: string, limit = 100): StateUpdate[] {
    let history = this.stateHistory;
    
    if (projectId) {
      history = history.filter(update => update.projectId === projectId);
    }
    
    return history.slice(-limit);
  }

  /**
   * Clear state for project
   */
  clearProjectState(projectId: string): void {
    this.projectStates.delete(projectId);
    this.subscribers.delete(projectId);
    
    // Remove from history
    this.stateHistory = this.stateHistory.filter(
      update => update.projectId !== projectId
    );
  }

  /**
   * Sync state between systems
   */
  async syncState(projectId: string): Promise<void> {
    const state = this.projectStates.get(projectId);
    if (!state) return;
    
    // Emit sync started event
    await this.dias.emitIntegrationEvent(
      IntegrationEventType.SYNC_STARTED,
      projectId,
      {
        sourceSystem: 'avca',
        targetSystem: 'dias',
        operation: 'state-sync',
        payload: state
      }
    );
    
    // In a real implementation, this would sync with external systems
    
    // Emit sync completed event
    await this.dias.emitIntegrationEvent(
      IntegrationEventType.SYNC_COMPLETED,
      projectId,
      {
        sourceSystem: 'avca',
        targetSystem: 'dias',
        operation: 'state-sync',
        payload: state,
        result: {
          success: true,
          data: { synced: true }
        }
      }
    );
  }

  /**
   * Private: Create new project state
   */
  private createProjectState(projectId: string): ProjectState {
    return {
      projectId,
      blueprints: [],
      components: [],
      metadata: {},
      lastModified: new Date(),
      version: 0
    };
  }

  /**
   * Private: Add to history
   */
  private addToHistory(update: StateUpdate): void {
    this.stateHistory.push(update);
    
    // Trim history if too large
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory = this.stateHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Private: Notify subscribers
   */
  private notifySubscribers(projectId: string, state: ProjectState): void {
    const subscribers = this.subscribers.get(projectId) || [];
    subscribers.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Subscriber callback error:', error);
      }
    });
  }

  /**
   * Private: Emit sync event
   */
  private emitSyncEvent(
    projectId: string,
    updates: Partial<ProjectState>,
    source: 'avca' | 'dias'
  ): void {
    this.eventBus.publish(
      EventCategory.INTEGRATION,
      'state-manager',
      EventFactory.createEvent(
        EventCategory.INTEGRATION,
        'integration.state.updated',
        'state-manager',
        projectId,
        {
          sourceSystem: source,
          targetSystem: source === 'avca' ? 'dias' : 'avca',
          operation: 'state-update',
          payload: updates
        }
      )
    );
  }

  /**
   * Private: Subscribe to events
   */
  private subscribeToEvents(): void {
    // Subscribe to pipeline events
    this.eventBus.subscribe(
      EventCategory.PIPELINE,
      'state-manager',
      async (message) => {
        const event = message.data;
        if (event.type === 'pipeline.stage.completed') {
          this.updateProjectState(
            event.projectId,
            { currentStage: event.data.stage },
            'avca'
          );
        }
      }
    );
    
    // Subscribe to component events
    this.eventBus.subscribe(
      EventCategory.COMPONENT,
      'state-manager',
      async (message) => {
        const event = message.data;
        if (event.type === 'component.created') {
          const state = this.getProjectState(event.projectId);
          if (state) {
            const components = [...state.components, event.data];
            this.updateProjectState(
              event.projectId,
              { components },
              'avca'
            );
          }
        }
      }
    );
  }
} 