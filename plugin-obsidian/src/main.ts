// Conditional import for Obsidian API - supports both real and mock environments
let Plugin: any, App: any, TFile: any, Notice: any;

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

export default class TaskSyncPlugin extends Plugin {
    settings: TaskSyncSettings;
    taskManager: TaskManager;

    async onload() {
        console.log('Loading Obsidian Tasks - SkedPal Sync plugin');

        // Load settings
        await this.loadSettings();

        // Initialize task manager
        this.taskManager = new TaskManager(this.app, this.settings);
        
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

        // Register event handlers for task changes
        this.registerEvent(
            this.app.vault.on('modify', (file: TFile) => {
                if (this.isTaskFile(file)) {
                    this.handleTaskChange(file);
                }
            })
        );

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

    private isTaskFile(file: TFile): boolean {
        // Check if file contains task markers or is in a tasks directory
        return file.extension === 'md' && 
               (file.path.includes('/tasks/') || 
                file.name.toLowerCase().includes('task'));
    }

    private async handleTaskChange(file: TFile) {
        if (this.settings.autoSync) {
            await this.syncTasks();
        }
    }

    private async syncTasks() {
        try {
            const tasks = await this.taskManager.collectTasks();
            new Notice(`Found ${tasks.length} tasks to sync`);
            // TODO: Implement SkedPal sync logic
        } catch (error) {
            console.error('Error syncing tasks:', error);
            new Notice('Error syncing tasks: ' + error.message);
        }
    }

    private async syncFromSkedPal() {
        try {
            // TODO: Implement SkedPal import logic
            new Notice('Syncing tasks from SkedPal...');
        } catch (error) {
            console.error('Error syncing from SkedPal:', error);
            new Notice('Error syncing from SkedPal: ' + error.message);
        }
    }
}