import { TFile, Vault, App, Notice } from "obsidian";
import {
    parseSyncableTasks,
    composeSkedPalEmail,
    ParsedTask,
} from "./TaskParser";
import { EmailSender } from "./email/EmailSender";
import type { SkedPalSyncSettings } from "./types/settings";

interface SyncCache {
    [filePath: string]: number[];
}

export class SyncService {
    private syncedCache: SyncCache = {};
    private debounceTimers: Map<string, number> = new Map();

    constructor(
        private app: App,
        private vault: Vault,
        private sender: EmailSender,
        private settings: SkedPalSyncSettings,
        private loadData: () => Promise<any>,
        private saveData: (data: any) => Promise<void>
    ) {}

    async initialize() {
        const data = await this.loadData();
        this.syncedCache = data?.syncedTasks || {};
    }

    register() {
        this.app.vault.on("modify", (file) => {
            if (file instanceof TFile && file.extension === "md") {
                this.debounceFile(file);
            }
        });
    }

    private debounceFile(file: TFile) {
        const path = file.path;
        if (this.debounceTimers.has(path)) {
            window.clearTimeout(this.debounceTimers.get(path));
        }

        const timer = window.setTimeout(() => this.handleFileChange(file), 500);
        this.debounceTimers.set(path, timer);
    }

    private async handleFileChange(file: TFile) {
        try {
            const content = await this.vault.read(file);
            const lines = content.split("\n");
            const parsed = parseSyncableTasks(lines, this.settings);

            const syncedLines = new Set(this.syncedCache[file.path] || []);
            const toSync = parsed.filter(
                (task) => !syncedLines.has(task.lineNumber)
            );

            for (const task of toSync) {
                const { to, subject, body } = composeSkedPalEmail(
                    task,
                    this.settings
                );
                await this.sender.sendEmail(to, subject, body);
                new Notice(`Synced task: ${subject}`);
                syncedLines.add(task.lineNumber);
            }

            if (toSync.length > 0) {
                this.syncedCache[file.path] = Array.from(syncedLines);
                await this.saveData({ syncedTasks: this.syncedCache });
            }
        } catch (err) {
            console.error("Failed to sync tasks:", err);
            new Notice("Error syncing task(s). Check console.");
        }
    }
}
