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

## Developer Task Processing Workflow

### Step 1: Task Selection
- Retrieve the lowest-lexicographically-ordered task from `ops/tasks/inbox`
- Read and understand the task requirements

### Step 2: Implementation
- Analyze current codebase and project structure
- Implement required features or fixes
- Follow TypeScript/JavaScript best practices
- Ensure proper error handling and validation

### Step 3: Build Verification
- Run TypeScript compilation: `npx tsc --noEmit --skipLibCheck`
- Execute build process: `npm run build`
- Verify no compilation errors or warnings

### Step 4: Testing (When Applicable)
- Run existing test suites
- Create new tests for implemented functionality
- Ensure all tests pass

### Step 5: Task Completion
- **Move task to done directory**: `mv ops/tasks/inbox/task-XXX.json ops/tasks/done/`
- **Git commit with task ID**: Include task filename (without extension) in commit message
- **Commit message format**: `task-XXX: Brief summary of work performed`

### Final Steps
