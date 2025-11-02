# Suggested Commands

## Testing Commands
- **Playwright Testing**: `npx playwright test` (specific command details depend on setup)

## Development Commands
- **Node.js/TypeScript**: Typical build and run scripts from `package.json`

## Sprint Planning and Parallel Development
- **Create Sprint Plan**: Review `PROJECT_REQUIREMENTS.md` and create `sprint_plan.json` with 4 sprints covering all requirements
- **Run Parallel Development**: `./parallel_dev_script.sh <sprint_number>`
- **Dry Run**: `./parallel_dev_script.sh <sprint_number> true` (shows commands without executing)

## Sprint Execution Examples
```bash
# Execute sprint 1
./parallel_dev_script.sh 1

# Execute sprint 2  
./parallel_dev_script.sh 2

# Dry run for sprint 3
./parallel_dev_script.sh 3 true
```

Additional commands should be determined according to the setup of your `package.json` or development scripts.