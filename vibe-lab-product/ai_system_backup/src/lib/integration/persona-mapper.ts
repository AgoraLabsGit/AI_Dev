/**
 * PersonaMapper - Bridge between AVCA AIRole and DIAS SuperClaude Personas
 * Enables seamless integration without breaking existing code
 */

import { AIRole } from '@/lib/avca/services/ai-client';
import { SuperClaudePersona, SuperClaudeCommand } from '@/lib/dias/services/types';

export interface PersonaMapping {
  avcaRole: AIRole;
  diasPersona: SuperClaudePersona;
  fallbackPersonas: SuperClaudePersona[];
  confidence: number;
}

export interface CommandMapping {
  command: SuperClaudeCommand;
  suggestedPersona: SuperClaudePersona;
  fallbackRole: AIRole;
  flags: string[];
}

export class PersonaMapper {
  private static instance: PersonaMapper;
  
  // AVCA Role → DIAS Persona mappings
  private readonly roleMappings: Record<AIRole, PersonaMapping> = {
    [AIRole.DEVELOPER]: {
      avcaRole: AIRole.DEVELOPER,
      diasPersona: 'frontend', // Default to frontend for UI work
      fallbackPersonas: ['backend', 'architect'],
      confidence: 0.8
    },
    [AIRole.AUDITOR]: {
      avcaRole: AIRole.AUDITOR,
      diasPersona: 'qa', // Map auditor to QA persona
      fallbackPersonas: ['security', 'analyzer'],
      confidence: 0.9
    },
    [AIRole.ROUTER]: {
      avcaRole: AIRole.ROUTER,
      diasPersona: 'analyzer', // Router becomes analyzer
      fallbackPersonas: ['mentor'],
      confidence: 0.7
    },
    [AIRole.ANALYZER]: {
      avcaRole: AIRole.ANALYZER,
      diasPersona: 'analyzer',
      fallbackPersonas: ['architect'],
      confidence: 0.95
    }
  };

  // Command → Persona mappings for missing endpoints
  private readonly commandMappings: Record<string, CommandMapping> = {
    '/plan': {
      command: '/plan' as SuperClaudeCommand,
      suggestedPersona: 'architect',
      fallbackRole: AIRole.DEVELOPER,
      flags: ['--think', '--c7']
    },
    '/review': {
      command: '/review' as SuperClaudeCommand,
      suggestedPersona: 'qa',
      fallbackRole: AIRole.AUDITOR,
      flags: ['--validate', '--seq']
    },
    '/help': {
      command: '/help' as SuperClaudeCommand,
      suggestedPersona: 'mentor',
      fallbackRole: AIRole.ROUTER,
      flags: ['--c7']
    }
  };

  public static getInstance(): PersonaMapper {
    if (!PersonaMapper.instance) {
      PersonaMapper.instance = new PersonaMapper();
    }
    return PersonaMapper.instance;
  }

  /**
   * Map AVCA AIRole to DIAS SuperClaude Persona
   */
  mapRoleToPersona(role: AIRole, context?: string): SuperClaudePersona {
    const mapping = this.roleMappings[role];
    if (!mapping) {
      return 'analyzer'; // Safe fallback
    }

    // Context-aware persona refinement
    if (context) {
      const contextPersona = this.refinePersonaFromContext(context, mapping.diasPersona);
      if (contextPersona !== mapping.diasPersona) {
        return contextPersona;
      }
    }

    return mapping.diasPersona;
  }

  /**
   * Map SuperClaude Persona back to AVCA AIRole (for backward compatibility)
   */
  mapPersonaToRole(persona: SuperClaudePersona): AIRole {
    // Reverse lookup
    for (const [role, mapping] of Object.entries(this.roleMappings)) {
      if (mapping.diasPersona === persona || mapping.fallbackPersonas.includes(persona)) {
        return role as AIRole;
      }
    }
    
    // Smart fallbacks based on persona characteristics
    switch (persona) {
      case 'architect':
      case 'frontend':
      case 'backend':
      case 'refactorer':
        return AIRole.DEVELOPER;
      case 'qa':
      case 'security':
      case 'performance':
        return AIRole.AUDITOR;
      case 'mentor':
      case 'scribe':
        return AIRole.ROUTER;
      case 'analyzer':
      case 'devops':
      default:
        return AIRole.ANALYZER;
    }
  }

  /**
   * Get command mapping for missing endpoints
   */
  getCommandMapping(command: string): CommandMapping | null {
    return this.commandMappings[command] || null;
  }

  /**
   * Context-aware persona refinement
   */
  private refinePersonaFromContext(context: string, defaultPersona: SuperClaudePersona): SuperClaudePersona {
    const contextLower = context.toLowerCase();
    
    // Security context
    if (contextLower.includes('security') || contextLower.includes('vulnerability') || 
        contextLower.includes('auth') || contextLower.includes('encryption')) {
      return 'security';
    }

    // Performance context  
    if (contextLower.includes('performance') || contextLower.includes('optimize') || 
        contextLower.includes('slow') || contextLower.includes('bottleneck')) {
      return 'performance';
    }

    // Backend context
    if (contextLower.includes('api') || contextLower.includes('database') || 
        contextLower.includes('server') || contextLower.includes('backend')) {
      return 'backend';
    }

    // Frontend context
    if (contextLower.includes('ui') || contextLower.includes('component') || 
        contextLower.includes('react') || contextLower.includes('frontend')) {
      return 'frontend';
    }

    // Architecture context
    if (contextLower.includes('architecture') || contextLower.includes('system') || 
        contextLower.includes('design') || contextLower.includes('plan')) {
      return 'architect';
    }

    // DevOps context
    if (contextLower.includes('deploy') || contextLower.includes('docker') || 
        contextLower.includes('ci/cd') || contextLower.includes('infrastructure')) {
      return 'devops';
    }

    return defaultPersona;
  }

  /**
   * Enhanced persona selection with confidence scoring
   */
  selectPersonaWithConfidence(
    role: AIRole, 
    context?: string, 
    userIntent?: string
  ): { persona: SuperClaudePersona; confidence: number; reasoning: string } {
    const mapping = this.roleMappings[role];
    let selectedPersona = mapping.diasPersona;
    let confidence = mapping.confidence;
    let reasoning = `Mapped ${role} to ${selectedPersona}`;

    // Context refinement
    if (context) {
      const contextPersona = this.refinePersonaFromContext(context, selectedPersona);
      if (contextPersona !== selectedPersona) {
        selectedPersona = contextPersona;
        confidence *= 0.9; // Slight reduction for context override
        reasoning += ` → ${contextPersona} (context-refined)`;
      }
    }

    // User intent analysis
    if (userIntent) {
      const intentPersona = this.analyzeUserIntent(userIntent);
      if (intentPersona && intentPersona !== selectedPersona) {
        // Only override if confidence is higher
        if (confidence < 0.8) {
          selectedPersona = intentPersona;
          confidence = 0.85;
          reasoning += ` → ${intentPersona} (intent-based)`;
        }
      }
    }

    return { persona: selectedPersona, confidence, reasoning };
  }

  /**
   * Analyze user intent for persona selection
   */
  private analyzeUserIntent(intent: string): SuperClaudePersona | null {
    const intentLower = intent.toLowerCase();

    // Planning and architecture
    if (intentLower.includes('plan') || intentLower.includes('architecture') || 
        intentLower.includes('design system')) {
      return 'architect';
    }

    // Code review and quality
    if (intentLower.includes('review') || intentLower.includes('audit') || 
        intentLower.includes('quality') || intentLower.includes('test')) {
      return 'qa';
    }

    // Implementation work
    if (intentLower.includes('implement') || intentLower.includes('build') || 
        intentLower.includes('create component')) {
      return 'frontend';
    }

    // Refactoring and cleanup
    if (intentLower.includes('refactor') || intentLower.includes('cleanup') || 
        intentLower.includes('improve')) {
      return 'refactorer';
    }

    // Documentation
    if (intentLower.includes('document') || intentLower.includes('write') || 
        intentLower.includes('explain')) {
      return 'scribe';
    }

    return null;
  }

  /**
   * Get all available mappings for debugging/monitoring
   */
  getAllMappings(): {
    roleMappings: typeof this.roleMappings;
    commandMappings: typeof this.commandMappings;
  } {
    return {
      roleMappings: this.roleMappings,
      commandMappings: this.commandMappings
    };
  }
}

// Export singleton instance
export const personaMapper = PersonaMapper.getInstance();