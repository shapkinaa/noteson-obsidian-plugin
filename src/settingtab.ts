import { Notice, Plugin, TFile, PluginSettingTab, Setting } from 'obsidian';

import { auth_to_noteson, get_templates } from './noteson_requests';

export class NotesOnSettingTab extends PluginSettingTab {
    plugin: NotesOnPlugin;

    constructor(app: App, plugin: NotesOnPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    async display(): Promise<void> {
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
        book.createEl("div", 
            { 
                    text: "I know, this is insecure, but Obsidian don't have input[type=password] and any tools for secrets"
                }
            );

        let options: Record<string, Set<string>> = {};
        try {
            // const token = await authToBackend(this.plugin.settings.username, this.plugin.settings.password);
            const token = await auth_to_noteson(this.plugin.settings.username, this.plugin.settings.password);

            // const response = await http_get(`http://localhost:5000/templates`, token);
            // let templates = JSON.parse(response.templates);
            const templates = await get_templates(token);
            console.log(templates);

            templates.forEach((item: any) => options[item.id] = item.name);

            // new Notice(getText('actions.create.success'));
        }
        catch (e) {
            console.error(e);
            // new Notice(getText('actions.create.failure'));
            return ;
        }

        console.log(options);

        new Setting(containerEl)
            .setName('Current template')
            .setDesc('Choose current template to publish your notes')
            .addDropdown(dropDown => {
                dropDown.addOptions(options);
                dropDown.onChange(async (value) =>	{
                                    this.plugin.settings.repetitions = value;
                                    await this.plugin.saveSettings();
            })});
    }
}

