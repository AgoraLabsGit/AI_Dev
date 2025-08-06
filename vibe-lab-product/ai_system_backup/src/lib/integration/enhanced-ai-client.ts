/**
 * Enhanced AI Client - Seamless SuperClaude Integration
 * Extends existing AIClientService without breaking changes
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { AIClientService, AIRequest, AIResponse, AIRole } from '@/lib/avca/services/ai-client';
import { EventBus } from '@/lib/avca/services/event-bus';
import { personaMapper } from './persona-mapper';
import { SuperClaudePersona, SuperClaudeCommand } from '@/lib/dias/services/types';

const execAsync = promisify(exec);

export interface SuperClaudeRequest extends AIRequest {
  command?: SuperClaudeCommand;
  flags?: string[];
  useSuperClaude?: boolean; // Feature flag for gradual rollout
}

export interface SuperClaudeResponse extends AIResponse {
  persona?: SuperClaudePersona;
  superClaudeUsed?: boolean;
  reasoning?: string;
}

export class EnhancedAIClient extends AIClientService {
  private superClaudeEnabled: boolean;
  private superClaudeCommand: string;
  
  constructor(eventBus: EventBus, enableSuperClaude = false) {
    super(eventBus);
    this.superClaudeEnabled = enableSuperClaude;
    this.superClaudeCommand = process.env.SUPERCLAUDE_CLI_PATH || 'claude-code';
  }

  /**
   * Enhanced process method with SuperClaude integration
   * Maintains backward compatibility with existing AIRequest interface
   */
  async process(request: SuperClaudeRequest): Promise<SuperClaudeResponse> {
    // If SuperClaude is disabled or not requested, use original implementation
    if (!this.superClaudeEnabled || !request.useSuperClaude) {
      const response = await super.process(request);
      return {
        ...response,
        superClaudeUsed: false
      };
    }

    // SuperClaude integration path
    return await this.processSuperClaudeRequest(request);
  }

  /**
   * Process request using SuperClaude framework
   */
  private async processSuperClaudeRequest(request: SuperClaudeRequest): Promise<SuperClaudeResponse> {
    const startTime = Date.now();
    
    try {
      // Map AVCA role to SuperClaude persona
      const personaSelection = personaMapper.selectPersonaWithConfidence(
        request.role,
        request.context,
        request.prompt
      );

      // Build SuperClaude command
      const command = request.command || this.inferCommandFromRequest(request);
      const flags = this.buildFlags(request, personaSelection.persona);

      // Execute SuperClaude command
      const result = await this.executeSuperClaudeCommand(command, flags, request);

      // Parse and format response
      const response: SuperClaudeResponse = {
        content: result.stdout,
        role: request.role,
        model: 'superclaude', // Indicate SuperClaude was used
        usage: this.estimateTokenUsage(request, result.stdout),
        cost: this.estimateCost(request, result.stdout),
        duration: Date.now() - startTime,
        persona: personaSelection.persona,
        superClaudeUsed: true,
        reasoning: personaSelection.reasoning,
        metadata: {
          ...request.metadata,
          command,
          flags,
          confidence: personaSelection.confidence
        }
      };

      this.log('info', `SuperClaude request completed: ${command} with ${personaSelection.persona} persona`);
      return response;

    } catch (error) {
      this.log('warn', `SuperClaude request failed, falling back to standard AI: ${error}`);
      
      // Graceful fallback to original implementation
      const fallbackResponse = await super.process(request);
      return {
        ...fallbackResponse,
        superClaudeUsed: false,
        metadata: {
          ...fallbackResponse.metadata,
          fallbackReason: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  /**
   * Execute SuperClaude CLI command
   */
  private async executeSuperClaudeCommand(
    command: string, 
    flags: string[], 
    request: SuperClaudeRequest
  ): Promise<{ stdout: string; stderr: string }> {
    // Prepare the full command
    const fullCommand = `${this.superClaudeCommand} ${command} ${flags.join(' ')}`;
    
    // Create context file if needed
    let contextFile: string | null = null;
    if (request.context) {
      contextFile = await this.createContextFile(request.context);
      // Add context flag
      flags.push(`--context=${contextFile}`);
    }

    try {
      this.log('info', `Executing SuperClaude: ${fullCommand}`);
      
      const result = await execAsync(fullCommand, {
        cwd: process.cwd(),
        env: { 
          ...process.env,
          SUPERCLAUDE_PROMPT: request.prompt // Pass prompt via environment
        },
        timeout: 120000 // 2 minute timeout
      });

      return result;
    } finally {
      // Cleanup context file
      if (contextFile) {
        await this.cleanupContextFile(contextFile);
      }
    }
  }

  /**
   * Infer SuperClaude command from request characteristics
   */
  private inferCommandFromRequest(request: SuperClaudeRequest): string {
    const prompt = request.prompt.toLowerCase();
    
    // Command inference based on prompt content
    if (prompt.includes('plan') || prompt.includes('architecture')) {
      return '/plan';
    }
    if (prompt.includes('review') || prompt.includes('audit')) {
      return '/review';
    }
    if (prompt.includes('implement') || prompt.includes('build')) {
      return '/implement';
    }
    if (prompt.includes('analyze') || prompt.includes('understand')) {
      return '/analyze';
    }
    if (prompt.includes('improve') || prompt.includes('optimize')) {
      return '/improve';
    }
    if (prompt.includes('help') || prompt.includes('guide')) {
      return '/help';
    }
    
    // Role-based fallbacks
    switch (request.role) {
      case AIRole.AUDITOR:
        return '/review';
      case AIRole.DEVELOPER:
        return '/implement';
      case AIRole.ANALYZER:
        return '/analyze';
      case AIRole.ROUTER:
      default:
        return '/explain';
    }
  }

  /**
   * Build SuperClaude flags based on request and persona
   */
  private buildFlags(request: SuperClaudeRequest, persona: SuperClaudePersona): string[] {
    const flags: string[] = [];
    
    // Add persona flag
    flags.push(`--persona-${persona}`);
    
    // Add flags based on request characteristics
    if (request.flags) {
      flags.push(...request.flags);
    }
    
    // Smart flag selection based on persona
    switch (persona) {
      case 'architect':
        flags.push('--think', '--c7');
        break;
      case 'security':
        flags.push('--validate', '--seq');
        break;
      case 'performance':
        flags.push('--think-hard', '--play');
        break;
      case 'frontend':
        flags.push('--magic', '--c7');
        break;
      case 'qa':
        flags.push('--validate', '--play');
        break;
      default:
        flags.push('--c7'); // Default to Context7 for documentation
    }
    
    // Add efficiency flags for high-volume requests
    if (request.maxTokens && request.maxTokens < 1000) {
      flags.push('--uc'); // Ultra-compressed mode
    }
    
    return flags;
  }

  /**
   * Create temporary context file for SuperClaude
   */
  private async createContextFile(context: string): Promise<string> {
    const fs = require('fs').promises;
    const path = require('path');
    const os = require('os');
    
    const tempFile = path.join(os.tmpdir(), `superclaude-context-${Date.now()}.md`);
    await fs.writeFile(tempFile, context, 'utf8');
    return tempFile;
  }

  /**
   * Cleanup temporary context file
   */
  private async cleanupContextFile(filePath: string): Promise<void> {
    try {
      const fs = require('fs').promises;
      await fs.unlink(filePath);
    } catch (error) {
      this.log('warn', `Failed to cleanup context file: ${error}`);
    }
  }

  /**
   * Estimate token usage for SuperClaude responses
   */
  private estimateTokenUsage(request: SuperClaudeRequest, response: string): {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } {
    // Rough estimation (1 token ≈ 4 characters)
    const promptTokens = Math.ceil((request.prompt.length + (request.context?.length || 0)) / 4);
    const completionTokens = Math.ceil(response.length / 4);
    
    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens
    };
  }

  /**
   * Estimate cost for SuperClaude responses
   */
  private estimateCost(request: SuperClaudeRequest, response: string): number {
    const usage = this.estimateTokenUsage(request, response);
    // SuperClaude cost estimation (placeholder - adjust based on actual pricing)
    return (usage.promptTokens * 0.003 + usage.completionTokens * 0.015) / 1000;
  }

  /**
   * Enable/disable SuperClaude integration at runtime
   */
  setSuperClaudeEnabled(enabled: boolean): void {
    this.superClaudeEnabled = enabled;
    this.log('info', `SuperClaude integration ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if SuperClaude is available
   */
  async checkSuperClaudeAvailability(): Promise<boolean> {
    try {
      const result = await execAsync(`${this.superClaudeCommand} --version`, { timeout: 5000 });
      return result.stdout.includes('SuperClaude') || result.stdout.includes('claude-code');
    } catch {
      return false;
    }
  }

  /**
   * Get SuperClaude integration status
   */
  getSuperClaudeStatus(): {
    enabled: boolean;
    available: boolean;
    command: string;
  } {
    return {
      enabled: this.superClaudeEnabled,
      available: false, // Will be checked async
      command: this.superClaudeCommand
    };
  }
}

// Factory function for backward compatibility
export function createEnhancedAIClient(eventBus: EventBus, enableSuperClaude = false): EnhancedAIClient {
  return new EnhancedAIClient(eventBus, enableSuperClaude);
}