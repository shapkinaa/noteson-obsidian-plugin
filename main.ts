import { Notice, Plugin, TFile, PluginSettingTab, Setting } from 'obsidian';

import { getText } from './src/text';
import { NotesOnSettingTab } from './src/settingtab';

import { http_post, http_post_formdata, http_delete } from './src/http';

const path = require('path');

const baseUrl = "https://api.noteson.ru";
// const baseUrl = 'http://localhost:5000';

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

	async onload() {
		await this.loadSettings();

		this.addNotesOnCommands()
		this.registerFileMenuEvent()

		this.addSettingTab(new NotesOnSettingTab(this.app, this));
	}
	async onunload() {
		await this.saveSettings();
	}
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}
	async saveSettings() {
		await this.saveData(this.settings);
	}

	addNotesOnCommands(){
		this.addCommand({
			id: 'action.create',
			name: getText('actions.create.name'),
			editorCheckCallback: (checking, _, view) => {
				this.publishFile(view.file)
			}
		})
		this.addCommand({
			id: 'action.remove',
			name: getText('actions.remove.name'),
			editorCheckCallback: (checking, _, view) => {
				this.deleteFile(view.file)
			}
		})
	}

	registerFileMenuEvent() {
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				if (file instanceof TFile) {
					menu.addSeparator();
					menu
						.addItem(item => item
							.setTitle(getText('actions.create.name'))
							.setIcon('up-chevron-glyph')
							.onClick(() => this.publishFile(file))
						);
					menu
						.addItem(item => item
							.setTitle(getText('actions.remove.name'))
							.setIcon('cross')
							.onClick(() => this.deleteFile(file))
						);
					menu.addSeparator();
				}
			})
		);
	}

	async getFileId(file: TFile): string {
		const id = file.name;
		return id.replace(/[^a-zA-Z0-9_-]/g,'');
	}

	async authToBackend(username: string, password: string): string {
		try {
			const response = await http_post(`${baseUrl}/auth`, {username: username, password: password});
			return response.access_token;
		}
		catch (error) {
			console.log(error);
			throw error;
		}
	}

	async publishFile(file: TFile) {
			const title = file.basename;
			const filename = file.basename;
			const content = await file.vault.read(file);
			const id = await this.getFileId(file);
			
			const fileCache = this.app.metadataCache.getFileCache(file)
			
			if (fileCache && fileCache.embeds) {
				for (let embed of fileCache.embeds) {
					let file_path = embed.link;

					const file_emb = this.app.metadataCache.getFirstLinkpathDest(embed.link, file.path)
					if (file_emb) {
						file_path = file_emb.path
					}
					embed['file_path'] = file_path
				}
			}

			try {
				const token = await this.authToBackend(this.settings.username, this.settings.password);

				let note_filename = filename.replace(/[^a-zA-Z0-9_-]/g,'');
				if (note_filename == '') {
					note_filename = null;
				}

				const response = await http_post(`${baseUrl}/notes`, {
					 																					note_uid: id,
																										note_content: content,
																										note_filename: note_filename,
																										note_title: title,
																										is_obsidian: true,
																										metadata: JSON.stringify(fileCache),
																								},
																								token);
				await navigator.clipboard.writeText(response.public_url);

				new Notice(getText('actions.create.success'));
			} 
			catch (e) {
				console.error(e);
				new Notice(getText('actions.create.failure'));
				return ;
			}

		if (fileCache && fileCache.embeds) {
			for (const embed of fileCache.embeds) {
				const file_emb = this.app.metadataCache.getFirstLinkpathDest(embed.link, file.path)
				if (!file_emb) {
					console.warn('file not found', embed.link)
					return
				}
				else {
					try {
							const token = await this.authToBackend(this.settings.username, this.settings.password);

							const fi: TAbstractFile = await file.vault.getAbstractFileByPath(file_emb.path);
					    if (!fi) {
					        console.error(`failed to load file ${file_path}`);
					        return;
					    }

							const data = await file.vault.readBinary(fi);
							const blob = new Blob([data]);
							const big_file = new File([blob], file_emb.path, { type: 'image/png' });

							const formData = new FormData();
							formData.append('file', big_file, big_file.name);

							http_post_formdata(`${baseUrl}/files`, formData, token);
					}
					catch (e) {
						console.error(e);
						throw e;
					}
				}
			}
		}
	}
	
	async deleteFile(file: TFile){
		const id = await this.getFileId(file);

		try {
				let token = null;
				token = await this.authToBackend(this.settings.username, this.settings.password);

				await http_delete(`${baseUrl}/note/${id}`, token);
				new Notice(getText('actions.remove.success'));
		} catch (e) {
			console.error(e);
			new Notice(getText('actions.remove.failure'));
		}
	}
}
