import { 
  LayoutDashboard,
  FileText,
  GanttChart,
  Github,
  Play,
  Terminal,
  FileCode,
  FlaskConical,
  Ship,
  Wrench,
  Lightbulb,
  ClipboardList,
  Files as PagesIcon,
  StickyNote,
  Bug, 
  Server, 
  BarChart, 
  KeyRound, 
  Settings2
} from 'lucide-react';

export const navConfig = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    description: 'Project overview and metrics'
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: FileText,
    href: '/plan/blueprints',
    description: 'Project planning and blueprints'
  },
  {
    id: 'build',
    label: 'Build',
    icon: GanttChart,
    href: '/build/roadmap',
    description: 'Development and progress'
  },
  {
    id: 'preview',
    label: 'Preview',
    icon: Play,
    href: '/preview',
    description: 'Live preview environment'
  },
  {
    id: 'iterate',
    label: 'Iterate',
    icon: Lightbulb,
    href: '/iterate/features',
    description: 'Feature iterations and improvements'
  },
  {
    id: 'test',
    label: 'Test',
    icon: FlaskConical,
    href: '/test/e2e',
    description: 'Testing and quality assurance'
  },
  {
    id: 'deploy',
    label: 'Deploy',
    icon: Ship,
    href: '/deploy/vercel',
    description: 'Deployment and hosting'
  },
  {
    id: 'codebase',
    label: 'Codebase',
    icon: FileCode,
    href: '/codebase',
    description: 'Source code management'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Wrench,
    href: '/settings/ai',
    description: 'Project configuration'
  }
];