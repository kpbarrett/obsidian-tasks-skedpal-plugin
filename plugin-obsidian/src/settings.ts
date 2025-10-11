import { PluginSettingTab, App, Plugin } from 'obsidian';

export interface TaskSyncSettings {
    autoSync: boolean;
    skedPalApiKey: string;
    skedPalWorkspaceId: string;
    taskFilePatterns: string[];
    syncInterval: number;
    includeCompletedTasks: boolean;
    conflictResolutionStrategy: string;
    maxRetryAttempts: number;
    syncDirection: 'bidirectional' | 'toSkedPal' | 'fromSkedPal';
    enableStatusTracking: boolean;
}

export const DEFAULT_SETTINGS: TaskSyncSettings = {
    autoSync: false,
    skedPalApiKey: '',
    skedPalWorkspaceId: '',
    taskFilePatterns: ['**/*.md'],
    syncInterval: 300, // 5 minutes in seconds
    includeCompletedTasks: false,
    conflictResolutionStrategy: 'most_recent',
    maxRetryAttempts: 3,
    syncDirection: 'bidirectional',
    enableStatusTracking: true
};