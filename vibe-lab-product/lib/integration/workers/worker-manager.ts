/**
 * Worker Manager
 * 
 * Orchestrates pools of workers and distributes tasks
 */

import { BaseService } from '../../avca/services/base-service';
import { EventBus } from '../../avca/services/event-bus';
import { BaseWorker, WorkerInput, WorkerOutput, WorkerContext } from './worker-base';

export interface WorkerPoolConfig {
  workerClass: typeof BaseWorker;
  minWorkers: number;
  maxWorkers: number;
  idleTimeout?: number;
}

export interface JobRequest {
  id: string;
  workerType: string;
  input: WorkerInput;
  context: WorkerContext;
  priority?: number;
  callback?: (result: WorkerOutput) => void;
}

export class WorkerManager extends BaseService {
  private eventBus: EventBus;
  private workerPools: Map<string, WorkerPool> = new Map();
  private jobQueue: PriorityQueue<JobRequest> = new PriorityQueue();
  private activeJobs: Map<string, JobRequest> = new Map();
  private processing = false;

  constructor(eventBus: EventBus) {
    super({
      name: 'worker-manager',
      version: '1.0.0'
    });
    this.eventBus = eventBus;
  }

  /**
   * Register a worker pool
   */
  registerWorkerPool(type: string, config: WorkerPoolConfig): void {
    if (this.workerPools.has(type)) {
      throw new Error(`Worker pool ${type} already registered`);
    }
    
    const pool = new WorkerPool(type, config, this.eventBus);
    this.workerPools.set(type, pool);
    
    this.log('info', `Registered worker pool: ${type}`, {
      minWorkers: config.minWorkers,
      maxWorkers: config.maxWorkers
    });
  }

  /**
   * Submit a job to the queue
   */
  async submitJob(request: JobRequest): Promise<WorkerOutput> {
    return new Promise((resolve, reject) => {
      // Add callback to request
      request.callback = (result) => {
        if (result.status === 'failed') {
          reject(new Error(result.error?.message || 'Job failed'));
        } else {
          resolve(result);
        }
      };
      
      // Add to queue
      this.jobQueue.enqueue(request, request.priority || 0);
      this.activeJobs.set(request.id, request);
      
      // Start processing if not already running
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string): boolean {
    const job = this.activeJobs.get(jobId);
    if (!job) return false;
    
    // Remove from queue if still pending
    this.jobQueue.remove((item) => item.id === jobId);
    
    // Cancel in worker pool if active
    const pool = this.workerPools.get(job.workerType);
    if (pool) {
      pool.cancelJob(jobId);
    }
    
    this.activeJobs.delete(jobId);
    return true;
  }

  /**
   * Process job queue
   */
  private async processQueue(): Promise<void> {
    this.processing = true;
    
    while (!this.jobQueue.isEmpty()) {
      const job = this.jobQueue.dequeue();
      if (!job) break;
      
      const pool = this.workerPools.get(job.workerType);
      if (!pool) {
        this.log('error', `No worker pool for type: ${job.workerType}`);
        if (job.callback) {
          job.callback({
            id: job.id,
            workerId: 'none',
            status: 'failed',
            error: {
              code: 'NO_WORKER_POOL',
              message: `No worker pool registered for type: ${job.workerType}`
            },
            duration: 0
          });
        }
        continue;
      }
      
      // Execute job in pool
      try {
        const result = await pool.executeJob(job);
        if (job.callback) {
          job.callback(result);
        }
      } catch (error) {
        this.log('error', 'Job execution failed', {
          jobId: job.id,
          error: error instanceof Error ? error.message : error
        });
        
        if (job.callback) {
          job.callback({
            id: job.id,
            workerId: 'none',
            status: 'failed',
            error: {
              code: 'EXECUTION_ERROR',
              message: error instanceof Error ? error.message : 'Unknown error'
            },
            duration: 0
          });
        }
      } finally {
        this.activeJobs.delete(job.id);
      }
    }
    
    this.processing = false;
  }

  /**
   * Get worker pool statistics
   */
  getStats(): Record<string, any> {
    const stats: Record<string, any> = {
      queueSize: this.jobQueue.size(),
      activeJobs: this.activeJobs.size,
      pools: {}
    };
    
    for (const [type, pool] of this.workerPools) {
      stats.pools[type] = pool.getStats();
    }
    
    return stats;
  }

  /**
   * BaseService implementations
   */
  async process(input: any): Promise<any> {
    // Not used - jobs are submitted via submitJob
    throw new Error('Use submitJob() instead');
  }

  protected async initialize(): Promise<void> {
    // Initialize worker pools
    for (const [type, pool] of this.workerPools) {
      await pool.initialize();
    }
  }

  protected async cleanup(): Promise<void> {
    // Cancel all active jobs
    for (const jobId of this.activeJobs.keys()) {
      this.cancelJob(jobId);
    }
    
    // Shutdown worker pools
    for (const [type, pool] of this.workerPools) {
      await pool.shutdown();
    }
  }

  protected async healthCheck(): Promise<boolean> {
    // Check all worker pools
    for (const [type, pool] of this.workerPools) {
      if (!pool.isHealthy()) {
        return false;
      }
    }
    return true;
  }
}

/**
 * Worker Pool - Manages a pool of workers of the same type
 */
class WorkerPool {
  private type: string;
  private config: WorkerPoolConfig;
  private eventBus: EventBus;
  private workers: BaseWorker[] = [];
  private availableWorkers: BaseWorker[] = [];
  private jobAssignments: Map<string, BaseWorker> = new Map();

  constructor(type: string, config: WorkerPoolConfig, eventBus: EventBus) {
    this.type = type;
    this.config = config;
    this.eventBus = eventBus;
  }

  async initialize(): Promise<void> {
    // Create minimum workers
    for (let i = 0; i < this.config.minWorkers; i++) {
      const worker = await this.createWorker();
      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
  }

  async executeJob(job: JobRequest): Promise<WorkerOutput> {
    // Get available worker or create new one
    let worker = this.availableWorkers.pop();
    
    if (!worker && this.workers.length < this.config.maxWorkers) {
      worker = await this.createWorker();
      this.workers.push(worker);
    }
    
    if (!worker) {
      // All workers busy and at max capacity
      throw new Error('No workers available');
    }
    
    // Assign job to worker
    this.jobAssignments.set(job.id, worker);
    
    try {
      const result = await worker.execute(job.input, job.context);
      return result;
    } finally {
      // Return worker to available pool
      this.jobAssignments.delete(job.id);
      this.availableWorkers.push(worker);
    }
  }

  cancelJob(jobId: string): boolean {
    const worker = this.jobAssignments.get(jobId);
    if (worker) {
      return worker.cancel(jobId);
    }
    return false;
  }

  async shutdown(): Promise<void> {
    // Stop all workers
    for (const worker of this.workers) {
      await worker.stop();
    }
    this.workers = [];
    this.availableWorkers = [];
    this.jobAssignments.clear();
  }

  isHealthy(): boolean {
    return this.workers.length >= this.config.minWorkers;
  }

  getStats(): any {
    return {
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      busyWorkers: this.workers.length - this.availableWorkers.length,
      activeJobs: this.jobAssignments.size
    };
  }

  private async createWorker(): Promise<BaseWorker> {
    // This is a simplified version - in reality would use factory pattern
    const WorkerClass = this.config.workerClass as any;
    const worker = new WorkerClass(
      {
        name: `${this.type}-worker-${this.workers.length + 1}`,
        type: this.type as any,
        version: '1.0.0'
      },
      this.eventBus
    );
    
    await worker.start();
    return worker;
  }
}

/**
 * Priority Queue implementation
 */
class PriorityQueue<T> {
  private items: Array<{ item: T; priority: number }> = [];

  enqueue(item: T, priority: number): void {
    const queueItem = { item, priority };
    
    // Find position to insert based on priority
    let added = false;
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].priority < priority) {
        this.items.splice(i, 0, queueItem);
        added = true;
        break;
      }
    }
    
    if (!added) {
      this.items.push(queueItem);
    }
  }

  dequeue(): T | undefined {
    const item = this.items.shift();
    return item?.item;
  }

  remove(predicate: (item: T) => boolean): boolean {
    const index = this.items.findIndex(qi => predicate(qi.item));
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
} 