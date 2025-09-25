import { PluginSettingTab, App, Plugin } from 'obsidian';

export interface TaskSyncSettings {
    autoSync: boolean;
    skedPalApiKey: string;
    skedPalWorkspaceId: string;
    taskFilePatterns: string[];
    syncInterval: number;
    includeCompletedTasks: boolean;
}

export const DEFAULT_SETTINGS: TaskSyncSettings = {
    autoSync: false,
    skedPalApiKey: '',
    skedPalWorkspaceId: '',
    taskFilePatterns: ['**/*.md'],
    syncInterval: 300, // 5 minutes in seconds
    includeCompletedTasks: false
};