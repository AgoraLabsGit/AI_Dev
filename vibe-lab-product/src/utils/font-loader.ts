/**
 * Font Loading Utility
 * Dynamically loads Google Fonts and provides font availability checking
 */

interface FontConfig {
  family: string;
  weights: number[];
  fallback: string;
}

class FontLoader {
  private loadedFonts = new Set<string>();
  private loadingPromises = new Map<string, Promise<void>>();

  /**
   * Load a Google Font dynamically
   */
  async loadGoogleFont(family: string, weights: number[] = [400]): Promise<void> {
    const fontKey = `${family}-${weights.join(',')}`;
    
    if (this.loadedFonts.has(fontKey)) {
      return;
    }

    if (this.loadingPromises.has(fontKey)) {
      return this.loadingPromises.get(fontKey);
    }

    const loadPromise = this.loadFontFromGoogle(family, weights);
    this.loadingPromises.set(fontKey, loadPromise);
    
    try {
      await loadPromise;
      this.loadedFonts.add(fontKey);
    } catch (error) {
      console.warn(`Failed to load font ${family}:`, error);
      this.loadingPromises.delete(fontKey);
    }
  }

  private async loadFontFromGoogle(family: string, weights: number[]): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create Google Fonts URL
      const weightsStr = weights.join(',');
      const fontUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/\s/g, '+')}:wght@${weightsStr}&display=swap`;
      
      // Check if already loaded
      const existingLink = document.querySelector(`link[href*="${family}"]`);
      if (existingLink) {
        resolve();
        return;
      }

      // Create link element
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontUrl;
      
      link.onload = () => {
        // Wait for font to be ready
        if ('fonts' in document) {
          Promise.all(
            weights.map(weight => 
              (document as any).fonts.load(`${weight} 16px "${family}"`)
            )
          ).then(() => resolve()).catch(reject);
        } else {
          // Fallback for browsers without Font Loading API
          setTimeout(resolve, 100);
        }
      };
      
      link.onerror = () => reject(new Error(`Failed to load font: ${family}`));
      
      document.head.appendChild(link);
    });
  }

  /**
   * Check if a font is available in the system
   */
  isFontAvailable(fontFamily: string): boolean {
    if (this.loadedFonts.has(fontFamily)) return true;
    
    // Use canvas-based detection
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return false;

    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    const baselineFont = 'monospace';

    context.font = testSize + ' ' + baselineFont;
    const baselineWidth = context.measureText(testString).width;

    context.font = testSize + ' ' + fontFamily + ', ' + baselineFont;
    const testWidth = context.measureText(testString).width;

    return testWidth !== baselineWidth;
  }

  /**
   * Get safe font stack with fallbacks
   */
  getSafeFontStack(config: FontConfig): string {
    const { family, fallback } = config;
    return `"${family}", ${fallback}`;
  }

  /**
   * Preload commonly used fonts
   */
  async preloadCommonFonts(): Promise<void> {
    const commonFonts = [
      { family: 'Inter', weights: [400, 500, 600, 700] },
      { family: 'Space Grotesk', weights: [400, 600, 700] },
      { family: 'Roboto', weights: [400, 500, 700] },
      { family: 'Open Sans', weights: [400, 600] },
      { family: 'Playfair Display', weights: [400, 600, 700] }
    ];

    await Promise.all(
      commonFonts.map(({ family, weights }) => 
        this.loadGoogleFont(family, weights)
      )
    );
  }

  /**
   * Get loading status of a font
   */
  getFontLoadingStatus(family: string): 'loaded' | 'loading' | 'not-loaded' {
    const fontKey = family;
    if (this.loadedFonts.has(fontKey)) return 'loaded';
    if (this.loadingPromises.has(fontKey)) return 'loading';
    return 'not-loaded';
  }
}

export const fontLoader = new FontLoader();

export const AVAILABLE_FONTS: FontConfig[] = [
  {
    family: 'Inter',
    weights: [300, 400, 500, 600, 700],
    fallback: 'system-ui, sans-serif'
  },
  {
    family: 'Space Grotesk',
    weights: [400, 500, 600, 700],
    fallback: 'system-ui, sans-serif'
  },
  {
    family: 'Roboto',
    weights: [300, 400, 500, 700],
    fallback: 'system-ui, sans-serif'
  },
  {
    family: 'Open Sans',
    weights: [400, 600, 700],
    fallback: 'system-ui, sans-serif'
  },
  {
    family: 'Nunito',
    weights: [400, 600, 700],
    fallback: 'system-ui, sans-serif'
  },
  {
    family: 'Crimson Text',
    weights: [400, 600, 700],
    fallback: 'Georgia, serif'
  },
  {
    family: 'Playfair Display',
    weights: [400, 500, 600, 700, 900],
    fallback: 'Georgia, serif'
  },
  {
    family: 'Comfortaa',
    weights: [400, 600, 700],
    fallback: 'system-ui, sans-serif'
  },
  {
    family: 'Orbitron',
    weights: [400, 700, 900],
    fallback: 'system-ui, sans-serif'
  },
  {
    family: 'Krona One',
    weights: [400],
    fallback: 'system-ui, sans-serif'
  },
  {
    family: 'JetBrains Mono',
    weights: [400, 500, 700],
    fallback: 'monospace'
  },
  {
    family: 'Fira Code',
    weights: [400, 500, 700],
    fallback: 'monospace'
  },
  {
    family: 'Source Code Pro',
    weights: [400, 600, 700],
    fallback: 'monospace'
  }
];