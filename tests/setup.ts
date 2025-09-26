/**
 * Test Setup File for Obsidian API Mocking
 * 
 * This file sets up the global mocking environment for Obsidian API components
 * to enable testing in CI/CD environments.
 */

import { MockApp, MockTFile, MockVault, MockNotice, MockPlugin, MockPluginSettingTab, normalizePath } from './obsidian-mocks';

// Global setup function for Playwright
export default async function globalSetup() {
    // Mock the Obsidian module globally
    (global as any).obsidian = {
        App: MockApp,
        TFile: MockTFile,
        Notice: MockNotice,
        Plugin: MockPlugin,
        normalizePath,
        moment: () => ({
            format: (format: string) => '2024-01-01',
            isSame: () => true,
            isBefore: () => false,
            isAfter: () => false,
            add: () => this,
            subtract: () => this
        }),
        PluginSettingTab: class {},
        Workspace: class {},
        Vault: MockVault
    };
}

// Create a test fixture that provides mocked Obsidian API
import { test as baseTest, expect } from '@playwright/test';

export const test = baseTest.extend({
    mockApp: async ({}, use) => {
        const mockApp = new MockApp();
        await use(mockApp);
        
        // Clean up after test
        MockNotice.clearMessages();
    },
});

// Export mock utilities for use in individual test files
export { MockApp, MockTFile, MockVault, MockNotice, MockPlugin, MockPluginSettingTab, normalizePath };
export { expect } from '@playwright/test';