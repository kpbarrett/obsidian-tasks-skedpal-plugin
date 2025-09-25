import { App, TFile, Notice, normalizePath } from 'obsidian';
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
}

export class TaskManager {
    private app: App;
    private settings: TaskSyncSettings;

    constructor(app: App, settings: TaskSyncSettings) {
        this.app = app;
        this.settings = settings;
    }

    /**
     * Collects all tasks from Obsidian vault
     */
    async collectTasks(): Promise<ObsidianTask[]> {
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
    private shouldProcessFile(file: TFile): boolean {
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
    private async extractTasksFromFile(file: TFile): Promise<ObsidianTask[]> {
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

        // Extract additional task metadata
        const priority = this.extractPriority(description);
        const dueDate = this.extractDueDate(description);
        const tags = this.extractTags(description);

        return {
            id: this.generateTaskId(filePath, lineNumber),
            description: this.cleanDescription(description),
            completed,
            filePath,
            lineNumber,
            priority,
            dueDate,
            tags,
            rawContent: line
        };
    }

    /**
     * Extracts priority from task description
     */
    private extractPriority(description: string): string | undefined {
        const priorityRegex = /\s\((.)\)\s/;
        const match = description.match(priorityRegex);
        return match ? match[1] : undefined;
    }

    /**
     * Extracts due date from task description
     */
    private extractDueDate(description: string): string | undefined {
        const dateRegex = /📅\s*(\d{4}-\d{2}-\d{2})|⏳\s*(\d{4}-\d{2}-\d{2})/;
        const match = description.match(dateRegex);
        return match ? (match[1] || match[2]) : undefined;
    }

    /**
     * Extracts tags from task description
     */
    private extractTags(description: string): string[] {
        const tagRegex = /#([\w-]+)/g;
        const tags: string[] = [];
        let match;
        
        while ((match = tagRegex.exec(description)) !== null) {
            tags.push(match[1]);
        }
        
        return tags;
    }

    /**
     * Cleans description by removing metadata markers
     */
    private cleanDescription(description: string): string {
        // Remove priority markers
        let cleaned = description.replace(/\s\(.\)\s/, ' ');
        
        // Remove date markers
        cleaned = cleaned.replace(/📅\s*\d{4}-\d{2}-\d{2}/, '');
        cleaned = cleaned.replace(/⏳\s*\d{4}-\d{2}-\d{2}/, '');
        
        // Remove tags but keep them for context
        // Tags are already extracted separately
        
        return cleaned.trim();
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
        // This would need file modification time tracking for proper implementation
        // For now, return all tasks as a simplified implementation
        return allTasks;
    }
}