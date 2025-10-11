import { test, expect, MockApp } from './setup';
import { SkedPalClient } from '../plugin-obsidian/src/skedpal-client';
import { ObsidianTask } from '../plugin-obsidian/src/task-manager';

// Mock fetch for testing
global.fetch = jest.fn();

// Test suite for REQ-004: Bidirectional synchronization with SkedPal scheduling system
test.describe('REQ-004: SkedPal Integration Tests', () => {
    let skedPalClient: SkedPalClient;
    const mockApiKey = 'test-api-key';
    const mockWorkspaceId = 'test-workspace';

    test.beforeEach(() => {
        skedPalClient = new SkedPalClient(mockApiKey, mockWorkspaceId);
        (fetch as jest.Mock).mockClear();
    });

    test('should initialize with API credentials', () => {
        expect(skedPalClient).toBeDefined();
        // Note: We can't directly access private properties in TypeScript
        // but we can test through public methods
    });

    test('should convert Obsidian task to SkedPal task correctly', () => {
        const obsidianTask: ObsidianTask = {
            id: 'test.md:1',
            description: 'Test task with priority (A) and due date 📅 2024-01-15',
            completed: false,
            filePath: 'test.md',
            lineNumber: 1,
            priority: 'A',
            dueDate: '2024-01-15',
            tags: ['work', 'important'],
            rawContent: '- [ ] Test task with priority (A) and due date 📅 2024-01-15'
        };

        // Use any to access private method for testing
        const skedPalTask = (skedPalClient as any).convertToSkedPalTask(obsidianTask);

        expect(skedPalTask.title).toBe('Test task with priority and due date');
        expect(skedPalTask.priority).toBe('HIGH');
        expect(skedPalTask.dueDate).toBe('2024-01-15T00:00:00Z');
        expect(skedPalTask.tags).toEqual(['work', 'important']);
        expect(skedPalTask.status).toBe('TODO');
        expect(skedPalTask.externalId).toBe('test.md:1');
    });

    test('should handle completed tasks correctly', () => {
        const obsidianTask: ObsidianTask = {
            id: 'test.md:2',
            description: 'Completed task',
            completed: true,
            filePath: 'test.md',
            lineNumber: 2,
            tags: [],
            rawContent: '- [x] Completed task'
        };

        const skedPalTask = (skedPalClient as any).convertToSkedPalTask(obsidianTask);
        expect(skedPalTask.status).toBe('COMPLETED');
    });

    test('should map priority levels correctly', () => {
        const priorities = [
            { obsidian: 'A', skedpal: 'HIGH' },
            { obsidian: 'B', skedpal: 'MEDIUM' },
            { obsidian: 'C', skedpal: 'LOW' },
            { obsidian: 'D', skedpal: 'LOW' }
        ];

        priorities.forEach(({ obsidian, skedpal }) => {
            const obsidianTask: ObsidianTask = {
                id: 'test.md:1',
                description: `Task with priority ${obsidian}`,
                completed: false,
                filePath: 'test.md',
                lineNumber: 1,
                priority: obsidian,
                tags: [],
                rawContent: `- [ ] Task with priority ${obsidian}`
            };

            const skedPalTask = (skedPalClient as any).convertToSkedPalTask(obsidianTask);
            expect(skedPalTask.priority).toBe(skedpal);
        });
    });

    test('should clean task descriptions properly', () => {
        const obsidianTask: ObsidianTask = {
            id: 'test.md:1',
            description: 'Task with (A) priority and 📅 2024-01-15 date and #tags',
            completed: false,
            filePath: 'test.md',
            lineNumber: 1,
            priority: 'A',
            dueDate: '2024-01-15',
            tags: ['tags'],
            rawContent: '- [ ] Task with (A) priority and 📅 2024-01-15 date and #tags'
        };

        const skedPalTask = (skedPalClient as any).convertToSkedPalTask(obsidianTask);
        
        // Description should be cleaned of metadata markers
        expect(skedPalTask.title).toBe('Task with priority and date and');
        expect(skedPalTask.title).not.toContain('(A)');
        expect(skedPalTask.title).not.toContain('📅 2024-01-15');
        // Tags are extracted separately but removed from description
    });

    test('should handle date formatting correctly', () => {
        const dateTests = [
            { input: '2024-01-15', expected: '2024-01-15T00:00:00Z' },
            { input: '2024-12-31', expected: '2024-12-31T00:00:00Z' }
        ];

        dateTests.forEach(({ input, expected }) => {
            const formatted = (skedPalClient as any).formatDateForSkedPal(input);
            expect(formatted).toBe(expected);
        });
    });

    test('should make API requests with correct headers', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true })
        });

        await (skedPalClient as any).makeApiRequest('/test');

        expect(fetch).toHaveBeenCalledWith(
            'https://api.skedpal.com/v1/test',
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Authorization': 'Bearer test-api-key',
                    'Content-Type': 'application/json',
                    'X-Workspace-Id': 'test-workspace'
                })
            })
        );
    });

    test('should handle API errors gracefully', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 401,
            statusText: 'Unauthorized'
        });

        await expect((skedPalClient as any).makeApiRequest('/test')).rejects.toThrow('SkedPal API error: 401 Unauthorized');
    });

    test('should sync tasks to SkedPal successfully', async () => {
        const obsidianTasks: ObsidianTask[] = [
            {
                id: 'test.md:1',
                description: 'Task 1',
                completed: false,
                filePath: 'test.md',
                lineNumber: 1,
                tags: [],
                rawContent: '- [ ] Task 1'
            },
            {
                id: 'test.md:2',
                description: 'Task 2',
                completed: false,
                filePath: 'test.md',
                lineNumber: 2,
                tags: [],
                rawContent: '- [ ] Task 2'
            }
        ];

        // Mock successful API responses
        (fetch as jest.Mock)
            .mockResolvedValueOnce({ // test connection
                ok: true,
                json: async () => ([])
            })
            .mockResolvedValueOnce({ // find task 1 - not found
                ok: true,
                json: async () => ([])
            })
            .mockResolvedValueOnce({ // create task 1
                ok: true,
                json: async () => ({ id: 'skedpal-1' })
            })
            .mockResolvedValueOnce({ // find task 2 - not found
                ok: true,
                json: async () => ([])
            })
            .mockResolvedValueOnce({ // create task 2
                ok: true,
                json: async () => ({ id: 'skedpal-2' })
            });

        const result = await skedPalClient.syncTasksToSkedPal(obsidianTasks);

        expect(result.success).toBe(true);
        expect(result.syncedTasks).toBe(2);
        expect(result.errors).toHaveLength(0);
    });

    test('should handle sync errors gracefully', async () => {
        const obsidianTasks: ObsidianTask[] = [
            {
                id: 'test.md:1',
                description: 'Task 1',
                completed: false,
                filePath: 'test.md',
                lineNumber: 1,
                tags: [],
                rawContent: '- [ ] Task 1'
            }
        ];

        // Mock API error
        (fetch as jest.Mock)
            .mockResolvedValueOnce({ // test connection
                ok: true,
                json: async () => ([])
            })
            .mockResolvedValueOnce({ // find task - not found
                ok: true,
                json: async () => ([])
            })
            .mockRejectedValueOnce(new Error('Network error')); // create task fails

        const result = await skedPalClient.syncTasksToSkedPal(obsidianTasks);

        expect(result.success).toBe(false);
        expect(result.syncedTasks).toBe(0);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('Failed to sync task');
    });

    test('should validate credentials before sync', async () => {
        const clientWithoutCredentials = new SkedPalClient('', '');
        const obsidianTasks: ObsidianTask[] = [
            {
                id: 'test.md:1',
                description: 'Task 1',
                completed: false,
                filePath: 'test.md',
                lineNumber: 1,
                tags: [],
                rawContent: '- [ ] Task 1'
            }
        ];

        const result = await clientWithoutCredentials.syncTasksToSkedPal(obsidianTasks);

        expect(result.success).toBe(false);
        expect(result.errors).toContain('SkedPal API credentials not configured');
    });

    test('should test connection successfully', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ([])
        });

        const result = await skedPalClient.testConnection();
        expect(result).toBe(true);
    });

    test('should handle connection test failures', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 401,
            statusText: 'Unauthorized'
        });

        const result = await skedPalClient.testConnection();
        expect(result).toBe(false);
    });

    test('should convert SkedPal task back to Obsidian format', () => {
        const skedPalTask = {
            id: 'skedpal-1',
            title: 'Test task',
            description: 'From Obsidian: test.md:1',
            priority: 'HIGH' as const,
            dueDate: '2024-01-15T00:00:00Z',
            status: 'TODO' as const,
            tags: ['work', 'important'],
            externalId: 'test.md:1'
        };

        const obsidianTask = skedPalClient.convertToObsidianTask(skedPalTask);

        expect(obsidianTask.description).toBe('Test task');
        expect(obsidianTask.priority).toBe('A');
        expect(obsidianTask.dueDate).toBe('2024-01-15');
        expect(obsidianTask.completed).toBe(false);
        expect(obsidianTask.tags).toEqual(['work', 'important']);
    });

    test('should handle completed SkedPal tasks', () => {
        const skedPalTask = {
            id: 'skedpal-1',
            title: 'Completed task',
            status: 'COMPLETED' as const,
            tags: []
        };

        const obsidianTask = skedPalClient.convertToObsidianTask(skedPalTask);
        expect(obsidianTask.completed).toBe(true);
    });

    test('should map SkedPal priorities back to Obsidian format', () => {
        const priorities = [
            { skedpal: 'HIGH', obsidian: 'A' },
            { skedpal: 'MEDIUM', obsidian: 'B' },
            { skedpal: 'LOW', obsidian: 'C' }
        ];

        priorities.forEach(({ skedpal, obsidian }) => {
            const skedPalTask = {
                id: 'skedpal-1',
                title: 'Test task',
                priority: skedpal as any,
                status: 'TODO' as const,
                tags: []
            };

            const obsidianTask = skedPalClient.convertToObsidianTask(skedPalTask);
            expect(obsidianTask.priority).toBe(obsidian);
        });
    });
});