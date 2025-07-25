# AI-First Development System - Complete Directory Structure
**Updated with Phase 0: Project Blueprint**

This document outlines the directory structure for the AI-First Development System. The structure is organized into two main parts: the initial **Blueprint** phase and the **Project Template** which contains the core development framework.

## 🏛️ Core Project Structure

The root directory contains the two primary phases of the project lifecycle.

```
/
├── 00-Blueprint/             # Phase 0: Collaborative project definition and strategy.
└── Project-Template/         # Contains the full, reusable development framework.
```

---

## **Phase 0: The Blueprint (`00-Blueprint/`)**

This directory is the starting point for all new projects. It contains the tools for the collaborative planning phase.

```
00-Blueprint/
├── 00_START_HERE.md                # Entry point for starting a new project blueprint.
├── 01-PROJECT-VISION.md            # Defines the project's high-level goals and purpose.
├── 02-CORE-FEATURES.md             # Lists and details the primary features.
├── 03-TECH-STACK-PROPOSAL.md       # Outlines the proposed technologies and architecture.
├── 04-MIGRATION-ANALYSIS.md        # Analysis for migrating existing projects.
└── 05-OPTIMIZATION-PROPOSAL.md     # Identifies areas for performance or process optimization.
```

---

## **The Project Template (`Project-Template/`)**

This directory is a self-contained, reusable template that is populated based on the outcome of the Blueprint phase. It contains the complete AI-First Development System.

```
Project-Template/
├── README.md                               # System overview and quick start
├── PROJECT-CONFIG.md                       # Project-specific configuration
├── package.json                            # Project dependencies and AI-powered scripts (commit, review, etc.)
│
├── system-overview/                        # Core system documentation
│   ├── AI_First_Development_System.md     # The Master README for the system
│   ├── System_Health_Dashboard.md         # Template for automated performance metrics
│   └── Automated_Learning_Loop.md         # Specification for the self-improving learning process
│
├── ai-system/
│   ├── memory-banks/                          # AI memory bank
│   │   ├── README.md                          # Memory bank system overview
│   │   └── primary_ai_memory_bank.md          # Primary developer AI instructions
│   │
│   ├── tier-1-quick/                  # Quick development guidance (1,000-2,000 words)
│   │   ├── README.md                          # Tier 1 navigation and domain mapping
│   │   ├── ARCHITECTURE-QUICK.md              # Core architectural decisions and patterns
│   │   └── ...
│   │
│   ├── tier-2-patterns/                # AI-updated pattern library
│   │   ├── README.md                          # Pattern library navigation
│   │   ├── components/                        # Frontend UI patterns
│   │   ├── modules/                           # Backend business logic patterns
│   │   └── ...
│   │
│   └── tier-3-comprehensive/                  # Deep review and troubleshooting (2,000-4,000 words)
│       ├── 06-DESIGN-SYSTEM-MASTER.md         # UI/UX, components, brand consistency
│       └── 07-TROUBLESHOOTING-MASTER.md       # Issues, debugging, emergency procedures
│
├── pages-architecture/                    # Page-centric mapping system
│   ├── admin-panel/                       # Administrative interface
│   └── settings/                          # User preferences
│
├── automation/                            # Python automation tools
│   ├── README.md                          # Automation system overview
│   ├── ai_dev_system.py                   # Main system orchestrator
│   └── scripts/                           # Utility scripts
│
├── logs/                                  # AI collaboration infrastructure
│   ├── README.md                          # Logging system overview
│   ├── dev_log.md                       # Development history with hashtags
│   └── hashtag_index.json                 # Searchable hashtag database
│
├── docs/                                  # System documentation
│   ├── README.md                          # Documentation overview
│   ├── getting-started.md                 # Quick start guide
│   └── Project_Roadmap.md                 # Generated from Blueprint
```

## 🎯 Key Structural Improvements

### **Two-Phase Development**
The system is now built around a two-phase process:
1.  **Blueprint**: Define the strategy in `00-Blueprint/`.
2.  **Develop**: Execute using the `Project-Template/`.

This ensures a solid foundation before development begins.

### **Unified `ai-system/` Directory**
The various tiers of documentation and the AI's memory are now consolidated into a single `ai-system/` directory within the `Project-Template/` for clarity and easy access.

### **Page-Centric Architecture**
```
pages-architecture/[page-name]/
├── overview.md              # Page purpose and requirements
├── components-needed.md     # UI components required  
├── modules-needed.md        # Backend modules required
├── database-requirements.md # Data and queries needed
├── styling-guide.md         # Design system application
└── masters-reference.md     # Relevant tier documentation
``` 