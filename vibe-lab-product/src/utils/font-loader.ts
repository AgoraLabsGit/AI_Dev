/**
 * Font Loader Utility
 * Handles dynamic font loading for templates
 */

interface FontLoaderOptions {
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  preload?: boolean;
}

class FontLoader {
  private loadedFonts = new Set<string>();

  /**
   * Load a Google Font with specified weights
   */
  async loadGoogleFont(
    family: string,
    weights: number[] = [400, 500, 600, 700],
    options: FontLoaderOptions = {}
  ): Promise<void> {
    const { display = 'swap', preload = true } = options;
    
    // Skip if already loaded
    const fontKey = `${family}-${weights.join(',')}`;
    if (this.loadedFonts.has(fontKey)) {
      return;
    }

    try {
      // Construct Google Fonts URL
      const familyParam = family.replace(/\s+/g, '+');
      const weightsParam = weights.join(';');
      const url = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weightsParam}&display=${display}`;

      if (preload) {
        // Add preload link
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'style';
        preloadLink.href = url;
        document.head.appendChild(preloadLink);
      }

      // Add stylesheet link
      const styleLink = document.createElement('link');
      styleLink.rel = 'stylesheet';
      styleLink.href = url;
      document.head.appendChild(styleLink);

      // Wait for font to load
      await document.fonts.ready;

      // Mark as loaded
      this.loadedFonts.add(fontKey);

      // Update Tailwind config if needed
      this.updateTailwindConfig(family);

    } catch (error) {
      console.warn(`Failed to load font family "${family}":`, error);
    }
  }

  /**
   * Load a local font file
   */
  async loadLocalFont(
    family: string,
    sources: { url: string; format: string }[],
    options: FontLoaderOptions = {}
  ): Promise<void> {
    const { display = 'swap' } = options;

    // Skip if already loaded
    const fontKey = `${family}-local`;
    if (this.loadedFonts.has(fontKey)) {
      return;
    }

    try {
      // Create @font-face rule
      const fontFace = new FontFace(
        family,
        `local("${family}"), ${sources.map(s => `url(${s.url}) format("${s.format}")`).join(', ')}`,
        { display }
      );

      // Load the font
      const loadedFace = await fontFace.load();
      document.fonts.add(loadedFace);

      // Mark as loaded
      this.loadedFonts.add(fontKey);

      // Update Tailwind config if needed
      this.updateTailwindConfig(family);

    } catch (error) {
      console.warn(`Failed to load local font "${family}":`, error);
    }
  }

  /**
   * Check if a font family is loaded
   */
  isFontLoaded(family: string): boolean {
    return this.loadedFonts.has(family) || document.fonts.check(`12px "${family}"`);
  }

  /**
   * Get all loaded font families
   */
  getLoadedFonts(): string[] {
    return Array.from(this.loadedFonts);
  }

  /**
   * Clear loaded fonts cache
   */
  clearLoadedFonts(): void {
    this.loadedFonts.clear();
  }

  /**
   * Update Tailwind config with new font
   */
  private updateTailwindConfig(family: string): void {
    // In a full implementation, this would update the Tailwind config
    // For now, we assume fonts are already in the config
    console.log(`Font "${family}" loaded and ready for Tailwind usage`);
  }
}

// Export singleton instance
export const fontLoader = new FontLoader();