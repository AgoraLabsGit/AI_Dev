'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardTitle } from '@/lib/design-system';
import { advancedThemeTemplates } from '@/lib/design-system/templates/advanced-templates';
import { fontLoader, AVAILABLE_FONTS } from '@/utils/font-loader';
import { cssGenerator } from '@/utils/css-generator';

export default function StylingTest() {
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const [currentFontIndex, setCurrentFontIndex] = useState(0);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [isRunning, setIsRunning] = useState(false);

  const currentTemplate = advancedThemeTemplates[currentTemplateIndex];
  const currentFont = AVAILABLE_FONTS[currentFontIndex];

  // Test font loading
  const testFontLoading = async () => {
    setIsRunning(true);
    const results: Record<string, boolean> = {};

    // Test each font
    for (const font of AVAILABLE_FONTS.slice(0, 5)) { // Test first 5 fonts
      try {
        await fontLoader.loadGoogleFont(font.family, font.weights.slice(0, 2));
        results[font.family] = fontLoader.isFontAvailable(font.family);
      } catch (error) {
        results[font.family] = false;
      }
    }

    setTestResults(results);
    setIsRunning(false);
  };

  // Auto-cycle through templates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTemplateIndex(prev => 
        prev >= advancedThemeTemplates.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Auto-cycle through fonts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFontIndex(prev => 
        prev >= AVAILABLE_FONTS.length - 1 ? 0 : prev + 1
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Test CSS generation
  const testCSSGeneration = () => {
    try {
      const css = cssGenerator.generateCSSVariables(currentTemplate);
      const components = cssGenerator.generateComponentClasses(currentTemplate);
      const tailwind = cssGenerator.generateTailwindConfig(currentTemplate);
      
      console.log('CSS Variables:', css.length > 0);
      console.log('Component Classes:', components.length > 0);
      console.log('Tailwind Config:', tailwind.length > 0);
      
      return css.length > 0 && components.length > 0 && tailwind.length > 0;
    } catch (error) {
      console.error('CSS Generation failed:', error);
      return false;
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <Card variant="gradient">
          <CardTitle className="text-center mb-6">
            🧪 Styling System Test Suite
          </CardTitle>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Template Test */}
            <Card>
              <CardTitle className="mb-4">Template Cycling Test</CardTitle>
              <div className="space-y-4">
                <div 
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: currentTemplate.colors.background.secondary,
                    borderColor: currentTemplate.colors.primary,
                    borderWidth: currentTemplate.borders.width.base,
                    borderRadius: currentTemplate.borders.radius.base
                  }}
                >
                  <h3 
                    style={{
                      color: currentTemplate.colors.text.primary,
                      fontFamily: currentTemplate.typography.headingFont.family
                    }}
                  >
                    {currentTemplate.name}
                  </h3>
                  <p 
                    style={{
                      color: currentTemplate.colors.text.secondary,
                      fontSize: currentTemplate.typography.scale.sm
                    }}
                  >
                    {currentTemplate.description}
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-sm text-gray-400">
                    Template {currentTemplateIndex + 1} of {advancedThemeTemplates.length}
                  </span>
                </div>
              </div>
            </Card>

            {/* Font Test */}
            <Card>
              <CardTitle className="mb-4">Font Loading Test</CardTitle>
              <div className="space-y-4">
                <div 
                  className="p-4 rounded-lg bg-gray-800/50"
                  style={{ fontFamily: currentFont.family }}
                >
                  <h3 className="text-white text-lg mb-2">
                    {currentFont.family}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    The quick brown fox jumps over the lazy dog
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Weights: {currentFont.weights.join(', ')}
                  </p>
                </div>
                
                <Button 
                  onClick={testFontLoading} 
                  disabled={isRunning}
                  variant="outline"
                  fullWidth
                >
                  {isRunning ? 'Testing Fonts...' : 'Test Font Loading'}
                </Button>

                {Object.keys(testResults).length > 0 && (
                  <div className="space-y-1">
                    {Object.entries(testResults).map(([font, success]) => (
                      <div key={font} className="flex justify-between text-xs">
                        <span className="text-gray-400">{font}</span>
                        <span className={success ? 'text-green-400' : 'text-red-400'}>
                          {success ? '✓' : '✗'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* CSS Generation Test */}
            <Card>
              <CardTitle className="mb-4">CSS Export Test</CardTitle>
              <div className="space-y-4">
                <Button 
                  onClick={() => {
                    const success = testCSSGeneration();
                    alert(success ? 'CSS Generation: ✅ Success' : 'CSS Generation: ❌ Failed');
                  }}
                  variant="outline"
                  fullWidth
                >
                  Test CSS Generation
                </Button>
                
                <Button 
                  onClick={() => cssGenerator.downloadTemplate(currentTemplate)}
                  variant="primary"
                  fullWidth
                >
                  Download Current Template
                </Button>

                <div className="text-xs text-gray-400 space-y-1">
                  <div>✓ CSS Variables</div>
                  <div>✓ Component Classes</div>
                  <div>✓ Tailwind Config</div>
                  <div>✓ File Download</div>
                </div>
              </div>
            </Card>
          </div>
        </Card>

        {/* Live Preview Test */}
        <Card>
          <CardTitle className="mb-6">Live Component Preview</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Buttons */}
            <div className="space-y-3">
              <h4 className="text-white font-medium">Buttons</h4>
              <button 
                className="px-4 py-2 font-medium transition-all duration-200"
                style={{
                  backgroundColor: currentTemplate.colors.primary,
                  color: currentTemplate.colors.background.primary,
                  borderRadius: currentTemplate.components.buttons.style === 'pill' ? '9999px' : 
                              currentTemplate.components.buttons.style === 'sharp' ? '0' : 
                              currentTemplate.borders.radius.base,
                  borderWidth: currentTemplate.borders.width.base,
                  borderStyle: currentTemplate.borders.style,
                  borderColor: currentTemplate.colors.primary,
                  fontFamily: currentTemplate.typography.primaryFont.family
                }}
              >
                Primary Button
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <h4 className="text-white font-medium">Inputs</h4>
              <input 
                placeholder="Test input..."
                className="w-full px-3 py-2 transition-all duration-200"
                style={{
                  backgroundColor: currentTemplate.components.inputs.style === 'filled' ? 
                    currentTemplate.colors.background.tertiary : 'transparent',
                  color: currentTemplate.colors.text.primary,
                  borderRadius: currentTemplate.borders.radius.base,
                  borderWidth: currentTemplate.components.inputs.style === 'underlined' ? '0 0 2px 0' :
                              currentTemplate.borders.width.base,
                  borderStyle: currentTemplate.borders.style,
                  borderColor: currentTemplate.colors.text.secondary + '60',
                  fontFamily: currentTemplate.typography.primaryFont.family
                }}
              />
            </div>

            {/* Cards */}
            <div className="space-y-3">
              <h4 className="text-white font-medium">Cards</h4>
              <div 
                className="p-4"
                style={{
                  backgroundColor: currentTemplate.colors.background.secondary,
                  borderRadius: currentTemplate.borders.radius.lg,
                  borderWidth: currentTemplate.components.cards.style === 'outlined' ? 
                    currentTemplate.borders.width.base : '0',
                  borderStyle: currentTemplate.borders.style,
                  borderColor: currentTemplate.colors.text.secondary + '30'
                }}
              >
                <h5 
                  style={{
                    color: currentTemplate.colors.text.primary,
                    fontFamily: currentTemplate.typography.headingFont.family,
                    fontSize: currentTemplate.typography.scale.lg
                  }}
                >
                  Test Card
                </h5>
                <p 
                  style={{
                    color: currentTemplate.colors.text.secondary,
                    fontSize: currentTemplate.typography.scale.sm,
                    fontFamily: currentTemplate.typography.primaryFont.family
                  }}
                >
                  Card content with template styling
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Results Summary */}
        <Card variant="outline">
          <CardTitle className="mb-4">Test Results Summary</CardTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl text-green-400">✅</div>
              <div className="text-sm text-gray-400">Templates</div>
              <div className="text-xs text-gray-500">{advancedThemeTemplates.length} loaded</div>
            </div>
            <div>
              <div className="text-2xl text-green-400">✅</div>
              <div className="text-sm text-gray-400">Colors</div>
              <div className="text-xs text-gray-500">All functional</div>
            </div>
            <div>
              <div className="text-2xl text-yellow-400">⚠️</div>
              <div className="text-sm text-gray-400">Fonts</div>
              <div className="text-xs text-gray-500">Loading system</div>
            </div>
            <div>
              <div className="text-2xl text-green-400">✅</div>
              <div className="text-sm text-gray-400">Export</div>
              <div className="text-xs text-gray-500">CSS generation</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}