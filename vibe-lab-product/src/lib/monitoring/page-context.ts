/**
 * Page Context Utilities for AI Intelligence Monitoring
 * Automatically captures page and route information for tracking
 */

export interface PageContext {
  sourcePage?: string;
  sourceRoute?: string;
  userAgent?: string;
  sessionId?: string;
  userId?: string;
}

/**
 * Capture current page context for monitoring
 */
export function capturePageContext(): PageContext {
  const context: PageContext = {};

  // Browser-side context
  if (typeof window !== 'undefined') {
    context.sourcePage = document.title || window.location.pathname;
    context.sourceRoute = window.location.pathname;
    context.userAgent = navigator.userAgent;
    
    // Try to get session ID from session storage
    const sessionId = sessionStorage.getItem('vibe-lab-session') || 
                     localStorage.getItem('vibe-lab-session');
    if (sessionId) {
      context.sessionId = sessionId;
    }
  }

  // Server-side context (Next.js)
  if (typeof window === 'undefined') {
    // Try to extract route from stack trace or other server context
    try {
      const stack = new Error().stack;
      const routeMatch = stack?.match(/\/app\/([^\/\s]+)/);
      if (routeMatch) {
        context.sourceRoute = `/${routeMatch[1]}`;
        context.sourcePage = routeMatch[1];
      }
    } catch (e) {
      // Fallback for server-side
      context.sourcePage = 'server-side';
      context.sourceRoute = '/api';
    }
  }

  return context;
}

/**
 * Enhanced page context with additional environment info
 */
export function captureEnhancedPageContext(additionalInfo?: {
  operation?: string;
  feature?: string;
  userId?: string;
}): PageContext & {
  environmentInfo?: string;
  serviceVersion?: string;
  operation?: string;
  feature?: string;
} {
  const baseContext = capturePageContext();

  return {
    ...baseContext,
    ...additionalInfo,
    environmentInfo: process.env.NODE_ENV || 'unknown',
    serviceVersion: process.env.npm_package_version || '1.0.0'
  };
}

/**
 * Page-specific context extractors
 */
export const pageContextExtractors = {
  onboarding: () => ({
    ...capturePageContext(),
    feature: 'onboarding',
    operation: 'project-setup'
  }),

  planning: () => ({
    ...capturePageContext(),
    feature: 'planning',
    operation: 'blueprint-generation'
  }),

  codeGeneration: () => ({
    ...capturePageContext(),
    feature: 'code-generation',
    operation: 'component-creation'
  }),

  review: () => ({
    ...capturePageContext(),
    feature: 'code-review',
    operation: 'quality-assessment'
  }),

  monitoring: () => ({
    ...capturePageContext(),
    feature: 'monitoring',
    operation: 'system-observation'
  })
};

/**
 * Auto-detect page context based on URL patterns
 */
export function autoDetectPageContext(): PageContext & { 
  detectedFeature?: string;
  detectedOperation?: string;
} {
  const baseContext = capturePageContext();
  const route = baseContext.sourceRoute || '';

  let detectedFeature = 'unknown';
  let detectedOperation = 'unknown';

  // Route-based feature detection
  if (route.includes('/onboarding')) {
    detectedFeature = 'onboarding';
    detectedOperation = 'project-setup';
  } else if (route.includes('/plan')) {
    detectedFeature = 'planning';
    detectedOperation = 'blueprint-generation';
  } else if (route.includes('/build') || route.includes('/generate')) {
    detectedFeature = 'code-generation';
    detectedOperation = 'component-creation';
  } else if (route.includes('/review')) {
    detectedFeature = 'code-review';
    detectedOperation = 'quality-assessment';
  } else if (route.includes('/monitor')) {
    detectedFeature = 'monitoring';
    detectedOperation = 'system-observation';
  } else if (route.includes('/api/')) {
    detectedFeature = 'api';
    detectedOperation = route.split('/api/')[1]?.split('/')[0] || 'unknown';
  }

  return {
    ...baseContext,
    detectedFeature,
    detectedOperation
  };
}