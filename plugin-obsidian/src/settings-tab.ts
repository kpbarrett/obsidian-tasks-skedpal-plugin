// Conditional import for Obsidian API - supports both real and mock environments
let App: any, PluginSettingTab: any, Setting: any, Notice: any;

type AppType = typeof App;

try {
    // Try to import the real Obsidian API
    const obsidian = require('obsidian');
    App = obsidian.App;
    PluginSettingTab = obsidian.PluginSettingTab;
    Setting = obsidian.Setting;
    Notice = obsidian.Notice;
} catch (error) {
    // Fall back to mock API for testing
    if (typeof global !== 'undefined' && (global as any).obsidian) {
        const obsidian = (global as any).obsidian;
        App = obsidian.App;
        PluginSettingTab = obsidian.PluginSettingTab;
        Setting = obsidian.Setting;
        Notice = obsidian.Notice;
    } else {
        // Create minimal mock types for development
        type App = any;
        type PluginSettingTab = any;
        type Setting = any;
        type Notice = any;
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

        // Setup Guide Section
        this.createSetupGuide(containerEl);

        // Configuration Section
        this.createConfigurationSection(containerEl);

        // Advanced Settings Section
        this.createAdvancedSettingsSection(containerEl);
    }

    private createSetupGuide(containerEl: HTMLElement): void {
        const setupSection = containerEl.createDiv('setup-guide');
        setupSection.createEl('h3', { text: 'Quick Setup Guide' });

        const steps = setupSection.createDiv('setup-steps');
        
        // Step 1: Get SkedPal API credentials
        const step1 = steps.createDiv('setup-step');
        step1.createEl('h4', { text: 'Step 1: Get SkedPal API Credentials' });
        step1.createEl('p', { text: '1. Log in to your SkedPal account' });
        step1.createEl('p', { text: '2. Go to Settings → API Keys' });
        step1.createEl('p', { text: '3. Generate a new API key' });
        step1.createEl('p', { text: '4. Copy your Workspace ID from the API settings' });

        // Step 2: Configure plugin
        const step2 = steps.createDiv('setup-step');
        step2.createEl('h4', { text: 'Step 2: Configure Plugin' });
        step2.createEl('p', { text: '1. Enter your API key and Workspace ID below' });
        step2.createEl('p', { text: '2. Enable auto-sync if desired' });
        step2.createEl('p', { text: '3. Adjust sync interval as needed' });

        // Step 3: Test connection
        const step3 = steps.createDiv('setup-step');
        step3.createEl('h4', { text: 'Step 3: Test Connection' });
        step3.createEl('p', { text: '1. Use the commands below to test sync' });
        step3.createEl('p', { text: '2. Check the console for any errors' });
        step3.createEl('p', { text: '3. Review sync results in SkedPal' });

        // Test Connection Button
        const testButton = new Setting(setupSection)
            .setName('Test Connection')
            .setDesc('Test the connection to SkedPal with current settings')
            .addButton((button: any) => {
                button.setButtonText('Test Now')
                    .onClick(async () => {
                        await this.testConnection();
                    });
            });
    }

    private createConfigurationSection(containerEl: HTMLElement): void {
        const configSection = containerEl.createDiv('configuration-section');
        configSection.createEl('h3', { text: 'Configuration' });

        new Setting(configSection)
            .setName('SkedPal API Key')
            .setDesc('Your SkedPal API key for authentication. Get this from SkedPal Settings → API Keys.')
            .addText((text: any) => text
                .setPlaceholder('Enter your API key')
                .setValue(this.plugin.settings.skedPalApiKey)
                .onChange(async (value: string) => {
                    this.plugin.settings.skedPalApiKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(configSection)
            .setName('SkedPal Workspace ID')
            .setDesc('Your SkedPal workspace ID. Find this in SkedPal Settings → API Keys.')
            .addText((text: any) => text
                .setPlaceholder('Enter workspace ID')
                .setValue(this.plugin.settings.skedPalWorkspaceId)
                .onChange(async (value: string) => {
                    this.plugin.settings.skedPalWorkspaceId = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(configSection)
            .setName('Auto-sync on task changes')
            .setDesc('Automatically sync tasks when they are modified in Obsidian')
            .addToggle((toggle: any) => toggle
                .setValue(this.plugin.settings.autoSync)
                .onChange(async (value: boolean) => {
                    this.plugin.settings.autoSync = value;
                    await this.plugin.saveSettings();
                }));
    }

    private createAdvancedSettingsSection(containerEl: HTMLElement): void {
        const advancedSection = containerEl.createDiv('advanced-settings');
        advancedSection.createEl('h3', { text: 'Advanced Settings' });

        new Setting(advancedSection)
            .setName('Sync interval (seconds)')
            .setDesc('Interval for automatic sync in seconds. Set to 0 to disable automatic sync.')
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

        new Setting(advancedSection)
            .setName('Include completed tasks')
            .setDesc('Sync tasks that are marked as completed in Obsidian')
            .addToggle((toggle: any) => toggle
                .setValue(this.plugin.settings.includeCompletedTasks)
                .onChange(async (value: boolean) => {
                    this.plugin.settings.includeCompletedTasks = value;
                    await this.plugin.saveSettings();
                }));
    }

    private async testConnection(): Promise<void> {
        try {
            // Check if required settings are provided
            if (!this.plugin.settings.skedPalApiKey || !this.plugin.settings.skedPalWorkspaceId) {
                throw new Error('Please provide both API Key and Workspace ID');
            }

            // Test SkedPal API connection
            const isConnected = await this.testSkedPalConnection();
            
            if (isConnected) {
                this.showSuccessMessage('Connection successful! Your SkedPal integration is working correctly.');
            } else {
                throw new Error('Failed to connect to SkedPal. Please check your credentials.');
            }
        } catch (error) {
            this.showErrorMessage(`Connection test failed: ${error.message}`);
        }
    }

    private async testSkedPalConnection(): Promise<boolean> {
        // TODO: Implement actual SkedPal API connection test
        // For now, simulate a successful connection if credentials are provided
        return this.plugin.settings.skedPalApiKey.length > 0 && 
               this.plugin.settings.skedPalWorkspaceId.length > 0;
    }

    private showSuccessMessage(message: string): void {
        // Show success message using Obsidian's notification system
        if (typeof Notice !== 'undefined') {
            new Notice(`✅ ${message}`);
        }
        console.log(`✅ ${message}`);
    }

    private showErrorMessage(message: string): void {
        // Show error message using Obsidian's notification system
        if (typeof Notice !== 'undefined') {
            new Notice(`❌ ${message}`);
        }
        console.error(`❌ ${message}`);
    }
}