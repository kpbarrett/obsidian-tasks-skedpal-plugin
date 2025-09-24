# Updated Agentic Development Workflow

## Overview
This workflow has been updated to use `PROJECT_REQUIREMENTS.md` as the single source of truth for all project requirements. The multi-agent system now automatically generates tasks from requirements and processes them through the specialized agent pipeline.

## Workflow Steps

### 1. Requirements Management
- **Source**: `PROJECT_REQUIREMENTS.md` contains all project requirements
- **Format**: Structured markdown with requirement IDs, descriptions, and priorities
- **Maintenance**: Update this file to add, modify, or complete requirements

### 2. Task Generation
- **Automated**: Tasks are automatically generated from requirements
- **Mapping**: Requirements are mapped to appropriate task types and agents
- **Prioritization**: Tasks are prioritized based on requirement priority

### 3. Agent Processing
- **Developer**: Implements features and fixes bugs
- **Tester**: Runs tests and validates implementations
- **Engineer**: Analyzes results and creates corrective tasks
- **General**: Coordinates workflow and monitors progress

### 4. Progress Tracking
- **Status Updates**: Requirement status is automatically updated
- **Reporting**: Results are recorded in dated report directories
- **Traceability**: Full trace from requirements to implementation

## Usage

### Single Task Processing (Original)
```bash
node scripts/agents/orchestrator.js '{"type":"implement-feature","title":"Test task"}'
```

### Requirements-Driven Processing (New)
```bash
node scripts/agents/orchestrator.js --requirements
```

### Manual Task Creation
```bash
# Create task file in inbox
echo '{"id":"task-001","type":"implement-feature","title":"Manual task"}' > ops/tasks/inbox/manual-task.json
```

## File Structure
```
PROJECT_REQUIREMENTS.md          # Single source of truth for requirements
scripts/
  requirements/
    parser.js                    # Parses requirements from markdown
    task-generator.js           # Generates tasks from requirements
  agents/
    orchestrator.js             # Enhanced with requirements integration
    developer.js                # Feature implementation
    tester.js                   # Test execution
    engineer.js                 # Results analysis
    general.js                  # Workflow coordination
ops/
  tasks/
    inbox/                      # Task input directory
    working/                    # Tasks in progress
    done/                       # Completed tasks
  reports/                      # Dated progress reports
```

## Key Changes

1. **Requirements-Driven**: Tasks are now generated from requirements rather than created manually
2. **Automated Prioritization**: Task priority is determined by requirement priority
3. **Status Synchronization**: Requirement status is automatically updated as tasks complete
4. **Enhanced Traceability**: Full audit trail from requirements to implementation

## Benefits
- **Reduced Manual Work**: No need to manually create tasks
- **Better Alignment**: All work directly ties back to requirements
- **Improved Visibility**: Clear progress tracking against requirements
- **Automated Documentation**: Requirements document stays current with implementation

## Adding New Requirements

1. Edit `PROJECT_REQUIREMENTS.md`
2. Add requirements with unique IDs (REQ-XXX)
3. Set appropriate priority and status
4. Run the requirements pipeline to generate tasks

## Example Requirement Format
```markdown
- **REQ-XXX**: Description of the requirement
```

## Priority Matrix Updates
The priority matrix in the requirements document is automatically updated as tasks are processed, providing real-time visibility into project progress against requirements.