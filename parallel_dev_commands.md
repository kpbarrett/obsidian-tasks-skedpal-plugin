# Parallel Development Commands for Sprint Plan

## Usage Examples

### Run Sprint 1 Development
```bash
./parallel_dev_script.sh 1
```

### Run Specific Sprint
```bash
./parallel_dev_script.sh 2  # Sprint 2
./parallel_dev_script.sh 3  # Sprint 3
./parallel_dev_script.sh 4  # Sprint 4
```

## Agent Configuration

### Developer Agents (dev1, dev2)
- Profile: `developer`
- Environment: `dev1`, `dev2`
- Tasks: Feature implementation, bug fixes, unit/integration tests

### Test Author Agents (ta1, ta2)
- Profile: `test-author`
- Environment: `ta1`, `ta2`
- Tasks: E2E testing, test framework, regression suites

### Tester Agent
- Profile: `test`
- Environment: `tester`
- Tasks: Test execution, result recording, validation

### Engineer Agent
- Profile: `engineer`
- Environment: `eng`
- Tasks: Releases, branch management, workflow coordination

## Sprint Overview

### Sprint 1: Core Obsidian Integration & Basic Testing
- **Focus**: Complete REQ-001, REQ-002, REQ-003 and establish testing foundation
- **Agents**: 2 developers, 2 test authors, 1 tester, 1 engineer

### Sprint 2: SkedPal API Integration & Chrome Extension
- **Focus**: Implement REQ-004, REQ-005, REQ-006 and complete Chrome extension
- **Agents**: 2 developers, 2 test authors, 1 tester, 1 engineer

### Sprint 3: User Experience & Performance Optimization
- **Focus**: Complete REQ-011 through REQ-019 for production readiness
- **Agents**: 2 developers, 2 test authors, 1 tester, 1 engineer

### Sprint 4: Final Validation & Release Preparation
- **Focus**: Complete all remaining requirements and prepare for v1.0 release
- **Agents**: 2 developers, 2 test authors, 1 tester, 1 engineer

## Command Structure

Each agent is launched using:
```bash
cnp2 --env=<agent_name> --profile=<profile> "command"
```

Where:
- `<agent_name>`: eng, tester, taN, or devN
- `<profile>`: engineer, test-author, test, or developer
- `<command>`: Specific task from sprint plan

## Requirements Coverage

This parallel development approach covers:
- REQ-001 through REQ-006 (Core functionality)
- REQ-011 through REQ-019 (UX and performance)
- REQ-020 through REQ-025 (Testing and documentation)

Total: 21 requirements across 4 sprints