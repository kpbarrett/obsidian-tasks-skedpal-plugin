# SkedPal Integration Guide

This document describes the SkedPal integration functionality implemented in the Obsidian Tasks - SkedPal Sync plugin.

## Overview

The SkedPal integration enables bidirectional synchronization between Obsidian tasks and SkedPal's scheduling system. This allows you to:

- Sync your Obsidian tasks to SkedPal for time blocking and scheduling
- Maintain task metadata like priorities, due dates, and tags
- Keep task completion status synchronized between both systems

## Features

### 1. Task Synchronization
- **Obsidian → SkedPal**: Convert Obsidian tasks to SkedPal tasks with proper metadata mapping
- **Task Updates**: Update existing tasks in SkedPal when they change in Obsidian
- **External ID Tracking**: Use Obsidian task IDs as external references in SkedPal

### 2. Metadata Mapping

| Obsidian | SkedPal |
|----------|---------|
| Priority (A) | HIGH |
| Priority (B) | MEDIUM |
| Priority (C/D) | LOW |
| Due Date (📅 YYYY-MM-DD) | Due Date (ISO 8601) |
| Tags (#tag) | Tags |
| Completion Status | Task Status |

### 3. Configuration

#### API Credentials
- **SkedPal API Key**: Your personal API key from SkedPal
- **Workspace ID**: Your SkedPal workspace identifier

#### Settings
- **Auto-sync**: Automatically sync when tasks are modified
- **Sync Interval**: How often to perform automatic sync (in seconds)
- **Include Completed Tasks**: Whether to sync completed tasks

## Setup Instructions

### 1. Get SkedPal API Credentials

1. Log into your SkedPal account
2. Navigate to Settings → API Keys
3. Generate a new API key
4. Copy your Workspace ID from the settings page

### 2. Configure the Plugin

1. Open Obsidian Settings
2. Go to Community Plugins → Obsidian Tasks - SkedPal Sync
3. Enter your SkedPal API Key and Workspace ID
4. Click "Test Connection" to verify credentials
5. Configure other settings as needed

### 3. Using the Integration

#### Manual Sync
- Use the command palette and search for "Sync tasks to SkedPal"
- Use the command palette and search for "Sync tasks from SkedPal"

#### Automatic Sync
- Enable "Auto-sync on task changes" in settings
- Set your preferred sync interval

## Task Processing

### Obsidian Task Detection
The plugin identifies tasks using:
- Obsidian's metadata cache (when available)
- File patterns (`**/tasks/**`, `**/*.task.md`)
- Task markers (`- [ ]`, `- [x]`)
- Extended Obsidian Tasks plugin syntax

### SkedPal Task Creation
When syncing to SkedPal, tasks are created with:
- **Title**: Cleaned task description (metadata removed)
- **Description**: Reference to original Obsidian location
- **Priority**: Mapped from Obsidian priority
- **Due Date**: Converted to ISO 8601 format
- **Tags**: Preserved from Obsidian tags
- **Status**: Mapped from completion status
- **External ID**: Original Obsidian task ID for tracking

## Error Handling

### Connection Issues
- Invalid API credentials are detected during connection test
- Network errors are caught and reported with user-friendly messages
- Failed sync operations are logged with detailed error information

### Data Validation
- Missing required fields are handled gracefully
- Invalid date formats are logged as warnings
- Task creation failures don't stop the entire sync process

## Testing

Run the test suite to verify the integration:

```bash
npm test
```

Tests cover:
- Task conversion between formats
- API request handling
- Error scenarios
- Configuration validation

## Troubleshooting

### Common Issues

1. **"Failed to connect to SkedPal"**
   - Verify API key and workspace ID
   - Check internet connection
   - Ensure SkedPal API is accessible

2. **Tasks not syncing**
   - Check if files match task patterns
   - Verify task detection in Obsidian
   - Check plugin logs for errors

3. **Metadata not preserved**
   - Ensure proper Obsidian task syntax
   - Check priority and date formatting
   - Verify tag syntax (#tag)

### Logs and Debugging

Enable debug logging in Obsidian to see detailed sync information:

1. Open Developer Tools (Ctrl+Shift+I)
2. Check Console for plugin logs
3. Look for "Obsidian Tasks - SkedPal Sync" messages

## API Reference

### SkedPalClient Methods

- `syncTasksToSkedPal(obsidianTasks)`: Sync Obsidian tasks to SkedPal
- `getTasks()`: Retrieve tasks from SkedPal
- `testConnection()`: Test API connectivity
- `convertToObsidianTask(skedPalTask)`: Convert SkedPal task to Obsidian format

### Task Conversion

See `skedpal-client.ts` for detailed conversion logic between Obsidian and SkedPal task formats.

## Security

- API credentials are stored securely in Obsidian's settings
- All API communication uses HTTPS
- No task data is stored outside your local environment

---

For additional support, please refer to the main project documentation or create an issue in the GitHub repository.