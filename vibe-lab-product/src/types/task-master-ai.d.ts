interface Task {
  id: string;
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  dependencies?: string[];
}

interface Dependency {
  from: string;
  to: string;
  type: 'blocks' | 'requires' | 'depends_on';
}

interface CriticalPathItem {
  taskId: string;
  duration: number;
  startTime: number;
  endTime: number;
}

interface RoadmapData {
  tasks: Task[];
  dependencies?: Dependency[];
  timeline?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

declare module 'task-master-ai' {
  export interface TaskAnalysis {
    tasks: Task[];
    dependencies: Dependency[];
    criticalPath: CriticalPathItem[];
    complexity: number;
    duration: number;
  }

  export interface TaskMasterOptions {
    roadmap: RoadmapData;
    complexity?: string;
    framework?: string;
    team_size?: number;
  }

  export function analyzeProject(options: TaskMasterOptions): Promise<TaskAnalysis>;
  
  const taskMasterAI = {
    analyzeProject
  };
  
  export default taskMasterAI;
}