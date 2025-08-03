/**
 * Log Manager
 * 
 * Centralized logging system:
 * - Log aggregation
 * - Log formatting
 * - Log persistence
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogFormat = 'json' | 'text';

export interface LogManagerConfig {
  services: string[];
  level?: LogLevel;
  format?: LogFormat;
  retention?: number;
  batchSize?: number;
  flushInterval?: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  service: string;
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export class LogManager {
  private config: Required<LogManagerConfig>;
  private logQueue: LogEntry[] = [];
  private flushInterval?: NodeJS.Timeout;
  private isRunning = false;

  constructor(config: LogManagerConfig) {
    this.config = {
      services: config.services,
      level: config.level || 'info',
      format: config.format || 'json',
      retention: config.retention || 7 * 24 * 60 * 60 * 1000, // 7 days
      batchSize: config.batchSize || 100,
      flushInterval: config.flushInterval || 5000
    };
  }

  /**
   * Start log manager
   */
  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.startFlushTimer();
  }

  /**
   * Stop log manager
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flushLogs();
  }

  /**
   * Log a message
   */
  log(
    level: LogLevel,
    service: string,
    message: string,
    context?: Record<string, any>
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      level,
      service,
      message,
      context
    };

    this.queueLog(entry);
  }

  /**
   * Log an error
   */
  error(
    service: string,
    error: Error,
    context?: Record<string, any>
  ): void {
    const entry: LogEntry = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      level: 'error',
      service,
      message: error.message,
      context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    };

    this.queueLog(entry);
  }

  /**
   * Get recent logs
   */
  async getLogs(
    options: {
      service?: string;
      level?: LogLevel;
      startTime?: number;
      endTime?: number;
      limit?: number;
    } = {}
  ): Promise<LogEntry[]> {
    // In a real implementation, this would query a log store
    return this.logQueue.filter(log => {
      if (options.service && log.service !== options.service) return false;
      if (options.level && log.level !== options.level) return false;
      if (options.startTime && log.timestamp < options.startTime) return false;
      if (options.endTime && log.timestamp > options.endTime) return false;
      return true;
    }).slice(0, options.limit || 100);
  }

  /**
   * Queue a log entry
   */
  private queueLog(entry: LogEntry): void {
    this.logQueue.push(entry);
    
    if (this.logQueue.length >= this.config.batchSize) {
      this.flushLogs();
    }
  }

  /**
   * Flush queued logs
   */
  private async flushLogs(): Promise<void> {
    if (this.logQueue.length === 0) return;

    const logs = [...this.logQueue];
    this.logQueue = [];

    try {
      await this.persistLogs(logs);
    } catch (error) {
      // Re-queue failed logs
      this.logQueue.unshift(...logs);
      console.error('Failed to persist logs:', error);
    }
  }

  /**
   * Persist logs to storage
   */
  private async persistLogs(logs: LogEntry[]): Promise<void> {
    // Format logs
    const formattedLogs = logs.map(log => this.formatLog(log));

    // In a real implementation, this would write to a log store
    console.log(formattedLogs);
  }

  /**
   * Format a log entry
   */
  private formatLog(entry: LogEntry): string {
    if (this.config.format === 'json') {
      return JSON.stringify(entry);
    }

    // Text format
    const timestamp = new Date(entry.timestamp).toISOString();
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const error = entry.error ? `\n${entry.error.stack || entry.error.message}` : '';
    
    return `[${timestamp}] ${entry.level.toUpperCase()} [${entry.service}] ${entry.message}${context}${error}`;
  }

  /**
   * Check if a log level should be recorded
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    return levels[level] >= levels[this.config.level];
  }

  /**
   * Generate a unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start the flush timer
   */
  private startFlushTimer(): void {
    this.flushInterval = setInterval(
      () => this.flushLogs(),
      this.config.flushInterval
    );
  }
}