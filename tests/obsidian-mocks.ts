/**
 * Comprehensive Obsidian API Mock for Testing Environment
 * 
 * This module provides mock implementations of Obsidian API components
 * to enable testing in CI/CD environments where the actual Obsidian API is not available.
 */

// Mock TFile class
export class MockTFile {
    constructor(
        public path: string,
        public name: string,
        public extension: string,
        public stat: { mtime: number, ctime: number, size: number } = { 
            mtime: Date.now(), 
            ctime: Date.now(), 
            size: 0 
        }
    ) {}
}

// Mock Vault class
export class MockVault {
    private files: Map<string, MockTFile> = new Map();
    private fileContents: Map<string, string> = new Map();
    private fileModificationTimes: Map<string, number> = new Map();

    getMarkdownFiles(): MockTFile[] {
        return Array.from(this.files.values()).filter(file => file.extension === 'md');
    }

    getAllFiles(): MockTFile[] {
        return Array.from(this.files.values());
    }

    getAbstractFileByPath(path: string): MockTFile | null {
        return this.files.get(path) || null;
    }

    getFiles(): MockTFile[] {
        return Array.from(this.files.values());
    }

    create(path: string, content: string): Promise<MockTFile> {
        const name = path.split('/').pop() || path;
        const extension = name.split('.').pop() || '';
        const file = new MockTFile(path, name, extension);
        
        this.files.set(path, file);
        this.fileContents.set(path, content);
        this.fileModificationTimes.set(path, Date.now());
        
        return Promise.resolve(file);
    }

    addFile(path: string, name: string, content: string): MockTFile {
        const extension = name.split('.').pop() || '';
        const file = new MockTFile(path, name, extension);
        
        this.files.set(path, file);
        this.fileContents.set(path, content);
        this.fileModificationTimes.set(path, Date.now());
        
        return file;
    }

    async read(file: MockTFile): Promise<string> {
        return this.fileContents.get(file.path) || '';
    }

    async modify(file: MockTFile, content: string): Promise<void> {
        this.fileContents.set(file.path, content);
        this.fileModificationTimes.set(file.path, Date.now());
    }

    async delete(file: MockTFile): Promise<void> {
        this.files.delete(file.path);
        this.fileContents.delete(file.path);
        this.fileModificationTimes.delete(file.path);
    }

    exists(path: string): boolean {
        return this.files.has(path);
    }

    getResourcePath(path: string): string {
        return `mock://${path}`;
    }

    // Mock event system
    private eventHandlers: Map<string, Function[]> = new Map();

    on(event: string, callback: Function): void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event)!.push(callback);
    }

    trigger(event: string, ...args: any[]): void {
        const handlers = this.eventHandlers.get(event) || [];
        handlers.forEach(handler => handler(...args));
    }
}

// Mock Notice class
export class MockNotice {
    private static messages: string[] = [];

    constructor(message: string, duration?: number) {
        MockNotice.messages.push(message);
        console.log(`[NOTICE] ${message}`);
    }

    static getMessages(): string[] {
        return [...MockNotice.messages];
    }

    static clearMessages(): void {
        MockNotice.messages = [];
    }
}

// Mock App class
export class MockApp {
    vault: MockVault;
    workspace: any;
    metadataCache: any;

    constructor() {
        this.vault = new MockVault();
        this.workspace = {
            getActiveFile: () => null,
            on: () => ({})
        };
        this.metadataCache = {
            getFileCache: () => null,
            on: () => ({})
        };
    }

    // Mock plugin management
    private plugins: Map<string, any> = new Map();

    loadPlugin(pluginId: string, plugin: any): void {
        this.plugins.set(pluginId, plugin);
    }

    unloadPlugin(pluginId: string): void {
        this.plugins.delete(pluginId);
    }
}

// Mock Plugin base class
export abstract class MockPlugin {
    app: MockApp;
    manifest: any;

    constructor(app: MockApp) {
        this.app = app;
        this.manifest = {
            name: 'Mock Plugin',
            version: '1.0.0'
        };
    }

    abstract onload(): Promise<void>;
    abstract onunload(): void;

    addCommand(command: any): void {
        console.log(`[PLUGIN] Command added: ${command.id}`);
    }

    addSettingTab(tab: any): void {
        console.log(`[PLUGIN] Setting tab added: ${tab.constructor.name}`);
    }

    registerEvent(eventHandler: any): void {
        console.log(`[PLUGIN] Event handler registered`);
    }

    async loadData(): Promise<any> {
        return {};
    }

    async saveData(data: any): Promise<void> {
        console.log(`[PLUGIN] Data saved`);
    }
}

// Mock PluginSettingTab class
export class MockPluginSettingTab {
    app: MockApp;
    plugin: MockPlugin;

    constructor(app: MockApp, plugin: MockPlugin) {
        this.app = app;
        this.plugin = plugin;
    }

    display(): void {
        console.log(`[PLUGIN] Setting tab displayed`);
    }
}

// Mock utility functions
export function normalizePath(path: string): string {
    return path.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/\/$/, '');
}

export function moment(input?: any): any {
    return {
        format: (format: string) => {
            if (input instanceof Date) {
                return input.toISOString().split('T')[0]; // Simple date formatting
            }
            return '2024-01-01'; // Default mock date
        },
        isSame: (other: any) => true,
        isBefore: (other: any) => false,
        isAfter: (other: any) => false,
        add: (amount: number, unit: string) => this,
        subtract: (amount: number, unit: string) => this
    };
}

// Mock Obsidian API module
export const obsidian = {
    App: MockApp,
    TFile: MockTFile,
    Notice: MockNotice,
    Plugin: MockPlugin,
    PluginSettingTab: MockPluginSettingTab,
    normalizePath,
    moment,
    // Additional Obsidian API components that might be needed
    Workspace: class MockWorkspace {
        constructor(app: MockApp) {}
    },
    Vault: MockVault
};

// Default export for convenience
export default obsidian;