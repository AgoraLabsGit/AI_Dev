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
  Sparkles, 
  Zap, 
  Mail, 
  Lock, 
  Search,
  Moon,
  Sun,
  ArrowRight,
  ChevronRight,
  Check,
  AlertCircle,
  Bot,
  Palette,
  Code,
  Layers
} from 'lucide-react';

export default function DesignSystemShowcase() {
  const { theme, themeName, toggleTheme } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Design System Showcase
            </h1>
            <p className="text-gray-400">
              AI/Tech Forward + Modern Minimal components
            </p>
          </div>
          
          <Button
            variant="secondary"
            size="lg"
            onClick={toggleTheme}
            leftIcon={themeName === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          >
            {themeName === 'dark' ? 'Light' : 'Dark'} Mode
          </Button>
        </div>

        {/* Color Palette */}
        <Card variant="gradient">
          <CardTitle className="flex items-center gap-2 mb-6">
            <Palette className="w-5 h-5 text-purple-400" />
            Color Palette
          </CardTitle>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600" />
              <p className="text-sm text-gray-300">Primary Gradient</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20" />
              <p className="text-sm text-gray-300">Subtle Gradient</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-emerald-500" />
              <p className="text-sm text-gray-300">Success</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-amber-500" />
              <p className="text-sm text-gray-300">Warning</p>
            </div>
          </div>
        </Card>

        {/* Buttons */}
        <Card>
          <CardTitle className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-indigo-400" />
            Buttons
          </CardTitle>
          
          <div className="space-y-6">
            {/* Button Variants */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="glow">AI Glow</Button>
              </div>
            </div>

            {/* Button Sizes */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Sizes</h3>
              <div className="flex items-center gap-3">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>

            {/* Button with Icons */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">With Icons</h3>
              <div className="flex flex-wrap gap-3">
                <Button leftIcon={<Sparkles className="w-4 h-4" />}>
                  Generate AI
                </Button>
                <Button variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Continue
                </Button>
                <Button variant="outline" leftIcon={<Bot className="w-4 h-4" />} rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Open Assistant
                </Button>
                <Button size="icon" variant="ghost">
                  <Code className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Button States */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">States</h3>
              <div className="flex flex-wrap gap-3">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button variant="glow" fullWidth>Full Width Button</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Inputs */}
        <Card variant="elevated">
          <CardTitle className="flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-indigo-400" />
            Input Fields
          </CardTitle>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Inputs */}
            <Input
              label="Username"
              placeholder="Enter your username"
              helper="Choose a unique username"
            />
            
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              leftIcon={<Lock className="w-4 h-4" />}
              variant="filled"
            />
            
            <Input
              label="Search"
              placeholder="Search components..."
              rightIcon={<Search className="w-4 h-4" />}
              variant="glow"
            />
            
            <Input
              label="Error State"
              placeholder="Invalid input"
              error
              errorMessage="This field is required"
              leftIcon={<AlertCircle className="w-4 h-4" />}
            />
            
            <Input
              label="Ghost Input"
              placeholder="Minimal style"
              variant="ghost"
              helper="Perfect for inline editing"
            />
          </div>
        </Card>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardTitle>Default Card</CardTitle>
            <CardDescription>
              Basic card with subtle background and border
            </CardDescription>
            <div className="mt-4">
              <Badge>Default Style</Badge>
            </div>
          </Card>
          
          <Card variant="elevated">
            <CardTitle>Elevated Card</CardTitle>
            <CardDescription>
              Card with shadow for elevated appearance
            </CardDescription>
            <div className="mt-4">
              <Badge variant="primary">Enhanced</Badge>
            </div>
          </Card>
          
          <Card variant="glow">
            <CardTitle>AI Glow Card</CardTitle>
            <CardDescription>
              Card with subtle AI-inspired glow effect
            </CardDescription>
            <div className="mt-4">
              <AnimatedBadge variant="glow" pulse>Active</AnimatedBadge>
            </div>
          </Card>
          
          <Card 
            variant="outline" 
            interactive
            header={<CardTitle>Interactive Card</CardTitle>}
            footer={
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Click me!</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            }
          >
            <CardDescription>
              This card responds to hover and click interactions
            </CardDescription>
          </Card>
          
          <Card variant="gradient" className="md:col-span-2">
            <CardTitle>Gradient Card</CardTitle>
            <CardDescription>
              Premium card style with gradient background
            </CardDescription>
            <div className="mt-4 flex gap-2">
              <Badge variant="gradient">AI Powered</Badge>
              <Badge variant="purple">Advanced</Badge>
            </div>
          </Card>
        </div>

        {/* Badges */}
        <Card variant="outline">
          <CardTitle className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Badges
          </CardTitle>
          
          <div className="space-y-4">
            {/* Badge Variants */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Variants</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="purple">Purple</Badge>
                <Badge variant="gradient">Gradient</Badge>
                <Badge variant="glow">Glow</Badge>
              </div>
            </div>

            {/* Badge Sizes */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Sizes</h3>
              <div className="flex items-center gap-2">
                <Badge size="xs">Extra Small</Badge>
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
                <Badge size="lg">Large</Badge>
              </div>
            </div>

            {/* Badges with Features */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Features</h3>
              <div className="flex flex-wrap gap-3">
                <Badge dot variant="success">Active</Badge>
                <Badge leftIcon={<Bot className="w-3 h-3" />} variant="primary">
                  AI Agent
                </Badge>
                <Badge rightIcon={<Check className="w-3 h-3" />} variant="success">
                  Verified
                </Badge>
                <AnimatedBadge pulse variant="danger">
                  Live
                </AnimatedBadge>
                <Badge interactive variant="purple">
                  Clickable
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Typography */}
        <Card>
          <CardTitle className="mb-6">Typography</CardTitle>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-white">Heading 1</h1>
            <h2 className="text-4xl font-semibold text-white">Heading 2</h2>
            <h3 className="text-2xl font-semibold text-white">Heading 3</h3>
            <h4 className="text-xl font-medium text-white">Heading 4</h4>
            <p className="text-base text-gray-300">
              Body text with regular weight. The quick brown fox jumps over the lazy dog.
            </p>
            <p className="text-sm text-gray-400">
              Small text for descriptions and helper content.
            </p>
            <p className="text-xs text-gray-500">
              Extra small text for fine print and metadata.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}