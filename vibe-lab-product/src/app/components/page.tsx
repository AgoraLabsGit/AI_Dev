/**
 * Component Gallery Page (Final Professional Version)
 * 
 * Showcases a rich gallery of components styled with a professional, custom-built
 * theme provider that correctly maps themes to Shadcn component variables.
 */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { ComponentService } from '@/lib/avca/services/ComponentService';
import { themes, Theme } from '@/lib/theme-provider';
import { ComponentMetadata } from '@/lib/avca/pipeline/component-pipeline/types';
import { Palette, Sparkles, SlidersHorizontal, Check, X } from 'lucide-react';

// Import all the base components
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


// --- Main Component ---
export default function ComponentGalleryPage() {
  const [components, setComponents] = useState<ComponentMetadata[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [progress, setProgress] = useState(60);

  const componentService = useMemo(() => new ComponentService(), []);

  useEffect(() => {
    async function fetchData() {
      try {
        const componentData = await componentService.getComponents();
        setComponents(componentData);
      } catch (error) {
        console.error("Failed to fetch component data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [componentService]);

  useEffect(() => {
    if (selectedTheme) {
      const root = document.documentElement;
      Object.entries(selectedTheme.variables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, [selectedTheme]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <Sparkles className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-4 text-lg font-semibold">Loading Gallery...</span>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen p-4 sm:p-6 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tighter">Component Gallery</h1>
          <p className="text-lg text-muted-foreground mt-2">An interactive showcase of our new component library.</p>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center"><Palette className="mr-3 text-primary"/>Styling Templates</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-secondary scrollbar-track-muted">
            {themes.map((theme) => (
              <Button 
                key={theme.name} 
                variant={selectedTheme.name === theme.name ? 'default' : 'outline'}
                onClick={() => setSelectedTheme(theme)}
                className="flex-shrink-0 capitalize"
              >
                {theme.name}
              </Button>
            ))}
          </div>
        </section>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Column 1 */}
          <div className="col-span-1 lg:col-span-1 space-y-8">
            <Card className="bg-primary text-primary-foreground">
              <CardHeader>
                <CardDescription>March 25th</CardDescription>
                <CardTitle>Customize every button and chip instance primary color</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                   <Avatar>
                     <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                     <AvatarFallback>LS</AvatarFallback>
                   </Avatar>
                   <span className="text-sm">Assigned to Lucas Smith</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start space-y-2">
                 <Progress value={progress} className="w-full" />
                 <span className="text-sm self-end">{progress}%</span>
              </CardFooter>
            </Card>
            <Card>
               <CardContent className="p-0 flex justify-center">
                 <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />
               </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="Angela Erickson" />
                    <AvatarFallback>AE</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>Angela Erickson</CardTitle>
                    <CardDescription>Incredible discoveries</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Column 2 */}
          <div className="col-span-1 lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Install one of our production-ready libraries</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  <li>Material UI</li>
                  <li>MUI Base</li>
                  <li>Joy UI</li>
                </ul>
              </CardContent>
            </Card>
            <Tabs defaultValue="joy-ui" className="w-full">
              <TabsList>
                <TabsTrigger value="joy-ui">Joy UI</TabsTrigger>
                <TabsTrigger value="material-ui">Material UI</TabsTrigger>
                <TabsTrigger value="mui-base">MUI Base</TabsTrigger>
              </TabsList>
            </Tabs>
            <Card>
              <CardContent className="p-6">
                <Slider defaultValue={[25, 50]} max={100} step={1} />
              </CardContent>
            </Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Assets & illustrations</TableCell>
                  <TableCell className="text-right">21 MB</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Components</TableCell>
                  <TableCell className="text-right text-primary">11.0 KB</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </div>
  );
}
