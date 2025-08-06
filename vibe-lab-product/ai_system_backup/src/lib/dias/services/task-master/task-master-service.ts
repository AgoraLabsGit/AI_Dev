/**
 * TaskMaster Service
 * TypeScript wrapper for the task-master-ai CLI
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { BaseService } from '@/lib/avca/services/base-service';
import { 
  Task, 
  SubTask, 
  ComplexityReport, 
  ServiceResponse, 
  DIASServiceConfig 
} from '../types';

const execAsync = promisify(exec);

export class TaskMasterService extends BaseService {
  private cliCommand: string;
  private configPath: string;

  constructor(config: DIASServiceConfig) {
    super('TaskMasterService');
    this.cliCommand = config.taskMasterCLI.command || 'task-master';
    this.configPath = config.taskMasterCLI.configPath || './.taskmasterconfig';
  }

  /**
   * Execute task-master CLI command with error handling and logging
   */
  private async executeCLI(command: string, args: string[] = []): Promise<ServiceResponse<string>> {
    const startTime = Date.now();
    const fullCommand = `${this.cliCommand} ${command} ${args.join(' ')}`;
    
    try {
      this.log('info', `Executing TaskMaster command: ${fullCommand}`);
      
      const { stdout, stderr } = await execAsync(fullCommand, {
        cwd: process.cwd(),
        env: { ...process.env, NODE_ENV: 'production' }
      });

      const executionTime = Date.now() - startTime;
      
      if (stderr) {
        this.log('warn', `TaskMaster stderr: ${stderr}`);
      }

      this.log('info', `TaskMaster command completed in ${executionTime}ms`);
      
      return {
        success: true,
        data: stdout.trim(),
        executionTime,
        metadata: {
          command: fullCommand,
          stderr: stderr || null
        }
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this.log('error', `TaskMaster command failed: ${fullCommand}`, { error: errorMessage });
      
      return {
        success: false,
        error: errorMessage,
        executionTime,
        metadata: {
          command: fullCommand
        }
      };
    }
  }

  /**
   * Initialize TaskMaster in the project
   */
  async initialize(projectName: string, description?: string): Promise<ServiceResponse<boolean>> {
    const args = [
      '-n', `"${projectName}"`,
      '--no-aliases',
      '--git-tasks',
      '-r', 'cursor'
    ];
    
    if (description) {
      args.push('-d', `"${description}"`);
    }

    const result = await this.executeCLI('init', args);
    return {
      ...result,
      data: result.success
    };
  }

  /**
   * Parse a roadmap document and generate tasks
   */
  async parseRoadmap(filePath: string, numTasks?: number): Promise<ServiceResponse<Task[]>> {
    const args = [`--input=${filePath}`];
    
    if (numTasks !== undefined) {
      args.push(`--num-tasks=${numTasks}`);
    }

    const result = await this.executeCLI('parse-prd', args);
    
    if (!result.success) {
      return { ...result, data: [] };
    }

    // Parse the tasks from the CLI output
    try {
      const tasks = await this.listTasks();
      return tasks;
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse generated tasks: ${error}`,
        executionTime: result.executionTime
      };
    }
  }

  /**
   * List all tasks
   */
  async listTasks(status?: string, withSubtasks = false): Promise<ServiceResponse<Task[]>> {
    const args: string[] = ['--json'];
    
    if (status) {
      args.push(`--status=${status}`);
    }
    
    if (withSubtasks) {
      args.push('--with-subtasks');
    }

    const result = await this.executeCLI('list', args);
    
    if (!result.success) {
      return { ...result, data: [] };
    }

    // Parse tasks from CLI output
    try {
      const tasks = JSON.parse(result.data || '[]');
      return {
        ...result,
        data: tasks
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse tasks output: ${error}`,
        executionTime: result.executionTime
      };
    }
  }

  /**
   * Get the next task to work on
   */
  async getNextTask(): Promise<ServiceResponse<Task | null>> {
    const result = await this.executeCLI('next', ['--json']);
    
    if (!result.success) {
      return { ...result, data: null };
    }

    try {
      const task = JSON.parse(result.data || 'null');
      return {
        ...result,
        data: task
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse next task: ${error}`,
        executionTime: result.executionTime
      };
    }
  }

  /**
   * Get a specific task by ID
   */
  async getTask(taskId: string): Promise<ServiceResponse<Task | null>> {
    const result = await this.executeCLI('show', [taskId, '--json']);
    
    if (!result.success) {
      return { ...result, data: null };
    }

    try {
      const task = JSON.parse(result.data || 'null');
      return {
        ...result,
        data: task
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse task: ${error}`,
        executionTime: result.executionTime
      };
    }
  }

  /**
   * Set task status
   */
  async setTaskStatus(taskId: string, status: Task['status']): Promise<ServiceResponse<boolean>> {
    const result = await this.executeCLI('set-status', [`--id=${taskId}`, `--status=${status}`]);
    return {
      ...result,
      data: result.success
    };
  }

  /**
   * Add a new task
   */
  async addTask(
    prompt: string, 
    dependencies?: string[], 
    priority?: Task['priority']
  ): Promise<ServiceResponse<Task | null>> {
    const args = [`--prompt="${prompt}"`, '--json'];
    
    if (dependencies && dependencies.length > 0) {
      args.push(`--dependencies=${dependencies.join(',')}`);
    }
    
    if (priority) {
      args.push(`--priority=${priority}`);
    }

    const result = await this.executeCLI('add-task', args);
    
    if (!result.success) {
      return { ...result, data: null };
    }

    try {
      const task = JSON.parse(result.data || 'null');
      return { ...result, data: task };
    } catch (error) {
      this.log('warn', 'Failed to retrieve newly created task from add-task JSON output', { error });
    }

    return {
      ...result,
      data: null
    };
  }

  /**
   * Expand a task into subtasks
   */
  async expandTask(
    taskId: string, 
    numSubtasks?: number, 
    prompt?: string, 
    useResearch = false
  ): Promise<ServiceResponse<Task | null>> {
    const args = [`--id=${taskId}`, '--json'];
    
    if (numSubtasks !== undefined) {
      args.push(`--num=${numSubtasks}`);
    }
    
    if (prompt) {
      args.push(`--prompt="${prompt}"`);
    }
    
    if (useResearch) {
      args.push('--research');
    }

    const result = await this.executeCLI('expand', args);
    
    if (!result.success) {
      return { ...result, data: null };
    }

    // Get the expanded task
    return await this.getTask(taskId);
  }

  /**
   * Analyze task complexity
   */
  async analyzeComplexity(
    useResearch = false, 
    threshold = 5, 
    outputFile?: string
  ): Promise<ServiceResponse<ComplexityReport>> {
    const args: string[] = ['--json'];
    
    if (useResearch) {
      args.push('--research');
    }
    
    args.push(`--threshold=${threshold}`);
    
    if (outputFile) {
      args.push(`--output=${outputFile}`);
    }

    const result = await this.executeCLI('analyze-complexity', args);
    
    if (!result.success) {
      return { ...result, data: undefined };
    }

    try {
      const report = JSON.parse(result.data || '{}');
      return {
        ...result,
        data: report
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse complexity report: ${error}`,
        executionTime: result.executionTime
      };
    }
  }

  /**
   * Generate individual task files
   */
  async generateTaskFiles(): Promise<ServiceResponse<boolean>> {
    const result = await this.executeCLI('generate');
    return {
      ...result,
      data: result.success
    };
  }
  
  /**
   * Health check for TaskMaster CLI
   */
  async healthCheck(): Promise<ServiceResponse<boolean>> {
    const result = await this.executeCLI('--version');
    return {
      ...result,
      data: result.success
    };
  }
}
