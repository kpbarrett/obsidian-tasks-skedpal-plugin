# Updated Agentic Development Workflow

## Overview
This workflow has been updated to use `PROJECT_REQUIREMENTS.md` as the single source of truth for all project requirements. The multi-agent system now automatically generates jobs from requirements and processes them through the specialized agent pipeline.

## Workflow Steps

### 1. Requirements Management
- **Source**: `PROJECT_REQUIREMENTS.md` contains all project requirements
- **Format**: Structured markdown with requirement IDs, descriptions, and priorities
- **Maintenance**: Update this file to add, modify, or complete requirements

### 2. Job Generation
- **Automated**: Jobs are automatically generated from requirements
- **Mapping**: Requirements are mapped to appropriate job types and agents
- **Prioritization**: Jobs are prioritized based on requirement priority

### 3. Agent Processing
- **Developer**: Implements features and fixes bugs
- **Test Author**: Creates and maintains test cases, test plans, and test documentation
- **Tester**: Runs tests and validates implementations
- **Engineer**: Analyzes results and creates corrective jobs
- **General**: Coordinates workflow and monitors progress

### 4. Progress Tracking
- **Status Updates**: Requirement status is automatically updated
- **Reporting**: Results are recorded in dated report directories
- **Traceability**: Full trace from requirements to implementation

## Developer Job Processing Workflow

### Step 1: Job Selection
- Retrieve the lowest-lexicographically-ordered job from `ops/jobs/inbox`
- Read and understand the job requirements

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

### Step 5: Job Completion
- **Move job to done directory**: `mv ops/jobs/inbox/job-XXX.json ops/jobs/done/`
- **Git commit with job ID**: Include job filename (without extension) in commit message
- **Commit message format**: `job-XXX: Brief summary of work performed`

## Test Author Job Processing Workflow

### Step 1: Test Planning
- Analyze requirements to identify test scenarios
- Design comprehensive test cases covering functional and non-functional requirements
- Create test plans and test strategy documentation

### Step 2: Test Development
- Write unit tests, integration tests, and end-to-end tests
- Implement test fixtures and test data
- Ensure test coverage meets project standards
- Follow testing best practices and patterns

### Step 3: Test Maintenance
- Update existing tests when requirements change
- Refactor tests for better maintainability
- Review and improve test coverage
- Document test cases and test procedures

### Step 4: Test Integration
- Ensure tests integrate properly with CI/CD pipeline
- Coordinate with Developers for testability requirements
- Collaborate with Testers for test execution planning

### Step 5: Job Completion
- **Move job to done directory**: `mv ops/jobs/inbox/job-XXX.json ops/jobs/done/`
- **Git commit with job ID**: Include job filename (without extension) in commit message
- **Commit message format**: `job-XXX: Brief summary of test work performed`

## Role Interactions

### Developer ↔ Test Author
- Developers implement features based on requirements
- Test Authors create corresponding test cases
- Collaboration ensures testability and comprehensive coverage

### Test Author ↔ Tester
- Test Authors provide test cases and test documentation
- Testers execute tests and report results
- Feedback loop for test improvement

### All Roles ↔ Engineer
- Engineer analyzes results from all roles
- Creates corrective jobs for issues identified
- Ensures overall system quality
## Final Steps

