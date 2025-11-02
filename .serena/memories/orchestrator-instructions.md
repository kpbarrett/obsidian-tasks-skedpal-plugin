# Orchestrator Instructions for Sprint Planning and Parallel Development

## Sprint Plan Creation

### Step 1: Analyze Requirements
- Review `PROJECT_REQUIREMENTS.md` to identify all requirements
- Group requirements by functionality and dependencies
- Estimate complexity and effort for each requirement group

### Step 2: Create Sprint Plan Structure
- Create `sprint_plan.json` with 4 sprints
- Each sprint should have:
  - Sprint number and title
  - Focus area and requirements covered
  - Tasks organized by role (developer, test-author, tester, engineer)
  - Specific commands for each role

### Step 3: Assign Tasks to Roles
- **Developer**: Feature implementation, bug fixes, unit/integration tests
- **Test Author**: E2E testing, test framework, regression suites  
- **Tester**: Test execution, result recording, validation
- **Engineer**: Releases, branch management, workflow coordination

## Parallel Development Execution

### Running Sprints
Use the parallel development script to execute sprints:

```bash
# Execute sprint 1
./parallel_dev_script.sh 1

# Execute sprint 2
./parallel_dev_script.sh 2

# Execute sprint 3
./parallel_dev_script.sh 3

# Execute sprint 4
./parallel_dev_script.sh 4

# Dry run to see commands without executing
./parallel_dev_script.sh 1 true
```

### Agent Configuration
- **Developer Agents**: dev1, dev2 with `developer` profile
- **Test Author Agents**: ta1, ta2 with `test-author` profile
- **Tester Agent**: tester with `test` profile  
- **Engineer Agent**: eng with `engineer` profile

### Command Structure
Each agent is launched using:
```bash
cnp2 --env=<agent_name> --profile=<profile> "command"
```

## Sprint Plan Template

### Sprint Structure
```json
{
  "sprint": 1,
  "title": "Sprint Title",
  "focus": "Focus area and requirements covered",
  "tasks": [
    {
      "role": "developer",
      "commands": ["task 1", "task 2"]
    },
    {
      "role": "test-author", 
      "commands": ["test task 1", "test task 2"]
    },
    {
      "role": "tester",
      "commands": ["validation task 1", "validation task 2"]
    },
    {
      "role": "engineer",
      "commands": ["release task 1", "release task 2"]
    }
  ]
}
```

## Key Files
- `sprint_plan.json`: Detailed sprint breakdown with tasks per role
- `parallel_dev_script.sh`: Script to launch parallel development
- `parallel_dev_commands.md`: Documentation and usage examples

## Best Practices
- Balance workload across sprints
- Ensure each sprint has clear focus and deliverables
- Include testing and validation in every sprint
- Track progress against sprint goals
- Adjust sprint plans based on velocity and blockers