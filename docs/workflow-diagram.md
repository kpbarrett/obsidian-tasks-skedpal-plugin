# Task Processing Workflow Diagram

## Overview

```mermaid
graph TD
    A[Task Created] --> B[Inbox Directory]
    B --> C[Process Next Task]
    C --> D[Orchestrator]
    D --> E{Route Task}

    E -->|implement-feature| F[Developer Agent]
    E -->|fix-bug| F
    E -->|run-test| G[Tester Agent]
    E -->|analyze-test-results| H[Engineer Agent]
    E -->|coordinate-workflow| I[General Agent]
    E -->|monitor-progress| I
    E -->|unknown type| I

    F --> J[Execute Task Logic]
    G --> J
    H --> J
    I --> J

    J --> K{Success?}
    K -->|Yes| L[Done Directory]
    K -->|No| M[Working Directory]

    J --> N[Create Report]
    N --> O[Reports Directory]

    H --> P[Create New Tasks]
    P --> B

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#fff3e0
    style D fill:#e8f5e8
    style E fill:#ffebee
    style F fill:#bbdefb
    style G fill:#c8e6c9
    style H fill:#fff9c4
    style I fill:#fce4ec
    style J fill:#f3e5f5
    style K fill:#ffebee
    style L fill:#c8e6c9
    style M fill:#ffcdd2
    style N fill:#e1f5fe
    style O fill:#f3e5f5
    style P fill:#fff9c4
```

## Detailed Flow

### 1. Task Creation
- Tasks are created as JSON files in `ops/tasks/inbox/`
- Files are processed in lexicographical order
- Each task contains metadata and specifications

### 2. Task Processing
- `scripts/process_next_task.js` is executed
- The script reads the highest-priority task from inbox
- Required files are created as stubs if missing

### 3. Agent Routing
- Orchestrator analyzes task type and properties
- Routes to appropriate agent:
 - **Developer**: Feature implementation, bug fixes
 - **Tester**: Test execution, result recording
 - **Engineer**: Test analysis, task generation
 - **General**: Coordination, monitoring, defaults

### 4. Task Execution
- Agent-specific logic is executed
- Results are captured and processed
- Any created files are tracked

### 5. Result Handling
- Success: Task moved to `ops/tasks/done/`
- Failure: Task moved to `ops/tasks/working/` for retry
- Report created in dated directory under `ops/reports/`

### 6. Follow-up Actions
- Engineer agent may create new tasks based on analysis
- New tasks are placed back in inbox for processing
- Continuous workflow until all tasks are completed

## File Structure

`
ops/
├── tasks/
│   ├── inbox/           # New tasks waiting processing
│   ├── working/         # Tasks being retried after failure
│   └── done/           # Successfully completed tasks
└── reports/
    └── YYYY-MM-DD/     # Dated report directories
        └── summary.jsonl  # Task execution logs

scripts/
└── agents/
    ├── orchestrator.js  # Task routing logic
    ├── developer.js     # Feature/bug implementation
    ├── tester.js        # Test execution
    ├── engineer.js      # Analysis and task generation
    └── general.js       # Coordination and defaults
`

## Error Recovery

- Failed tasks remain in working directory
- Manual intervention may be required
- System continues processing other tasks
- Detailed error information in reports"
