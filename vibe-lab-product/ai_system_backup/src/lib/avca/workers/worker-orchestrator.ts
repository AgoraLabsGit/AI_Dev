/**
 * INT-002: Worker Architecture Expansion
 * 
 * Specialized worker orchestration system for parallel processing
 * Supports component generation, testing, and documentation workers
 */

import { BaseService } from '../services/base-service';
import { EventBus } from '../services/event-bus';
import { EventFactory, EventCategory } from '../../dias/events/event-types';

export interface WorkerConfig {
  name: string;
  version: string;
  eventBus?: EventBus;
  maxConcurrentWorkers?: number;
  workerTimeout?: number;
  retryAttempts?: number;
}

export interface WorkerTask {
  id: string;
  type: 'component-generation' | 'testing' | 'documentation' | 'optimization' | 'validation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  dependencies?: string[];
  estimatedTime?: number;
  retries?: number;
  createdAt: Date;
  assignedAt?: Date;
  completedAt?: Date;
  status: 'pending' | 'assigned' | 'running' | 'completed' | 'failed' | 'cancelled';
}

export interface WorkerInstance {
  id: string;
  type: string;
  status: 'idle' | 'busy' | 'error' | 'offline';
  currentTask?: string;
  capabilities: string[];
  performance: {
    tasksCompleted: number;
    averageTime: number;
    successRate: number;
    lastActive: Date;
  };
  metadata: {
    created: Date;
    version: string;
    config: any;
  };
}

export interface WorkerResult {
  taskId: string;
  workerId: string;
  status: 'success' | 'failure' | 'partial';
  result?: any;
  error?: string;
  duration: number;
  metadata: {
    timestamp: Date;
    performance: {
      cpuUsage?: number;
      memoryUsage?: number;
      operations?: number;
    };
  };
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  tasks: WorkerTask[];
  dependencies: Record<string, string[]>;
  parallelGroups?: string[][];
  executionStrategy: 'sequential' | 'parallel' | 'hybrid';
  timeout?: number;
  retryPolicy?: {
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential';
    backoffDelay: number;
  };
}

export class WorkerOrchestrator extends BaseService {
  private eventBus?: EventBus;
  protected config: WorkerConfig;
  private workers: Map<string, WorkerInstance> = new Map();
  private taskQueue: WorkerTask[] = [];
  private runningTasks: Map<string, WorkerTask> = new Map();
  private completedTasks: Map<string, WorkerResult> = new Map();
  private workflows: Map<string, WorkflowDefinition> = new Map();

  constructor(config: Partial<WorkerConfig> = {}) {
    super({
      name: config.name || 'worker-orchestrator',
      version: config.version || '1.0.0',
      dependencies: []
    });
    this.config = {
      name: config.name || 'worker-orchestrator',
      version: config.version || '1.0.0',
      maxConcurrentWorkers: 10,
      workerTimeout: 300000, // 5 minutes
      retryAttempts: 3,
      ...config
    };
    this.eventBus = config.eventBus;
  }

  protected async initialize(): Promise<void> {
    await this.initializeWorkers();
    this.startTaskProcessor();
    this.log('info', 'Worker Orchestrator initialized');
  }

  protected async cleanup(): Promise<void> {
    await this.shutdownAllWorkers();
    this.taskQueue = [];
    this.runningTasks.clear();
    this.completedTasks.clear();
    this.log('info', 'Worker Orchestrator cleaned up');
  }

  protected async healthCheck(): Promise<boolean> {
    const healthyWorkers = Array.from(this.workers.values())
      .filter(w => w.status !== 'error' && w.status !== 'offline').length;
    return healthyWorkers > 0;
  }

  async process(data: any): Promise<WorkerResult[]> {
    if (data.workflow) {
      return await this.executeWorkflow(data.workflow);
    } else if (data.task) {
      const result = await this.executeTask(data.task);
      return [result];
    }
    throw new Error('Invalid worker orchestrator input');
  }

  /**
   * Execute a single task
   */
  async executeTask(task: Omit<WorkerTask, 'id' | 'createdAt' | 'status'>): Promise<WorkerResult> {
    const workerTask: WorkerTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      status: 'pending',
      retries: 0,
      ...task
    };

    await this.emitWorkerEvent('TASK_CREATED', workerTask.id, {
      type: workerTask.type,
      priority: workerTask.priority
    });

    // Add to queue
    this.addTaskToQueue(workerTask);

    // Wait for completion
    return new Promise((resolve, reject) => {
      const checkCompletion = () => {
        const result = this.completedTasks.get(workerTask.id);
        if (result) {
          resolve(result);
        } else if (this.runningTasks.has(workerTask.id)) {
          setTimeout(checkCompletion, 1000);
        } else {
          reject(new Error(`Task ${workerTask.id} failed or was cancelled`));
        }
      };
      checkCompletion();
    });
  }

  /**
   * Execute a workflow with multiple tasks
   */
  async executeWorkflow(workflowId: string): Promise<WorkerResult[]> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    await this.emitWorkerEvent('WORKFLOW_STARTED', workflowId, {
      tasks: workflow.tasks.length,
      strategy: workflow.executionStrategy
    });

    const results: WorkerResult[] = [];

    try {
      switch (workflow.executionStrategy) {
        case 'sequential':
          for (const task of workflow.tasks) {
            const result = await this.executeTask(task);
            results.push(result);
          }
          break;

        case 'parallel':
          const parallelPromises = workflow.tasks.map(task => this.executeTask(task));
          const parallelResults = await Promise.all(parallelPromises);
          results.push(...parallelResults);
          break;

        case 'hybrid':
          // Execute tasks in dependency order with parallel groups
          results.push(...await this.executeHybridWorkflow(workflow));
          break;
      }

      await this.emitWorkerEvent('WORKFLOW_COMPLETED', workflowId, {
        results: results.length,
        successful: results.filter(r => r.status === 'success').length
      });

      return results;

    } catch (error) {
      await this.emitWorkerEvent('WORKFLOW_FAILED', workflowId, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Add task to queue with priority ordering
   */
  private addTaskToQueue(task: WorkerTask): void {
    // Insert task based on priority
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const taskPriority = priorityOrder[task.priority];

    let insertIndex = this.taskQueue.length;
    for (let i = 0; i < this.taskQueue.length; i++) {
      const queuedTaskPriority = priorityOrder[this.taskQueue[i].priority];
      if (taskPriority > queuedTaskPriority) {
        insertIndex = i;
        break;
      }
    }

    this.taskQueue.splice(insertIndex, 0, task);
    this.log('info', `Task ${task.id} added to queue at position ${insertIndex}`);
  }

  /**
   * Process task queue continuously
   */
  private startTaskProcessor(): void {
    const processQueue = async () => {
      try {
        // Check for available workers and pending tasks
        const availableWorkers = Array.from(this.workers.values())
          .filter(w => w.status === 'idle');

        if (availableWorkers.length > 0 && this.taskQueue.length > 0) {
          const task = this.taskQueue.shift()!;
          const worker = this.findBestWorker(task, availableWorkers);

          if (worker) {
            await this.assignTaskToWorker(task, worker);
          } else {
            // No suitable worker, put task back in queue
            this.taskQueue.unshift(task);
          }
        }

        // Check for completed or failed tasks
        this.checkRunningTasks();

      } catch (error) {
        this.log('error', `Task processor error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Continue processing
      setTimeout(processQueue, 1000);
    };

    processQueue();
  }

  /**
   * Find the best worker for a task
   */
  private findBestWorker(task: WorkerTask, availableWorkers: WorkerInstance[]): WorkerInstance | null {
    // Filter workers by capability
    const capableWorkers = availableWorkers.filter(worker => 
      worker.capabilities.includes(task.type) ||
      worker.capabilities.includes('general')
    );

    if (capableWorkers.length === 0) return null;

    // Select worker with best performance for this task type
    return capableWorkers.reduce((best, current) => {
      const bestScore = this.calculateWorkerScore(best, task);
      const currentScore = this.calculateWorkerScore(current, task);
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Calculate worker suitability score
   */
  private calculateWorkerScore(worker: WorkerInstance, task: WorkerTask): number {
    let score = 0;

    // Performance-based scoring
    score += worker.performance.successRate * 0.4;
    score += (1 / (worker.performance.averageTime || 1)) * 0.3;
    score += (worker.performance.tasksCompleted / 100) * 0.2;

    // Capability match
    if (worker.capabilities.includes(task.type)) {
      score += 0.1;
    }

    return score;
  }

  /**
   * Assign task to worker
   */
  private async assignTaskToWorker(task: WorkerTask, worker: WorkerInstance): Promise<void> {
    task.status = 'assigned';
    task.assignedAt = new Date();
    worker.status = 'busy';
    worker.currentTask = task.id;

    this.runningTasks.set(task.id, task);

    await this.emitWorkerEvent('TASK_ASSIGNED', task.id, {
      workerId: worker.id,
      workerType: worker.type
    });

    // Simulate task execution (in real implementation, this would dispatch to actual worker)
    setTimeout(async () => {
      await this.completeTask(task.id, worker.id);
    }, Math.random() * 5000 + 2000); // 2-7 seconds
  }

  /**
   * Complete a task
   */
  private async completeTask(taskId: string, workerId: string): Promise<void> {
    const task = this.runningTasks.get(taskId);
    const worker = this.workers.get(workerId);

    if (!task || !worker) return;

    const startTime = task.assignedAt?.getTime() || Date.now();
    const duration = Date.now() - startTime;

    // Simulate success/failure (90% success rate)
    const success = Math.random() > 0.1;

    const result: WorkerResult = {
      taskId,
      workerId,
      status: success ? 'success' : 'failure',
      result: success ? this.generateTaskResult(task) : undefined,
      error: success ? undefined : 'Simulated task failure',
      duration,
      metadata: {
        timestamp: new Date(),
        performance: {
          cpuUsage: Math.random() * 100,
          memoryUsage: Math.random() * 1000,
          operations: Math.floor(Math.random() * 1000)
        }
      }
    };

    // Update worker performance
    worker.performance.tasksCompleted++;
    worker.performance.averageTime = 
      (worker.performance.averageTime * (worker.performance.tasksCompleted - 1) + duration) / 
      worker.performance.tasksCompleted;
    worker.performance.successRate = 
      (worker.performance.successRate * (worker.performance.tasksCompleted - 1) + (success ? 1 : 0)) /
      worker.performance.tasksCompleted;
    worker.performance.lastActive = new Date();
    worker.status = 'idle';
    worker.currentTask = undefined;

    // Store result and clean up
    this.completedTasks.set(taskId, result);
    this.runningTasks.delete(taskId);

    await this.emitWorkerEvent('TASK_COMPLETED', taskId, {
      workerId,
      status: result.status,
      duration
    });

    this.log('info', `Task ${taskId} ${result.status} in ${duration}ms`);
  }

  /**
   * Generate appropriate result based on task type
   */
  private generateTaskResult(task: WorkerTask): any {
    switch (task.type) {
      case 'component-generation':
        return {
          componentCode: `// Generated component for ${task.data.name}`,
          testCode: `// Generated tests for ${task.data.name}`,
          storyCode: `// Generated stories for ${task.data.name}`,
          documentation: `# ${task.data.name} Component Documentation`
        };

      case 'testing':
        return {
          testResults: {
            passed: Math.floor(Math.random() * 20) + 10,
            failed: Math.floor(Math.random() * 3),
            coverage: Math.random() * 30 + 70
          },
          duration: Math.random() * 5000 + 1000
        };

      case 'documentation':
        return {
          documentation: `Generated documentation for ${task.data.component}`,
          apiReference: 'API reference generated',
          examples: ['Example 1', 'Example 2']
        };

      case 'optimization':
        return {
          optimizations: ['Bundle size reduced by 15%', 'Load time improved by 200ms'],
          metrics: {
            bundleSize: Math.random() * 100 + 200,
            loadTime: Math.random() * 1000 + 500
          }
        };

      case 'validation':
        return {
          validationResults: {
            errors: Math.floor(Math.random() * 2),
            warnings: Math.floor(Math.random() * 5),
            passed: true
          },
          suggestions: ['Consider using TypeScript', 'Add error boundaries']
        };

      default:
        return { message: 'Task completed successfully' };
    }
  }

  /**
   * Check running tasks for timeouts
   */
  private checkRunningTasks(): void {
    const now = Date.now();
    const timeout = this.config.workerTimeout || 300000;

    for (const [taskId, task] of this.runningTasks) {
      const assignedTime = task.assignedAt?.getTime() || now;
      if (now - assignedTime > timeout) {
        this.handleTaskTimeout(taskId);
      }
    }
  }

  /**
   * Handle task timeout
   */
  private async handleTaskTimeout(taskId: string): Promise<void> {
    const task = this.runningTasks.get(taskId);
    if (!task) return;

    const worker = Array.from(this.workers.values())
      .find(w => w.currentTask === taskId);

    if (worker) {
      worker.status = 'idle';
      worker.currentTask = undefined;
    }

    // Retry if attempts remaining
    if ((task.retries || 0) < (this.config.retryAttempts || 3)) {
      task.retries = (task.retries || 0) + 1;
      task.status = 'pending';
      this.addTaskToQueue(task);
      this.log('warn', `Task ${taskId} timed out, retrying (attempt ${task.retries})`);
    } else {
      // Mark as failed
      const result: WorkerResult = {
        taskId,
        workerId: worker?.id || 'unknown',
        status: 'failure',
        error: 'Task timed out after maximum retries',
        duration: Date.now() - (task.assignedAt?.getTime() || Date.now()),
        metadata: {
          timestamp: new Date(),
          performance: {}
        }
      };

      this.completedTasks.set(taskId, result);
      this.log('error', `Task ${taskId} failed after timeout and retries`);
    }

    this.runningTasks.delete(taskId);

    await this.emitWorkerEvent('TASK_TIMEOUT', taskId, {
      workerId: worker?.id,
      retries: task.retries
    });
  }

  /**
   * Execute hybrid workflow with dependency resolution
   */
  private async executeHybridWorkflow(workflow: WorkflowDefinition): Promise<WorkerResult[]> {
    const results: WorkerResult[] = [];
    const completed = new Set<string>();
    const remaining = [...workflow.tasks];

    while (remaining.length > 0) {
      // Find tasks with satisfied dependencies
      const readyTasks = remaining.filter(task => {
        const deps = workflow.dependencies[task.id] || [];
        return deps.every(dep => completed.has(dep));
      });

      if (readyTasks.length === 0) {
        throw new Error('Circular dependency or missing dependency in workflow');
      }

      // Execute ready tasks in parallel
      const batchPromises = readyTasks.map(task => this.executeTask(task));
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults);
      
      // Mark tasks as completed
      readyTasks.forEach(task => {
        completed.add(task.id);
        const index = remaining.indexOf(task);
        if (index > -1) remaining.splice(index, 1);
      });
    }

    return results;
  }

  /**
   * Initialize worker instances
   */
  private async initializeWorkers(): Promise<void> {
    const workerTypes = [
      { type: 'component-generator', count: 3, capabilities: ['component-generation', 'general'] },
      { type: 'tester', count: 2, capabilities: ['testing', 'validation', 'general'] },
      { type: 'documenter', count: 2, capabilities: ['documentation', 'general'] },
      { type: 'optimizer', count: 1, capabilities: ['optimization', 'general'] }
    ];

    for (const workerType of workerTypes) {
      for (let i = 0; i < workerType.count; i++) {
        const worker: WorkerInstance = {
          id: `${workerType.type}_${i + 1}`,
          type: workerType.type,
          status: 'idle',
          capabilities: workerType.capabilities,
          performance: {
            tasksCompleted: 0,
            averageTime: 0,
            successRate: 1.0,
            lastActive: new Date()
          },
          metadata: {
            created: new Date(),
            version: '1.0.0',
            config: {}
          }
        };

        this.workers.set(worker.id, worker);
      }
    }

    this.log('info', `Initialized ${this.workers.size} workers`);
  }

  /**
   * Shutdown all workers
   */
  private async shutdownAllWorkers(): Promise<void> {
    for (const worker of this.workers.values()) {
      worker.status = 'offline';
    }
    this.workers.clear();
    this.log('info', 'All workers shut down');
  }

  /**
   * Register a workflow definition
   */
  registerWorkflow(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow);
    this.log('info', `Registered workflow: ${workflow.name}`);
  }

  /**
   * Get worker statistics
   */
  getWorkerStats(): {
    total: number;
    idle: number;
    busy: number;
    offline: number;
    performance: {
      totalTasksCompleted: number;
      averageSuccessRate: number;
      averageTaskTime: number;
    };
  } {
    const workers = Array.from(this.workers.values());
    const totalTasksCompleted = workers.reduce((sum, w) => sum + w.performance.tasksCompleted, 0);
    const averageSuccessRate = workers.reduce((sum, w) => sum + w.performance.successRate, 0) / workers.length;
    const averageTaskTime = workers.reduce((sum, w) => sum + w.performance.averageTime, 0) / workers.length;

    return {
      total: workers.length,
      idle: workers.filter(w => w.status === 'idle').length,
      busy: workers.filter(w => w.status === 'busy').length,
      offline: workers.filter(w => w.status === 'offline').length,
      performance: {
        totalTasksCompleted,
        averageSuccessRate,
        averageTaskTime
      }
    };
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    pending: number;
    running: number;
    completed: number;
    failed: number;
  } {
    const completedResults = Array.from(this.completedTasks.values());
    
    return {
      pending: this.taskQueue.length,
      running: this.runningTasks.size,
      completed: completedResults.filter(r => r.status === 'success').length,
      failed: completedResults.filter(r => r.status === 'failure').length
    };
  }

  /**
   * Emit worker events
   */
  private async emitWorkerEvent(type: string, entityId: string, data: any): Promise<void> {
    if (this.eventBus) {
      const event = EventFactory.createEvent(
        EventCategory.SYSTEM, 
        type, 
        this.config.name, 
        'default-project', 
        {
          service: this.config.name,
          entityId,
          ...data
        }
      );
      await this.eventBus.publish('worker-orchestrator', this.config.name, event);
    }
  }
}