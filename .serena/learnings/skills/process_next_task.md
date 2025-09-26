# Process Next Task Skill

## Implementation Date
2025-09-23

## Summary
Automated task processing system that reads JSON task files from `ops/jobs/inbox/`, handles file dependencies, runs tests, and reports results.

## Key Files
- `scripts/process_next_task.js` - Main implementation
- Updated `Makefile` - Added `process-next-task` target

## Usage
```bash
# Via Makefile
make process-next-task

# Direct execution
node scripts/process_next_task.js
```

## Functionality
1. **Task Selection**: Reads lexicographically highest `.json` file from `ops/jobs/inbox/`
2. **Dependency Handling**: Creates minimal stubs for required files if missing
3. **Test Execution**: Runs `make test` with 60-second timeout
4. **Reporting**: Logs results to dated JSONL files in `ops/reports/`
5. **Task Promotion**: Moves tasks to `done/` (success) or `working/` (failure)

## Code Location
The actual implementation remains in `scripts/process_next_task.js` - this file should contain documentation only.

## Current Status
✅ Implemented and tested
- Task `001-stage1.json` successfully processed
- Report generated in `ops/reports/2025-09-23/summary.jsonl`
- System ready for continuous task processing
