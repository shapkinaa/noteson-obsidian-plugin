import { Notice, Plugin, TFile, TAbstractFile } from 'obsidian';

import { getText } from './src/text';
import { NotesOnSettingTab } from './src/settingtab';

import { auth_to_noteson, post_note, post_inline_note, post_file, delete_note} from './src/noteson_requests';


interface NotesOnPluginSettings {
    username: string,
    password: string,
    current_version: string,
    new_version: string,
    maximum_notes_recursive: number,
}
const DEFAULT_SETTINGS: NotesOnPluginSettings = {
    username: '',
    password: '',
    current_version: '1.0.0',
    new_version: '',
    maximum_notes_recursive: 5,
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

    addNotesOnCommands() {
        this.addCommand({
            id: 'action.create',
            name: getText('actions.create.name'),
            editorCheckCallback: (checking, _, view) => {
                                            this.publishFile(view.file, 0)
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
                            .onClick(() => this.publishFile(file, 0))
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

    getFileId(file: TFile): string {
        const id = file.name;
        return id.replace(/[^a-zA-Z0-9_-]/g,'');
    }

    extractFileExtension(filename: string): string {
        const re = /(?:\.([^.]+))?$/;

        const ext = re.exec(filename)[1]; 
        return ext;
    }


    async publishFile(file: TFile, level_recurse: number): Promise<any> {
        console.log(file)
        const title = file.basename;
        const filename = file.basename;
        const content = await file.vault.read(file);
        const id = this.getFileId(file);

        const fileCache = this.app.metadataCache.getFileCache(file);
        if (fileCache && fileCache.embeds) {
            for (let embed of fileCache.embeds) {
                let file_path = embed.link;
                let server_file_path = '';

                const file_emb = this.app.metadataCache.getFirstLinkpathDest(embed.link, file.path);
                if (file_emb) {
                    file_path = file_emb.path;

                    const file_path_extension = this.extractFileExtension(file_emb.path);

                    if (file_path_extension == 'md') {
                        const fi: TAbstractFile = await file.vault.getAbstractFileByPath(file_emb.path);
                        if (!fi) {
                            console.error(`failed to load file ${file_emb.path}`);
                            return;
                        }
                        if (level_recurse + 1 <= this.settings.maximum_notes_recursive) {
                            server_file_path = await this.publishFile(fi, level_recurse + 1);
                        }
                    }
                    else {
                        try {
                            const token = await auth_to_noteson(this.settings.username, this.settings.password);

                            const fi: TAbstractFile = await file.vault.getAbstractFileByPath(file_emb.path);
                            if (!fi) {
                                console.error(`failed to load file ${file_emb.path}`);
                                return;
                            }

                            const data = await file.vault.readBinary(fi);
                            const blob = new Blob([data]);
                            const big_file = new File([blob], file_emb.path, { type: 'image/png' });

                            const formData = new FormData();
                            formData.append('file', big_file, big_file.name);

                            const result = await post_file(formData, token);
                            console.log(`result of send file: ${JSON.stringify(result)}`);
                        }
                        catch (error) {
                            console.error(error);
                            throw error;
                        }
                    }
                }
                else {
                    console.warn('file not found', embed.link)
                    new Notice(getText('actions.create.failure')+'\r\n'+'Inline note not found');
                    return;
                }

                embed['file_path'] = file_path;
                embed['server_file_path'] = server_file_path;
            }
        }

        try {
            const token = await auth_to_noteson(this.settings.username, this.settings.password);

            let note_filename = filename.replace(/[^a-zA-Z0-9_-]/g,'');
            if (note_filename == '') {
                note_filename = null;
            }

            const request_data = {
                                                    note_uid: id,
                                                    note_content: content,
                                                    note_filename: note_filename,
                                                    note_title: title,
                                                    is_obsidian: true,
                                                    metadata: JSON.stringify(fileCache),
                                                }

            let response = {
                public_url: '',
                filename: ''
            };
            if (level_recurse == 0) {
                response = await post_note(
                                                request_data,
                                                token
                                            );
                await navigator.clipboard.writeText(response.public_url);
                new Notice(getText('actions.create.success'));
                return;
            }
            else {
                response = await post_inline_note(
                                                request_data,
                                                token
                                            );
            }

            return response.filename;
        } 
        catch (e) {
            console.error(e);
            new Notice(getText('actions.create.failure'));
            return;
        }
    }

    async deleteFile(file: TFile): Promise<void> {
        const id = this.getFileId(file);

        try {
            const token = await auth_to_noteson(this.settings.username, this.settings.password);

            await delete_note(id, token);

            new Notice(getText('actions.remove.success'));
        }
        catch (e) {
            console.error(e);
            new Notice(getText('actions.remove.failure'));
        }
    }
}
