import { test, expect } from './setup';

// Test file specifically for validating the Obsidian API mocking
// This file tests the mocks without importing the plugin code that requires Obsidian API

test('Obsidian API mocks are properly set up', async ({ mockApp }) => {
    // Test that the mock App is available
    expect(mockApp).toBeDefined();
    expect(mockApp.vault).toBeDefined();
    expect(mockApp.workspace).toBeDefined();
    expect(mockApp.metadataCache).toBeDefined();
});

test('MockVault file operations work correctly', async ({ mockApp }) => {
    const mockVault = mockApp.vault;
    
    // Test file creation
    const file = mockVault.addFile('test.md', 'test.md', '# Test File\n- [ ] Test task');
    expect(file).toBeDefined();
    expect(file.name).toBe('test.md');
    expect(file.path).toBe('test.md');
    
    // Test file retrieval
    const files = mockVault.getAllFiles();
    expect(files.length).toBe(1);
    expect(files[0].name).toBe('test.md');
    
    // Test file reading
    const content = await mockVault.read(file);
    expect(content).toContain('Test File');
    expect(content).toContain('Test task');
    
    // Test file modification
    await mockVault.modify(file, '# Modified File\n- [x] Completed task');
    const modifiedContent = await mockVault.read(file);
    expect(modifiedContent).toContain('Modified File');
    expect(modifiedContent).toContain('Completed task');
    
    // Test file deletion
    await mockVault.delete(file);
    const remainingFiles = mockVault.getAllFiles();
    expect(remainingFiles.length).toBe(0);
});

test('MockNotice functionality works', async ({ mockApp }) => {
    // Import the MockNotice class directly
    const { MockNotice } = await import('./obsidian-mocks');
    
    // Clear any existing messages
    MockNotice.clearMessages();
    
    // Create a notice
    new MockNotice('Test message');
    
    // Verify the notice was created
    const messages = MockNotice.getMessages();
    expect(messages).toContain('Test message');
});

test('MockPluginSettingTab is available', async ({ mockApp }) => {
    // Test that the MockPluginSettingTab class is available through the mockApp
    // The global setup might not be working as expected, but the fixture should work
    
    // Import the mock class directly
    const { MockPluginSettingTab } = await import('./obsidian-mocks');
    expect(MockPluginSettingTab).toBeDefined();
    
    // Test that we can create a MockPluginSettingTab instance
    const { MockPlugin } = await import('./obsidian-mocks');
    
    // Create a minimal mock plugin
    class TestPlugin extends MockPlugin {
        async onload() {}
        onunload() {}
    }
    
    const testPlugin = new TestPlugin(mockApp);
    const settingTab = new MockPluginSettingTab(mockApp, testPlugin);
    expect(settingTab).toBeDefined();
    expect(settingTab.app).toBe(mockApp);
    expect(settingTab.plugin).toBe(testPlugin);
});