'use client';

import { Button, Card, CardTitle, Badge } from '@/lib/design-system';
import { advancedThemeTemplates } from '@/lib/design-system/templates/advanced-templates';

export default function StylingComparison() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Styling Dimensions Showcase
          </h1>
          <p className="text-xl text-gray-400">
            Beyond colors: Typography, spacing, borders, effects, and component styles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advancedThemeTemplates.slice(0, 6).map((template) => (
            <div
              key={template.id}
              className="space-y-4"
              style={{
                fontFamily: template.typography.primaryFont.family,
                backgroundColor: template.colors.background.secondary,
                padding: '24px',
                borderRadius: template.borders.radius.lg,
                borderWidth: template.borders.width.base,
                borderStyle: template.borders.style,
                borderColor: template.colors.text.secondary + '20'
              }}
            >
              {/* Template Info */}
              <div className="mb-4">
                <h2 
                  style={{
                    fontFamily: template.typography.headingFont.family,
                    fontSize: template.typography.scale.xl,
                    color: template.colors.text.primary,
                    fontWeight: template.typography.headingFont.weights[1] || 700,
                    letterSpacing: template.typography.letterSpacing.tight,
                    marginBottom: '8px'
                  }}
                >
                  {template.name}
                </h2>
                <p 
                  style={{
                    fontSize: template.typography.scale.sm,
                    color: template.colors.text.secondary,
                    lineHeight: template.typography.lineHeight.normal
                  }}
                >
                  {template.description}
                </p>
              </div>

              {/* Font Preview */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-400 uppercase">Typography</div>
                <div style={{ fontSize: template.typography.scale.xs, color: template.colors.text.secondary }}>
                  Primary: {template.typography.primaryFont.family}
                </div>
                <div style={{ fontSize: template.typography.scale.xs, color: template.colors.text.secondary }}>
                  Heading: {template.typography.headingFont.family}
                </div>
                <div 
                  style={{ 
                    fontFamily: template.typography.codeFont.family,
                    fontSize: template.typography.scale.xs,
                    color: template.colors.text.secondary,
                    backgroundColor: template.colors.background.tertiary,
                    padding: '4px 8px',
                    borderRadius: template.borders.radius.sm
                  }}
                >
                  Code: {template.typography.codeFont.family}
                </div>
              </div>

              {/* Button Styles */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-400 uppercase">Buttons</div>
                <div className="flex gap-2">
                  <button 
                    className="px-3 py-1.5 text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: template.colors.primary,
                      color: template.colors.background.primary,
                      borderRadius: template.components.buttons.style === 'pill' ? '9999px' : 
                                  template.components.buttons.style === 'sharp' ? '0' : 
                                  template.borders.radius.base,
                      borderWidth: template.borders.width.base,
                      borderStyle: template.borders.style,
                      borderColor: template.colors.primary
                    }}
                  >
                    {template.components.buttons.style}
                  </button>
                  <button 
                    className="px-3 py-1.5 text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: 'transparent',
                      color: template.colors.text.primary,
                      borderRadius: template.components.buttons.style === 'pill' ? '9999px' : 
                                  template.components.buttons.style === 'sharp' ? '0' : 
                                  template.borders.radius.base,
                      borderWidth: template.borders.width.base,
                      borderStyle: template.borders.style,
                      borderColor: template.colors.primary + '60'
                    }}
                  >
                    Outline
                  </button>
                </div>
              </div>

              {/* Input Style */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-400 uppercase">Input Style</div>
                <input 
                  placeholder={`${template.components.inputs.style} input`}
                  className="w-full px-3 py-2 text-sm"
                  style={{
                    backgroundColor: template.components.inputs.style === 'filled' ? 
                      template.colors.background.tertiary : 'transparent',
                    color: template.colors.text.primary,
                    borderRadius: template.borders.radius.base,
                    borderWidth: template.components.inputs.style === 'underlined' ? '0 0 1px 0' :
                                template.components.inputs.style === 'filled' ? '0' :
                                template.borders.width.base,
                    borderStyle: template.borders.style,
                    borderColor: template.colors.text.secondary + '40'
                  }}
                />
              </div>

              {/* Spacing Scale */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-400 uppercase">Spacing</div>
                <div className="flex items-center gap-2">
                  <div className="text-xs" style={{ color: template.colors.text.secondary }}>
                    {template.spacing.scale} ({template.spacing.baseUnit}x)
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(multiplier => (
                      <div 
                        key={multiplier}
                        className="border"
                        style={{ 
                          width: `${multiplier * template.spacing.baseUnit * 8}px`,
                          height: '8px',
                          backgroundColor: template.colors.primary + '40',
                          borderColor: template.colors.primary,
                          borderRadius: template.borders.radius.sm
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Effects */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-400 uppercase">Effects</div>
                <div className="flex flex-wrap gap-1">
                  <span 
                    className="px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: template.colors.accent + '20',
                      color: template.colors.accent,
                      borderRadius: template.borders.radius.sm
                    }}
                  >
                    {template.shadows.style}
                  </span>
                  {template.effects.gradients && (
                    <span 
                      className="px-2 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: template.colors.success + '20',
                        color: template.colors.success,
                        borderRadius: template.borders.radius.sm
                      }}
                    >
                      gradients
                    </span>
                  )}
                  {template.effects.glows && (
                    <span 
                      className="px-2 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: template.colors.warning + '20',
                        color: template.colors.warning,
                        borderRadius: template.borders.radius.sm
                      }}
                    >
                      glows
                    </span>
                  )}
                </div>
              </div>

              {/* Category Badge */}
              <div className="pt-2">
                <span 
                  className="px-2 py-1 text-xs font-medium uppercase"
                  style={{
                    backgroundColor: template.colors.primary + '15',
                    color: template.colors.primary,
                    borderRadius: template.borders.radius.sm,
                    letterSpacing: template.typography.letterSpacing.wide
                  }}
                >
                  {template.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <Card variant="gradient" className="text-center p-8">
          <CardTitle className="text-xl mb-4">
            Ready to customize beyond colors?
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => window.location.href = '/project/proj_001/design/styling'}
            >
              Basic Styling
            </Button>
            <Button 
              variant="glow" 
              size="lg"
              onClick={() => window.location.href = '/project/proj_001/design/styling/advanced'}
            >
              Advanced Styling
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}