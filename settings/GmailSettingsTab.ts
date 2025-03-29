import { PluginSettingTab, Setting } from "obsidian";
import { GmailAuth } from "./auth/GmailAuth";

export class GmailSettingsTab extends PluginSettingTab {
    constructor(app: App, private auth: GmailAuth) {
        super(app, app.plugins.plugins["tasks-skedpal-plugin"]);
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl("h2", { text: "Gmail Integration" });

        new Setting(containerEl)
            .setName("Connect to Gmail")
            .setDesc(
                "Authorize this plugin to send tasks using your Gmail account."
            )
            .addButton((btn) =>
                btn
                    .setButtonText("Authorize")
                    .setCta()
                    .onClick(async () => {
                        try {
                            const token = await this.auth.getAccessToken();
                            new Notice("Gmail authorization successful.");
                            console.log("Access token:", token);
                        } catch (err) {
                            console.error(err);
                            new Notice(
                                "Gmail authorization failed. Check console."
                            );
                        }
                    })
            );
    }
}
