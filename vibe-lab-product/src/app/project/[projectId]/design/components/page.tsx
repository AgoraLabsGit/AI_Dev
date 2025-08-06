import { ComponentCatalogService } from '@/lib/avca/services/component-catalog-service';
import { 
  LayoutGrid, 
  MousePointerClick,
  Table2,
  Bell,
  Search,
  Filter,
  Code,
  Eye,
  Copy,
  ArrowUpDown,
  Layers,
  Settings,
  Sparkles
} from 'lucide-react';
import { UIPattern } from '@/lib/avca/pipeline/component-pipeline/types';

// Initialize the catalog service
const catalogService = new ComponentCatalogService({
  cdnUrl: process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.vibelab.com/components'
});

async function getComponentData() {
  await catalogService.start();
  
  // Get components by category with recommendations
  const categories = [
    { id: 'INTERACTIVE', type: 'dashboard' as const },
    { id: 'LAYOUT', type: 'navigation' as const },
    { id: 'DATA_DISPLAY', type: 'table' as const },
    { id: 'FEEDBACK', type: 'modal' as const }
  ];

  const componentData = await Promise.all(
    categories.map(async (category) => {
      // Get recommendations based on patterns
      const { recommendations } = await catalogService.getRecommendations({
        blueprintAnalysis: {
          patterns: [{
            type: category.type,
            confidence: 90,
            keywords: [category.id.toLowerCase()],
            description: `${category.id} components`
          }],
          requirements: []
        }
      });

      return {
        id: category.id,
        name: category.id.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' '),
        icon: category.id === 'INTERACTIVE' ? MousePointerClick :
              category.id === 'LAYOUT' ? LayoutGrid :
              category.id === 'DATA_DISPLAY' ? Table2 : Bell,
        components: recommendations
      };
    })
  );

  // Get all available templates
  const templates = await catalogService.getTemplates();
  
  await catalogService.stop();

  return {
    categories: componentData,
    templates
  };
}

export default async function ComponentLibraryPage() {
  const data = await getComponentData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Component Library</h1>
              <p className="mt-2 text-muted-foreground">
                Browse and customize components with our template system
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search components..."
                  className="bg-transparent text-sm focus:outline-none"
                />
              </div>

              <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm">
                <Filter className="h-4 w-4" />
                Filter
              </button>

              <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm">
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Templates Section */}
        <section>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Style Templates</h2>
              <p className="text-muted-foreground">
                Choose from our collection of professionally designed templates
              </p>
            </div>

            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <Settings className="h-4 w-4" />
              Customize Templates
            </button>
          </div>
          
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.templates.map((template) => (
              <div 
                key={template.id}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 hover:shadow-lg transition-shadow"
              >
                {/* Preview Image */}
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-transparent">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  
                  {/* Color Palette Preview */}
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {template.colorPalette.primary.slice(0, 3).map((color, i) => (
                      <div
                        key={i}
                        className="h-6 w-6 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Template Info */}
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{template.name}</h3>
                    <span className="text-xs text-muted-foreground">{template.category}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2">
                  <button className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                    <Eye className="h-3 w-3" />
                    Preview
                  </button>
                  <button className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                    <Code className="h-3 w-3" />
                    Code
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Component Categories */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Components</h2>
              <p className="text-muted-foreground">
                Browse our collection of UI components
              </p>
            </div>

            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <Layers className="h-4 w-4" />
              View All
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8">
            {data.categories.map((category) => (
              <div key={category.id}>
                <div className="mb-4 flex items-center gap-2">
                  <category.icon className="h-5 w-5" />
                  <h3 className="text-lg font-medium">{category.name}</h3>
                  <span className="text-sm text-muted-foreground">
                    ({category.components.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {category.components.map((component) => (
                    <div
                      key={component.componentId}
                      className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 hover:shadow-lg transition-shadow"
                    >
                      {/* Component Preview */}
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-transparent">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        
                        {/* Component Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <category.icon className="h-8 w-8 text-primary/50" />
                        </div>

                        {/* Confidence Score */}
                        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-xs">
                          <Sparkles className="h-3 w-3 text-yellow-500" />
                          {component.confidence}%
                        </div>
                      </div>

                      {/* Component Info */}
                      <div className="mt-4">
                        <h4 className="font-medium">{component.name}</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {component.reasoning.map((reason, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                            >
                              {reason.split(':')[0]}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex items-center gap-2">
                        <button className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                          <Eye className="h-3 w-3" />
                          Preview
                        </button>
                        <button className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                          <Code className="h-3 w-3" />
                          Code
                        </button>
                        <button className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                          <Copy className="h-3 w-3" />
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}