import { Notice, Plugin, TFile, PluginSettingTab, Setting } from 'obsidian';

import type { NotesOnClient } from './src/noteson';
import { createClient } from './src/noteson';
import { getText } from './src/text';
// import { PublishedPostsModal } from './src/modals';
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
		this.addCommand({
			id: 'action.create',
			name: getText('actions.create.name'),
			editorCheckCallback: (checking, _, view) => {
				if (checking){
					return !this.notesonClient.getUrl(view.file)
				}
				this.publishFile(view.file)
			}
		})
		this.addCommand({
			id: 'action.remove',
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

	// showPublishedPosts(){
	// 	new PublishedPostsModal(this.app, this.notesonClient).open();
	// }

	async publishFile(file: TFile){
		try {
			const url = await this.notesonClient.createPost(file, this.settings.username, this.settings.password);
			await navigator.clipboard.writeText(url);
			new Notice(getText('actions.create.success'));
		} catch (e) {
			new Notice(getText('actions.create.failure'));
		}
	}

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
