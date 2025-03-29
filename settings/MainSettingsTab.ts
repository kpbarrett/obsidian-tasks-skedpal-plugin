import { PluginSettingTab, Setting } from "obsidian";
import type { SkedPalSyncSettings } from "../types/settings";

export class MainSettingsTab extends PluginSettingTab {
    constructor(
        app: App,
        private settings: SkedPalSyncSettings,
        private save: () => Promise<void>
    ) {
        super(app, app.plugins.plugins["tasks-skedpal-plugin"]);
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl("h2", { text: "Obsidian Tasks to SkedPal Sync" });

        new Setting(containerEl)
            .setName("SkedPal Email Address")
            .setDesc("Enter your personal SkedPal email integration address.")
            .addText((text) =>
                text
                    .setPlaceholder("name@skedpal.com")
                    .setValue(this.settings.skedpalEmail)
                    .onChange(async (value) => {
                        this.settings.skedpalEmail = value.trim();
                        await this.save();
                    })
            );

        containerEl.createEl("h3", { text: "Filtering" });

        new Setting(containerEl)
            .setName("Global Task Filter")
            .setDesc(
                "Only tasks containing this tag will be considered for sync. Matches the Obsidian Tasks plugin default behavior."
            )
            .addText((text) =>
                text
                    .setPlaceholder("#task")
                    .setValue(this.settings.globalTaskFilter)
                    .onChange(async (value) => {
                        this.settings.globalTaskFilter = value.trim();
                        await this.save();
                    })
            );

        new Setting(containerEl)
            .setName("Required Tag for Sync")
            .setDesc(
                "If set, tasks must contain this tag to be synced. Leave blank to sync all matching tasks."
            )
            .addText((text) =>
                text
                    .setPlaceholder("#skedpal")
                    .setValue(this.settings.requiredTagForSync)
                    .onChange(async (value) => {
                        this.settings.requiredTagForSync = value.trim();
                        await this.save();
                    })
            );
    }
}
