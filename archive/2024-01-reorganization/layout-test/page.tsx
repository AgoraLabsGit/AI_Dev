'use client';

import React from 'react';
import { 
  Container, 
  Stack, 
  Grid, 
  Flex,
  PageLayout,
  SidebarLayout,
  HeaderContentFooter,
  CardGrid,
  Card,
  CardTitle,
  CardDescription,
  Button
} from '@/lib/design-system';

export default function LayoutTest() {
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <Container size="xl" className="space-y-8">
        
        {/* Header */}
        <Card variant="gradient">
          <CardTitle className="text-center">
            🏗️ Layout Components Test Suite
          </CardTitle>
          <CardDescription className="text-center">
            Testing Container, Stack, Grid, Flex and layout patterns
          </CardDescription>
        </Card>

        {/* Container Test */}
        <Card>
          <CardTitle className="mb-4">Container Component</CardTitle>
          <div className="space-y-4">
            <div className="text-sm text-gray-400 mb-2">Different container sizes:</div>
            <Container size="sm" className="bg-blue-900/20 p-4 rounded">
              <div className="text-center text-blue-300">Small Container (max-w-sm)</div>
            </Container>
            <Container size="default" className="bg-green-900/20 p-4 rounded">
              <div className="text-center text-green-300">Default Container (max-w-4xl)</div>
            </Container>
            <Container size="lg" className="bg-purple-900/20 p-4 rounded">
              <div className="text-center text-purple-300">Large Container (max-w-6xl)</div>
            </Container>
          </div>
        </Card>

        {/* Stack Test */}
        <Card>
          <CardTitle className="mb-4">Stack Component</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-2">Vertical Stack (gap: md):</div>
              <Stack direction="vertical" gap="md" className="bg-gray-800/50 p-4 rounded">
                <div className="bg-red-900/30 p-2 rounded text-red-300">Item 1</div>
                <div className="bg-red-900/30 p-2 rounded text-red-300">Item 2</div>
                <div className="bg-red-900/30 p-2 rounded text-red-300">Item 3</div>
              </Stack>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">Horizontal Stack (gap: lg):</div>
              <Stack direction="horizontal" gap="lg" className="bg-gray-800/50 p-4 rounded">
                <div className="bg-yellow-900/30 p-2 rounded text-yellow-300">A</div>
                <div className="bg-yellow-900/30 p-2 rounded text-yellow-300">B</div>
                <div className="bg-yellow-900/30 p-2 rounded text-yellow-300">C</div>
              </Stack>
            </div>
          </div>
        </Card>

        {/* Grid Test */}
        <Card>
          <CardTitle className="mb-4">Grid Component</CardTitle>
          <div className="space-y-6">
            <div>
              <div className="text-sm text-gray-400 mb-2">3-Column Grid:</div>
              <Grid cols={3} gap="md" className="bg-gray-800/50 p-4 rounded">
                <div className="bg-cyan-900/30 p-4 rounded text-cyan-300 text-center">Grid 1</div>
                <div className="bg-cyan-900/30 p-4 rounded text-cyan-300 text-center">Grid 2</div>
                <div className="bg-cyan-900/30 p-4 rounded text-cyan-300 text-center">Grid 3</div>
                <div className="bg-cyan-900/30 p-4 rounded text-cyan-300 text-center">Grid 4</div>
                <div className="bg-cyan-900/30 p-4 rounded text-cyan-300 text-center">Grid 5</div>
                <div className="bg-cyan-900/30 p-4 rounded text-cyan-300 text-center">Grid 6</div>
              </Grid>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">Auto-fit Grid (responsive):</div>
              <Grid cols="auto" gap="sm" className="bg-gray-800/50 p-4 rounded">
                <div className="bg-pink-900/30 p-3 rounded text-pink-300 text-center">Auto 1</div>
                <div className="bg-pink-900/30 p-3 rounded text-pink-300 text-center">Auto 2</div>
                <div className="bg-pink-900/30 p-3 rounded text-pink-300 text-center">Auto 3</div>
                <div className="bg-pink-900/30 p-3 rounded text-pink-300 text-center">Auto 4</div>
              </Grid>
            </div>
          </div>
        </Card>

        {/* Flex Test */}
        <Card>
          <CardTitle className="mb-4">Flex Component</CardTitle>
          <div className="space-y-6">
            <div>
              <div className="text-sm text-gray-400 mb-2">Flex Row (justify: between):</div>
              <Flex justify="between" align="center" className="bg-gray-800/50 p-4 rounded">
                <div className="bg-indigo-900/30 p-2 rounded text-indigo-300">Left</div>
                <div className="bg-indigo-900/30 p-2 rounded text-indigo-300">Center</div>
                <div className="bg-indigo-900/30 p-2 rounded text-indigo-300">Right</div>
              </Flex>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">Flex Column (align: center):</div>
              <Flex direction="col" align="center" gap="sm" className="bg-gray-800/50 p-4 rounded">
                <div className="bg-orange-900/30 p-2 rounded text-orange-300">Top</div>
                <div className="bg-orange-900/30 p-2 rounded text-orange-300">Middle</div>
                <div className="bg-orange-900/30 p-2 rounded text-orange-300">Bottom</div>
              </Flex>
            </div>
          </div>
        </Card>

        {/* Layout Patterns Test */}
        <Card>
          <CardTitle className="mb-4">Layout Patterns</CardTitle>
          <div className="space-y-6">
            
            {/* Sidebar Layout Pattern */}
            <div>
              <div className="text-sm text-gray-400 mb-2">Sidebar Layout Pattern:</div>
              <div className="bg-gray-800/50 p-4 rounded h-32">
                <SidebarLayout
                  sidebarWidth="sm"
                  gap="md"
                  sidebar={
                    <div className="bg-emerald-900/30 p-3 rounded text-emerald-300 h-full">
                      Sidebar Content
                    </div>
                  }
                >
                  <div className="bg-teal-900/30 p-3 rounded text-teal-300 h-full">
                    Main Content Area
                  </div>
                </SidebarLayout>
              </div>
            </div>

            {/* Header-Content-Footer Pattern */}
            <div>
              <div className="text-sm text-gray-400 mb-2">Header-Content-Footer Pattern:</div>
              <div className="bg-gray-800/50 p-4 rounded h-32">
                <HeaderContentFooter
                  header={
                    <div className="bg-violet-900/30 p-2 rounded text-violet-300 text-center">
                      Header Section
                    </div>
                  }
                  footer={
                    <div className="bg-rose-900/30 p-2 rounded text-rose-300 text-center">
                      Footer Section
                    </div>
                  }
                >
                  <div className="bg-sky-900/30 p-3 rounded text-sky-300 h-full flex items-center justify-center">
                    Content Area
                  </div>
                </HeaderContentFooter>
              </div>
            </div>

            {/* Card Grid Pattern */}
            <div>
              <div className="text-sm text-gray-400 mb-2">Card Grid Pattern:</div>
              <CardGrid minCardWidth={200} gap="md">
                {Array.from({ length: 6 }, (_, i) => (
                  <Card key={i} variant="outline">
                    <CardTitle>Card {i + 1}</CardTitle>
                    <CardDescription>
                      This is a responsive card in the grid layout.
                    </CardDescription>
                    <Button variant="outline" size="sm">
                      Action
                    </Button>
                  </Card>
                ))}
              </CardGrid>
            </div>
          </div>
        </Card>

        {/* Test Results */}
        <Card variant="outline">
          <CardTitle className="mb-4">Layout Component Status</CardTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl text-green-400">✅</div>
              <div className="text-sm text-gray-400">Container</div>
              <div className="text-xs text-gray-500">Responsive sizes</div>
            </div>
            <div>
              <div className="text-2xl text-green-400">✅</div>
              <div className="text-sm text-gray-400">Stack</div>
              <div className="text-xs text-gray-500">V/H directions</div>
            </div>
            <div>
              <div className="text-2xl text-green-400">✅</div>
              <div className="text-sm text-gray-400">Grid</div>
              <div className="text-xs text-gray-500">Auto-responsive</div>
            </div>
            <div>
              <div className="text-2xl text-green-400">✅</div>
              <div className="text-sm text-gray-400">Flex</div>
              <div className="text-xs text-gray-500">Full flex API</div>
            </div>
          </div>
        </Card>

      </Container>
    </div>
  );
}