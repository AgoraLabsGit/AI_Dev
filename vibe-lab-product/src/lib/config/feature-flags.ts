/**
 * SuperClaude Feature Flags Configuration
 * Enables controlled rollout of SuperClaude features
 */

export interface FeatureFlags {
  // SuperClaude Integration
  useSuperClaude: boolean;
  showPersonaInfo: boolean;
  enableWaveMode: boolean;
  
  // UI Enhancements
  showSuperClaudeIndicators: boolean;
  enhancedResponseFormatting: boolean;
  personaAvatars: boolean;
  
  // Performance Features
  enableTokenOptimization: boolean;
  enablePerformanceMonitoring: boolean;
  
  // MCP Server Features
  enableContext7: boolean;
  enableSequential: boolean;
  enableMagic: boolean;
  enablePlaywright: boolean;
  
  // Development & Testing
  enableTestMode: boolean;
  verboseLogging: boolean;
}

// Default feature flag values
const DEFAULT_FLAGS: FeatureFlags = {
  // SuperClaude Integration - Start conservative
  useSuperClaude: false,
  showPersonaInfo: false,
  enableWaveMode: false,
  
  // UI Enhancements - Enable gradually
  showSuperClaudeIndicators: false,
  enhancedResponseFormatting: false,
  personaAvatars: false,
  
  // Performance Features
  enableTokenOptimization: true, // Safe to enable
  enablePerformanceMonitoring: true, // Safe to enable
  
  // MCP Server Features - Enable as available
  enableContext7: true, // Already tested and working
  enableSequential: false, // Not yet implemented
  enableMagic: false, // Not yet implemented
  enablePlaywright: false, // Not yet implemented
  
  // Development & Testing
  enableTestMode: false,
  verboseLogging: false
};

/**
 * Load feature flags from environment variables with fallbacks
 */
function loadFeatureFlags(): FeatureFlags {
  return {
    // SuperClaude Integration
    useSuperClaude: getEnvBoolean('NEXT_PUBLIC_USE_SUPERCLAUDE', DEFAULT_FLAGS.useSuperClaude),
    showPersonaInfo: getEnvBoolean('NEXT_PUBLIC_SHOW_PERSONA_INFO', DEFAULT_FLAGS.showPersonaInfo),
    enableWaveMode: getEnvBoolean('NEXT_PUBLIC_ENABLE_WAVE_MODE', DEFAULT_FLAGS.enableWaveMode),
    
    // UI Enhancements
    showSuperClaudeIndicators: getEnvBoolean('NEXT_PUBLIC_SHOW_SUPERCLAUDE_INDICATORS', DEFAULT_FLAGS.showSuperClaudeIndicators),
    enhancedResponseFormatting: getEnvBoolean('NEXT_PUBLIC_ENHANCED_RESPONSE_FORMATTING', DEFAULT_FLAGS.enhancedResponseFormatting),
    personaAvatars: getEnvBoolean('NEXT_PUBLIC_PERSONA_AVATARS', DEFAULT_FLAGS.personaAvatars),
    
    // Performance Features
    enableTokenOptimization: getEnvBoolean('NEXT_PUBLIC_TOKEN_OPTIMIZATION', DEFAULT_FLAGS.enableTokenOptimization),
    enablePerformanceMonitoring: getEnvBoolean('NEXT_PUBLIC_PERFORMANCE_MONITORING', DEFAULT_FLAGS.enablePerformanceMonitoring),
    
    // MCP Server Features
    enableContext7: getEnvBoolean('NEXT_PUBLIC_ENABLE_CONTEXT7', DEFAULT_FLAGS.enableContext7),
    enableSequential: getEnvBoolean('NEXT_PUBLIC_ENABLE_SEQUENTIAL', DEFAULT_FLAGS.enableSequential),
    enableMagic: getEnvBoolean('NEXT_PUBLIC_ENABLE_MAGIC', DEFAULT_FLAGS.enableMagic),
    enablePlaywright: getEnvBoolean('NEXT_PUBLIC_ENABLE_PLAYWRIGHT', DEFAULT_FLAGS.enablePlaywright),
    
    // Development & Testing
    enableTestMode: getEnvBoolean('NEXT_PUBLIC_TEST_MODE', DEFAULT_FLAGS.enableTestMode),
    verboseLogging: getEnvBoolean('NEXT_PUBLIC_VERBOSE_LOGGING', DEFAULT_FLAGS.verboseLogging)
  };
}

/**
 * Helper function to parse environment boolean variables
 */
function getEnvBoolean(envVar: string, defaultValue: boolean): boolean {
  const value = process.env[envVar];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

// Export singleton instance
export const featureFlags = loadFeatureFlags();

/**
 * Feature flag utilities
 */
export class FeatureFlagManager {
  private static instance: FeatureFlagManager;
  private flags: FeatureFlags;

  constructor() {
    this.flags = loadFeatureFlags();
  }

  static getInstance(): FeatureFlagManager {
    if (!FeatureFlagManager.instance) {
      FeatureFlagManager.instance = new FeatureFlagManager();
    }
    return FeatureFlagManager.instance;
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(feature: keyof FeatureFlags): boolean {
    return this.flags[feature];
  }

  /**
   * Check multiple features (AND logic)
   */
  areEnabled(...features: (keyof FeatureFlags)[]): boolean {
    return features.every(feature => this.flags[feature]);
  }

  /**
   * Check if any of multiple features is enabled (OR logic)
   */
  isAnyEnabled(...features: (keyof FeatureFlags)[]): boolean {
    return features.some(feature => this.flags[feature]);
  }

  /**
   * Get all feature flags
   */
  getAllFlags(): FeatureFlags {
    return { ...this.flags };
  }

  /**
   * Get enabled features only
   */
  getEnabledFeatures(): Partial<FeatureFlags> {
    const enabled: Partial<FeatureFlags> = {};
    for (const [key, value] of Object.entries(this.flags)) {
      if (value) {
        (enabled as any)[key] = value;
      }
    }
    return enabled;
  }

  /**
   * Reload feature flags from environment (useful for testing)
   */
  reload(): void {
    this.flags = loadFeatureFlags();
  }

  /**
   * Check SuperClaude readiness level
   */
  getSuperClaudeReadiness(): {
    level: 'none' | 'basic' | 'enhanced' | 'full';
    enabledFeatures: string[];
    missingFeatures: string[];
  } {
    const superClaudeFeatures = [
      'useSuperClaude',
      'showPersonaInfo', 
      'enableWaveMode',
      'enableContext7',
      'enableSequential',
      'enableMagic',
      'enablePlaywright'
    ] as const;

    const enabled = superClaudeFeatures.filter(feature => this.flags[feature]);
    const missing = superClaudeFeatures.filter(feature => !this.flags[feature]);

    let level: 'none' | 'basic' | 'enhanced' | 'full';
    if (enabled.length === 0) {
      level = 'none';
    } else if (enabled.length <= 2) {
      level = 'basic';
    } else if (enabled.length <= 5) {
      level = 'enhanced';
    } else {
      level = 'full';
    }

    return {
      level,
      enabledFeatures: enabled,
      missingFeatures: missing
    };
  }
}

// Export singleton instance
export const featureFlagManager = FeatureFlagManager.getInstance();

/**
 * React hook for using feature flags
 */
export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  return featureFlagManager.isEnabled(feature);
}

/**
 * React hook for using multiple feature flags
 */
export function useFeatureFlags(...features: (keyof FeatureFlags)[]): boolean[] {
  return features.map(feature => featureFlagManager.isEnabled(feature));
}

/**
 * HOC for conditional rendering based on feature flags
 */
export function withFeatureFlag<P extends object>(
  feature: keyof FeatureFlags,
  fallback?: React.ComponentType<P>
) {
  return function (WrappedComponent: React.ComponentType<P>) {
    return function FeatureFlagWrapper(props: P) {
      const isEnabled = useFeatureFlag(feature);
      
      if (!isEnabled) {
        return fallback ? React.createElement(fallback, props) : null;
      }
      
      return React.createElement(WrappedComponent, props);
    };
  };
}

/**
 * Environment-specific configuration
 */
export const FEATURE_FLAG_PRESETS = {
  development: {
    useSuperClaude: true,
    showPersonaInfo: true,
    showSuperClaudeIndicators: true,
    enhancedResponseFormatting: true,
    enableTestMode: true,
    verboseLogging: true
  },
  staging: {
    useSuperClaude: true,
    showPersonaInfo: true,
    showSuperClaudeIndicators: true,
    enhancedResponseFormatting: true,
    enablePerformanceMonitoring: true
  },
  production: {
    useSuperClaude: false, // Start conservative in production
    enablePerformanceMonitoring: true,
    enableTokenOptimization: true
  }
} as const;