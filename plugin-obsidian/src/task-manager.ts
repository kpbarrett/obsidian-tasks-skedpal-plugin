// Conditional import for Obsidian API - supports both real and mock environments
let App: any, TFile: any, Notice: any, normalizePath: any, MetadataCache: any, CachedMetadata: any;

type AppType = typeof App;
type TFileType = typeof TFile;

try {
    // Try to import the real Obsidian API
    const obsidian = require('obsidian');
    App = obsidian.App;
    TFile = obsidian.TFile;
    Notice = obsidian.Notice;
    normalizePath = obsidian.normalizePath;
    MetadataCache = obsidian.MetadataCache;
    CachedMetadata = obsidian.CachedMetadata;
} catch (error) {
    // Fall back to mock API for testing
    if (typeof global !== 'undefined' && (global as any).obsidian) {
        const obsidian = (global as any).obsidian;
        App = obsidian.App;
        TFile = obsidian.TFile;
        Notice = obsidian.Notice;
        normalizePath = obsidian.normalizePath;
        MetadataCache = obsidian.MetadataCache;
        CachedMetadata = obsidian.CachedMetadata;
    } else {
        // Create minimal mock types for development
        type App = any;
        type TFile = any;
        type Notice = any;
        type MetadataCache = any;
        type CachedMetadata = any;
        normalizePath = (path: string) => path.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/\/$/, '');
    }
}

import { TaskSyncSettings } from './settings';

export interface ObsidianTask {
    id: string;
    description: string;
    completed: boolean;
    filePath: string;
    lineNumber: number;
    priority?: string;
    dueDate?: string;
    tags: string[];
    rawContent: string;
    // Extended Obsidian task properties
    scheduledDate?: string;
    startDate?: string;
    doneDate?: string;
    recurrence?: string;
    createdDate?: string;
    // Obsidian Tasks plugin specific properties
    status?: string;
    blockId?: string;
    // File metadata
    fileModifiedTime?: number;
}

export class TaskManager {
    private app: AppType;
    private settings: TaskSyncSettings;

    constructor(app: AppType, settings: TaskSyncSettings) {
        this.app = app;
        this.settings = settings;
    }

    /**
     * Checks if Obsidian's Tasks plugin is available
     */
    private isTasksPluginAvailable(): boolean {
        // Check if Tasks plugin is installed and available
        return !!(this.app as any).plugins?.getPlugin('obsidian-tasks-plugin') ||
               !!(this.app as any).plugins?.getPlugin('tasks');
    }

    /**
     * Gets tasks using Obsidian's metadata cache when available
     */
    private getTasksFromMetadataCache(): ObsidianTask[] {
        const tasks: ObsidianTask[] = [];
        
        if (!this.app.metadataCache) {
            return tasks;
        }

        const files = this.app.vault.getMarkdownFiles();
        
        for (const file of files) {
            if (!this.shouldProcessFile(file)) {
                continue;
            }

            const cache = this.app.metadataCache.getFileCache(file);
            if (!cache) {
                continue;
            }

            // Extract tasks from list items in the cache
            const fileTasks = this.extractTasksFromCache(file, cache);
            tasks.push(...fileTasks);
        }

        return tasks;
    }

    /**
     * Extracts tasks from Obsidian's metadata cache
     */
    private extractTasksFromCache(file: TFileType, cache: any): ObsidianTask[] {
        const tasks: ObsidianTask[] = [];
        
        if (!cache.listItems) {
            return tasks;
        }

        for (const listItem of cache.listItems) {
            if (this.isTaskListItem(listItem)) {
                const task = this.parseTaskFromCache(file, listItem);
                if (task) {
                    tasks.push(task);
                }
            }
        }

        return tasks;
    }

    /**
     * Determines if a list item is a task
     */
    private isTaskListItem(listItem: any): boolean {
        // Check if this is a task list item (has checkbox)
        return listItem.task !== undefined;
    }

    /**
     * Parses a task from Obsidian's metadata cache
     */
    private parseTaskFromCache(file: TFileType, listItem: any): ObsidianTask | null {
        const taskContent = listItem.text || '';
        const completed = listItem.task === 'x' || listItem.task === 'X';

        // Skip completed tasks if not included in settings
        if (completed && !this.settings.includeCompletedTasks) {
            return null;
        }

        // Extract extended task metadata using Obsidian's task syntax
        const metadata = this.parseExtendedTaskMetadata(taskContent);

        return {
            id: this.generateTaskId(file.path, listItem.position.start.line),
            description: metadata.cleanDescription,
            completed,
            filePath: file.path,
            lineNumber: listItem.position.start.line + 1,
            priority: metadata.priority,
            dueDate: metadata.dueDate,
            scheduledDate: metadata.scheduledDate,
            startDate: metadata.startDate,
            doneDate: metadata.doneDate,
            recurrence: metadata.recurrence,
            createdDate: metadata.createdDate,
            tags: metadata.tags,
            rawContent: taskContent,
            fileModifiedTime: file.stat?.mtime
        };
    }

    /**
     * Parses extended task metadata using Obsidian Tasks plugin syntax
     */
    private parseExtendedTaskMetadata(content: string): {
        cleanDescription: string;
        priority?: string;
        dueDate?: string;
        scheduledDate?: string;
        startDate?: string;
        doneDate?: string;
        recurrence?: string;
        createdDate?: string;
        tags: string[];
    } {
        let cleanDescription = content;
        let priority: string | undefined;
        let dueDate: string | undefined;
        let scheduledDate: string | undefined;
        let startDate: string | undefined;
        let doneDate: string | undefined;
        let recurrence: string | undefined;
        let createdDate: string | undefined;
        const tags: string[] = [];

        // Parse Obsidian Tasks plugin syntax
        // Priority: (A), (B), (C), (D)
        const priorityMatch = content.match(/\s\((\w)\)\s/);
        if (priorityMatch) {
            priority = priorityMatch[1];
            cleanDescription = cleanDescription.replace(/\s\(\w\)\s/, ' ');
        }

        // Due date: 📅 YYYY-MM-DD or due:YYYY-MM-DD
        const dueDateMatch = content.match(/📅\s*(\d{4}-\d{2}-\d{2})|due:(\d{4}-\d{2}-\d{2})/);
        if (dueDateMatch) {
            dueDate = dueDateMatch[1] || dueDateMatch[2];
            cleanDescription = cleanDescription.replace(/📅\s*\d{4}-\d{2}-\d{2}/, '').replace(/due:\d{4}-\d{2}-\d{2}/, '');
        }

        // Scheduled date: ⏳ YYYY-MM-DD or scheduled:YYYY-MM-DD
        const scheduledMatch = content.match(/⏳\s*(\d{4}-\d{2}-\d{2})|scheduled:(\d{4}-\d{2}-\d{2})/);
        if (scheduledMatch) {
            scheduledDate = scheduledMatch[1] || scheduledMatch[2];
            cleanDescription = cleanDescription.replace(/⏳\s*\d{4}-\d{2}-\d{2}/, '').replace(/scheduled:\d{4}-\d{2}-\d{2}/, '');
        }

        // Start date: 🛫 YYYY-MM-DD or start:YYYY-MM-DD
        const startMatch = content.match(/🛫\s*(\d{4}-\d{2}-\d{2})|start:(\d{4}-\d{2}-\d{2})/);
        if (startMatch) {
            startDate = startMatch[1] || startMatch[2];
            cleanDescription = cleanDescription.replace(/🛫\s*\d{4}-\d{2}-\d{2}/, '').replace(/start:\d{4}-\d{2}-\d{2}/, '');
        }

        // Done date: ✅ YYYY-MM-DD or done:YYYY-MM-DD
        const doneMatch = content.match(/✅\s*(\d{4}-\d{2}-\d{2})|done:(\d{4}-\d{2}-\d{2})/);
        if (doneMatch) {
            doneDate = doneMatch[1] || doneMatch[2];
            cleanDescription = cleanDescription.replace(/✅\s*\d{4}-\d{2}-\d{2}/, '').replace(/done:\d{4}-\d{2}-\d{2}/, '');
        }

        // Recurrence: 🔁 every day/week/month or recur:pattern
        const recurMatch = content.match(/🔁\s*(.+?)(?=\s|$)|recur:(.+?)(?=\s|$)/);
        if (recurMatch) {
            recurrence = recurMatch[1] || recurMatch[2];
            cleanDescription = cleanDescription.replace(/🔁\s*.+?(?=\s|$)/, '').replace(/recur:.+?(?=\s|$)/, '');
        }

        // Created date: ➕ YYYY-MM-DD or created:YYYY-MM-DD
        const createdMatch = content.match(/➕\s*(\d{4}-\d{2}-\d{2})|created:(\d{4}-\d{2}-\d{2})/);
        if (createdMatch) {
            createdDate = createdMatch[1] || createdMatch[2];
            cleanDescription = cleanDescription.replace(/➕\s*\d{4}-\d{2}-\d{2}/, '').replace(/created:\d{4}-\d{2}-\d{2}/, '');
        }

        // Extract tags
        const tagRegex = /#([\w-]+)/g;
        let tagMatch;
        while ((tagMatch = tagRegex.exec(content)) !== null) {
            tags.push(tagMatch[1]);
        }

        // Clean up extra spaces
        cleanDescription = cleanDescription.replace(/\s+/g, ' ').trim();

        return {
            cleanDescription,
            priority,
            dueDate,
            scheduledDate,
            startDate,
            doneDate,
            recurrence,
            createdDate,
            tags
        };
    }

    /**
     * Collects all tasks from Obsidian vault
     */
    async collectTasks(): Promise<ObsidianTask[]> {
        // Try to use Obsidian's metadata cache first for better performance and integration
        const cacheTasks = this.getTasksFromMetadataCache();
        
        if (cacheTasks.length > 0) {
            return cacheTasks;
        }

        // Fall back to manual file processing if metadata cache is not available
        const tasks: ObsidianTask[] = [];
        const markdownFiles = this.app.vault.getMarkdownFiles();

        for (const file of markdownFiles) {
            if (this.shouldProcessFile(file)) {
                const fileTasks = await this.extractTasksFromFile(file);
                tasks.push(...fileTasks);
            }
        }

        return tasks;
    }

    /**
     * Determines if a file should be processed for tasks
     */
    private shouldProcessFile(file: TFileType): boolean {
        // Check if file matches any of the task file patterns
        const filePath = normalizePath(file.path);
        
        for (const pattern of this.settings.taskFilePatterns) {
            if (this.matchesPattern(filePath, pattern)) {
                return true;
            }
        }

        // Check if file is in a tasks directory or has 'task' in name
        return filePath.includes('/tasks/') || 
               file.name.toLowerCase().includes('task');
    }

    /**
     * Simple pattern matching for file paths
     */
    private matchesPattern(filePath: string, pattern: string): boolean {
        if (pattern.includes('**')) {
            // Simple glob pattern matching
            const regexPattern = pattern
                .replace(/\*\*/g, '.*')
                .replace(/\*/g, '[^/]*')
                .replace(/\?/g, '[^/]');
            const regex = new RegExp(`^${regexPattern}$`);
            return regex.test(filePath);
        }
        
        return filePath.includes(pattern.replace('*', ''));
    }

    /**
     * Extracts tasks from a markdown file
     */
    private async extractTasksFromFile(file: TFileType): Promise<ObsidianTask[]> {
        const tasks: ObsidianTask[] = [];
        const content = await this.app.vault.read(file);
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const task = this.parseTaskLine(line, file.path, i + 1);
            
            if (task) {
                tasks.push(task);
            }
        }

        return tasks;
    }

    /**
     * Parses a single line to extract task information
     */
    private parseTaskLine(line: string, filePath: string, lineNumber: number): ObsidianTask | null {
        // Match Obsidian task patterns: - [ ] task description or - [x] completed task
        const taskRegex = /^\s*[-*]\s*\[(.)\]\s*(.+)$/;
        const match = line.match(taskRegex);

        if (!match) {
            return null;
        }

        const statusChar = match[1].toLowerCase();
        const description = match[2].trim();
        const completed = statusChar === 'x';

        // Skip completed tasks if not included in settings
        if (completed && !this.settings.includeCompletedTasks) {
            return null;
        }

        // Extract extended task metadata using Obsidian's task syntax
        const metadata = this.parseExtendedTaskMetadata(description);

        return {
            id: this.generateTaskId(filePath, lineNumber),
            description: metadata.cleanDescription,
            completed,
            filePath,
            lineNumber,
            priority: metadata.priority,
            dueDate: metadata.dueDate,
            scheduledDate: metadata.scheduledDate,
            startDate: metadata.startDate,
            doneDate: metadata.doneDate,
            recurrence: metadata.recurrence,
            createdDate: metadata.createdDate,
            tags: metadata.tags,
            rawContent: line
        };
    }



    /**
     * Generates a unique task ID
     */
    private generateTaskId(filePath: string, lineNumber: number): string {
        return `${filePath}:${lineNumber}`;
    }

    /**
     * Updates a task in the original file
     */
    async updateTask(task: ObsidianTask, updates: Partial<ObsidianTask>): Promise<void> {
        try {
            const file = this.app.vault.getAbstractFileByPath(task.filePath);
            if (!(file instanceof TFile)) {
                throw new Error(`File not found: ${task.filePath}`);
            }

            const content = await this.app.vault.read(file);
            const lines = content.split('\n');
            
            if (task.lineNumber > lines.length) {
                throw new Error(`Line ${task.lineNumber} not found in file ${task.filePath}`);
            }

            // Update the task line
            const updatedLine = this.updateTaskLine(lines[task.lineNumber - 1], updates);
            lines[task.lineNumber - 1] = updatedLine;

            // Write the updated content back to the file
            await this.app.vault.modify(file, lines.join('\n'));
            
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }

    /**
     * Updates a single task line with new properties
     */
    private updateTaskLine(originalLine: string, updates: Partial<ObsidianTask>): string {
        let updatedLine = originalLine;

        // Update completion status
        if (updates.completed !== undefined) {
            const statusChar = updates.completed ? 'x' : ' ';
            updatedLine = updatedLine.replace(/\[(.)\]/, `[${statusChar}]`);
        }

        // Update description if provided
        if (updates.description) {
            // This is a simplified implementation - in a real scenario,
            // you'd need more sophisticated logic to preserve formatting
            const taskMatch = updatedLine.match(/^\s*[-*]\s*\[(.)\]\s*/);
            if (taskMatch) {
                updatedLine = updatedLine.replace(/^\s*[-*]\s*\[(.)\]\s*.*$/, `${taskMatch[0]}${updates.description}`);
            }
        }

        return updatedLine;
    }

    /**
     * Gets tasks that have been modified since last sync
     */
    async getModifiedTasks(since: Date): Promise<ObsidianTask[]> {
        const allTasks = await this.collectTasks();
        
        // Filter tasks based on file modification time
        return allTasks.filter(task => {
            if (!task.fileModifiedTime) {
                // If we don't have modification time, include the task
                return true;
            }
            return task.fileModifiedTime > since.getTime();
        });
    }

    /**
     * Gets tasks using Obsidian's Tasks plugin API when available
     */
    async getTasksFromTasksPlugin(): Promise<ObsidianTask[]> {
        const tasks: ObsidianTask[] = [];
        
        if (!this.isTasksPluginAvailable()) {
            return tasks;
        }

        try {
            // Try to use the Tasks plugin API if available
            const tasksPlugin = (this.app as any).plugins.getPlugin('obsidian-tasks-plugin') ||
                              (this.app as any).plugins.getPlugin('tasks');
            
            if (tasksPlugin && tasksPlugin.getTasks) {
                const pluginTasks = tasksPlugin.getTasks();
                
                for (const pluginTask of pluginTasks) {
                    const task = this.convertTasksPluginTask(pluginTask);
                    if (task) {
                        tasks.push(task);
                    }
                }
            }
        } catch (error) {
            console.warn('Error accessing Tasks plugin API:', error);
        }

        return tasks;
    }

    /**
     * Converts a Tasks plugin task to our ObsidianTask format
     */
    private convertTasksPluginTask(pluginTask: any): ObsidianTask | null {
        if (!pluginTask || !pluginTask.text) {
            return null;
        }

        const metadata = this.parseExtendedTaskMetadata(pluginTask.text);

        return {
            id: pluginTask.id || this.generateTaskId(pluginTask.path || '', pluginTask.line || 0),
            description: metadata.cleanDescription,
            completed: pluginTask.status === 'x' || pluginTask.status === 'X',
            filePath: pluginTask.path || '',
            lineNumber: pluginTask.line || 0,
            priority: metadata.priority,
            dueDate: metadata.dueDate,
            scheduledDate: metadata.scheduledDate,
            startDate: metadata.startDate,
            doneDate: metadata.doneDate,
            recurrence: metadata.recurrence,
            createdDate: metadata.createdDate,
            tags: metadata.tags,
            rawContent: pluginTask.text,
            status: pluginTask.status,
            blockId: pluginTask.blockId,
            fileModifiedTime: pluginTask.fileModifiedTime
        };
    }
}