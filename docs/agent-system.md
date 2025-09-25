# Agent-Based Task Processing System

## Overview

The agent system implements a sophisticated workflow for processing tasks using specialized agents. Each agent has specific responsibilities and handles different types of tasks.

## Architecture

### Core Components

1. **Task Inbox** (`ops/tasks/inbox/`)
   - JSON files containing task definitions
   - Tasks are processed in lexicographical order

2. **Agent Orchestrator** (`scripts/agents/orchestrator.js`)
   - Routes tasks to appropriate agents
   - Supports both explicit and automatic agent assignment

3. **Specialized Agents**
   - Developer: Feature implementation and bug fixes
   - Tester: Test execution and result recording
   - Engineer: Test result analysis and task creation
   - General: Miscellaneous coordination tasks

4. **Reporting System** (`ops/reports/`)
   - Dated directories for organized reporting
   - JSONL format for easy parsing and analysis

## Task Lifecycle

1. **Creation**: Task JSON files are placed in the inbox
2. **Routing**: Orchestrator determines appropriate agent
3. **Processing**: Agent executes task-specific logic
4. **Reporting**: Results are recorded with timestamps
5. **Completion**: Tasks are moved to done/working directories

## Task Format

```json
{
  "id": "unique-task-identifier",
  "type": "task-type",
  "title": "Descriptive title",
  "agent": "optional-agent-name",
  "priority": "low|normal|high|urgent",
  "requires": ["path/to/required/file"],
  "notes": "Additional context",
  "timestamp": "ISO-8601-timestamp"
}
```

## Supported Task Types

### Developer Tasks
- `implement-feature`: Create new functionality
- `fix-bug`: Resolve identified issues

### Tester Tasks
- `run-test`: Execute test suites

### Engineer Tasks
- `analyze-test-results`: Process test outcomes and create follow-up tasks

### General Tasks
- `coordinate-workflow`: Manage task dependencies
- `monitor-progress`: Track system performance

## Agent Responsibilities

### Developer Agent
- Implements features based on specifications
- Fixes bugs identified in testing
- Creates necessary code and documentation
- Ensures code quality and standards

### Tester Agent
- Executes automated test suites
- Records test results and metrics
- Identifies test failures and issues
- Generates test reports

### Engineer Agent
- Analyzes test results for patterns
- Creates bug fix tasks for failed tests
- Generates follow-up testing tasks
- Monitors system health and performance

### General Agent
- Coordinates workflow between agents
- Monitors task progress and dependencies
- Handles system-level coordination tasks
- Acts as default for unknown task types

## Usage Examples

### Creating a Development Task
```json
{
  "id": "feat-001",
  "type": "implement-feature",
  "title": "Add user authentication",
  "feature": "user-auth",
  "priority": "high",
  "requires": ["src/auth.js"],
  "notes": "Implement JWT-based authentication"
}
```

### Creating a Testing Task
```json
{
  "id": "test-001",
  "type": "run-test",
  "title": "Run integration tests",
  "test": "integration",
  "priority": "normal",
  "agent": "tester"
}
```

## Processing Workflow

1. Place task file in `ops/tasks/inbox/`
2. Run `node scripts/process_next_task.js`
3. Monitor progress in `ops/reports/[date]/summary.jsonl`
4. Check completed tasks in `ops/tasks/done/`

## Error Handling

- Failed tasks are moved to `ops/tasks/working/`
- Detailed error information is recorded in reports
- System continues processing other tasks
- Manual intervention may be required for failed tasks

## Extending the System

### Adding New Agents
1. Create agent file in `scripts/agents/`
2. Implement agent logic with standard interface
3. Update orchestrator to include new agent
4. Add agent-specific task types

### Adding New Task Types
1. Define task type in agent logic
2. Update orchestrator routing logic
3. Create appropriate test cases
4. Update documentation

## Best Practices

- Use descriptive task titles and IDs
- Include all necessary dependencies in `requires`
- Set appropriate priority levels
- Provide clear context in `notes` field
- Monitor report files for system health
- Regularly review and clean up completed tasks"