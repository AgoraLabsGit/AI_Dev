#!/usr/bin/env python3
"""
Gemini-Claude Collaboration System Implementation
Automated coordination between Gemini (Lead Developer) and Claude (Project Manager/Auditor)
"""

import json
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
import re

class AICollaborationSystem:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent.parent.parent
        self.ai_intelligence_path = self.project_root / "Vibe Lab" / "AI-Intelligence"
        self.collaboration_state_file = self.ai_intelligence_path / "memory" / "collaboration_state.json"
        self.daily_sync_file = self.ai_intelligence_path / "memory" / "daily_sync.json"
        
        # Initialize collaboration state if it doesn't exist
        self.ensure_state_files()
    
    def ensure_state_files(self):
        """Ensure collaboration state files exist"""
        if not self.collaboration_state_file.exists():
            initial_state = {
                "last_sync": None,
                "current_sprint": None,
                "gemini_status": "idle",
                "claude_status": "monitoring",
                "active_tasks": [],
                "pending_reviews": [],
                "collaboration_metrics": {
                    "tasks_completed_today": 0,
                    "reviews_completed_today": 0,
                    "escalations_today": 0
                }
            }
            self.save_state(initial_state)
    
    def load_state(self) -> Dict[str, Any]:
        """Load current collaboration state"""
        with open(self.collaboration_state_file, 'r') as f:
            return json.load(f)
    
    def save_state(self, state: Dict[str, Any]):
        """Save collaboration state"""
        state["last_updated"] = datetime.now().isoformat()
        with open(self.collaboration_state_file, 'w') as f:
            json.dump(state, f, indent=2)
    
    def generate_daily_sync(self) -> Dict[str, Any]:
        """Generate daily sync information for both AIs"""
        print("🔄 Generating daily AI collaboration sync...")
        
        sync_data = {
            "sync_date": datetime.now().isoformat(),
            "project_status": self.get_project_status(),
            "gemini_assignments": self.get_gemini_tasks(),
            "claude_priorities": self.get_claude_priorities(),
            "collaboration_metrics": self.calculate_collaboration_metrics(),
            "escalations": self.check_escalations(),
            "next_actions": self.determine_next_actions()
        }
        
        # Save daily sync
        with open(self.daily_sync_file, 'w') as f:
            json.dump(sync_data, f, indent=2)
        
        return sync_data
    
    def get_project_status(self) -> Dict[str, Any]:
        """Get current project status from TaskMaster and git"""
        try:
            # Get recent commits
            result = subprocess.run([
                'git', 'log', '--oneline', '-10', '--since=1.day.ago'
            ], capture_output=True, text=True, cwd=self.project_root)
            
            recent_commits = result.stdout.strip().split('\n') if result.stdout.strip() else []
            
            # Get current branch and status
            branch_result = subprocess.run([
                'git', 'branch', '--show-current'
            ], capture_output=True, text=True, cwd=self.project_root)
            
            current_branch = branch_result.stdout.strip()
            
            # Read tasks.md for current status
            tasks_file = self.project_root / "Vibe Lab" / "Documentation" / "tasks.md"
            task_status = self.parse_task_status(tasks_file)
            
            return {
                "current_branch": current_branch,
                "commits_today": len(recent_commits),
                "recent_commits": recent_commits[:5],  # Last 5 commits
                "task_status": task_status,
                "health_score": self.calculate_project_health()
            }
        except Exception as e:
            return {"error": f"Failed to get project status: {e}"}
    
    def parse_task_status(self, tasks_file: Path) -> Dict[str, Any]:
        """Parse current task status from tasks.md"""
        if not tasks_file.exists():
            return {"error": "tasks.md not found"}
        
        try:
            with open(tasks_file, 'r') as f:
                content = f.read()
            
            # Count tasks by status
            task_lines = [line for line in content.split('\n') if line.strip().startswith('| P')]
            
            status_counts = {
                "pending": 0,
                "in_progress": 0,
                "completed": 0,
                "blocked": 0
            }
            
            current_tasks = []
            
            for line in task_lines:
                parts = [part.strip() for part in line.split('|')]
                if len(parts) >= 8:
                    task_id = parts[1]
                    task_name = parts[2]
                    status = parts[7].lower()
                    
                    if status in status_counts:
                        status_counts[status] += 1
                    
                    current_tasks.append({
                        "id": task_id,
                        "name": task_name,
                        "status": status
                    })
            
            return {
                "total_tasks": len(current_tasks),
                "status_counts": status_counts,
                "current_tasks": current_tasks,
                "completion_rate": status_counts["completed"] / len(current_tasks) if current_tasks else 0
            }
        except Exception as e:
            return {"error": f"Failed to parse tasks: {e}"}
    
    def get_gemini_tasks(self) -> List[Dict[str, Any]]:
        """Get current task assignments for Gemini"""
        task_status = self.parse_task_status(
            self.project_root / "Vibe Lab" / "Documentation" / "tasks.md"
        )
        
        if "current_tasks" not in task_status:
            return []
        
        # Find tasks that should be assigned to Gemini (development tasks)
        gemini_tasks = []
        development_keywords = ["implement", "create", "build", "develop", "code"]
        
        for task in task_status["current_tasks"]:
            if task["status"] in ["pending", "in_progress"]:
                # Check if it's a development task
                task_name_lower = task["name"].lower()
                if any(keyword in task_name_lower for keyword in development_keywords):
                    gemini_tasks.append({
                        "task_id": task["id"],
                        "task_name": task["name"],
                        "status": task["status"],
                        "priority": self.calculate_task_priority(task),
                        "estimated_hours": self.estimate_task_hours(task),
                        "dependencies": self.get_task_dependencies(task["id"])
                    })
        
        # Sort by priority
        gemini_tasks.sort(key=lambda x: x["priority"], reverse=True)
        
        return gemini_tasks[:5]  # Top 5 priority tasks
    
    def get_claude_priorities(self) -> List[Dict[str, Any]]:
        """Get current priorities for Claude (reviews, audits, planning)"""
        priorities = []
        
        # Check for pending code reviews
        try:
            # Get recent commits that might need review
            result = subprocess.run([
                'git', 'log', '--oneline', '--since=1.day.ago', '--grep=feat:', '--grep=implement'
            ], capture_output=True, text=True, cwd=self.project_root)
            
            recent_commits = result.stdout.strip().split('\n') if result.stdout.strip() else []
            
            for commit in recent_commits:
                if commit.strip():
                    commit_hash = commit.split(' ')[0]
                    priorities.append({
                        "type": "code_review",
                        "description": f"Review commit {commit_hash}",
                        "urgency": "medium",
                        "estimated_time": "15 minutes"
                    })
        except Exception:
            pass
        
        # Check project health and add monitoring tasks
        priorities.append({
            "type": "project_monitoring",
            "description": "Monitor project health and progress",
            "urgency": "low",
            "estimated_time": "10 minutes"
        })
        
        # Add planning tasks if it's Monday or if sprint is ending
        if datetime.now().weekday() == 0:  # Monday
            priorities.append({
                "type": "sprint_planning",
                "description": "Weekly sprint planning and task prioritization",
                "urgency": "high",
                "estimated_time": "30 minutes"
            })
        
        return priorities
    
    def calculate_collaboration_metrics(self) -> Dict[str, Any]:
        """Calculate collaboration effectiveness metrics"""
        state = self.load_state()
        
        # Get metrics from last 24 hours
        metrics = {
            "tasks_assigned_today": len(self.get_gemini_tasks()),
            "reviews_pending": len([p for p in self.get_claude_priorities() if p["type"] == "code_review"]),
            "average_response_time": "< 1 hour",  # Placeholder - would calculate from actual data
            "collaboration_health": "good",  # Based on response times and task completion
            "escalations_needed": 0
        }
        
        return metrics
    
    def check_escalations(self) -> List[Dict[str, Any]]:
        """Check for situations requiring escalation"""
        escalations = []
        
        # Check for blocked tasks
        task_status = self.parse_task_status(
            self.project_root / "Vibe Lab" / "Documentation" / "tasks.md"
        )
        
        if "current_tasks" in task_status:
            blocked_tasks = [t for t in task_status["current_tasks"] if t["status"] == "blocked"]
            
            for task in blocked_tasks:
                escalations.append({
                    "type": "blocked_task",
                    "task_id": task["id"],
                    "description": f"Task {task['id']} has been blocked",
                    "urgency": "high",
                    "recommended_action": "Review blockers and reassign or resolve"
                })
        
        # Check for tasks in progress too long
        # (Would implement with more detailed tracking)
        
        return escalations
    
    def determine_next_actions(self) -> Dict[str, List[str]]:
        """Determine next actions for both AIs"""
        gemini_actions = []
        claude_actions = []
        
        # Gemini actions based on assigned tasks
        gemini_tasks = self.get_gemini_tasks()
        if gemini_tasks:
            priority_task = gemini_tasks[0]
            gemini_actions.append(f"Begin work on {priority_task['task_id']}: {priority_task['task_name']}")
            gemini_actions.append("Update TaskMaster with progress via git commits")
            gemini_actions.append("Follow established patterns and coding standards")
        
        # Claude actions based on priorities
        claude_priorities = self.get_claude_priorities()
        if claude_priorities:
            for priority in claude_priorities[:3]:  # Top 3
                claude_actions.append(f"Complete {priority['type']}: {priority['description']}")
        
        claude_actions.append("Monitor Gemini's progress and provide guidance as needed")
        
        return {
            "gemini": gemini_actions,
            "claude": claude_actions
        }
    
    def calculate_project_health(self) -> float:
        """Calculate overall project health score (0-1)"""
        task_status = self.parse_task_status(
            self.project_root / "Vibe Lab" / "Documentation" / "tasks.md"
        )
        
        if "status_counts" not in task_status:
            return 0.5  # Unknown health
        
        counts = task_status["status_counts"]
        total = sum(counts.values())
        
        if total == 0:
            return 0.5
        
        # Health factors
        completion_factor = counts["completed"] / total
        progress_factor = (counts["completed"] + counts["in_progress"]) / total
        blocked_penalty = counts["blocked"] / total if total > 0 else 0
        
        health_score = (completion_factor * 0.5 + progress_factor * 0.3) - (blocked_penalty * 0.3)
        
        return max(0.0, min(1.0, health_score))
    
    def calculate_task_priority(self, task: Dict[str, Any]) -> int:
        """Calculate task priority score"""
        priority_score = 0
        
        # Base priority from task ID (P1 = higher priority than P2)
        if task["id"].startswith("P1"):
            priority_score += 10
        elif task["id"].startswith("P2"):
            priority_score += 8
        elif task["id"].startswith("P3"):
            priority_score += 6
        
        # Add points for certain keywords
        high_priority_keywords = ["critical", "blocker", "authentication", "security"]
        for keyword in high_priority_keywords:
            if keyword in task["name"].lower():
                priority_score += 5
        
        return priority_score
    
    def estimate_task_hours(self, task: Dict[str, Any]) -> int:
        """Estimate hours for a task based on complexity indicators"""
        base_hours = 8  # Default estimate
        
        # Adjust based on task complexity indicators
        complexity_keywords = {
            "simple": -2,
            "basic": -2,
            "complex": +4,
            "integration": +3,
            "system": +6,
            "architecture": +8
        }
        
        for keyword, adjustment in complexity_keywords.items():
            if keyword in task["name"].lower():
                base_hours += adjustment
        
        return max(2, min(24, base_hours))  # Clamp between 2-24 hours
    
    def get_task_dependencies(self, task_id: str) -> List[str]:
        """Get dependencies for a specific task"""
        # This would parse the tasks.md or roadmap for dependencies
        # For now, return basic P-level dependencies
        
        dependencies = []
        task_num = task_id.replace("P", "").replace(".", "")
        
        try:
            major, minor = map(int, task_num.split(".") if "." in task_num else [task_num, "0"])
            
            # Previous tasks in same phase are dependencies
            if minor > 1:
                dependencies.append(f"P{major}.{minor-1}")
            elif major > 1:
                dependencies.append(f"P{major-1}.6")  # Assume 6 tasks per phase
        except ValueError:
            pass
        
        return dependencies
    
    def generate_ai_sync_instructions(self) -> Dict[str, str]:
        """Generate specific instructions for each AI"""
        sync_data = self.generate_daily_sync()
        
        gemini_instructions = f"""
# Gemini Daily Instructions - {datetime.now().strftime('%Y-%m-%d')}

## Your Role: Lead Developer
Today you are responsible for implementing features and writing production-ready code.

## Priority Tasks:
"""
        
        for i, task in enumerate(sync_data["gemini_assignments"][:3], 1):
            gemini_instructions += f"""
{i}. **{task['task_id']}**: {task['task_name']}
   - Priority: {task['priority']}/10
   - Estimated: {task['estimated_hours']} hours
   - Status: {task['status']}
"""
        
        gemini_instructions += f"""
## Success Criteria:
- Commit code with clear messages including task IDs
- Follow established patterns and coding standards
- Update TaskMaster automatically via commits
- Request Claude review when features are complete

## Project Health: {sync_data['project_status']['health_score']:.1%}
"""
        
        claude_instructions = f"""
# Claude Daily Instructions - {datetime.now().strftime('%Y-%m-%d')}

## Your Role: Project Manager & Code Auditor
Today you are responsible for project oversight, code reviews, and quality assurance.

## Priority Reviews:
"""
        
        for i, priority in enumerate(sync_data["claude_priorities"][:3], 1):
            claude_instructions += f"""
{i}. **{priority['type'].title()}**: {priority['description']}
   - Urgency: {priority['urgency']}
   - Estimated: {priority['estimated_time']}
"""
        
        claude_instructions += f"""
## Monitoring Focus:
- Review Gemini's commits for quality and standards
- Monitor project progress against timeline
- Identify and resolve blockers quickly
- Escalate architectural decisions to human stakeholders

## Project Status: {sync_data['project_status']['task_status']['completion_rate']:.1%} complete
## Health Score: {sync_data['project_status']['health_score']:.1%}
"""
        
        return {
            "gemini": gemini_instructions,
            "claude": claude_instructions
        }

def main():
    """Run the AI collaboration sync"""
    system = AICollaborationSystem()
    
    print("🤖 Starting AI Collaboration System...")
    print("=" * 60)
    
    # Generate daily sync
    sync_data = system.generate_daily_sync()
    
    # Generate AI instructions
    instructions = system.generate_ai_sync_instructions()
    
    # Save instructions to files
    ai_intelligence_path = system.ai_intelligence_path
    
    with open(ai_intelligence_path / "automation" / "gemini_daily_instructions.md", 'w') as f:
        f.write(instructions["gemini"])
    
    with open(ai_intelligence_path / "automation" / "claude_daily_instructions.md", 'w') as f:
        f.write(instructions["claude"])
    
    print("✅ AI Collaboration sync complete!")
    print(f"📊 Project Health: {sync_data['project_status']['health_score']:.1%}")
    print(f"📋 Gemini Tasks: {len(sync_data['gemini_assignments'])}")
    print(f"🔍 Claude Priorities: {len(sync_data['claude_priorities'])}")
    print(f"⚠️  Escalations: {len(sync_data['escalations'])}")
    print("")
    print("📄 Instructions generated:")
    print("   - Vibe Lab/AI-Intelligence/automation/gemini_daily_instructions.md")
    print("   - Vibe Lab/AI-Intelligence/automation/claude_daily_instructions.md")

if __name__ == '__main__':
    main()