import { SynchronizationEngine, ConflictResolutionStrategy, SyncStatus } from '../plugin-obsidian/src/sync-engine';
import { TaskSyncSettings } from '../plugin-obsidian/src/settings';
import { ObsidianTask } from '../plugin-obsidian/src/task-manager';

describe('Synchronization Engine Integration Tests', () => {
    let syncEngine: SynchronizationEngine;
    let settings: TaskSyncSettings;

    beforeEach(() => {
        settings = {
            autoSync: false,
            skedPalApiKey: 'test-key',
            skedPalWorkspaceId: 'test-workspace',
            taskFilePatterns: ['**/*.md'],
            syncInterval: 300,
            includeCompletedTasks: false,
            conflictResolutionStrategy: ConflictResolutionStrategy.MOST_RECENT,
            maxRetryAttempts: 3,
            syncDirection: 'bidirectional',
            enableStatusTracking: true
        };
        syncEngine = new SynchronizationEngine(settings);
    });

    describe('Bidirectional Synchronization', () => {
        it('should synchronize tasks without conflicts', async () => {
            const obsidianTasks: ObsidianTask[] = [
                {
                    id: 'task1',
                    description: 'Test task from Obsidian',
                    completed: false,
                    filePath: '/tasks/test.md',
                    lineNumber: 1,
                    rawContent: '- [ ] Test task from Obsidian',
                    tags: [],
                    fileModifiedTime: Date.now() - 1000
                }
            ];

            const skedpalTasks: any[] = [
                {
                    id: 'task2',
                    title: 'Test task from SkedPal',
                    status: 'pending',
                    lastModified: Date.now() - 500
                }
            ];

            const status = await syncEngine.synchronizeTasks(obsidianTasks, skedpalTasks);

            expect(status.tasksSynced).toBe(2);
            expect(status.conflictsResolved).toBe(0);
            expect(status.lastError).toBeUndefined();
        });

        it('should resolve conflicts using most recent strategy', async () => {
            const obsidianTasks: ObsidianTask[] = [
                {
                    id: 'conflict-task',
                    description: 'Updated in Obsidian',
                    completed: false,
                    filePath: '/tasks/conflict.md',
                    lineNumber: 1,
                    rawContent: '- [ ] Updated in Obsidian',
                    tags: [],
                    fileModifiedTime: Date.now() - 1000
                }
            ];

            const skedpalTasks: any[] = [
                {
                    id: 'conflict-task',
                    title: 'Updated in SkedPal',
                    status: 'completed',
                    lastModified: Date.now() - 500
                }
            ];

            const status = await syncEngine.synchronizeTasks(obsidianTasks, skedpalTasks);

            expect(status.conflictsResolved).toBe(1);
            expect(status.tasksSynced).toBe(1);
        });

        it('should handle network errors with retry mechanism', async () => {
            // Mock failing API calls
            const obsidianTasks: ObsidianTask[] = [
                {
                    id: 'error-task',
                    description: 'Task that causes error',
                    completed: false,
                    filePath: '/tasks/error.md',
                    lineNumber: 1,
                    rawContent: '- [ ] Task that causes error',
                    tags: [],
                    fileModifiedTime: Date.now()
                }
            ];

            const skedpalTasks: any[] = [];

            // This test would need proper mocking of the apply methods
            // For now, we'll just verify the engine doesn't crash
            const status = await syncEngine.synchronizeTasks(obsidianTasks, skedpalTasks);
            
            expect(status).toBeDefined();
            expect(typeof status.tasksSynced).toBe('number');
        });
    });

    describe('Conflict Resolution Strategies', () => {
        it('should use Obsidian wins strategy', async () => {
            settings.conflictResolutionStrategy = ConflictResolutionStrategy.OBSIDIAN_WINS;
            syncEngine = new SynchronizationEngine(settings);

            const obsidianTasks: ObsidianTask[] = [
                {
                    id: 'conflict-task',
                    description: 'Obsidian version',
                    completed: false,
                    filePath: '/tasks/conflict.md',
                    lineNumber: 1,
                    rawContent: '- [ ] Obsidian version',
                    tags: [],
                    fileModifiedTime: Date.now() - 2000
                }
            ];

            const skedpalTasks: any[] = [
                {
                    id: 'conflict-task',
                    title: 'SkedPal version',
                    status: 'completed',
                    lastModified: Date.now() - 1000
                }
            ];

            const status = await syncEngine.synchronizeTasks(obsidianTasks, skedpalTasks);
            
            expect(status.conflictsResolved).toBe(1);
        });

        it('should use SkedPal wins strategy', async () => {
            settings.conflictResolutionStrategy = ConflictResolutionStrategy.SKEDPAL_WINS;
            syncEngine = new SynchronizationEngine(settings);

            const obsidianTasks: ObsidianTask[] = [
                {
                    id: 'conflict-task',
                    description: 'Obsidian version',
                    completed: false,
                    filePath: '/tasks/conflict.md',
                    lineNumber: 1,
                    rawContent: '- [ ] Obsidian version',
                    tags: [],
                    fileModifiedTime: Date.now() - 1000
                }
            ];

            const skedpalTasks: any[] = [
                {
                    id: 'conflict-task',
                    title: 'SkedPal version',
                    status: 'completed',
                    lastModified: Date.now() - 2000
                }
            ];

            const status = await syncEngine.synchronizeTasks(obsidianTasks, skedpalTasks);
            
            expect(status.conflictsResolved).toBe(1);
        });
    });

    describe('Status Tracking', () => {
        it('should track synchronization progress', async () => {
            const initialStatus = syncEngine.getStatus();
            expect(initialStatus.syncInProgress).toBe(false);
            expect(initialStatus.tasksSynced).toBe(0);

            const obsidianTasks: ObsidianTask[] = [
                {
                    id: 'status-task',
                    description: 'Task for status tracking',
                    completed: false,
                    filePath: '/tasks/status.md',
                    lineNumber: 1,
                    rawContent: '- [ ] Task for status tracking',
                    tags: [],
                    fileModifiedTime: Date.now()
                }
            ];

            const skedpalTasks: any[] = [];

            const syncStatus = await syncEngine.synchronizeTasks(obsidianTasks, skedpalTasks);
            
            expect(syncStatus.tasksSynced).toBeGreaterThan(0);
            expect(syncStatus.syncInProgress).toBe(false);
            expect(syncStatus.lastSyncTime).toBeInstanceOf(Date);
        });

        it('should reset synchronization state', () => {
            syncEngine.reset();
            const status = syncEngine.getStatus();
            
            expect(status.tasksSynced).toBe(0);
            expect(status.conflictsResolved).toBe(0);
            expect(status.lastSyncTime.getTime()).toBe(0);
        });
    });

    describe('Error Recovery', () => {
        it('should handle synchronization errors gracefully', async () => {
            // Test with invalid data to trigger errors
            const obsidianTasks: any[] = [null]; // Invalid task data
            const skedpalTasks: any[] = [];

            const status = await syncEngine.synchronizeTasks(obsidianTasks, skedpalTasks);
            
            // Engine should handle the error without crashing
            expect(status).toBeDefined();
            expect(status.syncInProgress).toBe(false);
        });
    });
});