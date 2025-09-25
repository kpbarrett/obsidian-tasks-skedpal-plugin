# Project Structure Overview - Obsidian Tasks SkedPal Plugin

## Core Files
- `PROJECT_REQUIREMENTS.md` - Single source of truth for all project requirements
- `README.md` - Project documentation and agent system overview
- `WORKFLOW_DOCUMENTATION.md` - Updated workflow with requirements-driven processing
- `CLAUDE.md` - Project-specific instructions

## Scripts Directory Structure
```
scripts/
├── requirements/
│   ├── parser.js - Parses requirements from markdown
│   └── task-generator.js - Generates tasks from requirements
├── agents/
│   ├── orchestrator.js - Enhanced with requirements integration
│   ├── developer.js - Feature implementation agent
│   ├── tester.js - Test execution agent
│   ├── engineer.js - Results analysis agent
│   └── general.js - Workflow coordination agent
├── dev-hooks/
│   ├── receive-extension-task.js
│   └── emit-plugin-task.js
├── process_next_task.js - Main task processing workflow
└── orchestrate.sh
```

## Operations Directory Structure
```
ops/
├── tasks/
│   ├── inbox/ - Task input directory
│   ├── working/ - Tasks in progress
│   └── done/ - Completed tasks
└── reports/ - Dated progress reports
```

## Build Configuration
- `pnpm-lock.yaml` - Package manager lock file
- `pnpm-workspace.yaml` - Workspace configuration
- `Makefile` - Build automation
- `.gitignore` - Git ignore patterns

## Key Features
- Multi-agent development system (4 agents)
- Requirements-driven task generation
- Automated workflow processing
- Progress tracking and reporting