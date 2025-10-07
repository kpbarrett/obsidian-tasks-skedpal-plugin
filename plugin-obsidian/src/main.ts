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
import { SynchronizationEngine } from './sync-engine';

export default class TaskSyncPlugin extends Plugin {
    settings: TaskSyncSettings;
    taskManager: TaskManager;
    syncEngine: SynchronizationEngine;

    async onload() {
        console.log('Loading Obsidian Tasks - SkedPal Sync plugin');

        // Load settings
        await this.loadSettings();

        // Initialize task manager
        this.taskManager = new TaskManager(this.app, this.settings);
        
        // Initialize synchronization engine
        this.syncEngine = new SynchronizationEngine(this.settings);
        
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
            id: 'get-sync-status',
            name: 'Get synchronization status',
            callback: () => {
                this.showSyncStatus();
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
            const tasks = await this.taskManager.collectTasks();
            new Notice(`Found ${tasks.length} tasks to sync`);
            
            // TODO: Get SkedPal tasks (placeholder for now)
            const skedpalTasks: any[] = [];
            
            // Use synchronization engine for bidirectional sync
            const syncStatus = await this.syncEngine.synchronizeTasks(tasks, skedpalTasks);
            
            if (syncStatus.lastError) {
                new Notice(`Sync completed with errors: ${syncStatus.lastError}`);
            } else {
                new Notice(`Sync completed: ${syncStatus.tasksSynced} tasks synced, ${syncStatus.conflictsResolved} conflicts resolved`);
            }
        } catch (error) {
            console.error('Error syncing tasks:', error);
            new Notice('Error syncing tasks: ' + error.message);
        }
    }

    private async syncFromSkedPal() {
        try {
            // TODO: Get SkedPal tasks (placeholder for now)
            const skedpalTasks: any[] = [];
            
            // Get current Obsidian tasks for comparison
            const obsidianTasks = await this.taskManager.collectTasks();
            
            // Use synchronization engine for one-way sync from SkedPal
            const syncStatus = await this.syncEngine.synchronizeTasks(obsidianTasks, skedpalTasks);
            
            if (syncStatus.lastError) {
                new Notice(`Sync from SkedPal completed with errors: ${syncStatus.lastError}`);
            } else {
                new Notice(`Sync from SkedPal completed: ${syncStatus.tasksSynced} tasks synced`);
            }
        } catch (error) {
            console.error('Error syncing from SkedPal:', error);
            new Notice('Error syncing from SkedPal: ' + error.message);
        }
    }

    private showSyncStatus() {
        const status = this.syncEngine.getStatus();
        const statusMessage = `Synchronization Status:
Last Sync: ${status.lastSyncTime.toLocaleString()}
In Progress: ${status.syncInProgress ? 'Yes' : 'No'}
Tasks Synced: ${status.tasksSynced}
Conflicts Resolved: ${status.conflictsResolved}
Last Error: ${status.lastError || 'None'}`;
        
        new Notice(statusMessage);
    }
}