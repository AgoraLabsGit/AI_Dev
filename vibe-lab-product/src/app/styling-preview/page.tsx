'use client';

import { Button, Card, CardTitle } from '@/lib/design-system';
import { ArrowRight, Palette } from 'lucide-react';

export default function StylingPreview() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎨 Vibe Lab Styling Workspace
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Professional theme customization for your projects
          </p>
        </div>

        <Card variant="gradient" className="text-center p-12">
          <Palette className="w-16 h-16 text-purple-400 mx-auto mb-6" />
          <CardTitle className="text-2xl mb-4">
            Ready to customize your project's style?
          </CardTitle>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Choose from 8 professional templates including AI Tech Forward, Minimal Monochrome, 
            Neo Brutalist, Glass Morphism, and more. Each template includes complete color palettes, 
            typography settings, and live preview.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="glow" 
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={() => window.location.href = '/project/proj_001/design/styling'}
            >
              Open Styling Workspace
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => window.location.href = '/design-system'}
            >
              View Design System
            </Button>
          </div>
        </Card>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardTitle className="mb-3">8 Professional Templates</CardTitle>
            <p className="text-gray-400 text-sm">
              From AI Tech Forward to Corporate Professional - each with unique aesthetics
            </p>
          </Card>
          
          <Card>
            <CardTitle className="mb-3">Live Preview</CardTitle>
            <p className="text-gray-400 text-sm">
              See your changes instantly across desktop, tablet, and mobile devices
            </p>
          </Card>
          
          <Card>
            <CardTitle className="mb-3">Export Ready</CardTitle>
            <p className="text-gray-400 text-sm">
              Generate production-ready CSS and design tokens for your team
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}