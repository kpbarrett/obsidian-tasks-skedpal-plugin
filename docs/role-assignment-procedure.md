# Role Assignment Procedure

## Overview

Since GitHub can only assign issues to GitHub users, we use labels to assign tickets to different roles in our multi-agent system. This allows us to maintain clear role-based assignment without being limited by GitHub's user assignment constraints.

## Labels

### Role Labels

| Role | Label | Responsibilities |
|------|-------|------------------|
| **Developer** | `role: developer` | Feature implementation, bug fixes, code changes |
| **Tester** | `role: tester` | Test execution, result recording, test automation |
| **Test Author** | `role: test-author` | Test creation, test design, test planning, test documentation |
| **Engineer** | `role: engineer` | Test analysis, job generation, releases, branch management |
| **General** | `role: general` | Coordination, monitoring, defaults, workflow management |

### Priority Labels

| Priority | Label | Description |
|----------|-------|-------------|
| **Critical** | `priority: critical` | Must be addressed immediately |
| **High** | `priority: high` | High importance, complete within current sprint |
| **Medium** | `priority: medium` | Normal priority, complete within reasonable timeframe |
| **Low** | `priority: low` | Low priority, can be deferred if needed |

### Label Constraints

- **Single Priority**: Only one priority label allowed per issue
- **Single Role**: Only one role label allowed per issue
- **Engineer Control**: Only Engineers can add/change priority and role labels
- **Escalation Only**: Other roles can only add `role: engineer` label when escalating

## Workflow Rules

### 1. Issue Creation and Assignment

#### For All Roles (except Engineer):
- Create issue with description and requirements
- **DO NOT** add any priority labels
- **DO NOT** add any role labels
- Leave the issue unassigned

#### For Engineer Role:
- Create issue with description and requirements
- Add appropriate priority label (see Priority Labels section)
- Add appropriate role label (see Role Labels section)
- Assign issue to the appropriate role

#### Engineer Assignment Responsibilities:
- Monitor new unassigned issues
- For each new unassigned issue:
  - Analyze requirements and complexity
  - Assign appropriate priority label
  - Assign appropriate role label
  - Assign issue to the designated role
- Maintain only one priority and one role label per issue

### 2. Escalation Process

#### When to Escalate:
- Issue requires different priority level
- Issue should be assigned to different role
- Issue is blocked and needs reassignment
- Issue scope has changed significantly

#### Escalation Procedure:
1. **Current Owner**: Add comment explaining need for reassignment
2. **Current Owner**: Assign issue to Engineer
3. **Current Owner**: Keep issue open (do not close)
4. **Current Owner**: Remove existing role label and add `role: engineer` label
5. **Engineer**: Re-evaluate priority and role assignment
6. **Engineer**: Update labels and reassign if needed

#### Escalation Label Constraints:
- Other roles can **only** add `role: engineer` label when escalating
- No other role or priority labels can be added by non-Engineer roles
- When escalating, remove any existing role label and replace with `role: engineer`

### 3. Role-Specific Workflows

#### Developer (`role: developer`)
- Creates feature branches from `development`
- Implements features and bug fixes
- Opens PRs targeting `development`
- Ensures tests pass and documentation is updated
- **DO NOT** modify priority or role labels
- Escalate issues requiring reassignment to Engineer

#### Tester (`role: tester`)
- Executes test suites
- Records test results and evidence
- Validates acceptance criteria
- Reports bugs and issues
- **DO NOT** modify priority or role labels
- Escalate issues requiring reassignment to Engineer

#### Test Author (`role: test-author`)
- Creates test cases and test plans
- Designs test scenarios and test data
- Documents test procedures and expected results
- Ensures test coverage and quality
- **DO NOT** modify priority or role labels
- Escalate issues requiring reassignment to Engineer

#### Engineer (`role: engineer`)
- Analyzes test results and system performance
- Generates new jobs based on analysis
- Manages releases and tags
- Enforces branch protections and quality gates
- **Assigns priority and role labels** to new issues
- **Handles escalations** and reassignments
- **Maintains label integrity** across all issues

#### General (`role: general`)
- Coordinates workflow between agents
- Monitors system progress and health
- Handles unknown or unassigned job types
- Provides default behavior when specific agents are unavailable
- **DO NOT** modify priority or role labels
- Escalate issues requiring reassignment to Engineer

### 4. Status Tracking
- All issues use the standard status labels:
  - `status: inbox` - New issue awaiting processing
  - `status: in progress` - Currently being worked on
  - `status: review` - Ready for review/validation
  - `status: done` - Completed and validated

### 5. Ownership Model

#### Assigned Issues:
- **Assignee** owns the issue
- Responsible for completion according to priority
- Must escalate if unable to complete or if reassignment needed

#### Unassigned Issues:
- **Engineer** owns the issue
- Responsible for initial assignment and prioritization
- Must assign to appropriate role within reasonable timeframe

## Benefits

1. **Flexibility**: Not limited to GitHub user assignments
2. **Clarity**: Clear role-based assignment system
3. **Automation**: Compatible with automated job routing
4. **Traceability**: Easy to filter and search by role
5. **Scalability**: Can add new roles without GitHub user management

## Usage Examples

### Creating a Feature Implementation Issue (Non-Engineer)
```
Title: [REQ-001] Implement Obsidian task integration
Description: Detailed requirements...
DO NOT add priority or role labels
Leave unassigned
```

### Engineer Assignment Process
```
Engineer reviews unassigned issue
Adds: priority: high
Adds: role: developer
Assigns to Developer role
```

### Escalation Example
```
Current Owner: Issue requires higher priority due to blocking other work
Action: Add comment explaining need
Action: Assign issue to Engineer
Action: Remove current role label, add role: engineer
```

### Creating a Release Coordination Issue (Engineer)
```
Title: Prepare v1.1.0 release
Adds: priority: high
Adds: role: engineer
Assigns to Engineer role
```

## Integration with Multi-Agent System

The orchestrator agent uses these role labels to route jobs to the appropriate agent:
- Jobs with `role: developer` → Developer agent
- Jobs with `role: tester` → Tester agent
- Jobs with `role: test-author` → Test Author agent
- Jobs with `role: engineer` → Engineer agent
- Jobs with `role: general` → General agent

This ensures that each agent only processes jobs relevant to their specialization.

## Compliance and Enforcement

- All agents must follow these workflow rules
- Orchestrator will validate label usage
- Engineers are responsible for workflow enforcement
- Regular audits of label usage and assignment patterns

## Related Documentation

- [Issue Assignment Workflow](./issue-assignment-workflow.md) - Detailed workflow rules
- [Agent System](./agent-system.md) - Multi-agent system architecture
- [Workflow Diagram](./workflow-diagram.md) - Visual workflow representation