import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { SkedPalSyncSettings, DEFAULT_SETTINGS } from './settings';

// Remember to rename these classes and interfaces!

export default class SkedPalSyncPlugin extends Plugin {
	settings: SkedPalSyncSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new SkedPalSyncSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
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
		const {contentEl} = this;
		contentEl.setText('Woah!');

		// Create a new note with a title and some text
		const fileName = "New Note.md";
		const fileContent = `# Note Title\n\nThis is the content of the note.`;
		await this.app.vault.create(fileName, fileContent);
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SkedPalSyncSettingTab extends PluginSettingTab {
    plugin: SkedPalSyncPlugin;

    constructor(app: App, plugin: SkedPalSyncPlugin) {
      super(app, plugin);
      this.plugin = plugin;
    }

    display(): void {
      const { containerEl } = this;
      containerEl.empty();
      containerEl.createEl("h2", { text: "SkedPal Sync Settings" });

      new Setting(containerEl)
        .setName("SkedPal Email Address")
        .setDesc("The email address used to send tasks to SkedPal.")
        .addText(text =>
          text
            .setPlaceholder("yourname@skedpal.com")
            .setValue(this.plugin.settings.skedpalEmail)
            .onChange(async (value) => {
              this.plugin.settings.skedpalEmail = value;
              await this.plugin.saveSettings();
            }));

      new Setting(containerEl)
        .setName("Default Priority")
        .setDesc("Used if no priority is set in the task metadata.")
        .addDropdown(drop =>
          drop.addOptions({ "Low": "Low", "Medium": "Medium", "High": "High" })
              .setValue(this.plugin.settings.defaultPriority)
              .onChange(async (value) => {
                this.plugin.settings.defaultPriority = value;
                await this.plugin.saveSettings();
              }));

      new Setting(containerEl)
        .setName("Default Project")
        .setDesc("Optional default project to assign if none is specified.")
        .addText(text =>
          text.setValue(this.plugin.settings.defaultProject)
            .onChange(async (value) => {
              this.plugin.settings.defaultProject = value;
              await this.plugin.saveSettings();
            }));

      new Setting(containerEl)
        .setName("Default Tags")
        .setDesc("Comma-separated list of default tags (e.g., work,writing).")
        .addText(text =>
          text.setValue(this.plugin.settings.defaultTags)
            .onChange(async (value) => {
              this.plugin.settings.defaultTags = value;
              await this.plugin.saveSettings();
            }));

      new Setting(containerEl)
        .setName("Default Estimate")
        .setDesc("Estimated time if not set in the task (e.g., 30m, 1h).")
        .addText(text =>
          text.setValue(this.plugin.settings.defaultEstimate)
            .onChange(async (value) => {
              this.plugin.settings.defaultEstimate = value;
              await this.plugin.saveSettings();
            }));

      new Setting(containerEl)
        .setName("Auto-Send on Save")
        .setDesc("Automatically email new tasks when the file is saved.")
        .addToggle(toggle =>
          toggle.setValue(this.plugin.settings.autoSendOnSave)
            .onChange(async (value) => {
              this.plugin.settings.autoSendOnSave = value;
              await this.plugin.saveSettings();
            }));

      containerEl.createEl("h3", { text: "Priority Mapping" });
      containerEl.createEl("p", {
        text: "Map Obsidian Tasks priorities to SkedPal priorities."
      });

      const priorities = ['Lowest', 'Low', 'Normal', 'Medium', 'High', 'Highest'];

      priorities.forEach(priority => {
        new Setting(containerEl)
        .setName(priority)
        .addText(text =>
          text
          .setPlaceholder(`SkedPal value for ${priority}`)
          .setValue(this.plugin.settings.priorityMap[priority] || '')
          .onChange(async (value) => {
            this.plugin.settings.priorityMap[priority] = value;
            await this.plugin.saveSettings();
          })
        );
      });

      containerEl.createEl("h3", { text: "Sync Filtering" });

      new Setting(containerEl)
       .setName("Required Tag for Sync")
       .setDesc("If set, only tasks with this tag will be synced to SkedPal. Leave blank to sync all tasks.")
       .addText(text =>
         text
           .setPlaceholder("e.g., #skedpal")
           .setValue(this.plugin.settings.requiredTagForSync)
           .onChange(async (value) => {
             this.plugin.settings.requiredTagForSync = value.trim();
             await this.plugin.saveSettings();
           }));
    }
  }
