/**
 * Test Utilities for Obsidian-SkedPal E2E Testing
 * 
 * This module provides reusable test helpers, data factories, and utilities
 * for the end-to-end test suite.
 */

import { MockTFile } from './obsidian-mocks';

// Task data factory for generating test tasks
export interface TestTask {
  id?: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
  tags?: string[];
  source?: 'obsidian' | 'skedpal';
}

/**
 * Generate a random test task with realistic data
 */
export function generateTestTask(overrides: Partial<TestTask> = {}): TestTask {
  const baseTask: TestTask = {
    title: `Test Task ${Math.random().toString(36).substring(2, 8)}`,
    description: `This is a test task description for automated testing.`,
    dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
    completed: Math.random() > 0.7,
    tags: ['test', 'automation', 'e2e'].slice(0, Math.floor(Math.random() * 3) + 1),
    source: 'obsidian',
    ...overrides
  };

  return baseTask;
}

/**
 * Convert a test task to Obsidian markdown format
 */
export function taskToObsidianMarkdown(task: TestTask): string {
  const checkbox = task.completed ? '[x]' : '[ ]';
  const priorityIcon = getPriorityIcon(task.priority);
  const tags = task.tags?.map(tag => `#${tag}`).join(' ') || '';
  const dueDate = task.dueDate ? ` 📅 ${task.dueDate}` : '';
  
  return `- ${checkbox} ${priorityIcon} ${task.title}${dueDate} ${tags}`;
}

/**
 * Convert Obsidian markdown to a test task
 */
export function obsidianMarkdownToTask(markdown: string): TestTask {
  const taskRegex = /^-\s*\[(.)\]\s*(.*?)(?:\s*📅\s*(\d{4}-\d{2}-\d{2}))?(?:\s*(#\w+\s*)*)?$/;
  const match = markdown.match(taskRegex);
  
  if (!match) {
    throw new Error(`Invalid Obsidian task format: ${markdown}`);
  }

  const [, status, title, dueDate, tags] = match;
  const completed = status.toLowerCase() === 'x';
  const priority = extractPriorityFromTitle(title);
  const cleanTitle = title.replace(/[🔴🟡🟢]/g, '').trim();
  const tagList = tags ? tags.trim().split(/\s+/).map(tag => tag.substring(1)) : [];

  return {
    title: cleanTitle,
    dueDate: dueDate || undefined,
    priority,
    completed,
    tags: tagList,
    source: 'obsidian'
  };
}

/**
 * Get priority icon for Obsidian markdown
 */
function getPriorityIcon(priority?: 'low' | 'medium' | 'high'): string {
  switch (priority) {
    case 'high': return '🔴';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '';
  }
}

/**
 * Extract priority from task title
 */
function extractPriorityFromTitle(title: string): 'low' | 'medium' | 'high' | undefined {
  if (title.includes('🔴')) return 'high';
  if (title.includes('🟡')) return 'medium';
  if (title.includes('🟢')) return 'low';
  return undefined;
}

/**
 * Create a test Obsidian vault with sample tasks
 */
export function createTestVault(tasks: TestTask[] = []): { vault: any; files: MockTFile[] } {
  const { MockVault, MockApp } = require('./obsidian-mocks');
  
  const app = new MockApp();
  const vault = app.vault;
  const files: MockTFile[] = [];

  // Create default test files
  const defaultTasks: TestTask[] = [
    {
      title: 'Complete project documentation',
      description: 'Write comprehensive documentation for the project',
      dueDate: '2024-12-31',
      priority: 'high',
      completed: false,
      tags: ['documentation', 'important'],
      source: 'obsidian'
    },
    {
      title: 'Review pull requests',
      description: 'Review and provide feedback on open pull requests',
      dueDate: '2024-11-15',
      priority: 'medium',
      completed: true,
      tags: ['code-review', 'team'],
      source: 'obsidian'
    },
    {
      title: 'Update dependencies',
      description: 'Update project dependencies to latest versions',
      priority: 'low',
      completed: false,
      tags: ['maintenance'],
      source: 'obsidian'
    }
  ];

  const allTasks = [...defaultTasks, ...tasks];
  
  // Create daily note with tasks
  const dailyNoteContent = `# Daily Tasks\n\n${allTasks.map(taskToObsidianMarkdown).join('\n')}`;
  const dailyNote = vault.addFile('Daily/2024-01-01.md', '2024-01-01.md', dailyNoteContent);
  files.push(dailyNote);

  // Create project note with tasks
  const projectNoteContent = `# Project Tasks\n\n- [ ] Plan sprint goals\n- [x] Complete user research\n- [ ] Design wireframes`;
  const projectNote = vault.addFile('Projects/Test Project.md', 'Test Project.md', projectNoteContent);
  files.push(projectNote);

  return { vault, files };
}

/**
 * Wait for a condition to be true with timeout
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const result = await condition();
    if (result) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  return false;
}

/**
 * Mock SkedPal API responses
 */
export class MockSkedPalAPI {
  private tasks: Map<string, any> = new Map();
  private nextId = 1;

  /**
   * Simulate creating a task in SkedPal
   */
  async createTask(taskData: any): Promise<any> {
    const taskId = `skedpal_${this.nextId++}`;
    const task = {
      id: taskId,
      title: taskData.title,
      description: taskData.description || '',
      due_date: taskData.dueDate || null,
      priority: taskData.priority || 'medium',
      status: taskData.completed ? 'completed' : 'active',
      tags: taskData.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.tasks.set(taskId, task);
    return task;
  }

  /**
   * Simulate updating a task in SkedPal
   */
  async updateTask(taskId: string, updates: any): Promise<any> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const updatedTask = { ...task, ...updates, updated_at: new Date().toISOString() };
    this.tasks.set(taskId, updatedTask);
    return updatedTask;
  }

  /**
   * Simulate deleting a task in SkedPal
   */
  async deleteTask(taskId: string): Promise<void> {
    if (!this.tasks.has(taskId)) {
      throw new Error(`Task not found: ${taskId}`);
    }
    this.tasks.delete(taskId);
  }

  /**
   * Simulate getting all tasks from SkedPal
   */
  async getTasks(): Promise<any[]> {
    return Array.from(this.tasks.values());
  }

  /**
   * Simulate getting a specific task from SkedPal
   */
  async getTask(taskId: string): Promise<any> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    return task;
  }

  /**
   * Clear all mock tasks
   */
  clear(): void {
    this.tasks.clear();
    this.nextId = 1;
  }

  /**
   * Get task count
   */
  getTaskCount(): number {
    return this.tasks.size;
  }
}

/**
 * Test environment configuration
 */
export const TestConfig = {
  // Obsidian test vault settings
  vaultPath: '/test-vault',
  defaultFiles: ['Daily/2024-01-01.md', 'Projects/Test Project.md'],
  
  // SkedPal test settings
  skedpalBaseUrl: 'https://test.skedpal.com',
  testUserId: 'test-user-123',
  
  // Test data settings
  maxTasksPerTest: 10,
  defaultTimeout: 10000,
  
  // Chrome extension settings
  extensionId: 'test-extension-id',
  extensionVersion: '1.0.0'
};

/**
 * Assertion helpers for task comparison
 */
export function assertTasksEqual(actual: TestTask, expected: TestTask): void {
  expect(actual.title).toBe(expected.title);
  expect(actual.dueDate).toBe(expected.dueDate);
  expect(actual.priority).toBe(expected.priority);
  expect(actual.completed).toBe(expected.completed);
  expect(actual.tags).toEqual(expected.tags);
}

/**
 * Generate test report data
 */
export function generateTestReport(
  testName: string,
  duration: number,
  tasksProcessed: number,
  errors: string[] = []
): any {
  return {
    testName,
    timestamp: new Date().toISOString(),
    duration,
    tasksProcessed,
    errors,
    success: errors.length === 0
  };
}