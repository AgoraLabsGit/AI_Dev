import re
import subprocess
from datetime import datetime
from pathlib import Path

def extract_task_info(commit_message):
    task_pattern = r"P([0-9]+)\.([0-9]+)"
    task_match = re.search(task_pattern, commit_message, re.IGNORECASE)
    task_id = f"P{task_match.group(1)}.{task_match.group(2)}" if task_match else None
    
    message_lower = commit_message.lower()
    
    status_keywords = {
        "completed": ["complete", "implement", "feat:", "finish", "done", "add:", "create:"],
        "in_progress": ["wip:", "working", "fix:", "partial", "started", "update:", "refactor:"],
        "blocked": ["block", "issue", "error", "fail", "stuck", "problem"]
    }

    for status, keywords in status_keywords.items():
        if any(word in message_lower for word in keywords):
            return task_id, status
            
    return task_id, "in_progress"

def update_tasks_md(task_updates):
    tasks_file = Path("Vibe Lab/Documentation/tasks.md")
    if not tasks_file.exists():
        raise FileNotFoundError(f"Tasks file not found at {tasks_file}")
        
    backup_file = tasks_file.parent / f"tasks_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    
    with open(tasks_file, "r", encoding="utf-8") as f:
        content = f.read()
        
    with open(backup_file, "w", encoding="utf-8") as f:
        f.write(content)
        
    updated_content = content
    for task_id, new_status in task_updates.items():
        pattern = re.compile(f"(^\\|\\s*{re.escape(task_id)}\\s*\\|.*?\\|.*?\\|.*?\\|.*?\\|.*?\\|.*?\\|\\s*)[^\\|]+(\\s*\\|)", re.MULTILINE)
        replacement = f"\\g<1>{new_status}\\g<2>"
        updated_content, count = re.subn(pattern, replacement, updated_content)
        if count == 0:
            print(f"  ⚠️ Warning: Task ID {task_id} not found in table.")

    temp_file = tasks_file.with_suffix(".tmp")
    with open(temp_file, "w", encoding="utf-8") as f:
        f.write(updated_content)
    temp_file.replace(tasks_file)
    
    return backup_file

def auto_commit_updates(backup_file):
    tasks_file_path = "Vibe Lab/Documentation/tasks.md"
    subprocess.run(["git", "add", tasks_file_path])
    
    result = subprocess.run(["git", "diff", "--cached", "--quiet"])
    
    if result.returncode != 0:
        commit_message = f"""chore: auto-update tasks.md via TaskMaster

🤖 Generated with TaskMaster Auto-Updater
📊 Updated task status based on recent commits
🔄 Backup created: {backup_file.name}

Co-Authored-By: Gemini AI <gemini@vibelab.ai>"""
        
        subprocess.run(["git", "commit", "-m", commit_message])
        print("✅ Tasks updated and committed successfully")
    else:
        print("ℹ️  No changes to commit")

def gemini_update_tasks():
    print("🤖 Gemini: Starting TaskMaster update...")
    
    try:
        result = subprocess.run(
            ["git", "log", "--oneline", "-10"], capture_output=True, text=True, check=True
        )
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to get git log: {e}")
        return

    if not result.stdout.strip():
        print("ℹ️  No recent commits found")
        return
    
    commits = result.stdout.strip().split("\n")
    task_updates = {}
    
    for commit in commits:
        if not commit.strip():
            continue
            
        try:
            commit_hash, message = commit.split(" ", 1)
            task_id, status = extract_task_info(message)
            
            if task_id:
                task_updates[task_id] = status
                print(f"  📝 {commit_hash}: Found {task_id} → {status}")
        except ValueError:
            print(f"  ⚠️ Could not parse commit: {commit}")

    if not task_updates:
        print("ℹ️  No task updates found in recent commits")
        return
    
    try:
        backup_file = update_tasks_md(task_updates)
        print(f"✅ Tasks.md updated, backup created: {backup_file.name}")
        
        auto_commit_updates(backup_file)
        
    except FileNotFoundError as e:
        print(f"❌ ERROR: {e}")
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")

if __name__ == "__main__":
    gemini_update_tasks() 