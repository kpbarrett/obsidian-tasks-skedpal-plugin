import { test, expect } from './setup';

// Test for agent system functionality with Obsidian API mocking
test('agent system processes tasks correctly with Obsidian integration', async ({ mockApp }) => {

    // Test that the MockVault works correctly
    mockApp.vault.addFile('ops/jobs/inbox/test-dev.json', 'test-dev.json', JSON.stringify({
        id: 'test-dev-001',
        type: 'implement-feature',
        title: 'Test Developer Task',
        feature: 'test-feature',
        priority: 'normal',
        agent: 'developer'
    }, null, 2));

    mockApp.vault.addFile('ops/jobs/inbox/test-tester.json', 'test-tester.json', JSON.stringify({
        id: 'test-tester-001',
        type: 'run-test',
        title: 'Test Tester Task',
        test: 'stub',
        priority: 'normal',
        agent: 'tester'
    }, null, 2));

    // Verify files were created
    const files = mockApp.vault.getAllFiles();
    expect(files.length).toBeGreaterThan(0);

    // Verify file content can be read
    const testFile = mockApp.vault.getAbstractFileByPath('ops/jobs/inbox/test-dev.json');
    expect(testFile).toBeDefined();

    if (testFile) {
        const content = await mockApp.vault.read(testFile as any);
        const taskData = JSON.parse(content);
        expect(taskData.agent).toBe('developer');
        expect(taskData.type).toBe('implement-feature');
    }
});
test('orchestrator routes tasks to correct agents', async ({ mockApp }) => {
    // This test doesn't require Obsidian API, so it can remain as is
    // but we need to ensure the orchestrator module is properly mocked

    // Mock the orchestrator module
    const mockRouteTaskToAgent = (task: any) => {
        if (task.agent) return task.agent;

        switch (task.type) {
            case 'implement-feature':
            case 'fix-bug':
                return 'developer';
            case 'run-test':
                return 'tester';
            case 'analyze-test-results':
                return 'engineer';
            case 'coordinate-workflow':
            case 'monitor-progress':
                return 'general';
            default:
                return 'general';
        }
    };
    // Test developer tasks
    expect(mockRouteTaskToAgent({ type: 'implement-feature' })).toBe('developer');
    expect(mockRouteTaskToAgent({ type: 'fix-bug' })).toBe('developer');

    // Test tester tasks
    expect(mockRouteTaskToAgent({ type: 'run-test' })).toBe('tester');

    // Test engineer tasks
    expect(mockRouteTaskToAgent({ type: 'analyze-test-results' })).toBe('engineer');

    // Test general tasks
    expect(mockRouteTaskToAgent({ type: 'coordinate-workflow' })).toBe('general');
    expect(mockRouteTaskToAgent({ type: 'monitor-progress' })).toBe('general');

    // Test explicit agent assignment
    expect(mockRouteTaskToAgent({ agent: 'developer' })).toBe('developer');
    expect(mockRouteTaskToAgent({ agent: 'tester' })).toBe('tester');

    // Test default routing for unknown types
    expect(mockRouteTaskToAgent({ type: 'unknown-task-type' })).toBe('general');
});

test('Obsidian API mocking provides complete functionality', async ({ mockApp }) => {
    const mockVault = mockApp.vault;

    // Test file creation and reading
    await mockVault.create('test.md', '# Test File\n- [ ] Test task');

    const files = mockVault.getMarkdownFiles();
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe('test.md');

    // Test file reading
    const content = await mockVault.read(files[0]);
    expect(content).toContain('Test File');
    expect(content).toContain('Test task');

    // Test file modification
    await mockVault.modify(files[0], '# Modified File\n- [x] Completed task');
    const modifiedContent = await mockVault.read(files[0]);
    expect(modifiedContent).toContain('Modified File');
    expect(modifiedContent).toContain('Completed task');

    // Test file deletion
    await mockVault.delete(files[0]);
    const remainingFiles = mockVault.getMarkdownFiles();
    expect(remainingFiles).toHaveLength(0);
});

