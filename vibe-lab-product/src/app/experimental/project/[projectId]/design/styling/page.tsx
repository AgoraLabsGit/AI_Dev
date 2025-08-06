import { 
  Palette, 
  Droplets, 
  Type, 
  Square,
  CheckCircle,
  Settings,
  Upload,
  Download,
  RefreshCw,
  Eye,
  Copy
} from 'lucide-react';

interface ProjectStylingProps {
  params: Promise<{
    projectId: string;
  }>;
}

// Mock theme configuration data
const themeConfig = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      900: '#1e3a8a'
    },
    secondary: {
      50: '#f8fafc',
      500: '#64748b',
      900: '#0f172a'
    },
    accent: {
      50: '#fdf4ff',
      500: '#a855f7',
      900: '#581c87'
    }
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px'
  }
};

export default async function ProjectStyling({ params }: ProjectStylingProps) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      {/* Styling Header */}
      <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Palette className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Theme & Styling</h1>
              <p className="text-gray-400">AVCA Stage 2: Design system configuration</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Complete</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-[#0F0F11] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Styling Progress</span>
            <span className="text-sm text-gray-400">100% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Droplets className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Color Palette</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(themeConfig.colors).map(([colorName, shades]) => (
            <div key={colorName} className="space-y-3">
              <h3 className="text-sm font-medium text-white capitalize">{colorName}</h3>
              <div className="space-y-2">
                {Object.entries(shades).map(([shade, value]) => (
                  <div key={shade} className="flex items-center justify-between p-2 bg-[#0F0F11] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded border border-gray-600"
                        style={{ backgroundColor: value }}
                      />
                      <div>
                        <span className="text-sm text-white">{colorName}-{shade}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400">{value}</span>
                      <button className="p-1 hover:bg-gray-700 rounded">
                        <Copy className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Type className="w-5 h-5 text-green-400" />
          <h2 className="text-lg font-semibold text-white">Typography</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Font Families */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Font Families</h3>
            <div className="space-y-3">
              {Object.entries(themeConfig.typography.fontFamily).map(([name, fonts]) => (
                <div key={name} className="p-3 bg-[#0F0F11] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white capitalize">{name}</span>
                    <button className="p-1 hover:bg-gray-700 rounded">
                      <Copy className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 font-mono">{fonts.join(', ')}</p>
                  <div className={`mt-2 text-lg ${name === 'mono' ? 'font-mono' : 'font-sans'}`}>
                    Sample Text Aa Bb Cc 123
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Font Sizes */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Font Sizes</h3>
            <div className="space-y-2">
              {Object.entries(themeConfig.typography.fontSize).map(([size, value]) => (
                <div key={size} className="flex items-center justify-between p-2 bg-[#0F0F11] rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white">{size}</span>
                    <span className="text-xs font-mono text-gray-400">{value}</span>
                  </div>
                  <div style={{ fontSize: value }} className="text-white">
                    Sample
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Spacing & Layout */}
      <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Square className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Spacing & Layout</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spacing */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Spacing Scale</h3>
            <div className="space-y-2">
              {Object.entries(themeConfig.spacing).map(([name, value]) => (
                <div key={name} className="flex items-center justify-between p-2 bg-[#0F0F11] rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white">{name}</span>
                    <span className="text-xs font-mono text-gray-400">{value}</span>
                  </div>
                  <div 
                    className="bg-purple-400 h-4"
                    style={{ width: value }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Border Radius</h3>
            <div className="space-y-2">
              {Object.entries(themeConfig.borderRadius).map(([name, value]) => (
                <div key={name} className="flex items-center justify-between p-2 bg-[#0F0F11] rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white">{name}</span>
                    <span className="text-xs font-mono text-gray-400">{value}</span>
                  </div>
                  <div 
                    className="w-8 h-8 bg-purple-400"
                    style={{ borderRadius: value }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Theme Actions */}
      <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-white">Theme Management</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#2A2A2E] hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors">
            <Upload className="w-6 h-6 text-blue-400" />
            <span className="text-sm font-medium text-white">Import Theme</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#2A2A2E] hover:border-green-500/50 hover:bg-green-500/5 transition-colors">
            <Download className="w-6 h-6 text-green-400" />
            <span className="text-sm font-medium text-white">Export Theme</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#2A2A2E] hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors">
            <RefreshCw className="w-6 h-6 text-purple-400" />
            <span className="text-sm font-medium text-white">Reset Theme</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#2A2A2E] hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-colors">
            <Eye className="w-6 h-6 text-yellow-400" />
            <span className="text-sm font-medium text-white">Preview</span>
          </button>
        </div>
      </div>
    </div>
  );
}