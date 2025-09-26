import { test, expect } from './setup';

// Simple test to validate that the Obsidian API mocking works
// This test doesn't import any plugin code that requires the real Obsidian API

test('basic Obsidian API mocking works', async ({ mockApp }) => {
    // Test that we can create files and read them
    const file = mockApp.vault.addFile('test.md', 'test.md', '# Test File\n- [ ] Test task');
    
    // Verify file was created
    expect(file).toBeDefined();
    expect(file.name).toBe('test.md');
    expect(file.path).toBe('test.md');
    
    // Verify we can read the file
    const content = await mockApp.vault.read(file);
    expect(content).toContain('Test File');
    expect(content).toContain('Test task');
    
    // Verify we can modify the file
    await mockApp.vault.modify(file, '# Modified File\n- [x] Completed task');
    const modifiedContent = await mockApp.vault.read(file);
    expect(modifiedContent).toContain('Modified File');
    expect(modifiedContent).toContain('Completed task');
});

test('mock supports task detection patterns', async ({ mockApp }) => {
    // Create test files with different patterns
    mockApp.vault.addFile('tasks/daily.md', 'daily.md', '- [ ] Task 1\n- [x] Task 2');
    mockApp.vault.addFile('notes/meeting.md', 'meeting.md', '# Meeting Notes');
    mockApp.vault.addFile('project-tasks.md', 'project-tasks.md', '- [ ] Project task');
    
    // Get all markdown files
    const markdownFiles = mockApp.vault.getMarkdownFiles();
    expect(markdownFiles.length).toBe(3);
    
    // Get files by path
    const taskFile = mockApp.vault.getAbstractFileByPath('tasks/daily.md');
    expect(taskFile).toBeDefined();
    expect(taskFile?.name).toBe('daily.md');
    
    // Test file existence
    expect(mockApp.vault.exists('tasks/daily.md')).toBe(true);
    expect(mockApp.vault.exists('nonexistent.md')).toBe(false);
});

test('mock supports task parsing functionality', async ({ mockApp }) => {
    // Test content with various task formats
    const testContent = `# Daily Tasks

- [ ] Incomplete task with priority (A)
- [x] Completed task
- [ ] Task with due date 📅 2024-01-15
- [ ] Task with tags #work #urgent
- [ ] Regular list item (not a task)
* [ ] Task with asterisk`;

    mockApp.vault.addFile('test.md', 'test.md', testContent);
    
    // Verify file was created and content is accessible
    const file = mockApp.vault.getAbstractFileByPath('test.md');
    expect(file).toBeDefined();
    
    const content = await mockApp.vault.read(file!);
    expect(content).toContain('Incomplete task');
    expect(content).toContain('Completed task');
    expect(content).toContain('📅 2024-01-15');
});

test('mock supports file pattern matching', async ({ mockApp }) => {
    // Create files in different locations
    mockApp.vault.addFile('tasks/daily.md', 'daily.md', '- [ ] Task 1');
    mockApp.vault.addFile('notes/meeting.task.md', 'meeting.task.md', '- [ ] Task 2');
    mockApp.vault.addFile('random.md', 'random.md', '- [ ] Task 3');
    
    // Test pattern matching by checking file paths
    const allFiles = mockApp.vault.getAllFiles();
    
    // Debug: log what files were created
    console.log('All files:', allFiles.map(f => f.path));
    
    const taskFiles = allFiles.filter(file => 
        file.path.includes('tasks/') || 
        file.path.includes('.task.md')
    );
    
    console.log('Task files:', taskFiles.map(f => f.path));
    
    // Should find 2 task files (tasks/daily.md and notes/meeting.task.md)
    expect(taskFiles.length).toBe(2);
    expect(taskFiles.some(f => f.path.includes('tasks/'))).toBe(true);
    expect(taskFiles.some(f => f.path.includes('.task.md'))).toBe(true);
    expect(taskFiles.some(f => f.path.includes('random.md'))).toBe(false);
});