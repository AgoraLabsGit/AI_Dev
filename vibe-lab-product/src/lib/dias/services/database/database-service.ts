/**
 * DIAS Database Service
 * Persistence layer for SuperClaude and TaskMaster data
 */

import { BaseService } from '@/lib/avca/services/base-service';
import { PrismaClient } from '@prisma/client';
import { 
  Task, 
  ComplexityReport, 
  ServiceResponse,
  AIRequest,
  AIResponse,
  ContextData,
  DIASEvent
} from '../types';

// Extend Prisma client with DIAS-specific methods
interface DIASPrismaClient extends PrismaClient {
  // Custom methods would be added here if needed
}

export class DatabaseService extends BaseService {
  private prisma: DIASPrismaClient;

  constructor() {
    super('DatabaseService');
    this.prisma = new PrismaClient() as DIASPrismaClient;
  }

  /**
   * SuperClaude Session Management
   */
  async createSession(
    userId: string,
    projectId: string,
    sessionId: string,
    persona: string
  ): Promise<ServiceResponse<string>> {
    try {
      const session = await this.prisma.$executeRaw`
        INSERT INTO superclaude_sessions (user_id, project_id, session_id, persona)
        VALUES (${userId}, ${projectId}, ${sessionId}, ${persona})
        RETURNING id
      `;

      return {
        success: true,
        data: sessionId,
        executionTime: 0
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create session'
      };
    }
  }

  async updateSession(
    sessionId: string,
    commandsExecuted: any[],
    context: any,
    flags: any,
    tokensUsed: number,
    cost: number,
    mcpServers: string[]
  ): Promise<ServiceResponse<boolean>> {
    try {
      await this.prisma.$executeRaw`
        UPDATE superclaude_sessions 
        SET 
          commands_executed = ${JSON.stringify(commandsExecuted)},
          context = ${JSON.stringify(context)},
          flags = ${JSON.stringify(flags)},
          total_tokens_used = total_tokens_used + ${tokensUsed},
          total_cost = total_cost + ${cost},
          mcp_servers_used = ${JSON.stringify(mcpServers)},
          updated_at = NOW()
        WHERE session_id = ${sessionId}
      `;

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update session'
      };
    }
  }

  async getSession(sessionId: string): Promise<ServiceResponse<any>> {
    try {
      const session = await this.prisma.$queryRaw`
        SELECT * FROM superclaude_sessions 
        WHERE session_id = ${sessionId} AND expires_at > NOW()
        LIMIT 1
      `;

      return {
        success: true,
        data: Array.isArray(session) ? session[0] : null
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get session'
      };
    }
  }

  /**
   * TaskMaster Data Management
   */
  async saveTaskMasterConfig(
    projectId: string,
    configData: any,
    tasksJson: any,
    complexityReport?: ComplexityReport
  ): Promise<ServiceResponse<boolean>> {
    try {
      await this.prisma.$executeRaw`
        INSERT INTO task_master_config (project_id, config_data, tasks_json, complexity_report)
        VALUES (${projectId}, ${JSON.stringify(configData)}, ${JSON.stringify(tasksJson)}, ${JSON.stringify(complexityReport || {})})
        ON CONFLICT (project_id) 
        DO UPDATE SET 
          config_data = EXCLUDED.config_data,
          tasks_json = EXCLUDED.tasks_json,
          complexity_report = EXCLUDED.complexity_report,
          last_sync = NOW(),
          updated_at = NOW()
      `;

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save TaskMaster config'
      };
    }
  }

  async getTaskMasterConfig(projectId: string): Promise<ServiceResponse<any>> {
    try {
      const config = await this.prisma.$queryRaw`
        SELECT * FROM task_master_config WHERE project_id = ${projectId}
      `;

      return {
        success: true,
        data: Array.isArray(config) ? config[0] : null
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get TaskMaster config'
      };
    }
  }

  /**
   * Task Management
   */
  async saveTasks(tasks: Task[], projectId: string): Promise<ServiceResponse<number>> {
    try {
      let savedCount = 0;

      for (const task of tasks) {
        await this.prisma.$executeRaw`
          INSERT INTO tasks (
            id, project_id, title, description, details, test_strategy,
            status, priority, complexity, estimated_time, dependencies,
            subtasks, mcp_integration, tags
          )
          VALUES (
            ${task.id}, ${projectId}, ${task.title}, ${task.description || ''}, 
            ${task.details || ''}, ${task.testStrategy || ''}, ${task.status}, 
            ${task.priority}, ${task.complexity || null}, ${task.estimatedTime || ''}, 
            ${JSON.stringify(task.dependencies)}, ${JSON.stringify(task.subtasks || [])},
            ${JSON.stringify(task.mcpIntegration || [])}, ${JSON.stringify([])}
          )
          ON CONFLICT (id) 
          DO UPDATE SET 
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            details = EXCLUDED.details,
            test_strategy = EXCLUDED.test_strategy,
            status = EXCLUDED.status,
            priority = EXCLUDED.priority,
            complexity = EXCLUDED.complexity,
            estimated_time = EXCLUDED.estimated_time,
            dependencies = EXCLUDED.dependencies,
            subtasks = EXCLUDED.subtasks,
            mcp_integration = EXCLUDED.mcp_integration,
            updated_at = NOW()
        `;
        savedCount++;
      }

      return {
        success: true,
        data: savedCount
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save tasks'
      };
    }
  }

  async getTasks(
    projectId: string, 
    status?: string, 
    includeSubtasks = false
  ): Promise<ServiceResponse<Task[]>> {
    try {
      let query = `
        SELECT * FROM tasks 
        WHERE project_id = $1
      `;
      const params = [projectId];

      if (status) {
        query += ` AND status = $2`;
        params.push(status);
      }

      query += ` ORDER BY created_at DESC`;

      const tasks = await this.prisma.$queryRawUnsafe(query, ...params);

      return {
        success: true,
        data: Array.isArray(tasks) ? tasks.map(this.mapDbTaskToTask) : []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get tasks'
      };
    }
  }

  async updateTaskStatus(
    taskId: string, 
    status: Task['status'], 
    userId?: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const completedAt = status === 'done' ? 'NOW()' : 'NULL';
      
      await this.prisma.$executeRaw`
        UPDATE tasks 
        SET 
          status = ${status},
          completed_at = ${completedAt === 'NOW()' ? new Date() : null},
          updated_at = NOW()
        WHERE id = ${taskId}
      `;

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update task status'
      };
    }
  }

  /**
   * Context Cache Management
   */
  async saveContextCache(
    cacheKey: string,
    projectId: string,
    data: any,
    contextType: string,
    filePaths: string[],
    ttl: number,
    compressed = false
  ): Promise<ServiceResponse<boolean>> {
    try {
      const expiresAt = new Date(Date.now() + ttl);

      await this.prisma.$executeRaw`
        INSERT INTO context_cache (
          cache_key, project_id, data, compressed, context_type, 
          file_paths, expires_at
        )
        VALUES (
          ${cacheKey}, ${projectId}, ${JSON.stringify(data)}, ${compressed},
          ${contextType}, ${JSON.stringify(filePaths)}, ${expiresAt}
        )
        ON CONFLICT (cache_key)
        DO UPDATE SET
          data = EXCLUDED.data,
          compressed = EXCLUDED.compressed,
          file_paths = EXCLUDED.file_paths,
          expires_at = EXCLUDED.expires_at,
          access_count = context_cache.access_count + 1,
          last_accessed = NOW()
      `;

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save context cache'
      };
    }
  }

  async getContextCache(cacheKey: string): Promise<ServiceResponse<any>> {
    try {
      const cache = await this.prisma.$queryRaw`
        SELECT * FROM context_cache 
        WHERE cache_key = ${cacheKey} AND expires_at > NOW()
        LIMIT 1
      `;

      if (Array.isArray(cache) && cache.length > 0) {
        // Update access count
        await this.prisma.$executeRaw`
          UPDATE context_cache 
          SET access_count = access_count + 1, last_accessed = NOW()
          WHERE cache_key = ${cacheKey}
        `;
        
        return {
          success: true,
          data: cache[0]
        };
      }

      return {
        success: true,
        data: null
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get context cache'
      };
    }
  }

  /**
   * AI Command History
   */
  async saveAICommandHistory(
    sessionId: string,
    projectId: string,
    userId: string,
    request: AIRequest,
    response: AIResponse,
    success: boolean,
    errorMessage?: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      await this.prisma.$executeRaw`
        INSERT INTO ai_command_history (
          session_id, project_id, user_id, command, args, flags, context,
          persona, mcp_servers_used, model_used, tokens_used, cost,
          execution_time, success, error_message, result_summary
        )
        VALUES (
          ${sessionId}, ${projectId}, ${userId}, ${request.command},
          ${JSON.stringify(request.args || [])}, ${JSON.stringify(request.flags || {})},
          ${request.context || ''}, ${response?.persona || ''}, 
          ${JSON.stringify(response?.mcpServersUsed || [])}, 
          ${response?.metadata?.model || ''}, ${response?.tokensUsed || 0},
          ${response?.cost || 0}, ${response?.executionTime || 0}, ${success},
          ${errorMessage || ''}, ${response?.result?.substring(0, 1000) || ''}
        )
      `;

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save AI command history'
      };
    }
  }

  /**
   * Event Management
   */
  async saveEvent(event: DIASEvent): Promise<ServiceResponse<boolean>> {
    try {
      await this.prisma.$executeRaw`
        INSERT INTO dias_events (event_id, event_type, source, data, metadata)
        VALUES (
          ${event.id}, ${event.type}, ${event.source}, 
          ${JSON.stringify(event.data)}, ${JSON.stringify(event.metadata || {})}
        )
      `;

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save event'
      };
    }
  }

  /**
   * Analytics and Reporting
   */
  async getProjectUsageStats(projectId: string, days = 30): Promise<ServiceResponse<any>> {
    try {
      const stats = await this.prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_commands,
          SUM(tokens_used) as total_tokens,
          SUM(cost) as total_cost,
          AVG(execution_time) as avg_execution_time,
          COUNT(CASE WHEN success THEN 1 END) as successful_commands,
          COUNT(CASE WHEN NOT success THEN 1 END) as failed_commands
        FROM ai_command_history 
        WHERE project_id = ${projectId} 
          AND created_at >= NOW() - INTERVAL '${days} days'
      `;

      return {
        success: true,
        data: Array.isArray(stats) ? stats[0] : {}
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get usage stats'
      };
    }
  }

  /**
   * Maintenance Operations
   */
  async cleanupExpiredData(): Promise<ServiceResponse<{
    sessionsDeleted: number;
    cacheDeleted: number;
  }>> {
    try {
      const [sessionsResult, cacheResult] = await Promise.all([
        this.prisma.$queryRaw`SELECT cleanup_expired_sessions() as deleted`,
        this.prisma.$queryRaw`SELECT cleanup_expired_cache() as deleted`
      ]);

      return {
        success: true,
        data: {
          sessionsDeleted: Array.isArray(sessionsResult) ? sessionsResult[0]?.deleted || 0 : 0,
          cacheDeleted: Array.isArray(cacheResult) ? cacheResult[0]?.deleted || 0 : 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cleanup expired data'
      };
    }
  }

  /**
   * Helper Methods
   */
  private mapDbTaskToTask(dbTask: any): Task {
    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description,
      status: dbTask.status,
      priority: dbTask.priority,
      dependencies: Array.isArray(dbTask.dependencies) ? dbTask.dependencies : 
                   typeof dbTask.dependencies === 'string' ? JSON.parse(dbTask.dependencies) : [],
      details: dbTask.details,
      testStrategy: dbTask.test_strategy,
      subtasks: Array.isArray(dbTask.subtasks) ? dbTask.subtasks :
               typeof dbTask.subtasks === 'string' ? JSON.parse(dbTask.subtasks) : [],
      complexity: dbTask.complexity,
      estimatedTime: dbTask.estimated_time,
      mcpIntegration: Array.isArray(dbTask.mcp_integration) ? dbTask.mcp_integration :
                     typeof dbTask.mcp_integration === 'string' ? JSON.parse(dbTask.mcp_integration) : []
    };
  }

  /**
   * Health Check
   */
  async healthCheck(): Promise<ServiceResponse<boolean>> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database connection failed'
      };
    }
  }

  /**
   * Cleanup
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}