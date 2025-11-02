# Suggested Commands - Enhanced with Sprint Planning

## Development Commands

### Testing
- **Playwright Tests**: `npx playwright test` - Execute end-to-end tests
- **Unit Tests**: Specific test commands depend on project setup
- **Test Coverage**: Ensure >80% test coverage requirement (REQ-020)

### Build & Development
- **TypeScript Compilation**: `tsc` or `npx tsc` - Compile TypeScript files
- **Build Scripts**: Check `package.json` for project-specific build commands
- **Development Server**: Commands for local development environment

## Sprint Planning & Parallel Development Commands

### Sprint Plan Management
```bash
# Create sprint plan from requirements
create_sprint_plan() {
  # Analyzes PROJECT_REQUIREMENTS.md and generates sprint_plan.json
  # Groups requirements into 4 sprints with role-specific tasks
}

# Update sprint plan based on progress
update_sprint_plan() {
  # Adjusts remaining work and rebalances tasks
  # Updates sprint_plan.json with current status
}

# View sprint plan structure
cat sprint_plan.json | jq '.'

# Check specific sprint details
cat sprint_plan.json | jq '.sprints[] | select(.sprint == 1)'
```

### Parallel Development Execution
```bash
# Execute specific sprint with parallel agents
./parallel_dev_script.sh 1    # Sprint 1: Core Obsidian Integration
./parallel_dev_script.sh 2    # Sprint 2: SkedPal API Integration  
./parallel_dev_script.sh 3    # Sprint 3: UX & Performance
./parallel_dev_script.sh 4    # Sprint 4: Final Validation

# Dry run mode (preview commands without execution)
./parallel_dev_script.sh 1 true
./parallel_dev_script.sh 2 true

# Help and usage information
./parallel_dev_script.sh --help
```

### Agent Launch Commands
```bash
# Developer Agents
cnp2 --env=dev1 --profile=developer "Implement task collection from Obsidian vaults"
cnp2 --env=dev2 --profile=developer "Add real-time task change detection"

# Test Author Agents  
cnp2 --env=ta1 --profile=test-author "Create comprehensive unit tests for task collection"
cnp2 --env=ta2 --profile=test-author "Implement integration tests for Obsidian API"

# Tester Agent
cnp2 --env=tester --profile=test "Execute unit test suite for task collection"

# Engineer Agent
cnp2 --env=eng --profile=engineer "Review and merge completed tasks"
```

## Project Management Commands

### Git Operations
- **Branch Management**: Standard git commands for branch creation, switching, merging
- **PR Management**: GitHub CLI or web interface for pull request handling
- **Release Tagging**: `git tag v1.0.0 && git push origin v1.0.0`

### Documentation
- **Requirements Updates**: Edit `PROJECT_REQUIREMENTS.md` for requirement changes
- **Sprint Documentation**: Update sprint plan and progress tracking
- **API Documentation**: Maintain API documentation (REQ-024)

## Quality Assurance Commands

### Testing & Validation
- **Test Execution**: Run specific test suites for validation
- **Coverage Reports**: Generate and review test coverage reports
- **Performance Testing**: Execute performance benchmarks (REQ-014)
- **Integration Testing**: Validate end-to-end workflows (REQ-022)

### Code Quality
- **Linting**: Project-specific linting commands
- **Type Checking**: TypeScript type validation
- **Security Scanning**: Dependency and code security checks

## Agent System Commands

### Agent Configuration
- **Environment Setup**: Configure agent environments (dev1, dev2, ta1, ta2, tester, eng)
- **Profile Management**: Set up agent profiles (developer, test-author, test, engineer)
- **Resource Allocation**: Monitor and adjust agent resource usage

### Workflow Coordination
- **Task Assignment**: Assign tasks to appropriate agent roles
- **Progress Monitoring**: Track agent completion and performance
- **Block Resolution**: Address blocking issues and dependencies

## Usage Examples

### Complete Sprint Execution
```bash
# Step 1: Create or update sprint plan
create_sprint_plan

# Step 2: Execute sprint with parallel development
./parallel_dev_script.sh 1

# Step 3: Monitor progress and address blockers
# (Use agent logs and GitHub issues for monitoring)

# Step 4: Update documentation and prepare for next sprint
update_sprint_plan
```

### Quick Testing Cycle
```bash
# Developer implements feature
cnp2 --env=dev1 --profile=developer "Implement specific feature"

# Test author creates tests
cnp2 --env=ta1 --profile=test-author "Create tests for the feature"

# Tester validates implementation
cnp2 --env=tester --profile=test "Execute feature validation tests"

# Engineer reviews and merges
cnp2 --env=eng --profile=engineer "Review and merge completed feature"
```

## Important Notes

- Always reference `PROJECT_REQUIREMENTS.md` as the source of truth
- Ensure all changes are tied to GitHub Issues with proper labels
- Maintain traceability between requirements, tasks, and releases
- Use parallel development for maximum efficiency on complex projects
- Monitor agent performance and adjust resource allocation as needed