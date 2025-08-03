import { Suspense } from 'react';
import { 
  LayoutGrid, 
  Layers, 
  MousePointerClick,
  Type,
  Table2,
  Bell,
  Calendar,
  Info,
  Menu,
  ChevronRight
} from 'lucide-react';

interface ComponentCategory {
  name: string;
  icon: React.ElementType;
  description: string;
  count: number;
  components: {
    name: string;
    variants: string[];
    priority: string;
  }[];
}

const categories: ComponentCategory[] = [
  {
    name: "Interactive",
    icon: MousePointerClick,
    description: "High-interaction components for user input",
    count: 294,
    components: [
      {
        name: "Buttons",
        variants: ["Primary", "Secondary", "Outline", "Ghost", "Loading", "Icon", "Split"],
        priority: "HIGHEST"
      },
      {
        name: "Inputs",
        variants: ["Text", "Email", "Password", "Search", "Number", "TextArea", "File"],
        priority: "HIGHEST"
      },
      {
        name: "Selects",
        variants: ["Single", "Multi", "Searchable", "Grouped", "AsyncLoad", "Country", "User"],
        priority: "HIGH"
      }
    ]
  },
  {
    name: "Layout",
    icon: LayoutGrid,
    description: "Core layout and structure components",
    count: 157,
    components: [
      {
        name: "Cards",
        variants: ["Basic", "WithImage", "WithActions", "Stats", "Product", "User", "Pricing"],
        priority: "HIGH"
      },
      {
        name: "Accordions",
        variants: ["Single", "Multiple", "FAQ", "Navigation", "Settings", "Content"],
        priority: "HIGH"
      },
      {
        name: "Tabs",
        variants: ["Horizontal", "Vertical", "Pills", "Underline", "Card", "Icon"],
        priority: "HIGH"
      }
    ]
  },
  {
    name: "Data Display",
    icon: Table2,
    description: "Components for displaying data and content",
    count: 55,
    components: [
      {
        name: "Tables",
        variants: ["Basic", "Sortable", "Filterable", "Paginated", "Editable", "Responsive"],
        priority: "HIGH"
      },
      {
        name: "Charts",
        variants: ["Line", "Bar", "Pie", "Area", "Dashboard"],
        priority: "MEDIUM"
      }
    ]
  },
  {
    name: "Feedback",
    icon: Bell,
    description: "User feedback and notification components",
    count: 92,
    components: [
      {
        name: "AI Chats",
        variants: ["Basic", "Threaded", "Support", "Assistant", "Team", "Bot"],
        priority: "HIGH"
      },
      {
        name: "Notifications",
        variants: ["Toast", "Banner", "Badge", "Inbox"],
        priority: "MEDIUM"
      },
      {
        name: "Modals",
        variants: ["Confirmation", "Form", "Info", "Image", "Drawer"],
        priority: "HIGH"
      }
    ]
  }
];

export default function ComponentLibraryPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container py-6">
          <h1 className="text-4xl font-bold">Component Library</h1>
          <p className="mt-2 text-muted-foreground">
            224 production-ready components across 10 style templates
          </p>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div 
              key={category.name}
              className="group relative rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <category.icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-semibold">{category.name}</h2>
                  <p className="text-sm text-muted-foreground">{category.count} components</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                {category.description}
              </p>

              <div className="mt-6 space-y-4">
                {category.components.map((component) => (
                  <div 
                    key={component.name}
                    className="group/item flex items-center justify-between rounded-md p-2 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium">{component.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {component.variants.length} variants • {component.priority}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover/item:text-foreground transition-colors" />
                  </div>
                ))}
              </div>

              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}