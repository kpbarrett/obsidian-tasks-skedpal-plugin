import { App, PluginSettingTab, Setting } from 'obsidian';
import TaskSyncPlugin from './main';
import { TaskSyncSettings } from './settings';

export class TaskSyncSettingTab extends PluginSettingTab {
    plugin: TaskSyncPlugin;

    constructor(app: App, plugin: TaskSyncPlugin) {
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
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoSync)
                .onChange(async (value) => {
                    this.plugin.settings.autoSync = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('SkedPal API Key')
            .setDesc('Your SkedPal API key for authentication')
            .addText(text => text
                .setPlaceholder('Enter your API key')
                .setValue(this.plugin.settings.skedPalApiKey)
                .onChange(async (value) => {
                    this.plugin.settings.skedPalApiKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('SkedPal Workspace ID')
            .setDesc('Your SkedPal workspace ID')
            .addText(text => text
                .setPlaceholder('Enter workspace ID')
                .setValue(this.plugin.settings.skedPalWorkspaceId)
                .onChange(async (value) => {
                    this.plugin.settings.skedPalWorkspaceId = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Sync interval (seconds)')
            .setDesc('Interval for automatic sync in seconds (0 to disable)')
            .addText(text => text
                .setPlaceholder('300')
                .setValue(this.plugin.settings.syncInterval.toString())
                .onChange(async (value) => {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue)) {
                        this.plugin.settings.syncInterval = numValue;
                        await this.plugin.saveSettings();
                    }
                }));

        new Setting(containerEl)
            .setName('Include completed tasks')
            .setDesc('Sync tasks that are marked as completed')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.includeCompletedTasks)
                .onChange(async (value) => {
                    this.plugin.settings.includeCompletedTasks = value;
                    await this.plugin.saveSettings();
                }));
    }
}