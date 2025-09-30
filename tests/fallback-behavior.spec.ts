import { test, expect, MockApp } from './setup';

// Test suite for fallback behavior when metadata cache is unavailable
test.describe('Fallback Behavior Tests', () => {
    let taskManager: any;
    let settings: any;

    test.beforeEach(async ({ mockApp }) => {
        settings = {
            taskFilePatterns: ['**/*.md'],
            includeCompletedTasks: true,
            autoSync: false,
            skedPalApiKey: '',
            skedPalWorkspaceId: '',
            syncInterval: 300
        };
        
        // Create a simple task manager for testing
        taskManager = createTestTaskManager(mockApp, settings);
    });

    // Simple test task manager implementation
    function createTestTaskManager(app: any, settings: any) {
        return {
            app,
            settings,
            
            async collectTasks(): Promise<any[]> {
                const tasks: any[] = [];
                const markdownFiles = this.app.vault.getMarkdownFiles();

                for (const file of markdownFiles) {
                    if (this.shouldProcessFile(file)) {
                        const fileTasks = await this.extractTasksFromFile(file);
                        tasks.push(...fileTasks);
                    }
                }

                return tasks;
            },

            shouldProcessFile(file: any): boolean {
                const filePath = file.path;
                
                for (const pattern of this.settings.taskFilePatterns) {
                    if (this.matchesPattern(filePath, pattern)) {
                        return true;
                    }
                }

                return filePath.includes('/tasks/') || 
                       file.name.toLowerCase().includes('task');
            },

            matchesPattern(filePath: string, pattern: string): boolean {
                if (pattern === '**/*.md') {
                    return filePath.endsWith('.md');
                }
                
                if (pattern.includes('**')) {
                    const regexPattern = pattern
                        .replace(/\*\*/g, '.*')
                        .replace(/\*/g, '[^/]*')
                        .replace(/\?/g, '[^/]');
                    const regex = new RegExp(`^${regexPattern}$`);
                    return regex.test(filePath);
                }
                
                return filePath.includes(pattern.replace('*', ''));
            },

            async extractTasksFromFile(file: any): Promise<any[]> {
                const tasks: any[] = [];
                
                // Try to get tasks from metadata cache first
                const cacheData = this.app.metadataCache.getFileCache(file);
                if (cacheData && cacheData.listItems) {
                    console.log('Using metadata cache for file:', file.path);
                    const cacheTasks = this.extractTasksFromCache(cacheData, file.path);
                    tasks.push(...cacheTasks);
                } else {
                    // Fallback to manual parsing
                    console.log('Using manual parsing for file:', file.path);
                    const content = await this.app.vault.read(file);
                    const lines = content.replace(/\\n/g, '\n').split('\n');

                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        const task = this.parseTaskLine(line, file.path, i + 1);
                        
                        if (task) {
                            tasks.push(task);
                        }
                    }
                }

                return tasks;
            },

            extractTasksFromCache(cacheData: any, filePath: string): any[] {
                const tasks: any[] = [];
                
                if (cacheData.listItems) {
                    for (const listItem of cacheData.listItems) {
                        if (listItem.task !== undefined) {
                            const task = {
                                id: `${filePath}:${listItem.position.start.line + 1}`,
                                description: listItem.text,
                                completed: listItem.task === 'x',
                                filePath,
                                lineNumber: listItem.position.start.line + 1,
                                priority: this.extractPriority(listItem.text),
                                dueDate: this.extractDueDate(listItem.text),
                                tags: this.extractTags(listItem.text),
                                rawContent: `- [${listItem.task}] ${listItem.text}`,
                                fromCache: true
                            };
                            
                            // Skip completed tasks if not included in settings
                            if (task.completed && !this.settings.includeCompletedTasks) {
                                continue;
                            }
                            
                            tasks.push(task);
                        }
                    }
                }
                
                return tasks;
            },

            parseTaskLine(line: string, filePath: string, lineNumber: number): any | null {
                const taskRegex = /^\s*[-*]\s*\[(.)\]\s*(.+)$/;
                const match = line.match(taskRegex);

                if (!match) {
                    return null;
                }

                const statusChar = match[1].toLowerCase();
                const description = match[2].trim();
                const completed = statusChar === 'x';

                if (completed && !this.settings.includeCompletedTasks) {
                    return null;
                }

                const priority = this.extractPriority(description);
                const dueDate = this.extractDueDate(description);
                const tags = this.extractTags(description);

                return {
                    id: `${filePath}:${lineNumber}`,
                    description: this.cleanDescription(description),
                    completed,
                    filePath,
                    lineNumber,
                    priority,
                    dueDate,
                    tags,
                    rawContent: line,
                    fromCache: false
                };
            },

            extractPriority(description: string): string | undefined {
                const priorityRegex = /\((.)\)/;
                const match = description.match(priorityRegex);
                return match ? match[1] : undefined;
            },

            extractDueDate(description: string): string | undefined {
                const dateRegex = /📅\s*(\d{4}-\d{2}-\d{2})|⏳\s*(\d{4}-\d{2}-\d{2})/;
                const match = description.match(dateRegex);
                return match ? (match[1] || match[2]) : undefined;
            },

            extractTags(description: string): string[] {
                const tagRegex = /#([\w-]+)/g;
                const tags: string[] = [];
                let match;
                
                while ((match = tagRegex.exec(description)) !== null) {
                    tags.push(match[1]);
                }
                
                return tags;
            },

            cleanDescription(description: string): string {
                let cleaned = description.replace(/\(.\)/, '');
                cleaned = cleaned.replace(/📅\s*\d{4}-\d{2}-\d{2}/, '');
                cleaned = cleaned.replace(/⏳\s*\d{4}-\d{2}-\d{2}/, '');
                cleaned = cleaned.replace(/#\w+/g, '');
                return cleaned.replace(/\s+/g, ' ').trim();
            }
        };
    }

    test('should fallback to manual parsing when metadata cache is unavailable', async ({ mockApp }) => {
        const testContent = `- [ ] Task without cache
- [x] Completed task without cache`;

        const file = mockApp.vault.addFile('test.md', 'test.md', testContent);
        
        // Clear metadata cache to simulate cache unavailability
        mockApp.metadataCache.clearFileCache(file.path);
        
        const cacheData = mockApp.metadataCache.getFileCache(file);
        expect(cacheData).toBeNull();

        const tasks = await taskManager.collectTasks();
        
        // Should still find tasks via manual parsing
        expect(tasks).toHaveLength(2);
        expect(tasks.every(task => !task.fromCache)).toBe(true);

        // Verify task properties from manual parsing
        const incompleteTask = tasks.find(t => !t.completed);
        expect(incompleteTask?.description).toBe('Task without cache');

        const completedTask = tasks.find(t => t.completed);
        expect(completedTask?.description).toBe('Completed task without cache');
    });

    test('should handle mixed scenarios with some files having cache and others not', async ({ mockApp }) => {
        // Create files with different scenarios
        const file1 = mockApp.vault.addFile('cached.md', 'cached.md', '- [ ] Cached task');
        const file2 = mockApp.vault.addFile('no-cache.md', 'no-cache.md', '- [ ] Manual task');
        
        // Clear cache for one file
        mockApp.metadataCache.clearFileCache(file2.path);

        const tasks = await taskManager.collectTasks();
        
        // Should find tasks from both files
        expect(tasks).toHaveLength(2);
        
        const cachedTask = tasks.find(t => t.description.includes('Cached'));
        const manualTask = tasks.find(t => t.description.includes('Manual'));
        
        expect(cachedTask?.fromCache).toBe(true);
        expect(manualTask?.fromCache).toBe(false);
    });

    test('should handle files with no tasks in both cache and manual parsing', async ({ mockApp }) => {
        const testContent = `# No Tasks Here

This is just regular text.
No task markers in this file.`;

        const file = mockApp.vault.addFile('no-tasks.md', 'no-tasks.md', testContent);
        
        // Clear cache to force manual parsing
        mockApp.metadataCache.clearFileCache(file.path);
        
        const cacheData = mockApp.metadataCache.getFileCache(file);
        expect(cacheData).toBeNull();

        const tasks = await taskManager.collectTasks();
        
        // Should not find any tasks
        expect(tasks).toHaveLength(0);
    });

    test('should handle empty files in fallback mode', async ({ mockApp }) => {
        const file = mockApp.vault.addFile('empty.md', 'empty.md', '');
        
        // Clear cache to force manual parsing
        mockApp.metadataCache.clearFileCache(file.path);
        
        const cacheData = mockApp.metadataCache.getFileCache(file);
        expect(cacheData).toBeNull();

        const tasks = await taskManager.collectTasks();
        
        // Should not find any tasks
        expect(tasks).toHaveLength(0);
    });

    test('should respect includeCompletedTasks setting in fallback mode', async ({ mockApp }) => {
        const testContent = `- [ ] Incomplete task
- [x] Completed task`;

        const file = mockApp.vault.addFile('test.md', 'test.md', testContent);
        
        // Clear cache to force manual parsing
        mockApp.metadataCache.clearFileCache(file.path);

        // Test with includeCompletedTasks = false
        settings.includeCompletedTasks = false;
        let tasks = await taskManager.collectTasks();
        expect(tasks).toHaveLength(1);
        expect(tasks[0].completed).toBe(false);

        // Test with includeCompletedTasks = true
        settings.includeCompletedTasks = true;
        tasks = await taskManager.collectTasks();
        expect(tasks).toHaveLength(2);
        expect(tasks.some(t => t.completed)).toBe(true);
    });

    test('should handle complex task formats in fallback mode', async ({ mockApp }) => {
        const testContent = `## Complex Tasks

- [ ] Task with emoji ✅ and priority (B)
* [x] Completed task with asterisk
- [ ] Multi-line description that continues
  on the next line
- [X] Completed with capital X`;

        const file = mockApp.vault.addFile('complex.md', 'complex.md', testContent);
        
        // Clear cache to force manual parsing
        mockApp.metadataCache.clearFileCache(file.path);

        const tasks = await taskManager.collectTasks();
        
        // Should parse all valid task formats
        expect(tasks).toHaveLength(4);
        expect(tasks.filter(t => t.completed)).toHaveLength(2);
        expect(tasks.every(task => !task.fromCache)).toBe(true);
        
        // Verify complex task properties
        const emojiTask = tasks.find(t => t.description.includes('emoji'));
        expect(emojiTask?.priority).toBe('B');
        
        const asteriskTask = tasks.find(t => t.description.includes('asterisk'));
        expect(asteriskTask?.completed).toBe(true);
        
        const capitalXTask = tasks.find(t => t.description.includes('capital X'));
        expect(capitalXTask?.completed).toBe(true);
    });
});