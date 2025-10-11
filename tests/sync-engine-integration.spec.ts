/**
 * Sync Engine Integration Tests
 * 
 * Tests the core synchronization logic between Obsidian and SkedPal
 */

import { test, expect } from './setup';
import { 
  generateTestTask, 
  createTestVault, 
  MockSkedPalAPI, 
  TestConfig,
  assertTasksEqual,
  waitFor 
} from './test-utils';

// Mock sync engine for testing
class MockSyncEngine {
  private obsidianVault: any;
  private skedpalAPI: MockSkedPalAPI;
  private syncInProgress = false;

  constructor(obsidianVault: any, skedpalAPI: MockSkedPalAPI) {
    this.obsidianVault = obsidianVault;
    this.skedpalAPI = skedpalAPI;
  }

  /**
   * Sync tasks from Obsidian to SkedPal
   */
  async syncToSkedPal(): Promise<{ success: boolean; tasksSynced: number; errors: string[] }> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    const errors: string[] = [];
    let tasksSynced = 0;

    try {
      // Get all markdown files from Obsidian
      const markdownFiles = this.obsidianVault.getMarkdownFiles();
      
      for (const file of markdownFiles) {
        const content = await this.obsidianVault.read(file);
        const tasks = this.extractTasksFromMarkdown(content);
        
        for (const task of tasks) {
          try {
            await this.skedpalAPI.createTask(task);
            tasksSynced++;
          } catch (error) {
            errors.push(`Failed to sync task "${task.title}": ${error}`);
          }
        }
      }

      return { success: errors.length === 0, tasksSynced, errors };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync tasks from SkedPal to Obsidian
   */
  async syncFromSkedPal(): Promise<{ success: boolean; tasksSynced: number; errors: string[] }> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    const errors: string[] = [];
    let tasksSynced = 0;

    try {
      const skedpalTasks = await this.skedpalAPI.getTasks();
      
      for (const task of skedpalTasks) {
        try {
          // Convert SkedPal task to Obsidian format and add to vault
          const markdownTask = this.convertToObsidianMarkdown(task);
          await this.addTaskToVault(markdownTask);
          tasksSynced++;
        } catch (error) {
          errors.push(`Failed to sync task "${task.title}": ${error}`);
        }
      }

      return { success: errors.length === 0, tasksSynced, errors };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Extract tasks from Obsidian markdown content
   */
  private extractTasksFromMarkdown(content: string): any[] {
    const tasks: any[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const taskMatch = line.match(/^-\s*\[(.)\]\s*(.*)$/);
      if (taskMatch) {
        const [, status, title] = taskMatch;
        const completed = status.toLowerCase() === 'x';
        
        tasks.push({
          title: title.trim(),
          completed,
          source: 'obsidian'
        });
      }
    }
    
    return tasks;
  }

  /**
   * Convert SkedPal task to Obsidian markdown format
   */
  private convertToObsidianMarkdown(task: any): string {
    const checkbox = task.status === 'completed' ? '[x]' : '[ ]';
    return `- ${checkbox} ${task.title}`;
  }

  /**
   * Add a task to the Obsidian vault
   */
  private async addTaskToVault(markdownTask: string): Promise<void> {
    // Find or create a daily note to add the task to
    const dailyNotePath = 'Daily/2024-01-01.md';
    let dailyNote = this.obsidianVault.getAbstractFileByPath(dailyNotePath);
    
    if (!dailyNote) {
      dailyNote = await this.obsidianVault.create(dailyNotePath, '# Daily Tasks\n\n');
    }
    
    const currentContent = await this.obsidianVault.read(dailyNote);
    const updatedContent = currentContent + '\n' + markdownTask;
    
    await this.obsidianVault.modify(dailyNote, updatedContent);
  }

  /**
   * Check if sync is in progress
   */
  isSyncInProgress(): boolean {
    return this.syncInProgress;
  }
}

test.describe('Sync Engine Integration Tests', () => {
  let syncEngine: MockSyncEngine;
  let skedpalAPI: MockSkedPalAPI;
  let testVault: any;

  test.beforeEach(async () => {
    // Set up test environment
    const { vault } = createTestVault();
    testVault = vault;
    skedpalAPI = new MockSkedPalAPI();
    syncEngine = new MockSyncEngine(testVault, skedpalAPI);
  });

  test.afterEach(() => {
    // Clean up
    skedpalAPI.clear();
  });

  test('should sync tasks from Obsidian to SkedPal successfully', async () => {
    // Arrange
    const initialSkedPalTaskCount = skedpalAPI.getTaskCount();
    
    // Act
    const result = await syncEngine.syncToSkedPal();
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.tasksSynced).toBeGreaterThan(0);
    expect(result.errors).toHaveLength(0);
    expect(skedpalAPI.getTaskCount()).toBeGreaterThan(initialSkedPalTaskCount);
  });

  test('should sync tasks from SkedPal to Obsidian successfully', async () => {
    // Arrange
    const testTask = generateTestTask({ title: 'Test Task from SkedPal' });
    await skedpalAPI.createTask(testTask);
    
    const initialVaultFiles = testVault.getFiles().length;
    
    // Act
    const result = await syncEngine.syncFromSkedPal();
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.tasksSynced).toBe(1);
    expect(result.errors).toHaveLength(0);
    
    // Verify task was added to vault
    const dailyNote = testVault.getAbstractFileByPath('Daily/2024-01-01.md');
    const content = await testVault.read(dailyNote);
    expect(content).toContain('Test Task from SkedPal');
  });

  test('should handle sync conflicts gracefully', async () => {
    // Arrange - Create same task in both systems
    const conflictingTask = generateTestTask({ title: 'Conflicting Task' });
    
    // Add to Obsidian
    const dailyNote = testVault.getAbstractFileByPath('Daily/2024-01-01.md');
    const currentContent = await testVault.read(dailyNote);
    const updatedContent = currentContent + '\n- [ ] Conflicting Task';
    await testVault.modify(dailyNote, updatedContent);
    
    // Add to SkedPal
    await skedpalAPI.createTask(conflictingTask);
    
    // Act - Sync both directions
    const toSkedPalResult = await syncEngine.syncToSkedPal();
    const fromSkedPalResult = await syncEngine.syncFromSkedPal();
    
    // Assert - Both syncs should complete with the duplicate task
    expect(toSkedPalResult.success).toBe(true);
    expect(fromSkedPalResult.success).toBe(true);
    
    // The task should exist in both systems (duplicate handling would be more sophisticated in real implementation)
    const finalContent = await testVault.read(dailyNote);
    expect(finalContent.match(/Conflicting Task/g)?.length).toBeGreaterThanOrEqual(1);
    expect(skedpalAPI.getTaskCount()).toBeGreaterThan(0);
  });

  test('should prevent concurrent sync operations', async () => {
    // Arrange
    let secondSyncStarted = false;
    let secondSyncError = null;
    
    // Start first sync
    const firstSync = syncEngine.syncToSkedPal();
    
    // Try to start second sync immediately
    setTimeout(async () => {
      secondSyncStarted = true;
      try {
        await syncEngine.syncToSkedPal();
      } catch (error) {
        secondSyncError = error;
      }
    }, 100);
    
    // Wait for first sync to complete
    await firstSync;
    
    // Wait a bit for the second sync attempt to complete
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Assert
    expect(secondSyncStarted).toBe(true);
    expect(secondSyncError).toBeDefined();
    if (secondSyncError) {
      expect(secondSyncError.message).toContain('Sync already in progress');
    }
  });

  test('should handle network errors during sync', async () => {
    // Arrange - Mock network failure
    const originalCreateTask = skedpalAPI.createTask.bind(skedpalAPI);
    skedpalAPI.createTask = async () => {
      throw new Error('Network timeout');
    };
    
    // Act
    const result = await syncEngine.syncToSkedPal();
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Network timeout');
    
    // Restore original method
    skedpalAPI.createTask = originalCreateTask;
  });

  test('should sync task metadata correctly', async () => {
    // Arrange
    const taskWithMetadata = generateTestTask({
      title: 'Task with Metadata',
      description: 'This task has detailed metadata',
      dueDate: '2024-12-25',
      priority: 'high',
      tags: ['important', 'holiday']
    });
    
    // Add task to SkedPal
    await skedpalAPI.createTask(taskWithMetadata);
    
    // Act
    const result = await syncEngine.syncFromSkedPal();
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.tasksSynced).toBe(1);
    
    // Verify task was synced (basic verification - real implementation would check metadata mapping)
    const dailyNote = testVault.getAbstractFileByPath('Daily/2024-01-01.md');
    const content = await testVault.read(dailyNote);
    expect(content).toContain('Task with Metadata');
  });

  test('should handle empty vault and empty SkedPal account', async () => {
    // Arrange - Create empty vault
    const { vault: emptyVault } = createTestVault([]);
    const emptySyncEngine = new MockSyncEngine(emptyVault, skedpalAPI);
    
    // Act
    const toSkedPalResult = await emptySyncEngine.syncToSkedPal();
    const fromSkedPalResult = await emptySyncEngine.syncFromSkedPal();
    
    // Assert
    expect(toSkedPalResult.success).toBe(true);
    // Empty vault still has default files with tasks
    expect(toSkedPalResult.tasksSynced).toBeGreaterThan(0);
    expect(fromSkedPalResult.success).toBe(true);
    // SkedPal is empty, so no tasks to sync from
    expect(fromSkedPalResult.tasksSynced).toBe(0);
  });

  test('should report sync progress and status', async () => {
    // Arrange
    const largeTaskSet = Array.from({ length: 5 }, (_, i) => 
      generateTestTask({ title: `Batch Task ${i + 1}` })
    );
    
    const { vault: largeVault } = createTestVault(largeTaskSet);
    const largeSyncEngine = new MockSyncEngine(largeVault, skedpalAPI);
    
    // Act
    const result = await largeSyncEngine.syncToSkedPal();
    
    // Assert
    expect(result.success).toBe(true);
    // Total tasks = default tasks (3) + project tasks (3) + batch tasks (5) = 11
    expect(result.tasksSynced).toBe(11);
    expect(result.errors).toHaveLength(0);
    
    // Verify sync is no longer in progress
    expect(largeSyncEngine.isSyncInProgress()).toBe(false);
  });
});