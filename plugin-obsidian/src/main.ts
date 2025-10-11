// Conditional import for Obsidian API - supports both real and mock environments
let Plugin: any, App: any, TFile: any, Notice: any;

type AppType = typeof App;
type TFileType = typeof TFile;

try {
    // Try to import the real Obsidian API
    const obsidian = require('obsidian');
    Plugin = obsidian.Plugin;
    App = obsidian.App;
    TFile = obsidian.TFile;
    Notice = obsidian.Notice;
} catch (error) {
    // Fall back to mock API for testing
    if (typeof global !== 'undefined' && (global as any).obsidian) {
        const obsidian = (global as any).obsidian;
        Plugin = obsidian.Plugin;
        App = obsidian.App;
        TFile = obsidian.TFile;
        Notice = obsidian.Notice;
    } else {
        // Create minimal mock types for development
        type Plugin = any;
        type App = any;
        type TFile = any;
        type Notice = any;
    }
}

import { TaskManager } from './task-manager';
import { TaskSyncSettings, DEFAULT_SETTINGS } from './settings';
import { TaskSyncSettingTab } from './settings-tab';
import { SkedPalClient, SkedPalSyncResult } from './skedpal-client';

export default class TaskSyncPlugin extends Plugin {
    settings: TaskSyncSettings;
    taskManager: TaskManager;
    skedPalClient: SkedPalClient;

    async onload() {
        console.log('Loading Obsidian Tasks - SkedPal Sync plugin');

        // Load settings
        await this.loadSettings();

        // Initialize task manager
        this.taskManager = new TaskManager(this.app, this.settings);
        
        // Initialize SkedPal client
        this.skedPalClient = new SkedPalClient(this.settings.skedPalApiKey, this.settings.skedPalWorkspaceId);
        
        // Register settings tab
        this.addSettingTab(new TaskSyncSettingTab(this.app, this));

        // Register commands
        this.addCommand({
            id: 'sync-tasks-to-skedpal',
            name: 'Sync tasks to SkedPal',
            callback: () => {
                this.syncTasks();
            }
        });

        this.addCommand({
            id: 'sync-tasks-from-skedpal',
            name: 'Sync tasks from SkedPal',
            callback: () => {
                this.syncFromSkedPal();
            }
        });

        this.addCommand({
            id: 'test-skedpal-connection',
            name: 'Test SkedPal connection',
            callback: () => {
                this.testConnection();
            }
        });

        // Register event handlers for task changes
        this.registerEvent(
            this.app.vault.on('modify', (file: TFileType) => {
                if (this.isTaskFile(file)) {
                    this.handleTaskChange(file);
                }
            })
        );

        // Show setup guidance if not configured
        this.showSetupGuidance();

        new Notice('Obsidian Tasks - SkedPal Sync plugin loaded successfully');
    }

    onunload() {
        console.log('Unloading Obsidian Tasks - SkedPal Sync plugin');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private isTaskFile(file: TFileType): boolean {
        // Check if file contains task markers or is in a tasks directory
        // Also check if file has tasks in metadata cache
        if (file.extension !== 'md') {
            return false;
        }

        // Check file path patterns
        if (file.path.includes('/tasks/') || file.name.toLowerCase().includes('task')) {
            return true;
        }

        // Check if file has tasks in metadata cache
        try {
            const cache = this.app.metadataCache?.getFileCache(file);
            if (cache?.listItems) {
                return cache.listItems.some((item: any) => item.task !== undefined);
            }
        } catch (error) {
            // If metadata cache is not available, fall back to basic check
        }

        return false;
    }

    private async handleTaskChange(file: TFileType) {
        if (this.settings.autoSync) {
            await this.syncTasks();
        }
    }

    private async syncTasks() {
        try {
            // Check if configured
            if (!this.isConfigured()) {
                this.showSetupRequiredMessage();
                return;
            }

            // Test connection first
            const connectionOk = await this.skedPalClient.testConnection();
            if (!connectionOk) {
                new Notice('Failed to connect to SkedPal. Please check your API credentials.');
                return;
            }

            const tasks = await this.taskManager.collectTasks();
            new Notice(`Found ${tasks.length} tasks to sync to SkedPal...`);
            
            const result = await this.skedPalClient.syncTasksToSkedPal(tasks);
            
            if (result.success) {
                new Notice(`Successfully synced ${result.syncedTasks} tasks to SkedPal`);
                if (result.warnings.length > 0) {
                    console.warn('SkedPal sync warnings:', result.warnings);
                }
            } else {
                new Notice(`Failed to sync tasks to SkedPal. ${result.errors.length} errors occurred.`);
                console.error('SkedPal sync errors:', result.errors);
            }
        } catch (error) {
            console.error('Error syncing tasks to SkedPal:', error);
            new Notice('Error syncing tasks to SkedPal: ' + error.message);
        }
    }

    private async syncFromSkedPal() {
        try {
            // Check if configured
            if (!this.isConfigured()) {
                this.showSetupRequiredMessage();
                return;
            }

            // Test connection first
            const connectionOk = await this.skedPalClient.testConnection();
            if (!connectionOk) {
                new Notice('Failed to connect to SkedPal. Please check your API credentials.');
                return;
            }

            new Notice('Syncing tasks from SkedPal...');
            
            // Get tasks from SkedPal
            const skedPalTasks = await this.skedPalClient.getTasks();
            new Notice(`Found ${skedPalTasks.length} tasks in SkedPal`);
            
            // For now, just show a notice - in a real implementation,
            // we would convert these to Obsidian tasks and create/update them
            if (skedPalTasks.length > 0) {
                new Notice(`Found ${skedPalTasks.length} tasks in SkedPal. Import functionality coming soon.`);
            } else {
                new Notice('No tasks found in SkedPal');
            }
        } catch (error) {
            console.error('Error syncing from SkedPal:', error);
            new Notice('Error syncing from SkedPal: ' + error.message);
        }
    }

    private async testConnection() {
        try {
            // Check if configured
            if (!this.isConfigured()) {
                this.showSetupRequiredMessage();
                return;
            }

            new Notice('Testing SkedPal connection...');
            
            // Test connection
            const connectionOk = await this.skedPalClient.testConnection();
            
            if (connectionOk) {
                new Notice('✅ SkedPal connection test successful!');
            } else {
                new Notice('❌ Failed to connect to SkedPal. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error testing connection:', error);
            new Notice('Error testing connection: ' + error.message);
        }
    }

    private isConfigured(): boolean {
        return this.settings.skedPalApiKey.length > 0 && 
               this.settings.skedPalWorkspaceId.length > 0;
    }

    private showSetupRequiredMessage(): void {
        new Notice('⚠️ Please configure SkedPal API credentials in plugin settings first');
    }

    private showSetupGuidance(): void {
        if (!this.isConfigured()) {
            // Show setup guidance only once per session
            const hasShownGuidance = this.app.loadLocalStorage('task-sync-setup-guidance');
            if (!hasShownGuidance) {
                new Notice('🔧 Obsidian Tasks - SkedPal Sync plugin loaded. Please configure your SkedPal API credentials in settings.');
                this.app.saveLocalStorage('task-sync-setup-guidance', 'true');
            }
        }
    }
}