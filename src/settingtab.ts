import { Notice, Plugin, TFile, PluginSettingTab, Setting } from 'obsidian';

export class NotesOnSettingTab extends PluginSettingTab {
	plugin: NotesOnPlugin;

	constructor(app: App, plugin: NotesOnPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Account name')
			.setDesc('User name for NotesOn.ru')
			.addText(text => text
				.setPlaceholder('Enter your user name')
				.setValue(this.plugin.settings.username)
				.onChange(async (value) => {
					this.plugin.settings.username = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Account password')
			.setDesc("User's password for NotesOn.ru")
			.addText(text => text
				.setPlaceholder('Enter your password')
				.setValue(this.plugin.settings.password)
				.onChange(async (value) => {
					this.plugin.settings.password = value;
					await this.plugin.saveSettings();
				}));

		const book = containerEl.createEl("div");
		book.createEl("div", { text: "I know, this is insecure, but Obsidian don't have input[type=password] and any tools for secrets" });
	}
}

