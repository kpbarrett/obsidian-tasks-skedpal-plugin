# Job Processing Workflow Diagram

## Overview

```mermaid
graph TD
    A[Job Created] --> B[Inbox Directory]
    B --> C[Process Next Job]
    C --> D[Orchestrator]
    D --> E{Route Job}

    E -->|implement-feature| F[Developer Agent]
    E -->|fix-bug| F
    E -->|run-test| G[Tester Agent]
    E -->|analyze-test-results| H[Engineer Agent]
    E -->|coordinate-workflow| I[General Agent]
    E -->|monitor-progress| I
    E -->|unknown type| I

    F --> J[Execute Job Logic]
    G --> J
    H --> J
    I --> J

    J --> K{Success?}
    K -->|Yes| L[Done Directory]
    K -->|No| M[Working Directory]

    J --> N[Create Report]
    N --> O[Reports Directory]

    H --> P[Create New Jobs]
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

### 1. Job Creation
- Jobs are created as JSON files in `ops/jobs/inbox/`
- Files are processed in lexicographical order
- Each job contains metadata and specifications

### 2. Job Processing
- `scripts/process_next_job.js` is executed
- The script reads the highest-priority job from inbox
- Required files are created as stubs if missing

### 3. Agent Routing
- Orchestrator analyzes job type and properties
- Routes to appropriate agent based on role labels:
 - **Developer** (`role: developer`): Feature implementation, bug fixes
 - **Tester** (`role: tester`): Test execution, result recording
 - **Engineer** (`role: engineer`): Test analysis, job generation
 - **General** (`role: general`): Coordination, monitoring, defaults

### 4. Job Execution
- Agent-specific logic is executed
- Results are captured and processed
- Any created files are tracked

### 5. Result Handling
- Success: Job moved to `ops/jobs/done/`
- Failure: Job moved to `ops/jobs/working/` for retry
- Report created in dated directory under `ops/reports/`

### 6. Follow-up Actions
- Engineer agent may create new jobs based on analysis
- New jobs are placed back in inbox for processing
- Continuous workflow until all jobs are completed

## File Structure

`
ops/
├── jobs/
│   ├── inbox/           # New jobs waiting processing
│   ├── working/         # Jobs being retried after failure
│   └── done/           # Successfully completed jobs
└── reports/
    └── YYYY-MM-DD/     # Dated report directories
        └── summary.jsonl  # Job execution logs

scripts/
└── agents/
    ├── orchestrator.js  # Job routing logic
    ├── developer.js     # Feature/bug implementation
    ├── tester.js        # Test execution
    ├── engineer.js      # Analysis and job generation
    └── general.js       # Coordination and defaults
`

## Error Recovery

- Failed jobs remain in working directory
- Manual intervention may be required
- System continues processing other jobs
- Detailed error information in reports