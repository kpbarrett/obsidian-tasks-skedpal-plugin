# Requirements-Driven Processing System

## Overview
This project implements a sophisticated multi-agent development system that automatically generates tasks from requirements defined in `PROJECT_REQUIREMENTS.md`.

## Key Components

### Requirements Parser (`scripts/requirements/parser.js`)
- Parses structured markdown requirements with unique IDs (REQ-XXX)
- Extracts requirements from sections: Core, Technical, Development
- Maintains requirement status and priority

### Task Generator (`scripts/requirements/task-generator.js`)
- Generates tasks from planned requirements
- Maps requirements to appropriate task types and agents
- Prioritizes tasks based on requirement priority

### Multi-Agent System
- **Developer Agent**: Handles feature implementation and bug fixing
- **Tester Agent**: Executes test runs and validation
- **Engineer Agent**: Analyzes results and creates corrective tasks
- **General Agent**: Coordinates workflow and monitors progress

### Orchestrator (`scripts/agents/orchestrator.js`)
- Routes tasks to appropriate agents based on type
- Supports both single-task and requirements-driven processing
- Creates task files in `ops/jobs/inbox` for proper workflow processing

## Workflow
1. Requirements are parsed from `PROJECT_REQUIREMENTS.md`
2. Tasks are generated for planned requirements
3. Task files are created in `ops/jobs/inbox`
4. Tasks are processed by appropriate agents via `scripts/process_next_task.js`
5. Results are recorded in dated report directories

## Current Status
- System successfully creates task files from requirements
- 25 requirements from PROJECT_REQUIREMENTS.md mapped to tasks
- Tasks await processing through the workflow system
- Developer agent properly handles requirement-based task structure