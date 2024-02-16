import { Notice, Plugin, TFile, PluginSettingTab, Setting } from 'obsidian';

import type { NotesOnClient } from './src/noteson';
import { createClient } from './src/noteson';
import { getText } from './src/text';
import { PublishedPostsModal } from './src/modals';
import { NotesOnSettingTab } from './src/settingtab';

interface NotesOnPluginSettings {
	username: string,
	password: string,
}
const DEFAULT_SETTINGS: NotesOnPluginSettings = {
	username: '',
	password: '',
}

export default class NotesOnPlugin extends Plugin {
	settings: NotesOnPluginSettings;

	notesonClient: NotesOnClient;

	async onload() {
		await this.loadSettings();

		this.notesonClient = await createClient(
			async () => ({
				posts: {},
				...(await this.loadData()),
			}),
			async (data) => await this.saveData(data)
		);

		this.addNotesOnCommands()
		this.registerFileMenuEvent()

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new NotesOnSettingTab(this.app, this));
	}

	async onunload() {
		await this.saveSettings();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		console.log(this.settings)
	}
	async saveSettings() {
		console.log(this.settings)
		await this.saveData(this.settings);
	}

	addNotesOnCommands(){
		// this.addCommand({
		// 	id: 'noteson.action.listPosts',
		// 	name: getText('actions.listPosts.name'),
		// 	callback: () => this.showPublishedPosts(),
		// })
		this.addCommand({
			id: 'noteson.action.create',
			name: getText('actions.create.name'),
			editorCheckCallback: (checking, _, view) => {
				if (checking){
					return !this.notesonClient.getUrl(view.file)
				}
				this.publishFile(view.file)
			}
		})
		// this.addCommand({
		// 	id: 'noteson.action.update',
		// 	name: getText('actions.update.name'),
		// 	editorCheckCallback: (checking, _, view) => {
		// 		if (checking){
		// 			return !!this.notesonClient.getUrl(view.file)
		// 		}
		// 		this.updateFile(view.file)
		// 	}
		// })
		// this.addCommand({
		// 	id: 'noteson.action.copyUrl',
		// 	name: getText('actions.copyUrl.name'),
		// 	editorCheckCallback: (checking, _, view) => {
		// 		if (checking){
		// 			return !!this.notesonClient.getUrl(view.file)
		// 		}
		// 		this.copyUrl(view.file)
		// 	}
		// })
		this.addCommand({
			id: 'noteson.action.remove',
			name: getText('actions.remove.name'),
			editorCheckCallback: (checking, _, view) => {
				if (checking){
					return !!this.notesonClient.getUrl(view.file)
				}
				this.deleteFile(view.file)
			}
		})
	}

	registerFileMenuEvent(){
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				if (file instanceof TFile) {
					menu.addSeparator();
					if (!this.notesonClient.getUrl(file)) {
						menu
							.addItem(item => item
								.setTitle(getText('actions.create.name'))
								.setIcon('up-chevron-glyph')
								.onClick(() => this.publishFile(file))
							);
					} else {
						menu
							// .addItem(item => item
							// 	.setTitle(getText('actions.update.name'))
							// 	.setIcon('double-up-arrow-glyph')
							// 	.onClick(() => this.updateFile(file))
							// )
							// .addItem(item => item
							// 	.setTitle(getText('actions.copyUrl.name'))
							// 	.setIcon('link')
							// 	.onClick(() => this.copyUrl(file))
							// )
							.addItem(item => item
								.setTitle(getText('actions.remove.name'))
								.setIcon('cross')
								.onClick(() => this.deleteFile(file))
							);
					}
					menu.addSeparator();
				}
			})
		);
	}

	showPublishedPosts(){
		new PublishedPostsModal(this.app, this.notesonClient).open();
	}

	async publishFile(file: TFile){
		try {
			const url = await this.notesonClient.createPost(file, this.settings.username, this.settings.password);
			await navigator.clipboard.writeText(url);
			new Notice(getText('actions.create.success'));
		} catch (e) {
			new Notice(getText('actions.create.failure'));
		}
	}

	// async updateFile(file: TFile){
	// 	try {
	// 		await this.notesonClient.updatePost(file);
	// 		new Notice(getText('actions.update.success'));
	// 	} catch (e) {
	// 		console.error(e);
	// 		new Notice(getText('actions.update.failure'));
	// 	}
	// }

	// async copyUrl(file: TFile){
	// 	const url = this.notesonClient.getUrl(file);
	// 	if (url) {
	// 		await navigator.clipboard.writeText(url);
	// 		new Notice(getText('actions.copyUrl.success'));
	// 	} else {
	// 		new Notice(getText('actions.copyUrl.failure'));
	// 	}
	// }

	async deleteFile(file: TFile){
		try {
			await this.notesonClient.deletePost(file, this.settings.username, this.settings.password);
			new Notice(getText('actions.remove.success'));
		} catch (e) {
			console.error(e);
			new Notice(getText('actions.remove.failure'));
		}
	}
}

// class NotesOnSettingTab extends PluginSettingTab {
// 	plugin: NotesOnPlugin;

// 	constructor(app: App, plugin: NotesOnPlugin) {
// 		super(app, plugin);
// 		this.plugin = plugin;
// 	}

// 	display(): void {
// 		const {containerEl} = this;

// 		containerEl.empty();

// 		new Setting(containerEl)
// 			.setName('Account name')
// 			.setDesc('User name for NotesOn.ru')
// 			.addText(text => text
// 				.setPlaceholder('Enter your user name')
// 				.setValue(this.plugin.settings.username)
// 				.onChange(async (value) => {
// 					this.plugin.settings.username = value;
// 					await this.plugin.saveSettings();
// 				}));
// 		new Setting(containerEl)
// 			.setName('Account password')
// 			.setDesc("User's password for NotesOn.ru")
// 			.addText(text => text
// 				.setPlaceholder('Enter your password')
// 				.setValue(this.plugin.settings.password)
// 				.onChange(async (value) => {
// 					this.plugin.settings.password = value;
// 					await this.plugin.saveSettings();
// 				}));
// 	}
// }

