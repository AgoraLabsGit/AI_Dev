declare module 'task-master-ai' {
  export interface TaskAnalysis {
    tasks: any[];
    dependencies: any[];
    criticalPath: any[];
    complexity: number;
    duration: number;
  }

  export interface TaskMasterOptions {
    roadmap: any;
    complexity?: string;
    framework?: string;
    team_size?: number;
  }

  export function analyzeProject(options: TaskMasterOptions): Promise<TaskAnalysis>;
  
  export default {
    analyzeProject
  };
}