# obsidian-tasks-skedpal-plugin
A plugin that connects Obsidian Tasks to SkedPal.

## Motivation
Because I want one. Also because I want a way to play with agentic development, and this is as good a way as any.

## Agent-Based Task Processing System

This project now implements a sophisticated agent-based task processing system with four specialized agents:

### Agents Overview

1. **Developer Agent** (`scripts/agents/developer.js`)
   - Handles feature implementation and bug fixing
   - Task types: `implement-feature`, `fix-bug`

2. **Tester Agent** (`scripts/agents/tester.js`)
   - Executes test runs and records results
   - Task type: `run-test`

3. **Engineer Agent** (`scripts/agents/engineer.js`)
   - Analyzes test results and creates new tasks
   - Task type: `analyze-test-results`

4. **General Agent** (`scripts/agents/general.js`)
   - Handles miscellaneous coordination and monitoring tasks
   - Task types: `coordinate-workflow`, `monitor-progress`

### Task Workflow

Tasks are processed through the following workflow:

1. **Inbox**: Tasks are placed in `ops/tasks/inbox/` as JSON files
2. **Processing**: The orchestrator routes tasks to appropriate agents
3. **Execution**: Agents process tasks based on their specialization
4. **Reporting**: Results are recorded in dated report directories
5. **Completion**: Successful tasks are moved to `ops/tasks/done/`, failed tasks to `ops/tasks/working/`

### Task Format

Tasks are JSON files with the following structure:

