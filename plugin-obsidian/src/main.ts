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
import { ChromeExtensionBridge } from './chrome-bridge';

export default class TaskSyncPlugin extends Plugin {
    settings: TaskSyncSettings;
    taskManager: TaskManager;
    chromeBridge: ChromeExtensionBridge;

    async onload() {
        console.log('Loading Obsidian Tasks - SkedPal Sync plugin');

        // Load settings
        await this.loadSettings();

        // Initialize task manager
        this.taskManager = new TaskManager(this.app, this.settings);
        
        // Initialize Chrome extension bridge
        this.chromeBridge = new ChromeExtensionBridge();
        this.initializeChromeBridge();
        
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

        // Chrome extension connection commands
        this.addCommand({
            id: 'check-chrome-connection',
            name: 'Check Chrome Extension Connection',
            callback: () => {
                this.checkChromeConnection();
            }
        });

        this.addCommand({
            id: 'reconnect-chrome-extension',
            name: 'Reconnect to Chrome Extension',
            callback: () => {
                this.reconnectChromeExtension();
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
        if (this.chromeBridge) {
            this.chromeBridge.disconnect();
        }
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

    private async initializeChromeBridge(): Promise<void> {
        try {
            const connected = await this.chromeBridge.connect();
            if (connected) {
                console.log('Chrome extension bridge initialized successfully');
                
                // Register message handlers
                this.chromeBridge.registerHandler('sync-tasks', async (data) => {
                    return await this.handleTaskSync(data);
                });

                this.chromeBridge.registerHandler('get-tasks', async () => {
                    return await this.taskManager.collectTasks();
                });
            } else {
                console.warn('Chrome extension bridge initialization failed');
            }
        } catch (error) {
            console.error('Error initializing Chrome extension bridge:', error);
        }
    }

    private async checkChromeConnection(): Promise<void> {
        const status = this.chromeBridge.getConnectionStatus();
        if (status.connected) {
            new Notice('Chrome extension is connected');
        } else {
            new Notice(`Chrome extension is not connected: ${status.lastError || 'Unknown error'}`);
        }
    }

    private async reconnectChromeExtension(): Promise<void> {
        try {
            new Notice('Attempting to reconnect to Chrome extension...');
            const connected = await this.chromeBridge.reconnect();
            if (connected) {
                new Notice('Successfully reconnected to Chrome extension');
            } else {
                new Notice('Failed to reconnect to Chrome extension');
            }
        } catch (error) {
            console.error('Error reconnecting to Chrome extension:', error);
            new Notice('Error reconnecting to Chrome extension: ' + error.message);
        }
    }

    private async handleTaskSync(data: any): Promise<any> {
        try {
            const tasks = await this.taskManager.collectTasks();
            return {
                success: true,
                tasks: tasks,
                count: tasks.length
            };
        } catch (error) {
            console.error('Error handling task sync:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}