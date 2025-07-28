#!/usr/bin/env python3
"""
TaskMaster Auto-Updater Script
Monitors roadmap changes and triggers task analysis updates
"""

import os
import json
import subprocess
import requests
from datetime import datetime
from pathlib import Path

class TaskMasterUpdater:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent.parent.parent.parent
        self.docs_path = self.project_root / "Vibe Lab" / "Documentation"
        self.api_base = "http://localhost:3000/api/v1"
        self.project_id = "vibe-lab-mvp"
        
    def check_roadmap_changes(self):
        """Check if roadmap files have been modified"""
        try:
            # Get git status for roadmap files
            result = subprocess.run([
                'git', 'status', '--porcelain', 
                str(self.docs_path / "Project_Roadmap.md"),
                str(self.docs_path / "tasks.md")
            ], capture_output=True, text=True, cwd=self.project_root)
            
            return len(result.stdout.strip()) > 0
            
        except subprocess.SubprocessError as e:
            print(f"Git status check failed: {e}")
            return False
    
    def read_roadmap_content(self):
        """Extract roadmap content for TaskMaster analysis"""
        roadmap_file = self.docs_path / "Project_Roadmap.md"
        
        if not roadmap_file.exists():
            raise FileNotFoundError(f"Roadmap file not found: {roadmap_file}")
        
        with open(roadmap_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract key sections (simplified parsing)
        roadmap_data = {
            "content": content,
            "phases": self._extract_phases(content),
            "requirements": self._extract_requirements(content),
            "constraints": self._extract_constraints(content),
            "timestamp": datetime.now().isoformat()
        }
        
        return roadmap_data
    
    def _extract_phases(self, content):
        """Extract project phases from roadmap"""
        phases = []
        lines = content.split('\n')
        current_phase = None
        
        for line in lines:
            if line.startswith('## Phase'):
                current_phase = line.strip()
                phases.append({
                    "name": current_phase,
                    "tasks": []
                })
            elif current_phase and line.strip().startswith('-'):
                if phases:
                    phases[-1]["tasks"].append(line.strip()[1:].strip())
        
        return phases
    
    def _extract_requirements(self, content):
        """Extract technical requirements"""
        # Simplified extraction - would be more sophisticated
        requirements = []
        if "TypeScript" in content: requirements.append("TypeScript")
        if "React" in content: requirements.append("React")
        if "Next.js" in content: requirements.append("Next.js")
        if "Tailwind" in content: requirements.append("Tailwind CSS")
        if "Prisma" in content: requirements.append("Prisma")
        if "NextAuth" in content: requirements.append("NextAuth")
        
        return requirements
    
    def _extract_constraints(self, content):
        """Extract project constraints"""
        constraints = {
            "timeline": "7 weeks",
            "team_size": 4,
            "complexity": "high",
            "budget": "medium"
        }
        
        # Extract from content if available
        if "weeks" in content.lower():
            # Extract timeline information
            pass
        
        return constraints
    
    def trigger_taskmaster_analysis(self, roadmap_data):
        """Trigger TaskMaster analysis via API"""
        try:
            payload = {
                "roadmap": roadmap_data,
                "complexity": "high",
                "framework": "next.js",
                "team_size": 4,
                "requirements": roadmap_data.get("requirements", []),
                "constraints": roadmap_data.get("constraints", {})
            }
            
            response = requests.post(
                f"{self.api_base}/projects/{self.project_id}/tasks/analyze",
                json=payload,
                timeout=120  # 2 minutes for complex analysis
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ TaskMaster analysis completed successfully")
                print(f"   Tasks generated: {len(result['data']['task_matrix'])}")
                print(f"   Confidence score: {result['data']['confidence_score']}")
                return result['data']
            else:
                print(f"❌ TaskMaster analysis failed: {response.status_code}")
                print(f"   Error: {response.text}")
                return None
                
        except requests.RequestException as e:
            print(f"❌ API request failed: {e}")
            return None
    
    def update_tasks_file(self, analysis_data):
        """Update the tasks.md file with new analysis"""
        if not analysis_data:
            return False
        
        tasks_file = self.docs_path / "tasks.md"
        backup_file = self.docs_path / f"tasks_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        
        try:
            # Backup existing file
            if tasks_file.exists():
                with open(tasks_file, 'r', encoding='utf-8') as f:
                    backup_content = f.read()
                with open(backup_file, 'w', encoding='utf-8') as f:
                    f.write(backup_content)
            
            # Generate new tasks.md content
            new_content = self._generate_tasks_markdown(analysis_data)
            
            # Write updated file
            with open(tasks_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"✅ Tasks file updated: {tasks_file}")
            print(f"📁 Backup created: {backup_file}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to update tasks file: {e}")
            return False
    
    def _generate_tasks_markdown(self, analysis_data):
        """Generate updated tasks.md content from analysis"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        content = f"""# Vibe Lab MVP - Updated Task Analysis

**Last Updated**: {timestamp}  
**Generated By**: TaskMaster Auto-Updater  
**Confidence Score**: {analysis_data.get('confidence_score', 0.85)}

## Executive Summary

**Timeline**: {analysis_data.get('estimated_timeline', '7 weeks')}  
**Total Tasks**: {len(analysis_data.get('task_matrix', []))}  
**Critical Path Length**: {len(analysis_data.get('critical_path', []))}  

---

## Task Matrix

| Task ID | Task Name | Complexity | Hours | Risk | Priority | MCP Server | Status |
|---------|-----------|------------|-------|------|----------|------------|--------|
"""
        
        # Add task rows
        for task in analysis_data.get('task_matrix', []):
            content += f"| {task.get('id', '')} | {task.get('name', '')} | {task.get('complexity', '')} | {task.get('time_hours', '')} | {task.get('risk_level', '')} | {task.get('priority', '')} | {', '.join(task.get('mcp_servers', []))} | {task.get('status', 'pending')} |\n"
        
        content += f"""
---

## Critical Path

{' → '.join(analysis_data.get('critical_path', []))}

---

## Risk Assessment

"""
        
        for risk in analysis_data.get('risk_assessment', []):
            content += f"**{risk.get('task_id', '')}**: {risk.get('description', '')}\n"
        
        content += f"""
---

*Auto-generated by TaskMaster at {timestamp}*
"""
        
        return content
    
    def run_update_cycle(self):
        """Execute complete update cycle"""
        print("🔄 Starting TaskMaster update cycle...")
        
        # Check for changes
        if not self.check_roadmap_changes():
            print("ℹ️  No roadmap changes detected, skipping update")
            return
        
        print("📝 Roadmap changes detected, processing...")
        
        try:
            # Read roadmap content
            roadmap_data = self.read_roadmap_content()
            print(f"✅ Roadmap content loaded ({len(roadmap_data['phases'])} phases)")
            
            # Trigger analysis
            analysis_data = self.trigger_taskmaster_analysis(roadmap_data)
            if not analysis_data:
                print("❌ TaskMaster analysis failed, aborting update")
                return
            
            # Update tasks file
            if self.update_tasks_file(analysis_data):
                print("✅ TaskMaster update cycle completed successfully")
            else:
                print("❌ TaskMaster update cycle failed")
                
        except Exception as e:
            print(f"❌ Update cycle failed: {e}")

def main():
    """Main entry point"""
    updater = TaskMasterUpdater()
    updater.run_update_cycle()

if __name__ == '__main__':
    main()