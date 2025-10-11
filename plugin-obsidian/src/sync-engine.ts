// Bidirectional Synchronization Engine for Obsidian-SkedPal Integration

import { ObsidianTask } from './task-manager';
import { TaskSyncSettings } from './settings';

// Synchronization status tracking
export interface SyncStatus {
    lastSyncTime: Date;
    syncInProgress: boolean;
    lastError?: string;
    tasksSynced: number;
    conflictsResolved: number;
    syncDirection: 'bidirectional' | 'toSkedPal' | 'fromSkedPal';
}

// Conflict resolution strategies
export enum ConflictResolutionStrategy {
    OBSIDIAN_WINS = 'obsidian_wins',
    SKEDPAL_WINS = 'skedpal_wins',
    MANUAL_RESOLUTION = 'manual_resolution',
    MOST_RECENT = 'most_recent'
}

// Task change detection
export interface TaskChange {
    taskId: string;
    timestamp: Date;
    changes: Partial<ObsidianTask>;
    source: 'obsidian' | 'skedpal';
}

// Synchronization engine class
export class SynchronizationEngine {
    private settings: TaskSyncSettings;
    private syncStatus: SyncStatus;
    private changeQueue: TaskChange[] = [];
    private retryCount = 0;
    private maxRetries = 3;

    constructor(settings: TaskSyncSettings) {
        this.settings = settings;
        this.syncStatus = {
            lastSyncTime: new Date(0),
            syncInProgress: false,
            tasksSynced: 0,
            conflictsResolved: 0,
            syncDirection: 'bidirectional'
        };
    }

    /**
     * Main synchronization method - orchestrates bidirectional sync
     */
    async synchronizeTasks(
        obsidianTasks: ObsidianTask[],
        skedpalTasks: any[]
    ): Promise<SyncStatus> {
        if (this.syncStatus.syncInProgress) {
            throw new Error('Synchronization already in progress');
        }

        this.syncStatus.syncInProgress = true;
        this.syncStatus.lastError = undefined;

        try {
            // Detect changes since last sync
            const obsidianChanges = await this.detectChanges(obsidianTasks, 'obsidian');
            const skedpalChanges = await this.detectChanges(skedpalTasks, 'skedpal');

            // Merge changes and resolve conflicts
            const mergedChanges = await this.mergeChanges(obsidianChanges, skedpalChanges);

            // Apply changes to both systems
            await this.applyChanges(mergedChanges);

            // Update sync status
            this.syncStatus.lastSyncTime = new Date();
            this.syncStatus.tasksSynced = mergedChanges.length;

        } catch (error) {
            this.syncStatus.lastError = error.message;
            await this.handleSyncError(error);
        } finally {
            this.syncStatus.syncInProgress = false;
        }

        return this.syncStatus;
    }

    /**
     * Detect changes since last synchronization
     */
    private async detectChanges(tasks: any[], source: 'obsidian' | 'skedpal'): Promise<TaskChange[]> {
        const changes: TaskChange[] = [];
        const lastSyncTime = this.syncStatus.lastSyncTime;

        for (const task of tasks) {
            // Check if task was modified since last sync
            const taskModifiedTime = this.getTaskModifiedTime(task, source);
            
            if (taskModifiedTime > lastSyncTime) {
                changes.push({
                    taskId: this.getTaskId(task, source),
                    timestamp: taskModifiedTime,
                    changes: this.extractChanges(task, source),
                    source
                });
            }
        }

        return changes;
    }

    /**
     * Get task modification time based on source system
     */
    private getTaskModifiedTime(task: any, source: 'obsidian' | 'skedpal'): Date {
        if (source === 'obsidian') {
            return new Date((task as ObsidianTask).fileModifiedTime || Date.now());
        } else {
            // SkedPal task modification time
            return new Date(task.lastModified || task.createdAt || Date.now());
        }
    }

    /**
     * Extract task ID based on source system
     */
    private getTaskId(task: any, source: 'obsidian' | 'skedpal'): string {
        if (source === 'obsidian') {
            return (task as ObsidianTask).id;
        } else {
            // SkedPal task ID
            return task.id || task.externalId;
        }
    }

    /**
     * Extract changes from task object
     */
    private extractChanges(task: any, source: 'obsidian' | 'skedpal'): Partial<ObsidianTask> {
        if (source === 'obsidian') {
            const obsidianTask = task as ObsidianTask;
            return {
                description: obsidianTask.description,
                completed: obsidianTask.completed,
                priority: obsidianTask.priority,
                dueDate: obsidianTask.dueDate,
                scheduledDate: obsidianTask.scheduledDate,
                startDate: obsidianTask.startDate,
                tags: obsidianTask.tags
            };
        } else {
            // Map SkedPal task to Obsidian task format
            return {
                description: task.title || task.name,
                completed: task.status === 'completed' || task.done,
                priority: this.mapSkedPalPriority(task.priority),
                dueDate: task.dueDate,
                scheduledDate: task.scheduledDate,
                startDate: task.startDate,
                tags: task.tags || task.categories || []
            };
        }
    }

    /**
     * Map SkedPal priority to Obsidian priority format
     */
    private mapSkedPalPriority(skedpalPriority: string): string | undefined {
        const priorityMap: { [key: string]: string } = {
            'high': 'A',
            'medium': 'B',
            'low': 'C',
            'none': 'D'
        };
        return priorityMap[skedpalPriority?.toLowerCase()];
    }

    /**
     * Merge changes from both systems and resolve conflicts
     */
    private async mergeChanges(
        obsidianChanges: TaskChange[],
        skedpalChanges: TaskChange[]
    ): Promise<TaskChange[]> {
        const mergedChanges: TaskChange[] = [];
        const conflictMap = new Map<string, TaskChange[]>();

        // Group changes by task ID
        for (const change of [...obsidianChanges, ...skedpalChanges]) {
            if (!conflictMap.has(change.taskId)) {
                conflictMap.set(change.taskId, []);
            }
            conflictMap.get(change.taskId)!.push(change);
        }

        // Resolve conflicts and merge
        for (const [taskId, changes] of conflictMap) {
            if (changes.length === 1) {
                // No conflict - single change
                mergedChanges.push(changes[0]);
            } else {
                // Conflict detected - resolve using strategy
                const resolvedChange = await this.resolveConflict(changes);
                if (resolvedChange) {
                    mergedChanges.push(resolvedChange);
                    this.syncStatus.conflictsResolved++;
                }
            }
        }

        return mergedChanges;
    }

    /**
     * Resolve conflicts between multiple changes to the same task
     */
    private async resolveConflict(changes: TaskChange[]): Promise<TaskChange | null> {
        const strategy = this.settings.conflictResolutionStrategy || ConflictResolutionStrategy.MOST_RECENT;

        switch (strategy) {
            case ConflictResolutionStrategy.OBSIDIAN_WINS:
                return changes.find(change => change.source === 'obsidian') || changes[0];

            case ConflictResolutionStrategy.SKEDPAL_WINS:
                return changes.find(change => change.source === 'skedpal') || changes[0];

            case ConflictResolutionStrategy.MOST_RECENT:
                return changes.reduce((latest, current) => 
                    current.timestamp > latest.timestamp ? current : latest
                );

            case ConflictResolutionStrategy.MANUAL_RESOLUTION:
                // For manual resolution, we'd need user interface
                // For now, return the most recent change
                console.warn('Manual conflict resolution not implemented, using most recent change');
                return changes.reduce((latest, current) => 
                    current.timestamp > latest.timestamp ? current : latest
                );

            default:
                return changes[0];
        }
    }

    /**
     * Apply merged changes to both systems
     */
    private async applyChanges(changes: TaskChange[]): Promise<void> {
        for (const change of changes) {
            try {
                if (change.source === 'obsidian') {
                    // Apply Obsidian changes to SkedPal
                    await this.applyToSkedPal(change);
                } else {
                    // Apply SkedPal changes to Obsidian
                    await this.applyToObsidian(change);
                }
            } catch (error) {
                console.error(`Failed to apply change for task ${change.taskId}:`, error);
                // Add to retry queue
                this.changeQueue.push(change);
            }
        }

        // Process retry queue if needed
        if (this.changeQueue.length > 0 && this.retryCount < this.maxRetries) {
            await this.retryFailedChanges();
        }
    }

    /**
     * Apply changes to SkedPal
     */
    private async applyToSkedPal(change: TaskChange): Promise<void> {
        // TODO: Implement SkedPal API integration
        // This would call the Chrome extension or direct API
        console.log('Applying to SkedPal:', change);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    /**
     * Apply changes to Obsidian
     */
    private async applyToObsidian(change: TaskChange): Promise<void> {
        // TODO: Implement Obsidian task update
        // This would update the task in the Obsidian vault
        console.log('Applying to Obsidian:', change);
        
        // Simulate file update
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    /**
     * Handle synchronization errors
     */
    private async handleSyncError(error: Error): Promise<void> {
        console.error('Synchronization error:', error);
        
        // Increment retry count
        this.retryCount++;
        
        if (this.retryCount <= this.maxRetries) {
            console.log(`Retrying synchronization in ${this.retryCount * 5000}ms`);
            await new Promise(resolve => setTimeout(resolve, this.retryCount * 5000));
            // TODO: Implement retry logic
        } else {
            console.error('Max retry attempts reached');
            // TODO: Notify user of persistent failure
        }
    }

    /**
     * Retry failed changes from the queue
     */
    private async retryFailedChanges(): Promise<void> {
        const failedChanges = [...this.changeQueue];
        this.changeQueue = [];

        for (const change of failedChanges) {
            try {
                if (change.source === 'obsidian') {
                    await this.applyToSkedPal(change);
                } else {
                    await this.applyToObsidian(change);
                }
            } catch (error) {
                console.error(`Retry failed for task ${change.taskId}:`, error);
                this.changeQueue.push(change);
            }
        }
    }

    /**
     * Get current synchronization status
     */
    getStatus(): SyncStatus {
        return { ...this.syncStatus };
    }

    /**
     * Reset synchronization state
     */
    reset(): void {
        this.syncStatus = {
            lastSyncTime: new Date(0),
            syncInProgress: false,
            tasksSynced: 0,
            conflictsResolved: 0,
            syncDirection: 'bidirectional'
        };
        this.changeQueue = [];
        this.retryCount = 0;
    }

    /**
     * Schedule automatic synchronization
     */
    scheduleAutoSync(intervalMinutes: number): void {
        // TODO: Implement scheduled synchronization
        console.log(`Auto-sync scheduled every ${intervalMinutes} minutes`);
        
        setInterval(async () => {
            if (!this.syncStatus.syncInProgress) {
                // Trigger sync (would need access to task managers)
                console.log('Auto-sync triggered');
            }
        }, intervalMinutes * 60 * 1000);
    }
}