// AI Client types for AVCA system

// Re-export AIRole from services for convenience
export { AIRole } from '../services/ai-client';

export interface AIResponse {
  response: string;
  extractedInfo?: Record<string, any>;
  quickActions?: QuickAction[];
  confidence?: number;
}

export interface QuickAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary';
  metadata?: {
    icon?: React.ReactNode;
    description?: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  projectName?: string;
  conversationHistory: ChatMessage[];
  context: {
    stage: string;
    extractedInfo: Record<string, any>;
  };
}

export interface AIClientConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
}

export class AIClient {
  private config: AIClientConfig;

  constructor(config: AIClientConfig = {}) {
    this.config = config;
  }

  async processMessage(request: ChatRequest): Promise<AIResponse> {
    // Simple mock response for now
    return {
      response: "Thank you for your message. I'm here to help you build your project!",
      extractedInfo: {},
      quickActions: [],
      confidence: 0.8
    };
  }
}

export const defaultAIClient = new AIClient();