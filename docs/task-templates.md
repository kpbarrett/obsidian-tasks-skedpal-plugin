# Task Templates

## Overview

This document provides templates for creating tasks for the agent system. Use these templates as starting points for different types of tasks.

## Developer Task Templates

### Feature Implementation
```json
{
  "id": "feat-[number]",
  "type": "implement-feature",
  "title": "[Descriptive feature title]",
  "feature": "[feature-name]",
  "priority": "normal",
  "agent": "developer",
  "requires": [
    "[path/to/required/file.js]"
  ],
  "notes": "[Detailed description of what needs to be implemented]",
  "acceptanceCriteria": [
    "[Criterion 1]",
    "[Criterion 2]"
  ]
}
```

### Bug Fix
```json
{
  "id": "bug-[number]",
  "type": "fix-bug",
  "title": "Fix [bug description]",
  "bug": "[bug-identifier]",
  "priority": "high",
  "agent": "developer",
  "requires": [
    "[path/to/affected/file.js]"
  ],
  "notes": "[Bug description, steps to reproduce, expected vs actual behavior]",
  "reproductionSteps": [
    "[Step 1]",
    "[Step 2]"
  ]
}
```

## Tester Task Templates

### Test Execution
```json
{
  "id": "test-[number]",
  "type": "run-test",
  "title": "Run [test suite] tests",
  "test": "[suite-name|all|specific-test]",
  "priority": "normal",
  "agent": "tester",
  "environment": "[test-environment]",
  "timeout": 60000,
  "notes": "[Specific test configuration or requirements]"
}
```

## Engineer Task Templates

### Test Result Analysis
```json
{
  "id": "analyze-[number]",
  "type": "analyze-test-results",
  "title": "Analyze recent test results",
  "priority": "normal",
  "agent": "engineer",
  "analysisPeriod": "last-24-hours",
  "maxResults": 10,
  "notes": "[Specific analysis focus or criteria]"
}
```

## General Task Templates

### Workflow Coordination
```json
{
  "id": "coord-[number]",
  "type": "coordinate-workflow",
  "title": "Coordinate [workflow description]",
  "priority": "normal",
  "agent": "general",
  "dependencies": [
    "[task-id-1]",
    "[task-id-2]"
  ],
  "notes": "[Coordination requirements and dependencies]"
}
```

### Progress Monitoring
```json
{
  "id": "monitor-[number]",
  "type": "monitor-progress",
  "title": "Monitor [metric] progress",
  "metric": "[metric-name]",
  "priority": "low",
  "agent": "general",
  "interval": "daily",
  "thresholds": {
    "warning": 80,
    "critical": 90
  },
  "notes": "[Monitoring criteria and alert conditions]"
}
```

## Task ID Naming Convention

Use the following prefixes for task IDs:
- `feat-`: Feature implementation
- `bug-`: Bug fixes
- `test-`: Test execution
- `analyze-`: Analysis tasks
- `coord-`: Coordination tasks
- `monitor-`: Monitoring tasks

## Priority Levels

- `low`: Non-critical tasks, can be deferred
- `normal`: Standard priority tasks
- `high`: Important tasks that should be processed soon
- `urgent`: Critical tasks requiring immediate attention

## Best Practices

1. **Descriptive Titles**: Use clear, action-oriented titles
2. **Unique IDs**: Ensure task IDs are unique and follow naming conventions
3. **Complete Requirements**: List all required files in the `requires` array
4. **Clear Notes**: Provide sufficient context for agents to understand the task
5. **Realistic Priorities**: Assign appropriate priority levels
6. **Specific Acceptance Criteria**: Define clear success criteria for complex tasks

## Example Tasks

### Complete Feature Implementation
```json
{
  "id": "feat-001",
  "type": "implement-feature",
  "title": "Add user authentication system",
  "feature": "user-auth",
  "priority": "high",
  "agent": "developer",
  "requires": [
    "src/auth.js",
    "src/models/user.js"
  ],
  "notes": "Implement JWT-based authentication with user registration and login functionality",
  "acceptanceCriteria": [
    "Users can register with email and password",
    "Users can login and receive JWT token",
    "Protected routes require valid JWT",
    "Passwords are securely hashed"
  ]
}
```

### Comprehensive Test Run
```json
{
  "id": "test-001",
  "type": "run-test",
  "title": "Run full integration test suite",
  "test": "integration",
  "priority": "normal",
  "agent": "tester",
  "environment": "staging",
  "timeout": 120000,
  "notes": "Run all integration tests with database connectivity and external service mocking"
}
```