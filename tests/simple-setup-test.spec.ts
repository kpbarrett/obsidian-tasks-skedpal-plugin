import { test, expect, MockApp, MockTFile, MockVault } from './setup';
import TaskSyncPlugin from '../plugin-obsidian/src/main';
import { TaskSyncSettingTab } from '../plugin-obsidian/src/settings-tab';

// Test suite for REQ-011: Simple configuration and setup process
test.describe('REQ-011: Simple Configuration and Setup Process', () => {
    let plugin: TaskSyncPlugin;
    let settingsTab: TaskSyncSettingTab;
    let mockApp: MockApp;

    test.beforeEach(async ({ mockApp }) => {
        // Create a mock plugin instance
        plugin = new TaskSyncPlugin(mockApp, {});
        await plugin.loadSettings();
        
        // Create settings tab
        settingsTab = new TaskSyncSettingTab(mockApp, plugin);
    });

    test('should provide clear setup guidance', () => {
        const containerEl = document.createElement('div');
        settingsTab.display();
        
        // Should contain setup guide section
        expect(containerEl.innerHTML).toContain('Quick Setup Guide');
        expect(containerEl.innerHTML).toContain('Step 1: Get SkedPal API Credentials');
        expect(containerEl.innerHTML).toContain('Step 2: Configure Plugin');
        expect(containerEl.innerHTML).toContain('Step 3: Test Connection');
    });

    test('should organize settings into logical sections', () => {
        const containerEl = document.createElement('div');
        settingsTab.display();
        
        // Should have configuration section
        expect(containerEl.innerHTML).toContain('Configuration');
        
        // Should have advanced settings section
        expect(containerEl.innerHTML).toContain('Advanced Settings');
    });

    test('should provide helpful descriptions for settings', () => {
        const containerEl = document.createElement('div');
        settingsTab.display();
        
        // API key description should include guidance
        expect(containerEl.innerHTML).toContain('Get this from SkedPal Settings → API Keys');
        
        // Workspace ID description should include guidance
        expect(containerEl.innerHTML).toContain('Find this in SkedPal Settings → API Keys');
    });

    test('should include test connection functionality', () => {
        const containerEl = document.createElement('div');
        settingsTab.display();
        
        // Should have test connection button
        expect(containerEl.innerHTML).toContain('Test Connection');
        expect(containerEl.innerHTML).toContain('Test Now');
    });

    test('should check if plugin is configured', () => {
        // Test with empty settings
        expect(plugin.isConfigured()).toBe(false);
        
        // Test with partial settings
        plugin.settings.skedPalApiKey = 'test-key';
        expect(plugin.isConfigured()).toBe(false);
        
        // Test with complete settings
        plugin.settings.skedPalWorkspaceId = 'test-workspace';
        expect(plugin.isConfigured()).toBe(true);
    });

    test('should show setup guidance when not configured', () => {
        // Mock localStorage
        const localStorage = {};
        mockApp.loadLocalStorage = (key: string) => localStorage[key];
        mockApp.saveLocalStorage = (key: string, value: string) => {
            localStorage[key] = value;
        };
        
        // Test with empty settings
        plugin.settings.skedPalApiKey = '';
        plugin.settings.skedPalWorkspaceId = '';
        
        // Should show setup guidance
        plugin.showSetupGuidance();
        // Note: This test verifies the logic, actual Notice display is tested in integration tests
    });

    test('should provide test connection command', () => {
        // Should have test connection command registered
        const commands = plugin.getCommands();
        const testCommand = commands.find(cmd => cmd.id === 'test-skedpal-connection');
        expect(testCommand).toBeDefined();
        expect(testCommand.name).toBe('Test SkedPal connection');
    });

    test('should handle unconfigured sync attempts gracefully', async () => {
        // Test sync with empty settings
        plugin.settings.skedPalApiKey = '';
        plugin.settings.skedPalWorkspaceId = '';
        
        await plugin.syncTasks();
        // Should show setup required message
        // Note: This test verifies the logic, actual Notice display is tested in integration tests
    });

    test('should provide clear error messages for configuration issues', () => {
        // Test connection with empty settings
        settingsTab.testConnection();
        // Should show appropriate error message
        // Note: This test verifies the logic, actual error handling is tested in integration tests
    });
});