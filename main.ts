import {
    App,
    Editor,
    MarkdownView,
    Modal,
    Notice,
    Plugin,
    PluginSettingTab,
    Setting,
} from "obsidian";
import { SkedPalSyncSettings, DEFAULT_SETTINGS } from "./types/settings";
import { MainSettingsTab } from "./settings/MainSettingsTab";
import { GmailSettingsTab } from "./settings/GmailSettingsTab";
import { GmailAuth } from "./auth/GmailAuth";
import { runTestParser } from "./testParser";

export default class SkedPalSyncPlugin extends Plugin {
    settings: SkedPalSyncSettings;

    async onload() {
        await this.loadSettings();
        console.log("Running test parser");
        runTestParser(); // TEMPORARY: remove after confirming output
        console.log("Loaded SkedPal Sync plugin");

        // This creates an icon in the left ribbon.
        const ribbonIconEl = this.addRibbonIcon(
            "dice",
            "Sample Plugin",
            (evt: MouseEvent) => {
                // Called when the user clicks the icon.
                new Notice("This is a notice!");
            }
        );
        // Perform additional things with the ribbon
        ribbonIconEl.addClass("my-plugin-ribbon-class");

        // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
        const statusBarItemEl = this.addStatusBarItem();
        statusBarItemEl.setText("Status Bar Text");

        // This adds a simple command that can be triggered anywhere
        this.addCommand({
            id: "open-sample-modal-simple",
            name: "Open sample modal (simple)",
            callback: () => {
                new SampleModal(this.app).open();
            },
        });
        // This adds an editor command that can perform some operation on the current editor instance
        this.addCommand({
            id: "sample-editor-command",
            name: "Sample editor command",
            editorCallback: (editor: Editor, view: MarkdownView) => {
                console.log(editor.getSelection());
                editor.replaceSelection("Sample Editor Command");
            },
        });
        // This adds a complex command that can check whether the current state of the app allows execution of the command
        this.addCommand({
            id: "open-sample-modal-complex",
            name: "Open sample modal (complex)",
            checkCallback: (checking: boolean) => {
                // Conditions to check
                const markdownView =
                    this.app.workspace.getActiveViewOfType(MarkdownView);
                if (markdownView) {
                    // If checking is true, we're simply "checking" if the command can be run.
                    // If checking is false, then we want to actually perform the operation.
                    if (!checking) {
                        new SampleModal(this.app).open();
                    }

                    // This command will only show up in Command Palette when the check function returns true
                    return true;
                }
            },
        });

        this.addSettingTab(
            new MainSettingsTab(
                this.app,
                this.settings,
                this.saveSettings.bind(this)
            )
        );
        this.addSettingTab(new GmailSettingsTab(this.app, new GmailAuth(this)));

        // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
        // Using this function will automatically remove the event listener when this plugin is disabled.
        this.registerDomEvent(document, "click", (evt: MouseEvent) => {
            console.log("click", evt);
        });

        // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
        this.registerInterval(
            window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
        );
    }

    onunload() {}

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class SampleModal extends Modal {
    constructor(app: App) {
        super(app);
    }

    async onOpen() {
        const { contentEl } = this;
        contentEl.setText("Woah!");

        // Create a new note with a title and some text
        const fileName = "New Note.md";
        const fileContent = `# Note Title\n\nThis is the content of the note.`;
        await this.app.vault.create(fileName, fileContent);
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
