/**
 * Design System Templates
 * Pre-configured theme presets for different aesthetics
 */

export interface ThemeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'tech' | 'minimal' | 'playful' | 'corporate' | 'bold' | 'elegant';
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
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
  };
  typography: {
    fontFamily: string;
    headingWeight: number;
    bodyWeight: number;
  };
  effects: {
    shadows: 'none' | 'subtle' | 'elevated' | 'dramatic';
    borders: 'none' | 'subtle' | 'defined' | 'bold';
    animations: 'none' | 'subtle' | 'smooth' | 'playful';
    glows: boolean;
  };
  popular?: boolean;
  new?: boolean;
}

export const themeTemplates: ThemeTemplate[] = [
  {
    id: 'ai-tech-forward',
    name: 'AI Tech Forward',
    description: 'Modern AI-inspired design with sophisticated gradients and glow effects',
    category: 'tech',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: {
        primary: '#0a0a0f',
        secondary: '#0f0f1a',
        tertiary: '#141424'
      },
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1'
      }
    },
    gradients: {
      primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      secondary: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
      accent: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
    },
    typography: {
      fontFamily: 'Inter',
      headingWeight: 700,
      bodyWeight: 400
    },
    effects: {
      shadows: 'elevated',
      borders: 'subtle',
      animations: 'smooth',
      glows: true
    },
    popular: true
  },
  
  {
    id: 'minimal-mono',
    name: 'Minimal Monochrome',
    description: 'Clean and sophisticated with subtle grays and minimal ornamentation',
    category: 'minimal',
    colors: {
      primary: '#1e293b',
      secondary: '#334155',
      accent: '#475569',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      background: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#f1f5f9'
      },
      text: {
        primary: '#0f172a',
        secondary: '#64748b'
      }
    },
    gradients: {
      primary: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
      secondary: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
      accent: 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
    },
    typography: {
      fontFamily: 'Inter',
      headingWeight: 600,
      bodyWeight: 400
    },
    effects: {
      shadows: 'subtle',
      borders: 'defined',
      animations: 'subtle',
      glows: false
    }
  },
  
  {
    id: 'neo-brutalist',
    name: 'Neo Brutalist',
    description: 'Bold colors, sharp edges, and strong contrasts for maximum impact',
    category: 'bold',
    colors: {
      primary: '#000000',
      secondary: '#ff006e',
      accent: '#ffbe0b',
      success: '#06ffa5',
      warning: '#fb5607',
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
    gradients: {
      primary: 'linear-gradient(135deg, #ff006e 0%, #ff4081 100%)',
      secondary: 'linear-gradient(135deg, #ffbe0b 0%, #ffd60a 100%)',
      accent: 'linear-gradient(135deg, #06ffa5 0%, #0affed 100%)'
    },
    typography: {
      fontFamily: 'Space Grotesk',
      headingWeight: 800,
      bodyWeight: 500
    },
    effects: {
      shadows: 'bold',
      borders: 'bold',
      animations: 'playful',
      glows: false
    },
    new: true
  },
  
  {
    id: 'glass-morphism',
    name: 'Glass Morphism',
    description: 'Translucent surfaces with blur effects for a modern, ethereal feel',
    category: 'elegant',
    colors: {
      primary: '#6366f1',
      secondary: '#a78bfa',
      accent: '#60a5fa',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      background: {
        primary: '#030712',
        secondary: 'rgba(15, 23, 42, 0.8)',
        tertiary: 'rgba(30, 41, 59, 0.6)'
      },
      text: {
        primary: '#f9fafb',
        secondary: '#e5e7eb'
      }
    },
    gradients: {
      primary: 'linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)',
      secondary: 'linear-gradient(135deg, rgba(167, 139, 250, 0.8) 0%, rgba(196, 181, 253, 0.8) 100%)',
      accent: 'linear-gradient(135deg, rgba(96, 165, 250, 0.8) 0%, rgba(147, 197, 253, 0.8) 100%)'
    },
    typography: {
      fontFamily: 'Inter',
      headingWeight: 600,
      bodyWeight: 400
    },
    effects: {
      shadows: 'subtle',
      borders: 'subtle',
      animations: 'smooth',
      glows: true
    },
    popular: true
  },
  
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    description: 'High contrast neon colors with dark backgrounds for a futuristic vibe',
    category: 'tech',
    colors: {
      primary: '#00d9ff',
      secondary: '#ff0080',
      accent: '#ffff00',
      success: '#00ff88',
      warning: '#ff9500',
      error: '#ff0040',
      background: {
        primary: '#0a0a0a',
        secondary: '#1a0a1a',
        tertiary: '#1a1a2a'
      },
      text: {
        primary: '#ffffff',
        secondary: '#00d9ff'
      }
    },
    gradients: {
      primary: 'linear-gradient(135deg, #00d9ff 0%, #0099ff 100%)',
      secondary: 'linear-gradient(135deg, #ff0080 0%, #ff00ff 100%)',
      accent: 'linear-gradient(135deg, #ffff00 0%, #ffaa00 100%)'
    },
    typography: {
      fontFamily: 'Orbitron',
      headingWeight: 700,
      bodyWeight: 400
    },
    effects: {
      shadows: 'dramatic',
      borders: 'defined',
      animations: 'playful',
      glows: true
    },
    new: true
  },
  
  {
    id: 'nature-organic',
    name: 'Nature Organic',
    description: 'Earth tones and organic shapes for eco-friendly and wellness brands',
    category: 'corporate',
    colors: {
      primary: '#2d5016',
      secondary: '#4a7c59',
      accent: '#73a942',
      success: '#52b788',
      warning: '#f4a261',
      error: '#e76f51',
      background: {
        primary: '#fefae0',
        secondary: '#faf3dd',
        tertiary: '#f5edd6'
      },
      text: {
        primary: '#264653',
        secondary: '#2a6f7c'
      }
    },
    gradients: {
      primary: 'linear-gradient(135deg, #2d5016 0%, #4a7c59 100%)',
      secondary: 'linear-gradient(135deg, #4a7c59 0%, #73a942 100%)',
      accent: 'linear-gradient(135deg, #73a942 0%, #a3b18a 100%)'
    },
    typography: {
      fontFamily: 'Lato',
      headingWeight: 700,
      bodyWeight: 400
    },
    effects: {
      shadows: 'subtle',
      borders: 'subtle',
      animations: 'subtle',
      glows: false
    }
  },
  
  {
    id: 'startup-gradient',
    name: 'Startup Gradient',
    description: 'Bold gradients and modern typography for innovative startups',
    category: 'playful',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb',
      success: '#36d399',
      warning: '#fbbd23',
      error: '#f56565',
      background: {
        primary: '#fafbfc',
        secondary: '#ffffff',
        tertiary: '#f7f8fa'
      },
      text: {
        primary: '#1a202c',
        secondary: '#4a5568'
      }
    },
    gradients: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      accent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    typography: {
      fontFamily: 'Poppins',
      headingWeight: 700,
      bodyWeight: 400
    },
    effects: {
      shadows: 'elevated',
      borders: 'subtle',
      animations: 'smooth',
      glows: false
    },
    popular: true
  },
  
  {
    id: 'corporate-professional',
    name: 'Corporate Professional',
    description: 'Clean and trustworthy design for enterprise applications',
    category: 'corporate',
    colors: {
      primary: '#1e3a8a',
      secondary: '#1e40af',
      accent: '#2563eb',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      background: {
        primary: '#ffffff',
        secondary: '#f9fafb',
        tertiary: '#f3f4f6'
      },
      text: {
        primary: '#111827',
        secondary: '#6b7280'
      }
    },
    gradients: {
      primary: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
      secondary: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
      accent: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
    },
    typography: {
      fontFamily: 'Roboto',
      headingWeight: 600,
      bodyWeight: 400
    },
    effects: {
      shadows: 'subtle',
      borders: 'defined',
      animations: 'subtle',
      glows: false
    }
  }
];