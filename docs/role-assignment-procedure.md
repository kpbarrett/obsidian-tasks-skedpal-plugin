# Role Assignment Procedure

## Overview

Since GitHub can only assign issues to GitHub users, we use labels to assign tickets to different roles in our multi-agent system. This allows us to maintain clear role-based assignment without being limited by GitHub's user assignment constraints.

## Role Labels

| Role | Label | Responsibilities |
|------|-------|------------------|
| **Developer** | `role: developer` | Feature implementation, bug fixes, code changes |
| **Tester** | `role: tester` | Test execution, result recording, test automation |
| **Test Author** | `role: test-author` | Test creation, test design, test planning, test documentation |
| **Engineer** | `role: engineer` | Test analysis, job generation, releases, branch management |
| **General** | `role: general` | Coordination, monitoring, defaults, workflow management |

## Procedure

### 1. Issue Creation
- Use the GitHub issue template
- Select the appropriate role from the "Role Assignment" dropdown
- The selected role will automatically apply the corresponding label

### 2. Role-Specific Workflows

#### Developer (`role: developer`)
- Creates feature branches from `development`
- Implements features and bug fixes
- Opens PRs targeting `development`
- Ensures tests pass and documentation is updated

#### Tester (`role: tester`)
- Executes test suites
- Records test results and evidence
- Validates acceptance criteria
- Reports bugs and issues

#### Test Author (`role: test-author`)
- Creates test cases and test plans
- Designs test scenarios and test data
- Documents test procedures and expected results
- Ensures test coverage and quality

#### Engineer (`role: engineer`)
- Analyzes test results and system performance
- Generates new jobs based on analysis
- Manages releases and tags
- Enforces branch protections and quality gates

#### General (`role: general`)
- Coordinates workflow between agents
- Monitors system progress and health
- Handles unknown or unassigned job types
- Provides default behavior when specific agents are unavailable

### 3. Status Tracking
- All issues use the standard status labels:
  - `status: inbox` - New issue awaiting processing
  - `status: in progress` - Currently being worked on
  - `status: review` - Ready for review/validation
  - `status: done` - Completed and validated

## Benefits

1. **Flexibility**: Not limited to GitHub user assignments
2. **Clarity**: Clear role-based assignment system
3. **Automation**: Compatible with automated job routing
4. **Traceability**: Easy to filter and search by role
5. **Scalability**: Can add new roles without GitHub user management

## Usage Examples

### Creating a Feature Implementation Issue
```
Title: [REQ-001] Implement Obsidian task integration
Role Assignment: Developer
Priority: High
Requirement ID: REQ-001
```

### Creating a Test Execution Issue
```
Title: [REQ-020] Execute unit test suite
Role Assignment: Tester
Priority: Medium
Requirement ID: REQ-020
```

### Creating a Test Creation Issue
```
Title: [REQ-020] Create unit tests for task integration
Role Assignment: Test Author
Priority: Medium
Requirement ID: REQ-020
```

### Creating a Release Coordination Issue
```
Title: Prepare v1.1.0 release
Role Assignment: Engineer
Priority: High
Requirement ID: N/A (process improvement)
```

## Integration with Multi-Agent System

The orchestrator agent uses these role labels to route jobs to the appropriate agent:
- Jobs with `role: developer` → Developer agent
- Jobs with `role: tester` → Tester agent
- Jobs with `role: test-author` → Test Author agent
- Jobs with `role: engineer` → Engineer agent
- Jobs with `role: general` → General agent

This ensures that each agent only processes jobs relevant to their specialization.