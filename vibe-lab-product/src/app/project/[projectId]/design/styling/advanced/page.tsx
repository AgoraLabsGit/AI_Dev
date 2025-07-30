'use client';

import { useState, useEffect, use } from 'react';
import { 
  Button, 
  Input, 
  Card, 
  CardTitle, 
  CardDescription,
  Badge,
  useTheme
} from '@/lib/design-system';
import { 
  Palette,
  Type,
  Box,
  Zap,
  Layers,
  Sliders,
  Eye,
  Download,
  Wand2,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Circle,
  Square,
  Triangle,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { advancedThemeTemplates, type AdvancedThemeTemplate } from '@/lib/design-system/templates/advanced-templates';
import { fontLoader, AVAILABLE_FONTS } from '@/utils/font-loader';
import { cssGenerator } from '@/utils/css-generator';

interface ProjectAdvancedStylingProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function ProjectAdvancedStyling({ params }: ProjectAdvancedStylingProps) {
  const { projectId } = use(params);
  const { theme, themeName, toggleTheme } = useTheme();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('professional-dark');
  const [activeTab, setActiveTab] = useState<'templates' | 'typography' | 'spacing' | 'borders' | 'effects' | 'components'>('templates');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [fontLoadingStates, setFontLoadingStates] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});
  
  // Customizable properties that override template defaults
  const [customizations, setCustomizations] = useState({
    typography: {
      primaryFont: '',
      headingFont: '',
      scale: 'base' as 'xs' | 'sm' | 'base' | 'lg' | 'xl'
    },
    spacing: {
      scale: '' as '' | 'compact' | 'comfortable' | 'spacious',
      baseUnit: 0
    },
    borders: {
      radius: '' as '' | 'none' | 'sm' | 'base' | 'lg' | 'xl',
      style: '' as '' | 'solid' | 'dashed' | 'dotted'
    },
    effects: {
      shadowStyle: '' as '' | 'none' | 'subtle' | 'elevated' | 'dramatic' | 'neon'
    },
    components: {
      buttonStyle: '' as '' | 'rounded' | 'sharp' | 'pill' | 'cut-corners',
      inputStyle: '' as '' | 'outlined' | 'filled' | 'underlined' | 'floating'
    }
  });
  
  const currentTemplate = advancedThemeTemplates.find(t => t.id === selectedTemplate) || advancedThemeTemplates[0];
  
  // Reset customizations when template changes
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    setCustomizations({
      typography: { primaryFont: '', headingFont: '', scale: 'base' },
      spacing: { scale: '', baseUnit: 0 },
      borders: { radius: '', style: '' },
      effects: { shadowStyle: '' },
      components: { buttonStyle: '', inputStyle: '' }
    });
  };
  
  // Create effective template with customizations applied
  const effectiveTemplate = {
    ...currentTemplate,
    typography: {
      ...currentTemplate.typography,
      primaryFont: {
        ...currentTemplate.typography.primaryFont,
        family: customizations.typography.primaryFont || currentTemplate.typography.primaryFont.family
      },
      headingFont: {
        ...currentTemplate.typography.headingFont,
        family: customizations.typography.headingFont || currentTemplate.typography.headingFont.family
      }
    },
    spacing: {
      scale: customizations.spacing.scale || currentTemplate.spacing.scale,
      baseUnit: customizations.spacing.baseUnit || currentTemplate.spacing.baseUnit
    },
    borders: {
      ...currentTemplate.borders,
      radius: {
        ...currentTemplate.borders.radius,
        base: customizations.borders.radius ? 
          (customizations.borders.radius === 'none' ? '0' :
           customizations.borders.radius === 'sm' ? '4px' :
           customizations.borders.radius === 'base' ? '8px' :
           customizations.borders.radius === 'lg' ? '16px' :
           customizations.borders.radius === 'xl' ? '24px' : currentTemplate.borders.radius.base)
          : currentTemplate.borders.radius.base
      },
      style: customizations.borders.style || currentTemplate.borders.style
    },
    shadows: {
      ...currentTemplate.shadows,
      style: customizations.effects.shadowStyle || currentTemplate.shadows.style
    },
    components: {
      buttons: {
        ...currentTemplate.components.buttons,
        style: customizations.components.buttonStyle || currentTemplate.components.buttons.style
      },
      inputs: {
        ...currentTemplate.components.inputs,
        style: customizations.components.inputStyle || currentTemplate.components.inputs.style
      },
      cards: currentTemplate.components.cards
    }
  };
  
  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedValue(label);
    setTimeout(() => setCopiedValue(null), 2000);
  };
  
  const getDeviceClasses = () => {
    switch (previewDevice) {
      case 'mobile': return 'max-w-sm mx-auto';
      case 'tablet': return 'max-w-2xl mx-auto';
      default: return 'w-full';
    }
  };

  // Load fonts when they're selected
  const handleFontChange = async (fontFamily: string, type: 'primary' | 'heading') => {
    if (!fontFamily) return;
    
    setFontLoadingStates(prev => ({ ...prev, [fontFamily]: 'loading' }));
    
    try {
      const fontConfig = AVAILABLE_FONTS.find(f => f.family === fontFamily);
      if (fontConfig) {
        await fontLoader.loadGoogleFont(fontConfig.family, fontConfig.weights);
        setFontLoadingStates(prev => ({ ...prev, [fontFamily]: 'loaded' }));
      }
    } catch (error) {
      setFontLoadingStates(prev => ({ ...prev, [fontFamily]: 'error' }));
    }
    
    setCustomizations(prev => ({
      ...prev,
      typography: { ...prev.typography, [type === 'primary' ? 'primaryFont' : 'headingFont']: fontFamily }
    }));
  };

  // Export template functionality
  const handleExportTheme = () => {
    cssGenerator.downloadTemplate(effectiveTemplate, { 
      format: 'css-variables',
      includeComponents: true,
      prefix: 'vibe'
    });
  };

  // Preload common fonts on mount
  useEffect(() => {
    fontLoader.preloadCommonFonts().catch(console.warn);
  }, []);

  const TabButton = ({ id, children, icon: Icon }: { id: string; children: React.ReactNode; icon: any }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        activeTab === id
          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="gradient">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Sliders className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Advanced Styling</h1>
              <p className="text-gray-400">Complete design system customization</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="secondary" leftIcon={<RotateCcw className="w-4 h-4" />}>
              Reset
            </Button>
            <Button 
              variant="primary" 
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportTheme}
            >
              Export Theme
            </Button>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <Card>
        <div className="flex flex-wrap gap-2">
          <TabButton id="templates" icon={Palette}>Templates</TabButton>
          <TabButton id="typography" icon={Type}>Typography</TabButton>
          <TabButton id="spacing" icon={Box}>Spacing</TabButton>
          <TabButton id="borders" icon={Square}>Borders</TabButton>
          <TabButton id="effects" icon={Zap}>Effects</TabButton>
          <TabButton id="components" icon={Layers}>Components</TabButton>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {activeTab === 'templates' && (
            <Card>
              <CardTitle className="mb-4">Style Templates</CardTitle>
              <div className="space-y-3">
                {advancedThemeTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateChange(template.id)}
                    className={`w-full p-4 rounded-lg border transition-all duration-200 ${
                      selectedTemplate === template.id
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : 'border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-2 mt-1">
                        {/* Color dots */}
                        <div className="flex gap-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: template.colors.primary }}
                          />
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: template.colors.secondary }}
                          />
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: template.colors.accent }}
                          />
                        </div>
                        {/* Shape indicators */}
                        <div className="flex gap-1 items-center justify-center">
                          {template.borders.radius.base === '0' ? (
                            <Square className="w-2.5 h-2.5 text-gray-500" />
                          ) : template.borders.radius.base.includes('9999') ? (
                            <Circle className="w-2.5 h-2.5 text-gray-500" />
                          ) : (
                            <div className="w-2.5 h-2.5 bg-gray-500 rounded-sm" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">{template.name}</span>
                          {template.popular && (
                            <Badge size="xs" variant="primary">Popular</Badge>
                          )}
                          {template.new && (
                            <Badge size="xs" variant="success">New</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{template.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge size="xs" variant="outline">{template.category}</Badge>
                          <Badge size="xs" variant="outline">{template.typography.primaryFont.family}</Badge>
                        </div>
                      </div>
                      {selectedTemplate === template.id && (
                        <Check className="w-4 h-4 text-purple-400 mt-1" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'typography' && (
            <Card>
              <CardTitle className="mb-4">Typography System</CardTitle>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Primary Font
                  </label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white"
                    value={customizations.typography.primaryFont || currentTemplate.typography.primaryFont.family}
                    onChange={(e) => handleFontChange(e.target.value, 'primary')}
                  >
                    <option value="">{currentTemplate.typography.primaryFont.family} (Default)</option>
                    {AVAILABLE_FONTS.map(font => (
                      <option key={font.family} value={font.family}>
                        {font.family}
                        {fontLoadingStates[font.family] === 'loading' && ' (Loading...)'}
                        {fontLoadingStates[font.family] === 'loaded' && ' ✓'}
                        {fontLoadingStates[font.family] === 'error' && ' ✗'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Heading Font
                  </label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white"
                    value={customizations.typography.headingFont || currentTemplate.typography.headingFont.family}
                    onChange={(e) => handleFontChange(e.target.value, 'heading')}
                  >
                    <option value="">{currentTemplate.typography.headingFont.family} (Default)</option>
                    {AVAILABLE_FONTS.map(font => (
                      <option key={font.family} value={font.family}>
                        {font.family}
                        {fontLoadingStates[font.family] === 'loading' && ' (Loading...)'}
                        {fontLoadingStates[font.family] === 'loaded' && ' ✓'}
                        {fontLoadingStates[font.family] === 'error' && ' ✗'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Font Scale
                  </label>
                  <div className="space-y-2">
                    {Object.entries(currentTemplate.typography.scale).map(([size, value]) => (
                      <div key={size} className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 uppercase">{size}</span>
                        <button
                          onClick={() => copyToClipboard(value, `font-${size}`)}
                          className="text-xs text-gray-300 hover:text-white flex items-center gap-1"
                        >
                          {value}
                          {copiedValue === `font-${size}` ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Letter Spacing
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(currentTemplate.typography.letterSpacing).map(([spacing, value]) => (
                      <button
                        key={spacing}
                        onClick={() => copyToClipboard(value, `spacing-${spacing}`)}
                        className="p-2 bg-gray-800/50 border border-gray-700/50 rounded text-xs text-gray-300 hover:text-white"
                      >
                        {spacing}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'spacing' && (
            <Card>
              <CardTitle className="mb-4">Spacing System</CardTitle>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Spacing Scale
                  </label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white"
                    value={customizations.spacing.scale || currentTemplate.spacing.scale}
                    onChange={(e) => setCustomizations(prev => ({
                      ...prev,
                      spacing: { ...prev.spacing, scale: e.target.value as 'compact' | 'comfortable' | 'spacious' }
                    }))}
                  >
                    <option value="compact">Compact (0.8x)</option>
                    <option value="comfortable">Comfortable (1.0x)</option>
                    <option value="spacious">Spacious (1.25x)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Base Unit Multiplier
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={currentTemplate.spacing.baseUnit}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-300 w-12">{currentTemplate.spacing.baseUnit}x</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-800/30 rounded-lg">
                  <div className="text-xs font-medium text-gray-400 mb-2">Spacing Preview</div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 6, 8].map(multiplier => (
                      <div key={multiplier} className="flex items-center gap-3">
                        <div 
                          className="bg-purple-500/20 border border-purple-500/30 rounded"
                          style={{ 
                            width: `${multiplier * currentTemplate.spacing.baseUnit * 16}px`,
                            height: '12px'
                          }}
                        />
                        <span className="text-xs text-gray-400">{multiplier * currentTemplate.spacing.baseUnit * 16}px</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'borders' && (
            <Card>
              <CardTitle className="mb-4">Border System</CardTitle>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Border Radius
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(currentTemplate.borders.radius).map(([size, value]) => (
                      <button
                        key={size}
                        onClick={() => copyToClipboard(value, `radius-${size}`)}
                        className="flex items-center justify-between p-2 bg-gray-800/50 border border-gray-700/50 rounded text-xs text-gray-300 hover:text-white"
                      >
                        <span>{size}</span>
                        <div 
                          className="w-4 h-4 bg-purple-500/30 border border-purple-500/50"
                          style={{ borderRadius: value }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Border Width
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(currentTemplate.borders.width).map(([width, value]) => (
                      <button
                        key={width}
                        onClick={() => copyToClipboard(value, `border-${width}`)}
                        className="flex items-center justify-between p-2 bg-gray-800/50 border border-gray-700/50 rounded text-xs text-gray-300 hover:text-white"
                      >
                        <span>{width}</span>
                        <div 
                          className="w-4 h-4 bg-transparent border-purple-500"
                          style={{ borderWidth: value, borderStyle: currentTemplate.borders.style }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Border Style
                  </label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white"
                    value={customizations.borders.style || currentTemplate.borders.style}
                    onChange={(e) => setCustomizations(prev => ({
                      ...prev,
                      borders: { ...prev.borders, style: e.target.value as 'solid' | 'dashed' | 'dotted' }
                    }))}
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="double">Double</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'effects' && (
            <Card>
              <CardTitle className="mb-4">Visual Effects</CardTitle>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Shadow Style
                  </label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white"
                    value={customizations.effects.shadowStyle || currentTemplate.shadows.style}
                    onChange={(e) => setCustomizations(prev => ({
                      ...prev,
                      effects: { ...prev.effects, shadowStyle: e.target.value as 'none' | 'subtle' | 'elevated' | 'dramatic' | 'neon' }
                    }))}
                  >
                    <option value="none">None</option>
                    <option value="subtle">Subtle</option>
                    <option value="elevated">Elevated</option>
                    <option value="dramatic">Dramatic</option>
                    <option value="neon">Neon</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Effects Enabled
                  </label>
                  <div className="space-y-2">
                    {Object.entries(currentTemplate.effects).map(([effect, enabled]) => (
                      <label key={effect} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={enabled}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-500"
                        />
                        <span className="text-sm text-gray-300 capitalize">{effect}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Animation Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(currentTemplate.animations.duration).map(([speed, value]) => (
                      <button
                        key={speed}
                        onClick={() => copyToClipboard(value, `duration-${speed}`)}
                        className="p-2 bg-gray-800/50 border border-gray-700/50 rounded text-xs text-gray-300 hover:text-white"
                      >
                        {speed}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'components' && (
            <Card>
              <CardTitle className="mb-4">Component Styles</CardTitle>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Button Style
                  </label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white"
                    value={customizations.components.buttonStyle || currentTemplate.components.buttons.style}
                    onChange={(e) => setCustomizations(prev => ({
                      ...prev,
                      components: { ...prev.components, buttonStyle: e.target.value as 'rounded' | 'sharp' | 'pill' | 'cut-corners' }
                    }))}
                  >
                    <option value="rounded">Rounded</option>
                    <option value="sharp">Sharp</option>
                    <option value="pill">Pill</option>
                    <option value="cut-corners">Cut Corners</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Input Style
                  </label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white"
                    value={customizations.components.inputStyle || currentTemplate.components.inputs.style}
                    onChange={(e) => setCustomizations(prev => ({
                      ...prev,
                      components: { ...prev.components, inputStyle: e.target.value as 'outlined' | 'filled' | 'underlined' | 'floating' }
                    }))}
                  >
                    <option value="outlined">Outlined</option>
                    <option value="filled">Filled</option>
                    <option value="underlined">Underlined</option>
                    <option value="floating">Floating</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Card Style
                  </label>
                  <select className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white">
                    <option value="flat" selected={currentTemplate.components.cards.style === 'flat'}>Flat</option>
                    <option value="elevated" selected={currentTemplate.components.cards.style === 'elevated'}>Elevated</option>
                    <option value="outlined" selected={currentTemplate.components.cards.style === 'outlined'}>Outlined</option>
                    <option value="filled" selected={currentTemplate.components.cards.style === 'filled'}>Filled</option>
                  </select>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview Controls */}
          <Card variant="elevated">
            <div className="flex items-center justify-between mb-6">
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-400" />
                Live Preview
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-2 rounded-lg transition-colors ${
                    previewDevice === 'desktop' 
                      ? 'bg-indigo-500/20 text-indigo-400' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-2 rounded-lg transition-colors ${
                    previewDevice === 'tablet' 
                      ? 'bg-indigo-500/20 text-indigo-400' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-2 rounded-lg transition-colors ${
                    previewDevice === 'mobile' 
                      ? 'bg-indigo-500/20 text-indigo-400' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Component Preview */}
            <div 
              className={`p-6 bg-gray-900/50 rounded-lg border border-gray-800/50 ${getDeviceClasses()}`}
              style={{
                fontFamily: effectiveTemplate.typography.primaryFont.family,
                backgroundColor: effectiveTemplate.colors.background.secondary
              }}
            >
              <div className="space-y-6">
                {/* Typography Preview */}
                <div className="space-y-3">
                  <h1 
                    className="font-bold"
                    style={{
                      fontFamily: effectiveTemplate.typography.headingFont.family,
                      fontSize: effectiveTemplate.typography.scale['2xl'],
                      color: effectiveTemplate.colors.text.primary,
                      letterSpacing: effectiveTemplate.typography.letterSpacing.tight
                    }}
                  >
                    {effectiveTemplate.name}
                  </h1>
                  <p 
                    style={{
                      fontSize: effectiveTemplate.typography.scale.base,
                      color: effectiveTemplate.colors.text.secondary,
                      lineHeight: effectiveTemplate.typography.lineHeight.normal
                    }}
                  >
                    {effectiveTemplate.description}
                  </p>
                </div>
                
                {/* Button Preview */}
                <div className="flex gap-3 flex-wrap">
                  <button 
                    className="px-4 py-2 font-medium transition-all duration-200"
                    style={{
                      backgroundColor: effectiveTemplate.colors.primary,
                      color: effectiveTemplate.colors.background.primary,
                      borderRadius: effectiveTemplate.components.buttons.style === 'pill' ? '9999px' : 
                                  effectiveTemplate.components.buttons.style === 'sharp' ? '0' : 
                                  effectiveTemplate.components.buttons.style === 'cut-corners' ? '0 8px 0 8px' :
                                  effectiveTemplate.borders.radius.base,
                      borderWidth: effectiveTemplate.borders.width.base,
                      borderStyle: effectiveTemplate.borders.style,
                      borderColor: effectiveTemplate.colors.primary
                    }}
                  >
                    Primary Button
                  </button>
                  <button 
                    className="px-4 py-2 font-medium transition-all duration-200"
                    style={{
                      backgroundColor: 'transparent',
                      color: effectiveTemplate.colors.text.primary,
                      borderRadius: effectiveTemplate.components.buttons.style === 'pill' ? '9999px' : 
                                  effectiveTemplate.components.buttons.style === 'sharp' ? '0' : 
                                  effectiveTemplate.components.buttons.style === 'cut-corners' ? '0 8px 0 8px' :
                                  effectiveTemplate.borders.radius.base,
                      borderWidth: effectiveTemplate.borders.width.base,
                      borderStyle: effectiveTemplate.borders.style,
                      borderColor: effectiveTemplate.colors.primary
                    }}
                  >
                    Secondary
                  </button>
                </div>
                
                {/* Input Preview */}
                <input 
                  placeholder="Search components..."
                  className="w-full px-3 py-2 transition-all duration-200"
                  style={{
                    backgroundColor: effectiveTemplate.components.inputs.style === 'filled' ? 
                      effectiveTemplate.colors.background.tertiary : 'transparent',
                    color: effectiveTemplate.colors.text.primary,
                    borderRadius: effectiveTemplate.borders.radius.base,
                    borderWidth: effectiveTemplate.components.inputs.style === 'underlined' ? '0 0 2px 0' :
                                effectiveTemplate.components.inputs.style === 'filled' ? '0' :
                                effectiveTemplate.borders.width.base,
                    borderStyle: effectiveTemplate.borders.style,
                    borderColor: effectiveTemplate.colors.text.secondary + '40'
                  }}
                />
                
                {/* Card Preview */}
                <div 
                  className="p-4 transition-all duration-200"
                  style={{
                    backgroundColor: currentTemplate.components.cards.style === 'filled' ? 
                      currentTemplate.colors.background.tertiary : 
                      currentTemplate.components.cards.style === 'flat' ? 'transparent' :
                      currentTemplate.colors.background.primary,
                    borderRadius: currentTemplate.components.cards.corners === 'super-rounded' ? '24px' :
                                currentTemplate.components.cards.corners === 'sharp' ? '0' :
                                currentTemplate.borders.radius.lg,
                    borderWidth: currentTemplate.components.cards.style === 'outlined' ? 
                      currentTemplate.borders.width.base : '0',
                    borderStyle: currentTemplate.borders.style,
                    borderColor: currentTemplate.colors.text.secondary + '20',
                    boxShadow: currentTemplate.components.cards.style === 'elevated' ? 
                      '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                  }}
                >
                  <h3 
                    className="font-semibold mb-2"
                    style={{
                      fontSize: currentTemplate.typography.scale.lg,
                      color: currentTemplate.colors.text.primary
                    }}
                  >
                    Component Card
                  </h3>
                  <p 
                    style={{
                      fontSize: currentTemplate.typography.scale.sm,
                      color: currentTemplate.colors.text.secondary
                    }}
                  >
                    This card demonstrates the {currentTemplate.name} theme styling.
                  </p>
                </div>
                
                {/* Badge Preview */}
                <div className="flex gap-2 flex-wrap">
                  <span 
                    className="px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: currentTemplate.colors.primary + '20',
                      color: currentTemplate.colors.primary,
                      borderRadius: currentTemplate.borders.radius.sm
                    }}
                  >
                    {currentTemplate.category}
                  </span>
                  <span 
                    className="px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: currentTemplate.colors.success + '20',
                      color: currentTemplate.colors.success,
                      borderRadius: currentTemplate.borders.radius.sm
                    }}
                  >
                    Active
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Template Details */}
          <Card>
            <CardTitle className="mb-4">Template Details</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Typography</h4>
                <div className="space-y-1 text-xs text-gray-400">
                  <div>Primary: {effectiveTemplate.typography.primaryFont.family}</div>
                  <div>Heading: {effectiveTemplate.typography.headingFont.family}</div>
                  <div>Code: {effectiveTemplate.typography.codeFont.family}</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Spacing</h4>
                <div className="space-y-1 text-xs text-gray-400">
                  <div>Scale: {effectiveTemplate.spacing.scale}</div>
                  <div>Base Unit: {effectiveTemplate.spacing.baseUnit}x</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Effects</h4>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(effectiveTemplate.effects)
                    .filter(([_, enabled]) => enabled)
                    .map(([effect]) => (
                      <Badge key={effect} size="xs" variant="outline">
                        {effect}
                      </Badge>
                    ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Components</h4>
                <div className="space-y-1 text-xs text-gray-400">
                  <div>Buttons: {effectiveTemplate.components.buttons.style}</div>
                  <div>Inputs: {effectiveTemplate.components.inputs.style}</div>
                  <div>Cards: {effectiveTemplate.components.cards.style}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}