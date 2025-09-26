// Conditional import for Obsidian API - supports both real and mock environments
let App: any, PluginSettingTab: any, Setting: any;

type AppType = typeof App;

try {
    // Try to import the real Obsidian API
    const obsidian = require('obsidian');
    App = obsidian.App;
    PluginSettingTab = obsidian.PluginSettingTab;
    Setting = obsidian.Setting;
} catch (error) {
    // Fall back to mock API for testing
    if (typeof global !== 'undefined' && (global as any).obsidian) {
        const obsidian = (global as any).obsidian;
        App = obsidian.App;
        PluginSettingTab = obsidian.PluginSettingTab;
        Setting = obsidian.Setting;
    } else {
        // Create minimal mock types for development
        type App = any;
        type PluginSettingTab = any;
        type Setting = any;
    }
}

import TaskSyncPlugin from './main';
import { TaskSyncSettings } from './settings';

export class TaskSyncSettingTab extends PluginSettingTab {
    plugin: TaskSyncPlugin;

    constructor(app: AppType, plugin: TaskSyncPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Task Sync Settings' });

        new Setting(containerEl)
            .setName('Auto-sync on task changes')
            .setDesc('Automatically sync tasks when they are modified')
            .addToggle((toggle: any) => toggle
                .setValue(this.plugin.settings.autoSync)
                .onChange(async (value: boolean) => {
                    this.plugin.settings.autoSync = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('SkedPal API Key')
            .setDesc('Your SkedPal API key for authentication')
            .addText((text: any) => text
                .setPlaceholder('Enter your API key')
                .setValue(this.plugin.settings.skedPalApiKey)
                .onChange(async (value: string) => {
                    this.plugin.settings.skedPalApiKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('SkedPal Workspace ID')
            .setDesc('Your SkedPal workspace ID')
            .addText((text: any) => text
                .setPlaceholder('Enter workspace ID')
                .setValue(this.plugin.settings.skedPalWorkspaceId)
                .onChange(async (value: string) => {
                    this.plugin.settings.skedPalWorkspaceId = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Sync interval (seconds)')
            .setDesc('Interval for automatic sync in seconds (0 to disable)')
            .addText((text: any) => text
                .setPlaceholder('300')
                .setValue(this.plugin.settings.syncInterval.toString())
                .onChange(async (value: string) => {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue)) {
                        this.plugin.settings.syncInterval = numValue;
                        await this.plugin.saveSettings();
                    }
                }));

        new Setting(containerEl)
            .setName('Include completed tasks')
            .setDesc('Sync tasks that are marked as completed')
            .addToggle((toggle: any) => toggle
                .setValue(this.plugin.settings.includeCompletedTasks)
                .onChange(async (value: boolean) => {
                    this.plugin.settings.includeCompletedTasks = value;
                    await this.plugin.saveSettings();
                }));
    }
}