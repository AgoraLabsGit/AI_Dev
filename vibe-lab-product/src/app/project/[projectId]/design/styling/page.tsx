'use client';

import { useState } from 'react';
import { 
  Button, 
  Input, 
  Card, 
  CardTitle, 
  CardDescription,
  Badge,
  AnimatedBadge,
  useTheme
} from '@/lib/design-system';
import { 
  Palette,
  Sparkles,
  Moon,
  Sun,
  Copy,
  Check,
  ChevronRight,
  Download,
  Upload,
  Wand2,
  Layers,
  Type,
  Box,
  Zap,
  Grid3x3,
  Eye,
  Code,
  Smartphone,
  Monitor,
  Tablet,
  Flame,
  Leaf,
  Star,
  Cpu,
  Sliders
} from 'lucide-react';
import { themeTemplates, type ThemeTemplate } from '@/lib/design-system/templates';

interface ProjectStylingProps {
  params: {
    projectId: string;
  };
}

export default function ProjectStyling({ params }: ProjectStylingProps) {
  const { projectId } = params;
  const { theme, themeName, toggleTheme } = useTheme();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('ai-tech-forward');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const currentTemplate = themeTemplates.find(t => t.id === selectedTemplate) || themeTemplates[0];
  
  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedColor(label);
    setTimeout(() => setCopiedColor(null), 2000);
  };
  
  const getDeviceClasses = () => {
    switch (previewDevice) {
      case 'mobile': return 'max-w-sm mx-auto';
      case 'tablet': return 'max-w-2xl mx-auto';
      default: return 'w-full';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="gradient">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Palette className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Styling & Theme</h1>
              <p className="text-gray-400">Customize your project's visual identity</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => window.location.href = `/project/${projectId}/design/styling/advanced`}
              leftIcon={<Sliders className="w-4 h-4" />}
            >
              Advanced
            </Button>
            <Button
              variant="secondary"
              onClick={toggleTheme}
              leftIcon={themeName === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            >
              {themeName === 'dark' ? 'Light' : 'Dark'} Mode
            </Button>
            <Button variant="primary" leftIcon={<Download className="w-4 h-4" />}>
              Export Theme
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Template Selection */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardTitle className="flex items-center gap-2 mb-4">
              <Wand2 className="w-5 h-5 text-indigo-400" />
              Quick Actions
            </CardTitle>
            
            <div className="space-y-3">
              <Button variant="outline" fullWidth leftIcon={<Sparkles className="w-4 h-4" />}>
                Generate AI Theme
              </Button>
              <Button variant="ghost" fullWidth leftIcon={<Upload className="w-4 h-4" />}>
                Import Theme
              </Button>
            </div>
          </Card>

          {/* Style Templates */}
          <Card>
            <CardTitle className="mb-4">Style Templates</CardTitle>
            
            <div className="space-y-2">
              {themeTemplates.map((template) => {
                const getCategoryIcon = (category: string) => {
                  switch (category) {
                    case 'tech': return <Cpu className="w-3 h-3" />;
                    case 'bold': return <Flame className="w-3 h-3" />;
                    case 'corporate': return <Leaf className="w-3 h-3" />;
                    case 'elegant': return <Star className="w-3 h-3" />;
                    default: return <Sparkles className="w-3 h-3" />;
                  }
                };
                
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`w-full p-3 rounded-lg border transition-all duration-200 ${
                      selectedTemplate === template.id
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : 'border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-1 mt-1">
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
                        <div className="text-gray-500">
                          {getCategoryIcon(template.category)}
                        </div>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{template.name}</span>
                          {template.popular && (
                            <Badge size="xs" variant="primary">Popular</Badge>
                          )}
                          {template.new && (
                            <Badge size="xs" variant="success">New</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{template.description}</p>
                        <p className="text-xs text-gray-500 mt-1 capitalize">{template.category}</p>
                      </div>
                      {selectedTemplate === template.id && (
                        <Check className="w-4 h-4 text-purple-400 mt-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Typography Settings */}
          <Card>
            <CardTitle className="flex items-center gap-2 mb-4">
              <Type className="w-5 h-5 text-indigo-400" />
              Typography
            </CardTitle>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Primary Font
                </label>
                <select className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white">
                  <option>Inter</option>
                  <option>Roboto</option>
                  <option>Open Sans</option>
                  <option>Poppins</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Code Font
                </label>
                <select className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white">
                  <option>JetBrains Mono</option>
                  <option>Fira Code</option>
                  <option>Source Code Pro</option>
                  <option>Monaco</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel - Preview and Customization */}
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
            <div className={`p-6 bg-gray-900/50 rounded-lg border border-gray-800/50 ${getDeviceClasses()}`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Dashboard</h3>
                  <Badge variant="gradient">Live</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="primary" 
                    style={{ background: currentTemplate.gradients.primary }}
                  >
                    Primary Action
                  </Button>
                  <Button 
                    variant="secondary"
                    style={{ background: currentTemplate.gradients.secondary }}
                  >
                    Secondary
                  </Button>
                </div>
                
                <Input 
                  placeholder="Search components..."
                  leftIcon={<Sparkles className="w-4 h-4" />}
                  variant="glow"
                />
                
                <div className="grid grid-cols-3 gap-3">
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-white">156</div>
                    <div className="text-xs text-gray-400">Components</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">94%</div>
                    <div className="text-xs text-gray-400">Quality</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">2.5s</div>
                    <div className="text-xs text-gray-400">Build Time</div>
                  </Card>
                </div>
              </div>
            </div>
          </Card>

          {/* Color Customization */}
          <Card>
            <CardTitle className="flex items-center gap-2 mb-6">
              <Layers className="w-5 h-5 text-indigo-400" />
              Color Palette
            </CardTitle>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Primary Colors */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Primary</label>
                <div className="relative group">
                  <div 
                    className="h-24 rounded-lg cursor-pointer" 
                    style={{ background: currentTemplate.gradients.primary }}
                  />
                  <button
                    onClick={() => copyToClipboard(currentTemplate.colors.primary, 'Primary')}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedColor === 'Primary' ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Copy className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">{currentTemplate.colors.primary}</p>
              </div>
              
              {/* Secondary Colors */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Secondary</label>
                <div className="relative group">
                  <div 
                    className="h-24 rounded-lg cursor-pointer" 
                    style={{ background: currentTemplate.gradients.secondary }}
                  />
                  <button
                    onClick={() => copyToClipboard(currentTemplate.colors.secondary, 'Secondary')}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedColor === 'Secondary' ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Copy className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">{currentTemplate.colors.secondary}</p>
              </div>
              
              {/* Accent Colors */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Accent</label>
                <div className="relative group">
                  <div 
                    className="h-24 rounded-lg cursor-pointer" 
                    style={{ background: currentTemplate.gradients.accent }}
                  />
                  <button
                    onClick={() => copyToClipboard(currentTemplate.colors.accent, 'Accent')}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedColor === 'Accent' ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Copy className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">{currentTemplate.colors.accent}</p>
              </div>
              
              {/* Semantic Colors */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Success</label>
                <div className="relative group">
                  <div 
                    className="h-24 rounded-lg cursor-pointer" 
                    style={{ backgroundColor: currentTemplate.colors.success }}
                  />
                  <button
                    onClick={() => copyToClipboard(currentTemplate.colors.success, 'Success')}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedColor === 'Success' ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Copy className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">{currentTemplate.colors.success}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Warning</label>
                <div className="relative group">
                  <div 
                    className="h-24 rounded-lg cursor-pointer" 
                    style={{ backgroundColor: currentTemplate.colors.warning }}
                  />
                  <button
                    onClick={() => copyToClipboard(currentTemplate.colors.warning, 'Warning')}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedColor === 'Warning' ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Copy className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">{currentTemplate.colors.warning}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Error</label>
                <div className="relative group">
                  <div 
                    className="h-24 rounded-lg cursor-pointer" 
                    style={{ backgroundColor: currentTemplate.colors.error }}
                  />
                  <button
                    onClick={() => copyToClipboard(currentTemplate.colors.error, 'Error')}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedColor === 'Error' ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Copy className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">{currentTemplate.colors.error}</p>
              </div>
            </div>
          </Card>

          {/* Advanced Settings */}
          <Card variant="outline">
            <CardTitle className="flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-indigo-400" />
              Advanced Settings
            </CardTitle>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Border Radius
                </label>
                <select className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white">
                  <option>Rounded (Default)</option>
                  <option>Sharp</option>
                  <option>Extra Rounded</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Shadow Style
                </label>
                <select className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white">
                  <option>Subtle</option>
                  <option>Elevated</option>
                  <option>None</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Animation Speed
                </label>
                <select className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white">
                  <option>Normal</option>
                  <option>Fast</option>
                  <option>Slow</option>
                  <option>None</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Spacing Scale
                </label>
                <select className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white">
                  <option>Default</option>
                  <option>Compact</option>
                  <option>Comfortable</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}