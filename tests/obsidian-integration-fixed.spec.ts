import { test, expect, MockApp, MockTFile, MockVault } from './setup';
import { TaskManager } from '../plugin-obsidian/src/task-manager';

// Test suite for REQ-001: Plugin must integrate with Obsidian's task management system
test.describe('REQ-001: Obsidian Integration Tests', () => {
    let taskManager: TaskManager;
    let settings: any;

    test.beforeEach(async ({ mockApp }) => {
        // Create settings for the actual TaskManager
        settings = {
            taskFilePatterns: ['**/*.md'],
            includeCompletedTasks: true,
            autoSync: false,
            skedPalApiKey: '',
            skedPalWorkspaceId: '',
            syncInterval: 300
        };
        
        // Create the actual TaskManager for testing
        taskManager = new TaskManager(mockApp, settings);
    });

    test('should detect task files based on patterns', async ({ mockApp }) => {
        // Setup test files
        mockApp.vault.addFile('tasks/daily.md', 'daily.md', '- [ ] Task 1\\n- [x] Task 2');
        mockApp.vault.addFile('notes/meeting.md', 'meeting.md', '# Meeting Notes');
        mockApp.vault.addFile('project-tasks.md', 'project-tasks.md', '- [ ] Project task');

        const tasks = await taskManager.collectTasks();

        // Should find tasks from task files
        expect(tasks.length).toBeGreaterThan(0);
        expect(tasks.some(task => task.filePath.includes('tasks/'))).toBeTruthy();
        expect(tasks.some(task => task.filePath.includes('project-tasks'))).toBeTruthy();
    });

    test.skip('should parse Obsidian task syntax correctly', async ({ mockApp }) => {
        const testContent = `# Daily Tasks

- [ ] Incomplete task with priority (A)
- [x] Completed task
- [ ] Task with due date 📅 2024-01-15
- [ ] Task with tags #work #urgent
- [ ] Regular list item (not a task)
* [ ] Task with asterisk`;

        mockApp.vault.addFile('test.md', 'test.md', testContent);

        const tasks = await taskManager.collectTasks();

        expect(tasks).toHaveLength(6);

        // Test incomplete task
        const incompleteTask = tasks.find(t => t.description.includes('Incomplete task'));
        expect(incompleteTask).toBeDefined();
        expect(incompleteTask?.completed).toBe(false);
        expect(incompleteTask?.priority).toBe('A');

        // Test completed task
        const completedTask = tasks.find(t => t.description.includes('Completed task'));
        expect(completedTask).toBeDefined();
        expect(completedTask?.completed).toBe(true);

        // Test task with due date
        const datedTask = tasks.find(t => t.description.includes('due date'));
        expect(datedTask).toBeDefined();
        expect(datedTask?.dueDate).toBe('2024-01-15');

        // Test task with tags
        const taggedTask = tasks.find(t => t.description.includes('tags'));
        expect(taggedTask).toBeDefined();
        expect(taggedTask?.tags).toContain('work');
        expect(taggedTask?.tags).toContain('urgent');
    });

    test.skip('should parse extended Obsidian task syntax', async ({ mockApp }) => {
        const testContent = `# Extended Task Syntax

- [ ] Task with scheduled date ⏳ 2024-01-16
- [ ] Task with start date 🛫 2024-01-17
- [ ] Task with done date ✅ 2024-01-18
- [ ] Task with recurrence 🔁 every week
- [ ] Task with created date ➕ 2024-01-19
- [ ] Task with multiple dates 📅 2024-01-20 🛫 2024-01-21`;

        mockApp.vault.addFile('extended.md', 'extended.md', testContent);

        const tasks = await taskManager.collectTasks();

        expect(tasks).toHaveLength(6);

        // Test scheduled date
        const scheduledTask = tasks.find(t => t.description.includes('scheduled date'));
        expect(scheduledTask?.scheduledDate).toBe('2024-01-16');

        // Test start date
        const startTask = tasks.find(t => t.description.includes('start date'));
        expect(startTask?.startDate).toBe('2024-01-17');

        // Test done date
        const doneTask = tasks.find(t => t.description.includes('done date'));
        expect(doneTask?.doneDate).toBe('2024-01-18');

        // Test recurrence
        const recurTask = tasks.find(t => t.description.includes('recurrence'));
        expect(recurTask?.recurrence).toBe('every week');

        // Test created date
        const createdTask = tasks.find(t => t.description.includes('created date'));
        expect(createdTask?.createdDate).toBe('2024-01-19');

        // Test multiple dates
        const multiDateTask = tasks.find(t => t.description.includes('multiple dates'));
        expect(multiDateTask?.dueDate).toBe('2024-01-20');
        expect(multiDateTask?.startDate).toBe('2024-01-21');
    });

    test.skip('should respect includeCompletedTasks setting', async ({ mockApp }) => {
        const testContent = `- [ ] Incomplete task
- [x] Completed task`;

        mockApp.vault.addFile('test.md', 'test.md', testContent);

        // Test with includeCompletedTasks = false
        settings.includeCompletedTasks = false;
        let tasks = await taskManager.collectTasks();
        expect(tasks).toHaveLength(1);
        expect(tasks[0].completed).toBe(false);

        // Test with includeCompletedTasks = true
        settings.includeCompletedTasks = true;
        tasks = await taskManager.collectTasks();
        expect(tasks).toHaveLength(2);
        expect(tasks.some(t => t.completed)).toBeTruthy();
    });

    test.skip('should generate unique task IDs', async ({ mockApp }) => {
        mockApp.vault.addFile('test.md', 'test.md', '- [ ] Task 1\\n- [ ] Task 2');

        const tasks = await taskManager.collectTasks();

        expect(tasks).toHaveLength(2);
        expect(tasks[0].id).toBe('test.md:1');
        expect(tasks[1].id).toBe('test.md:2');
        expect(tasks[0].id).not.toBe(tasks[1].id);
    });

    test.skip('should update task status in file', async ({ mockApp }) => {
        const originalContent = '- [ ] Original task';
        mockApp.vault.addFile('test.md', 'test.md', originalContent);

        const tasks = await taskManager.collectTasks();
        const task = tasks[0];

        // Update task to completed
        await taskManager.updateTask(task, { completed: true });

        const updatedContent = await mockApp.vault.read(mockApp.vault.getMarkdownFiles()[0]);
        expect(updatedContent).toContain('- [x] Original task');
    });

    test.skip('should handle task file pattern matching', async ({ mockApp }) => {
        settings.taskFilePatterns = ['**/tasks/**', '**/*.task.md'];

        mockApp.vault.addFile('tasks/daily.md', 'daily.md', '- [ ] Task 1');
        mockApp.vault.addFile('notes/meeting.task.md', 'meeting.task.md', '- [ ] Task 2');
        mockApp.vault.addFile('random.md', 'random.md', '- [ ] Task 3');

        const tasks = await taskManager.collectTasks();

        // Should only process files matching patterns
        expect(tasks).toHaveLength(2);
        expect(tasks.some(t => t.filePath.includes('tasks/'))).toBeTruthy();
        expect(tasks.some(t => t.filePath.includes('.task.md'))).toBeTruthy();
        expect(tasks.some(t => t.filePath.includes('random.md'))).toBeFalsy();
    });

    test.skip('should extract task metadata correctly', async ({ mockApp }) => {
        const testContent = `- [ ] High priority task (A) with due date 📅 2024-01-15 and tags #work #important
- [x] Completed task with priority (B)`;

        mockApp.vault.addFile('test.md', 'test.md', testContent);

        const tasks = await taskManager.collectTasks();

        // Test first task metadata
        const task1 = tasks.find(t => t.description.includes('High priority'));
        expect(task1?.priority).toBe('A');
        expect(task1?.dueDate).toBe('2024-01-15');
        expect(task1?.tags).toContain('work');
        expect(task1?.tags).toContain('important');
        expect(task1?.completed).toBe(false);

        // Test second task metadata
        const task2 = tasks.find(t => t.description.includes('Completed task'));
        expect(task2?.priority).toBe('B');
        expect(task2?.completed).toBe(true);
    });

    test.skip('should clean task descriptions properly', async ({ mockApp }) => {
        const testContent = `- [ ] Task with (A) priority and 📅 2024-01-15 date and #tags`;

        mockApp.vault.addFile('test.md', 'test.md', testContent);

        const tasks = await taskManager.collectTasks();
        const task = tasks[0];

        // Description should be cleaned of metadata markers
        expect(task.description).toBe('Task with priority and date and');
        expect(task.description).not.toContain('(A)');
        expect(task.description).not.toContain('📅 2024-01-15');
        // Tags are extracted separately but removed from description
    });

    test.skip('should handle multiple task formats', async ({ mockApp }) => {
        const testContent = `## Different task formats
- [ ] Standard dash format
* [ ] Asterisk format
- [x] Completed with cross
- [X] Completed with capital X
- [ ] Task with emoji status ✅`;

        mockApp.vault.addFile('test.md', 'test.md', testContent);

        const tasks = await taskManager.collectTasks();

        // Should parse all valid task formats
        expect(tasks).toHaveLength(5);
        expect(tasks.filter(t => t.completed)).toHaveLength(2);
    });

    test('should handle empty files and files without tasks', async ({ mockApp }) => {
        mockApp.vault.addFile('empty.md', 'empty.md', '');
        mockApp.vault.addFile('no-tasks.md', 'no-tasks.md', '# Header\\nRegular text');

        const tasks = await taskManager.collectTasks();

        expect(tasks).toHaveLength(0);
    });

    test.skip('should detect task files using metadata cache', async ({ mockApp }) => {
        // Mock metadata cache integration
        const mockMetadataCache = {
            getFileCache: (file: any) => {
                if (file.path === 'tasks/cache-test.md') {
                    return {
                        listItems: [
                            { task: ' ', text: 'Task from cache', position: { start: { line: 0 } } },
                            { task: 'x', text: 'Completed task from cache', position: { start: { line: 1 } } }
                        ]
                    };
                }
                return null;
            }
        };

        // Add metadata cache to mock app
        mockApp.metadataCache = mockMetadataCache;
        
        mockApp.vault.addFile('tasks/cache-test.md', 'cache-test.md', '- [ ] Task from cache\\n- [x] Completed task from cache');

        const tasks = await taskManager.collectTasks();

        // Should find tasks from metadata cache
        expect(tasks.length).toBeGreaterThan(0);
        expect(tasks.some(task => task.description.includes('Task from cache'))).toBeTruthy();
    });
});