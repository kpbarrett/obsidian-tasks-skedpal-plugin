# Orchestrator Instructions - Enhanced with Sprint Planning

## Core Responsibilities

### Project Coordination
- Coordinate the overall development workflow across all agent roles
- Ensure smooth handoffs between different agent types
- Monitor progress and address bottlenecks
- Maintain communication between parallel development streams

### Sprint Planning Commands

#### Sprint Plan Creation
```bash
# Create comprehensive sprint plan from requirements
create_sprint_plan() {
  # Steps:
  # 1. Analyze PROJECT_REQUIREMENTS.md for all requirements
  # 2. Group requirements by dependencies and logical areas
  # 3. Estimate effort and complexity for each group
  # 4. Define 4 sprints with clear focus areas
  # 5. Assign requirements to appropriate sprints
  # 6. Create role-specific tasks for each sprint
  # 7. Generate sprint_plan.json file
  
  # Expected output: sprint_plan.json with 4 sprints covering all requirements
}

# Update sprint plan based on progress
update_sprint_plan() {
  # Steps:
  # 1. Review completed requirements
  # 2. Adjust remaining work distribution
  # 3. Rebalance tasks across sprints if needed
  # 4. Update sprint focus areas
  # 5. Regenerate sprint_plan.json
}
```

#### Sprint Execution Commands
```bash
# Execute specific sprint with parallel development
./parallel_dev_script.sh 1    # Sprint 1: Core Obsidian Integration
./parallel_dev_script.sh 2    # Sprint 2: SkedPal API Integration
./parallel_dev_script.sh 3    # Sprint 3: UX & Performance
./parallel_dev_script.sh 4    # Sprint 4: Final Validation

# Dry run to preview commands without execution
./parallel_dev_script.sh 1 true
./parallel_dev_script.sh 2 true

# Check sprint plan structure
cat sprint_plan.json | jq '.'

# View specific sprint details
cat sprint_plan.json | jq '.sprints[] | select(.sprint == 1)'
```

### Agent Management

#### Developer Agents (dev1, dev2)
- Profile: `developer`
- Environment: `dev1`, `dev2`
- Tasks: Feature implementation, bug fixes, unit/integration tests
- Launch: `cnp2 --env=dev1 --profile=developer "command"`

#### Test Author Agents (ta1, ta2)
- Profile: `test-author`
- Environment: `ta1`, `ta2`
- Tasks: E2E testing, test framework, regression suites
- Launch: `cnp2 --env=ta1 --profile=test-author "command"`

#### Tester Agent
- Profile: `test`
- Environment: `tester`
- Tasks: Test execution, result recording, validation
- Launch: `cnp2 --env=tester --profile=test "command"`

#### Engineer Agent
- Profile: `engineer`
- Environment: `eng`
- Tasks: Releases, branch management, workflow coordination
- Launch: `cnp2 --env=eng --profile=engineer "command"`

### Workflow Coordination

#### Daily Operations
1. **Morning Check**: Review overnight progress and any blocking issues
2. **Sprint Status**: Check current sprint progress and agent availability
3. **Issue Triage**: Process new issues and assign to appropriate roles
4. **Coordination**: Ensure smooth handoffs between development and testing

#### Sprint Cycle Management
1. **Sprint Planning**: Create/update sprint plan at beginning of each sprint
2. **Daily Standup**: Monitor progress and address blockers
3. **Sprint Review**: Assess sprint completion and prepare for next sprint
4. **Retrospective**: Identify process improvements for next sprint

### Communication Protocols

#### Inter-Agent Communication
- Use clear, specific task descriptions
- Ensure all agents understand dependencies and handoff points
- Maintain consistent terminology across all agents

#### Progress Reporting
- Track completion of role-specific tasks
- Monitor requirement coverage across sprints
- Report blockers and dependencies to Engineer for resolution

### Quality Assurance Coordination

#### Testing Coordination
- Ensure test authors create comprehensive test suites
- Coordinate test execution with development progress
- Validate that acceptance criteria are met before closing issues

#### Release Coordination
- Work with Engineer to ensure releases are properly prepared
- Validate that all requirements are tested and documented
- Ensure smooth transition from development to production

### Process Optimization

#### Continuous Improvement
- Monitor agent performance and efficiency
- Identify bottlenecks in the development workflow
- Suggest process improvements to Engineer
- Optimize parallel development execution

#### Tooling and Automation
- Ensure all agents have necessary tools and access
- Automate repetitive coordination tasks where possible
- Maintain up-to-date documentation and instructions

## Key Files and Resources

### Essential Files
- `sprint_plan.json` - Master sprint plan with role assignments
- `parallel_dev_script.sh` - Script for launching parallel development
- `parallel_dev_commands.md` - Usage instructions and agent configuration
- `PROJECT_REQUIREMENTS.md` - Source of truth for all requirements

### Monitoring Tools
- GitHub Issues for progress tracking
- Agent logs for debugging and performance monitoring
- Sprint progress reports for status updates

## Best Practices

### Sprint Planning
- Keep sprints focused and manageable (4-6 weeks)
- Ensure clear dependencies between sprints
- Balance workload across agent roles
- Include buffer time for unexpected issues

### Parallel Development
- Launch agents in appropriate order (developers first, then testers)
- Monitor agent resource usage and performance
- Ensure proper error handling and recovery
- Maintain clear communication channels

### Quality Control
- Validate all requirements are covered in sprint plan
- Ensure proper testing coverage before releases
- Maintain documentation throughout development
- Conduct regular code and process reviews