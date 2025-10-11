# Obsidian Tasks - SkedPal Sync Plugin

A plugin that connects Obsidian Tasks to SkedPal for bidirectional synchronization.

## Features

- **Bidirectional Sync**: Sync tasks between Obsidian and SkedPal
- **Auto-sync**: Automatically sync tasks when they change in Obsidian
- **Task Metadata**: Support for due dates, priorities, tags, and more
- **Flexible Configuration**: Customize which files and tasks to sync

## Quick Start

### 1. Get SkedPal API Credentials

1. Log in to your SkedPal account
2. Go to **Settings → API Keys**
3. Generate a new API key
4. Copy your **Workspace ID** from the API settings

### 2. Install and Configure Plugin

1. Install the plugin in Obsidian
2. Open **Settings → Task Sync Settings**
3. Enter your SkedPal API Key and Workspace ID
4. Configure sync options as needed

### 3. Test Connection

1. Use the **Test Connection** button in settings
2. Or run the **Test SkedPal connection** command
3. Verify successful connection

### 4. Start Syncing

- Use **Sync tasks to SkedPal** command to push tasks
- Use **Sync tasks from SkedPal** command to pull tasks
- Enable **Auto-sync** for automatic synchronization

## Commands

- **Sync tasks to SkedPal**: Push all tasks from Obsidian to SkedPal
- **Sync tasks from SkedPal**: Pull tasks from SkedPal to Obsidian
- **Test SkedPal connection**: Verify your API credentials work

## Configuration

### Basic Settings

- **SkedPal API Key**: Your SkedPal API key
- **SkedPal Workspace ID**: Your SkedPal workspace ID
- **Auto-sync**: Automatically sync on task changes

### Advanced Settings

- **Sync interval**: How often to auto-sync (in seconds)
- **Include completed tasks**: Whether to sync completed tasks
- **Task file patterns**: Which files to scan for tasks

## Task Support

The plugin supports Obsidian's extended task syntax:

- ✅ Completion status
- (A) Priority levels
- 📅 Due dates
- ⏳ Scheduled dates
- 🛫 Start dates
- 🔁 Recurrence patterns
- #tags for categorization

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify your API key and workspace ID
   - Check your internet connection
   - Ensure SkedPal API is accessible

2. **Tasks Not Syncing**
   - Check if files match task file patterns
   - Verify tasks use proper Obsidian syntax
   - Check console for error messages

3. **Auto-sync Not Working**
   - Ensure auto-sync is enabled in settings
   - Check sync interval is not set to 0
   - Verify task files are being detected

### Getting Help

- Check the console for detailed error messages
- Review the plugin settings for configuration issues
- Ensure your Obsidian and SkedPal accounts are properly set up

## Development

This plugin is built with TypeScript and follows Obsidian's plugin development guidelines.

### Building

```bash
cd plugin-obsidian
npm run build
```

### Testing

```bash
npm test
```

## License

MIT License - see LICENSE file for details.