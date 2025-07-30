/**
 * Advanced Design System Templates
 * Templates that vary across multiple design dimensions beyond just color
 */

export interface AdvancedThemeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'geometric' | 'organic' | 'retro' | 'futuristic' | 'editorial' | 'playful' | 'financial';
  
  // Color system
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
  };
  
  // Typography system
  typography: {
    primaryFont: {
      family: string;
      fallback: string;
      weights: number[];
    };
    headingFont: {
      family: string;
      fallback: string;
      weights: number[];
    };
    codeFont: {
      family: string;
      fallback: string;
    };
    scale: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
    letterSpacing: {
      tight: string;
      normal: string;
      wide: string;
    };
  };
  
  // Border and shape system
  borders: {
    radius: {
      none: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      full: string;
    };
    width: {
      none: string;
      thin: string;
      base: string;
      thick: string;
    };
    style: 'solid' | 'dashed' | 'dotted' | 'double';
  };
  
  // Spacing system
  spacing: {
    scale: 'compact' | 'comfortable' | 'spacious';
    baseUnit: number; // multiplier for standard spacing
  };
  
  // Shadow and depth system
  shadows: {
    style: 'none' | 'subtle' | 'elevated' | 'dramatic' | 'neon';
    colors: string[]; // shadow colors for different effects
  };
  
  // Animation system
  animations: {
    duration: {
      fast: string;
      base: string;
      slow: string;
    };
    easing: {
      ease: string;
      spring: string;
      bounce: string;
    };
    effects: ('fade' | 'slide' | 'scale' | 'rotate' | 'glow' | 'pulse')[];
  };
  
  // Visual effects
  effects: {
    gradients: boolean;
    glassmorphism: boolean;
    neumorphism: boolean;
    glows: boolean;
    patterns: boolean;
    noise: boolean;
  };
  
  // Component styling
  components: {
    buttons: {
      style: 'rounded' | 'sharp' | 'pill' | 'cut-corners';
      emphasis: 'subtle' | 'medium' | 'bold';
      texture: 'flat' | 'raised' | 'pressed' | 'floating';
    };
    inputs: {
      style: 'outlined' | 'filled' | 'underlined' | 'floating';
      focus: 'glow' | 'outline' | 'underline' | 'scale';
    };
    cards: {
      style: 'flat' | 'elevated' | 'outlined' | 'filled';
      corners: 'sharp' | 'rounded' | 'super-rounded';
    };
  };
  
  popular?: boolean;
  new?: boolean;
}

export const advancedThemeTemplates: AdvancedThemeTemplate[] = [
  {
    id: 'professional-dark',
    name: 'Professional Dark',
    description: 'Modern professional interface with gradients and blur effects',
    category: 'futuristic',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: {
        primary: '#000000',
        secondary: '#111111',
        tertiary: '#1a1a1a'
      },
      text: {
        primary: '#ffffff',
        secondary: '#888888'
      }
    },
    typography: {
      primaryFont: {
        family: 'Inter',
        fallback: 'system-ui, sans-serif',
        weights: [400, 500, 600]
      },
      headingFont: {
        family: 'Inter',
        fallback: 'system-ui, sans-serif',
        weights: [600, 700, 800]
      },
      codeFont: {
        family: 'JetBrains Mono',
        fallback: 'monospace'
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      },
      letterSpacing: {
        tight: '-0.01em',
        normal: '0',
        wide: '0.01em'
      }
    },
    borders: {
      radius: {
        none: '0',
        sm: '4px',
        base: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px'
      },
      width: {
        none: '0',
        thin: '1px',
        base: '1px',
        thick: '2px'
      },
      style: 'solid'
    },
    spacing: {
      scale: 'comfortable',
      baseUnit: 1.0
    },
    shadows: {
      style: 'elevated',
      colors: ['rgba(102, 126, 234, 0.25)', 'rgba(118, 75, 162, 0.15)']
    },
    animations: {
      duration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms'
      },
      easing: {
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      effects: ['fade', 'slide', 'glow']
    },
    effects: {
      gradients: true,
      glassmorphism: true,
      neumorphism: false,
      glows: true,
      patterns: false,
      noise: false
    },
    components: {
      buttons: {
        style: 'rounded',
        emphasis: 'medium',
        texture: 'floating'
      },
      inputs: {
        style: 'filled',
        focus: 'glow'
      },
      cards: {
        style: 'elevated',
        corners: 'rounded'
      }
    },
    popular: true
  },

  {
    id: 'premium-light',
    name: 'Premium Light',
    description: 'Clean premium design with abundant whitespace',
    category: 'geometric',
    colors: {
      primary: '#007aff',
      secondary: '#5856d6',
      accent: '#ff9500',
      success: '#34c759',
      warning: '#ff9500',
      error: '#ff3b30',
      background: {
        primary: '#ffffff',
        secondary: '#f5f5f7',
        tertiary: '#f2f2f7'
      },
      text: {
        primary: '#1d1d1f',
        secondary: '#86868b'
      }
    },
    typography: {
      primaryFont: {
        family: 'SF Pro Display',
        fallback: '-apple-system, sans-serif',
        weights: [300, 400, 500, 600]
      },
      headingFont: {
        family: 'SF Pro Display',
        fallback: '-apple-system, sans-serif',
        weights: [500, 600, 700]
      },
      codeFont: {
        family: 'SF Mono',
        fallback: 'monospace'
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem'
      },
      lineHeight: {
        tight: 1.2,
        normal: 1.47,
        relaxed: 1.7
      },
      letterSpacing: {
        tight: '-0.03em',
        normal: '0',
        wide: '0.02em'
      }
    },
    borders: {
      radius: {
        none: '0',
        sm: '6px',
        base: '12px',
        lg: '18px',
        xl: '24px',
        full: '9999px'
      },
      width: {
        none: '0',
        thin: '0.5px',
        base: '1px',
        thick: '2px'
      },
      style: 'solid'
    },
    spacing: {
      scale: 'spacious',
      baseUnit: 1.5
    },
    shadows: {
      style: 'subtle',
      colors: ['rgba(0, 0, 0, 0.08)', 'rgba(0, 0, 0, 0.04)']
    },
    animations: {
      duration: {
        fast: '200ms',
        base: '300ms',
        slow: '500ms'
      },
      easing: {
        ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      effects: ['fade', 'scale']
    },
    effects: {
      gradients: false,
      glassmorphism: false,
      neumorphism: false,
      glows: false,
      patterns: false,
      noise: false
    },
    components: {
      buttons: {
        style: 'rounded',
        emphasis: 'subtle',
        texture: 'flat'
      },
      inputs: {
        style: 'filled',
        focus: 'outline'
      },
      cards: {
        style: 'flat',
        corners: 'rounded'
      }
    },
    popular: true
  },

  {
    id: 'creative-vibrant',
    name: 'Creative Vibrant',
    description: 'High-energy design with vibrant colors and playful animations',
    category: 'playful',
    colors: {
      primary: '#1db954',
      secondary: '#1ed760',
      accent: '#ff6b6b',
      success: '#1db954',
      warning: '#ffaa00',
      error: '#e22134',
      background: {
        primary: '#121212',
        secondary: '#282828',
        tertiary: '#3e3e3e'
      },
      text: {
        primary: '#ffffff',
        secondary: '#b3b3b3'
      }
    },
    typography: {
      primaryFont: {
        family: 'Circular',
        fallback: 'system-ui, sans-serif',
        weights: [400, 500, 700]
      },
      headingFont: {
        family: 'Circular',
        fallback: 'system-ui, sans-serif',
        weights: [700, 800, 900]
      },
      codeFont: {
        family: 'Consolas',
        fallback: 'monospace'
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '3rem'
      },
      lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.8
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.05em'
      }
    },
    borders: {
      radius: {
        none: '0',
        sm: '8px',
        base: '16px',
        lg: '24px',
        xl: '32px',
        full: '9999px'
      },
      width: {
        none: '0',
        thin: '1px',
        base: '2px',
        thick: '3px'
      },
      style: 'solid'
    },
    spacing: {
      scale: 'comfortable',
      baseUnit: 1.0
    },
    shadows: {
      style: 'elevated',
      colors: ['rgba(0, 0, 0, 0.3)', 'rgba(29, 185, 84, 0.2)']
    },
    animations: {
      duration: {
        fast: '150ms',
        base: '250ms',
        slow: '400ms'
      },
      easing: {
        ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      effects: ['fade', 'scale', 'slide', 'pulse']
    },
    effects: {
      gradients: true,
      glassmorphism: false,
      neumorphism: false,
      glows: true,
      patterns: false,
      noise: false
    },
    components: {
      buttons: {
        style: 'pill',
        emphasis: 'bold',
        texture: 'raised'
      },
      inputs: {
        style: 'filled',
        focus: 'scale'
      },
      cards: {
        style: 'elevated',
        corners: 'rounded'
      }
    },
    new: true
  },

  {
    id: 'friendly-warm',
    name: 'Friendly Warm',
    description: 'Approachable design with warm colors and playful elements',
    category: 'playful',
    colors: {
      primary: '#007c89',
      secondary: '#579ddb',
      accent: '#ffe01b',
      success: '#00b894',
      warning: '#fdcb6e',
      error: '#e17055',
      background: {
        primary: '#ffffff',
        secondary: '#f6f8fa',
        tertiary: '#eef2f5'
      },
      text: {
        primary: '#241c15',
        secondary: '#707070'
      }
    },
    typography: {
      primaryFont: {
        family: 'Faktum',
        fallback: 'Georgia, serif',
        weights: [400, 500, 600]
      },
      headingFont: {
        family: 'Faktum',
        fallback: 'Georgia, serif',
        weights: [600, 700, 800]
      },
      codeFont: {
        family: 'Source Code Pro',
        fallback: 'monospace'
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      lineHeight: {
        tight: 1.3,
        normal: 1.6,
        relaxed: 1.8
      },
      letterSpacing: {
        tight: '-0.01em',
        normal: '0',
        wide: '0.02em'
      }
    },
    borders: {
      radius: {
        none: '0',
        sm: '6px',
        base: '12px',
        lg: '18px',
        xl: '24px',
        full: '9999px'
      },
      width: {
        none: '0',
        thin: '1px',
        base: '2px',
        thick: '3px'
      },
      style: 'solid'
    },
    spacing: {
      scale: 'comfortable',
      baseUnit: 1.1
    },
    shadows: {
      style: 'subtle',
      colors: ['rgba(0, 124, 137, 0.15)', 'rgba(0, 0, 0, 0.08)']
    },
    animations: {
      duration: {
        fast: '200ms',
        base: '300ms',
        slow: '450ms'
      },
      easing: {
        ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      effects: ['fade', 'scale', 'bounce']
    },
    effects: {
      gradients: false,
      glassmorphism: false,
      neumorphism: true,
      glows: false,
      patterns: true,
      noise: false
    },
    components: {
      buttons: {
        style: 'rounded',
        emphasis: 'medium',
        texture: 'raised'
      },
      inputs: {
        style: 'outlined',
        focus: 'outline'
      },
      cards: {
        style: 'elevated',
        corners: 'rounded'
      }
    }
  },

  {
    id: 'corporate-professional',
    name: 'Corporate Professional',
    description: 'Trustworthy enterprise design with structured layouts',
    category: 'geometric',
    colors: {
      primary: '#0066cc',
      secondary: '#004499',
      accent: '#0088ff',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      background: {
        primary: '#ffffff',
        secondary: '#f8f9fa',
        tertiary: '#e9ecef'
      },
      text: {
        primary: '#212529',
        secondary: '#6c757d'
      }
    },
    typography: {
      primaryFont: {
        family: 'Arial',
        fallback: 'Helvetica, sans-serif',
        weights: [400, 600, 700]
      },
      headingFont: {
        family: 'Arial',
        fallback: 'Helvetica, sans-serif',
        weights: [600, 700, 800]
      },
      codeFont: {
        family: 'Consolas',
        fallback: 'monospace'
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      },
      letterSpacing: {
        tight: '0',
        normal: '0',
        wide: '0.025em'
      }
    },
    borders: {
      radius: {
        none: '0',
        sm: '2px',
        base: '4px',
        lg: '6px',
        xl: '8px',
        full: '9999px'
      },
      width: {
        none: '0',
        thin: '1px',
        base: '1px',
        thick: '2px'
      },
      style: 'solid'
    },
    spacing: {
      scale: 'comfortable',
      baseUnit: 1.0
    },
    shadows: {
      style: 'subtle',
      colors: ['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.05)']
    },
    animations: {
      duration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms'
      },
      easing: {
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      effects: ['fade']
    },
    effects: {
      gradients: false,
      glassmorphism: false,
      neumorphism: false,
      glows: false,
      patterns: false,
      noise: false
    },
    components: {
      buttons: {
        style: 'rounded',
        emphasis: 'medium',
        texture: 'flat'
      },
      inputs: {
        style: 'outlined',
        focus: 'outline'
      },
      cards: {
        style: 'outlined',
        corners: 'rounded'
      }
    }
  },

  {
    id: 'ecommerce-modern',
    name: 'E-commerce Modern',
    description: 'Conversion-focused design optimized for online retail',
    category: 'geometric',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#ff4444',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      background: {
        primary: '#ffffff',
        secondary: '#fafafa',
        tertiary: '#f5f5f5'
      },
      text: {
        primary: '#000000',
        secondary: '#666666'
      }
    },
    typography: {
      primaryFont: {
        family: 'Helvetica Neue',
        fallback: 'Helvetica, sans-serif',
        weights: [400, 500, 600]
      },
      headingFont: {
        family: 'Helvetica Neue',
        fallback: 'Helvetica, sans-serif',
        weights: [600, 700, 800]
      },
      codeFont: {
        family: 'Monaco',
        fallback: 'monospace'
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.7
      },
      letterSpacing: {
        tight: '-0.01em',
        normal: '0',
        wide: '0.01em'
      }
    },
    borders: {
      radius: {
        none: '0',
        sm: '2px',
        base: '4px',
        lg: '6px',
        xl: '8px',
        full: '9999px'
      },
      width: {
        none: '0',
        thin: '1px',
        base: '1px',
        thick: '2px'
      },
      style: 'solid'
    },
    spacing: {
      scale: 'compact',
      baseUnit: 0.9
    },
    shadows: {
      style: 'subtle',
      colors: ['rgba(0, 0, 0, 0.08)', 'rgba(0, 0, 0, 0.04)']
    },
    animations: {
      duration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms'
      },
      easing: {
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      effects: ['fade', 'scale']
    },
    effects: {
      gradients: false,
      glassmorphism: false,
      neumorphism: false,
      glows: false,
      patterns: false,
      noise: false
    },
    components: {
      buttons: {
        style: 'rounded',
        emphasis: 'bold',
        texture: 'flat'
      },
      inputs: {
        style: 'outlined',
        focus: 'outline'
      },
      cards: {
        style: 'outlined',
        corners: 'rounded'
      }
    }
  },

  {
    id: 'startup-gradient',
    name: 'Startup Gradient',
    description: 'Growth-focused design with modern gradients and optimistic colors',
    category: 'futuristic',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: {
        primary: '#ffffff',
        secondary: '#fafbff',
        tertiary: '#f1f5f9'
      },
      text: {
        primary: '#111827',
        secondary: '#6b7280'
      }
    },
    typography: {
      primaryFont: {
        family: 'Inter',
        fallback: 'system-ui, sans-serif',
        weights: [400, 500, 600]
      },
      headingFont: {
        family: 'Cal Sans',
        fallback: 'system-ui, sans-serif',
        weights: [600, 700, 800]
      },
      codeFont: {
        family: 'Fira Code',
        fallback: 'monospace'
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.02em'
      }
    },
    borders: {
      radius: {
        none: '0',
        sm: '6px',
        base: '12px',
        lg: '18px',
        xl: '24px',
        full: '9999px'
      },
      width: {
        none: '0',
        thin: '1px',
        base: '1px',
        thick: '2px'
      },
      style: 'solid'
    },
    spacing: {
      scale: 'comfortable',
      baseUnit: 1.0
    },
    shadows: {
      style: 'elevated',
      colors: ['rgba(99, 102, 241, 0.25)', 'rgba(139, 92, 246, 0.15)']
    },
    animations: {
      duration: {
        fast: '200ms',
        base: '300ms',
        slow: '500ms'
      },
      easing: {
        ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      effects: ['fade', 'scale', 'slide', 'glow']
    },
    effects: {
      gradients: true,
      glassmorphism: false,
      neumorphism: false,
      glows: true,
      patterns: false,
      noise: false
    },
    components: {
      buttons: {
        style: 'rounded',
        emphasis: 'bold',
        texture: 'floating'
      },
      inputs: {
        style: 'filled',
        focus: 'glow'
      },
      cards: {
        style: 'elevated',
        corners: 'rounded'
      }
    },
    new: true
  },

  {
    id: 'gaming-neon',
    name: 'Gaming Neon',
    description: 'High-contrast design with neon effects and dramatic lighting',
    category: 'futuristic',
    colors: {
      primary: '#00ff41',
      secondary: '#ff0080',
      accent: '#00d4ff',
      success: '#00ff41',
      warning: '#ffaa00',
      error: '#ff0040',
      background: {
        primary: '#0d1117',
        secondary: '#161b22',
        tertiary: '#21262d'
      },
      text: {
        primary: '#f0f6fc',
        secondary: '#8b949e'
      }
    },
    typography: {
      primaryFont: {
        family: 'Rajdhani',
        fallback: 'system-ui, sans-serif',
        weights: [400, 500, 600, 700]
      },
      headingFont: {
        family: 'Orbitron',
        fallback: 'system-ui, sans-serif',
        weights: [700, 800, 900]
      },
      codeFont: {
        family: 'Source Code Pro',
        fallback: 'monospace'
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      lineHeight: {
        tight: 1.2,
        normal: 1.4,
        relaxed: 1.6
      },
      letterSpacing: {
        tight: '0',
        normal: '0.025em',
        wide: '0.1em'
      }
    },
    borders: {
      radius: {
        none: '0',
        sm: '2px',
        base: '4px',
        lg: '8px',
        xl: '12px',
        full: '9999px'
      },
      width: {
        none: '0',
        thin: '1px',
        base: '2px',
        thick: '3px'
      },
      style: 'solid'
    },
    spacing: {
      scale: 'comfortable',
      baseUnit: 1.0
    },
    shadows: {
      style: 'neon',
      colors: ['rgba(0, 255, 65, 0.5)', 'rgba(255, 0, 128, 0.3)', 'rgba(0, 212, 255, 0.3)']
    },
    animations: {
      duration: {
        fast: '100ms',
        base: '200ms',
        slow: '350ms'
      },
      easing: {
        ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      effects: ['fade', 'glow', 'pulse', 'rotate']
    },
    effects: {
      gradients: true,
      glassmorphism: false,
      neumorphism: false,
      glows: true,
      patterns: true,
      noise: true
    },
    components: {
      buttons: {
        style: 'cut-corners',
        emphasis: 'bold',
        texture: 'raised'
      },
      inputs: {
        style: 'outlined',
        focus: 'glow'
      },
      cards: {
        style: 'outlined',
        corners: 'sharp'
      }
    },
    new: true
  },

  {
    id: 'financial-orange',
    name: 'Financial Orange',
    description: 'Bold financial design with orange accents and trustworthy typography',
    category: 'financial',
    colors: {
      primary: '#f7931a',
      secondary: '#ff9500',
      accent: '#4a90e2',
      success: '#00d4aa',
      warning: '#ff8c00',
      error: '#ff4757',
      background: {
        primary: '#ffffff',
        secondary: '#fafafa',
        tertiary: '#f5f5f5'
      },
      text: {
        primary: '#1a1a1a',
        secondary: '#666666'
      }
    },
    typography: {
      primaryFont: {
        family: 'Inter',
        fallback: 'system-ui, sans-serif',
        weights: [400, 500, 600, 700]
      },
      headingFont: {
        family: 'Inter',
        fallback: 'system-ui, sans-serif',
        weights: [600, 700, 800]
      },
      codeFont: {
        family: 'JetBrains Mono',
        fallback: 'monospace'
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.02em'
      }
    },
    borders: {
      radius: {
        none: '0',
        sm: '4px',
        base: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px'
      },
      width: {
        none: '0',
        thin: '1px',
        base: '2px',
        thick: '3px'
      },
      style: 'solid'
    },
    spacing: {
      scale: 'comfortable',
      baseUnit: 1.0
    },
    shadows: {
      style: 'elevated',
      colors: ['rgba(247, 147, 26, 0.15)', 'rgba(0, 0, 0, 0.05)']
    },
    animations: {
      duration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms'
      },
      easing: {
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      effects: ['fade', 'scale']
    },
    effects: {
      gradients: true,
      glassmorphism: false,
      neumorphism: false,
      glows: false,
      patterns: false,
      noise: false
    },
    components: {
      buttons: {
        style: 'rounded',
        emphasis: 'bold',
        texture: 'raised'
      },
      inputs: {
        style: 'outlined',
        focus: 'outline'
      },
      cards: {
        style: 'elevated',
        corners: 'rounded'
      }
    },
    popular: true
  },

  {
    id: 'geometric-minimal',
    name: 'Geometric Minimal',
    description: 'Sharp edges, precise spacing, and clean typography',
    category: 'geometric',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#0066ff',
      success: '#00cc44',
      warning: '#ff9900',
      error: '#ff3333',
      background: {
        primary: '#ffffff',
        secondary: '#f8f9fa',
        tertiary: '#e9ecef'
      },
      text: {
        primary: '#000000',
        secondary: '#666666'
      }
    },
    typography: {
      primaryFont: {
        family: 'Inter',
        fallback: 'system-ui, sans-serif',
        weights: [400, 500, 600]
      },
      headingFont: {
        family: 'Space Grotesk',
        fallback: 'system-ui, sans-serif',
        weights: [700, 800, 900]
      },
      codeFont: {
        family: 'JetBrains Mono',
        fallback: 'monospace'
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem'
      },
      lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.7
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.05em'
      }
    },
    borders: {
      radius: {
        none: '0',
        sm: '2px',
        base: '4px',
        lg: '6px',
        xl: '8px',
        full: '9999px'
      },
      width: {
        none: '0',
        thin: '1px',
        base: '2px',
        thick: '3px'
      },
      style: 'solid'
    },
    spacing: {
      scale: 'compact',
      baseUnit: 0.8
    },
    shadows: {
      style: 'subtle',
      colors: ['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.05)']
    },
    animations: {
      duration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms'
      },
      easing: {
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      effects: ['fade', 'slide']
    },
    effects: {
      gradients: false,
      glassmorphism: false,
      neumorphism: false,
      glows: false,
      patterns: false,
      noise: false
    },
    components: {
      buttons: {
        style: 'sharp',
        emphasis: 'medium',
        texture: 'flat'
      },
      inputs: {
        style: 'outlined',
        focus: 'outline'
      },
      cards: {
        style: 'outlined',
        corners: 'sharp'
      }
    },
    popular: true
  },

  {
    id: 'organic-curves',
    name: 'Organic Curves',
    description: 'Flowing shapes, soft shadows, and natural proportions',
    category: 'organic',
    colors: {
      primary: '#6b46c1',
      secondary: '#a78bfa',
      accent: '#10b981',
      success: '#059669',
      warning: '#f59e0b',
      error: '#ef4444',
      background: {
        primary: '#fefefe',
        secondary: '#faf7ff',
        tertiary: '#f3f0ff'
      },
      text: {
        primary: '#1f2937',
        secondary: '#6b7280'
      }
    },
    typography: {
      primaryFont: {
        family: 'Nunito',
        fallback: 'system-ui, sans-serif',
        weights: [400, 600, 700]
      },
      headingFont: {
        family: 'Comfortaa',
        fallback: 'system-ui, sans-serif',
        weights: [600, 700, 800]
      },
      codeFont: {
        family: 'Fira Code',
        fallback: 'monospace'
      },
      scale: {
        xs: '0.8rem',
        sm: '0.9rem',
        base: '1rem',
        lg: '1.2rem',
        xl: '1.4rem',
        '2xl': '1.8rem',
        '3xl': '2.4rem',
        '4xl': '3.2rem'
      },
      lineHeight: {
        tight: 1.3,
        normal: 1.6,
        relaxed: 1.8
      },
      letterSpacing: {
        tight: '-0.01em',
        normal: '0',
        wide: '0.02em'
      }
    },
    borders: {
      radius: {
        none: '0',
        sm: '8px',
        base: '16px',
        lg: '24px',
        xl: '32px',
        full: '9999px'
      },
      width: {
        none: '0',
        thin: '1px',
        base: '2px',
        thick: '3px'
      },
      style: 'solid'
    },
    spacing: {
      scale: 'spacious',
      baseUnit: 1.3
    },
    shadows: {
      style: 'elevated',
      colors: ['rgba(107, 70, 193, 0.15)', 'rgba(167, 139, 250, 0.1)']
    },
    animations: {
      duration: {
        fast: '200ms',
        base: '350ms',
        slow: '500ms'
      },
      easing: {
        ease: 'cubic-bezier(0.23, 1, 0.32, 1)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      effects: ['fade', 'scale', 'glow']
    },
    effects: {
      gradients: true,
      glassmorphism: false,
      neumorphism: true,
      glows: true,
      patterns: false,
      noise: false
    },
    components: {
      buttons: {
        style: 'pill',
        emphasis: 'bold',
        texture: 'floating'
      },
      inputs: {
        style: 'filled',
        focus: 'glow'
      },
      cards: {
        style: 'elevated',
        corners: 'super-rounded'
      }
    },
    new: true
  },

  {
    id: 'retro-terminal',
    name: 'Retro Terminal',
    description: 'Monospace fonts, green phosphor, and 80s computing vibes',
    category: 'retro',
    colors: {
      primary: '#00ff41',
      secondary: '#39ff14',
      accent: '#ffff00',
      success: '#00ff00',
      warning: '#ffa500',
      error: '#ff0040',
      background: {
        primary: '#0c0c0c',
        secondary: '#1a1a1a',
        tertiary: '#262626'
      },
      text: {
        primary: '#00ff41',
        secondary: '#39ff14'
      }
    },
    typography: {
      primaryFont: {
        family: 'JetBrains Mono',
        fallback: 'monospace',
        weights: [400, 500, 700]
      },
      headingFont: {
        family: 'Orbitron',
        fallback: 'monospace',
        weights: [700, 800, 900]
      },
      codeFont: {
        family: 'JetBrains Mono',
        fallback: 'monospace'
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      lineHeight: {
        tight: 1.2,
        normal: 1.4,
        relaxed: 1.6
      },
      letterSpacing: {
        tight: '0',
        normal: '0.05em',
        wide: '0.1em'
      }
    },
    borders: {
      radius: {
        none: '0',
        sm: '0',
        base: '2px',
        lg: '4px',
        xl: '6px',
        full: '9999px'
      },
      width: {
        none: '0',
        thin: '1px',
        base: '2px',
        thick: '4px'
      },
      style: 'solid'
    },
    spacing: {
      scale: 'comfortable',
      baseUnit: 1.0
    },
    shadows: {
      style: 'neon',
      colors: ['rgba(0, 255, 65, 0.5)', 'rgba(57, 255, 20, 0.3)']
    },
    animations: {
      duration: {
        fast: '100ms',
        base: '150ms',
        slow: '200ms'
      },
      easing: {
        ease: 'linear',
        spring: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        bounce: 'linear'
      },
      effects: ['fade', 'glow', 'pulse']
    },
    effects: {
      gradients: false,
      glassmorphism: false,
      neumorphism: false,
      glows: true,
      patterns: true,
      noise: true
    },
    components: {
      buttons: {
        style: 'sharp',
        emphasis: 'bold',
        texture: 'flat'
      },
      inputs: {
        style: 'outlined',
        focus: 'glow'
      },
      cards: {
        style: 'outlined',
        corners: 'sharp'
      }
    },
    popular: true
  },

  {
    id: 'brutalist-bold',
    name: 'Brutalist Bold',
    description: 'Chunky borders, bold typography, and unapologetic design',
    category: 'geometric',
    colors: {
      primary: '#ff006e',
      secondary: '#fb5607',
      accent: '#ffbe0b',
      success: '#8338ec',
      warning: '#3a86ff',
      error: '#ff006e',
      background: {
        primary: '#ffffff',
        secondary: '#f0f0f0',
        tertiary: '#e0e0e0'
      },
      text: {
        primary: '#000000',
        secondary: '#333333'
      }
    },
    typography: {
      primaryFont: {
        family: 'Space Grotesk',
        fallback: 'system-ui, sans-serif',
        weights: [500, 700, 900]
      },
      headingFont: {
        family: 'Krona One',
        fallback: 'system-ui, sans-serif',
        weights: [400]
      },
      codeFont: {
        family: 'Space Mono',
        fallback: 'monospace'
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.25rem',
        xl: '1.5rem',
        '2xl': '2rem',
        '3xl': '3rem',
        '4xl': '4rem'
      },
      lineHeight: {
        tight: 1.1,
        normal: 1.3,
        relaxed: 1.5
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.05em'
      }
    },
    borders: {
      radius: {
        none: '0',
        sm: '0',
        base: '0',
        lg: '4px',
        xl: '8px',
        full: '9999px'
      },
      width: {
        none: '0',
        thin: '2px',
        base: '4px',
        thick: '8px'
      },
      style: 'solid'
    },
    spacing: {
      scale: 'comfortable',
      baseUnit: 1.2
    },
    shadows: {
      style: 'dramatic',
      colors: ['rgba(0, 0, 0, 0.25)', 'rgba(255, 0, 110, 0.2)']
    },
    animations: {
      duration: {
        fast: '100ms',
        base: '150ms',
        slow: '200ms'
      },
      easing: {
        ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      effects: ['slide', 'scale']
    },
    effects: {
      gradients: true,
      glassmorphism: false,
      neumorphism: false,
      glows: false,
      patterns: true,
      noise: false
    },
    components: {
      buttons: {
        style: 'sharp',
        emphasis: 'bold',
        texture: 'raised'
      },
      inputs: {
        style: 'outlined',
        focus: 'outline'
      },
      cards: {
        style: 'outlined',
        corners: 'sharp'
      }
    },
    new: true
  },

  {
    id: 'glass-future',
    name: 'Glass Future',
    description: 'Translucent surfaces, backdrop blur, and ethereal aesthetics',
    category: 'futuristic',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: {
        primary: 'rgba(15, 23, 42, 0.95)',
        secondary: 'rgba(30, 41, 59, 0.8)',
        tertiary: 'rgba(51, 65, 85, 0.6)'
      },
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1'
      }
    },
    typography: {
      primaryFont: {
        family: 'Inter',
        fallback: 'system-ui, sans-serif',
        weights: [300, 400, 500, 600]
      },
      headingFont: {
        family: 'Outfit',
        fallback: 'system-ui, sans-serif',
        weights: [500, 600, 700]
      },
      codeFont: {
        family: 'Fira Code',
        fallback: 'monospace'
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      },
      letterSpacing: {
        tight: '-0.01em',
        normal: '0',
        wide: '0.01em'
      }
    },
    borders: {
      radius: {
        none: '0',
        sm: '6px',
        base: '12px',
        lg: '20px',
        xl: '28px',
        full: '9999px'
      },
      width: {
        none: '0',
        thin: '1px',
        base: '1px',
        thick: '2px'
      },
      style: 'solid'
    },
    spacing: {
      scale: 'spacious',
      baseUnit: 1.25
    },
    shadows: {
      style: 'elevated',
      colors: ['rgba(99, 102, 241, 0.25)', 'rgba(139, 92, 246, 0.15)']
    },
    animations: {
      duration: {
        fast: '200ms',
        base: '300ms',
        slow: '500ms'
      },
      easing: {
        ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      effects: ['fade', 'scale', 'glow']
    },
    effects: {
      gradients: true,
      glassmorphism: true,
      neumorphism: false,
      glows: true,
      patterns: false,
      noise: false
    },
    components: {
      buttons: {
        style: 'rounded',
        emphasis: 'subtle',
        texture: 'floating'
      },
      inputs: {
        style: 'filled',
        focus: 'glow'
      },
      cards: {
        style: 'elevated',
        corners: 'rounded'
      }
    },
    popular: true
  },

  {
    id: 'editorial-magazine',
    name: 'Editorial Magazine',
    description: 'Typography-focused, grid-based, and editorial elegance',
    category: 'editorial',
    colors: {
      primary: '#1a202c',
      secondary: '#2d3748',
      accent: '#e53e3e',
      success: '#38a169',
      warning: '#d69e2e',
      error: '#e53e3e',
      background: {
        primary: '#ffffff',
        secondary: '#f7fafc',
        tertiary: '#edf2f7'
      },
      text: {
        primary: '#1a202c',
        secondary: '#4a5568'
      }
    },
    typography: {
      primaryFont: {
        family: 'Crimson Text',
        fallback: 'Georgia, serif',
        weights: [400, 600, 700]
      },
      headingFont: {
        family: 'Playfair Display',
        fallback: 'Georgia, serif',
        weights: [400, 500, 700, 900]
      },
      codeFont: {
        family: 'Source Code Pro',
        fallback: 'monospace'
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1.125rem',
        lg: '1.25rem',
        xl: '1.5rem',
        '2xl': '2rem',
        '3xl': '2.5rem',
        '4xl': '3.5rem'
      },
      lineHeight: {
        tight: 1.2,
        normal: 1.6,
        relaxed: 1.8
      },
      letterSpacing: {
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em'
      }
    },
    borders: {
      radius: {
        none: '0',
        sm: '2px',
        base: '4px',
        lg: '6px',
        xl: '8px',
        full: '9999px'
      },
      width: {
        none: '0',
        thin: '1px',
        base: '1px',
        thick: '2px'
      },
      style: 'solid'
    },
    spacing: {
      scale: 'spacious',
      baseUnit: 1.4
    },
    shadows: {
      style: 'subtle',
      colors: ['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.05)']
    },
    animations: {
      duration: {
        fast: '200ms',
        base: '300ms',
        slow: '400ms'
      },
      easing: {
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      effects: ['fade', 'slide']
    },
    effects: {
      gradients: false,
      glassmorphism: false,
      neumorphism: false,
      glows: false,
      patterns: false,
      noise: false
    },
    components: {
      buttons: {
        style: 'rounded',
        emphasis: 'subtle',
        texture: 'flat'
      },
      inputs: {
        style: 'underlined',
        focus: 'underline'
      },
      cards: {
        style: 'flat',
        corners: 'rounded'
      }
    }
  }
];