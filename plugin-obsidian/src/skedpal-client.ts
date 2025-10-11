// SkedPal API Client for Obsidian Tasks integration

import { Notice } from 'obsidian';
import { ObsidianTask } from './task-manager';

export interface SkedPalTask {
    id?: string;
    title: string;
    description?: string;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    dueDate?: string; // ISO 8601 format
    estimatedDuration?: number; // in minutes
    tags?: string[];
    status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    externalId?: string; // For linking back to Obsidian
    createdTime?: string;
    updatedTime?: string;
}

export interface SkedPalSyncResult {
    success: boolean;
    syncedTasks: number;
    errors: string[];
    warnings: string[];
}

export class SkedPalClient {
    private apiKey: string;
    private workspaceId: string;
    private baseUrl: string = 'https://api.skedpal.com/v1';

    constructor(apiKey: string, workspaceId: string) {
        this.apiKey = apiKey;
        this.workspaceId = workspaceId;
    }

    /**
     * Converts an Obsidian task to a SkedPal task
     */
    private convertToSkedPalTask(obsidianTask: ObsidianTask): SkedPalTask {
        const skedPalTask: SkedPalTask = {
            title: obsidianTask.description,
            description: `From Obsidian: ${obsidianTask.filePath}:${obsidianTask.lineNumber}`,
            externalId: obsidianTask.id,
            tags: [...obsidianTask.tags],
            status: obsidianTask.completed ? 'COMPLETED' : 'TODO'
        };

        // Map priority
        if (obsidianTask.priority) {
            switch (obsidianTask.priority.toUpperCase()) {
                case 'A':
                    skedPalTask.priority = 'HIGH';
                    break;
                case 'B':
                    skedPalTask.priority = 'MEDIUM';
                    break;
                case 'C':
                case 'D':
                    skedPalTask.priority = 'LOW';
                    break;
            }
        }

        // Map due date
        if (obsidianTask.dueDate) {
            skedPalTask.dueDate = this.formatDateForSkedPal(obsidianTask.dueDate);
        }

        // Add estimated duration if we can derive it
        if (obsidianTask.description.length > 100) {
            skedPalTask.estimatedDuration = 30; // 30 minutes for longer tasks
        } else {
            skedPalTask.estimatedDuration = 15; // 15 minutes for shorter tasks
        }

        return skedPalTask;
    }

    /**
     * Formats date for SkedPal API (ISO 8601)
     */
    private formatDateForSkedPal(dateStr: string): string {
        // Handle various date formats from Obsidian
        if (dateStr.match(/\d{4}-\d{2}-\d{2}/)) {
            return `${dateStr}T00:00:00Z`;
        }
        
        // Try to parse other formats
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
        
        return dateStr;
    }

    /**
     * Makes authenticated API requests to SkedPal
     */
    private async makeApiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
        const url = `${this.baseUrl}${endpoint}`;
        
        const defaultOptions: RequestInit = {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'X-Workspace-Id': this.workspaceId
            }
        };

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, finalOptions);
            
            if (!response.ok) {
                throw new Error(`SkedPal API error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('SkedPal API request failed:', error);
            throw error;
        }
    }

    /**
     * Syncs Obsidian tasks to SkedPal
     */
    async syncTasksToSkedPal(obsidianTasks: ObsidianTask[]): Promise<SkedPalSyncResult> {
        const result: SkedPalSyncResult = {
            success: true,
            syncedTasks: 0,
            errors: [],
            warnings: []
        };

        if (!this.apiKey || !this.workspaceId) {
            result.success = false;
            result.errors.push('SkedPal API credentials not configured');
            return result;
        }

        for (const obsidianTask of obsidianTasks) {
            try {
                const skedPalTask = this.convertToSkedPalTask(obsidianTask);
                
                // Check if task already exists in SkedPal
                const existingTask = await this.findTaskByExternalId(obsidianTask.id);
                
                if (existingTask) {
                    // Update existing task
                    await this.updateTask(existingTask.id!, skedPalTask);
                } else {
                    // Create new task
                    await this.createTask(skedPalTask);
                }
                
                result.syncedTasks++;
            } catch (error) {
                const errorMsg = `Failed to sync task "${obsidianTask.description}": ${error.message}`;
                console.error(errorMsg);
                result.errors.push(errorMsg);
                result.success = false;
            }
        }

        return result;
    }

    /**
     * Creates a new task in SkedPal
     */
    async createTask(task: SkedPalTask): Promise<SkedPalTask> {
        return await this.makeApiRequest('/tasks', {
            method: 'POST',
            body: JSON.stringify(task)
        });
    }

    /**
     * Updates an existing task in SkedPal
     */
    async updateTask(taskId: string, updates: Partial<SkedPalTask>): Promise<SkedPalTask> {
        return await this.makeApiRequest(`/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    /**
     * Finds a task by its external ID (Obsidian task ID)
     */
    async findTaskByExternalId(externalId: string): Promise<SkedPalTask | null> {
        try {
            const tasks = await this.makeApiRequest(`/tasks?externalId=${encodeURIComponent(externalId)}`);
            return tasks.length > 0 ? tasks[0] : null;
        } catch (error) {
            console.warn('Error finding task by external ID:', error);
            return null;
        }
    }

    /**
     * Gets all tasks from SkedPal
     */
    async getTasks(): Promise<SkedPalTask[]> {
        try {
            return await this.makeApiRequest('/tasks');
        } catch (error) {
            console.error('Error getting tasks from SkedPal:', error);
            throw error;
        }
    }

    /**
     * Gets tasks that have been modified since a specific date
     */
    async getModifiedTasks(since: Date): Promise<SkedPalTask[]> {
        try {
            const sinceStr = since.toISOString();
            return await this.makeApiRequest(`/tasks?updatedSince=${encodeURIComponent(sinceStr)}`);
        } catch (error) {
            console.error('Error getting modified tasks from SkedPal:', error);
            throw error;
        }
    }

    /**
     * Deletes a task from SkedPal
     */
    async deleteTask(taskId: string): Promise<void> {
        try {
            await this.makeApiRequest(`/tasks/${taskId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting task from SkedPal:', error);
            throw error;
        }
    }

    /**
     * Tests the connection to SkedPal API
     */
    async testConnection(): Promise<boolean> {
        try {
            await this.makeApiRequest('/workspaces');
            return true;
        } catch (error) {
            console.error('SkedPal connection test failed:', error);
            return false;
        }
    }

    /**
     * Converts a SkedPal task back to Obsidian task format
     */
    convertToObsidianTask(skedPalTask: SkedPalTask): Partial<ObsidianTask> {
        const obsidianTask: Partial<ObsidianTask> = {
            description: skedPalTask.title,
            completed: skedPalTask.status === 'COMPLETED',
            tags: skedPalTask.tags || []
        };

        // Map priority back to Obsidian format
        if (skedPalTask.priority) {
            switch (skedPalTask.priority) {
                case 'HIGH':
                    obsidianTask.priority = 'A';
                    break;
                case 'MEDIUM':
                    obsidianTask.priority = 'B';
                    break;
                case 'LOW':
                    obsidianTask.priority = 'C';
                    break;
            }
        }

        // Map due date
        if (skedPalTask.dueDate) {
            const date = new Date(skedPalTask.dueDate);
            obsidianTask.dueDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        }

        return obsidianTask;
    }
}