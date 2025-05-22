import { App, Modal, Notice, PluginSettingTab, Setting } from 'obsidian';

import { auth_to_noteson, get_templates, post_feedback } from './noteson_requests';

import { getText } from './text';

import NotesOnPlugin from 'main';
// import { text } from 'stream/consumers';

import { FeedbackModal } from './feedbackmodal';

export class NotesOnSettingTab extends PluginSettingTab {
    plugin: NotesOnPlugin;

    constructor(app: App, plugin: NotesOnPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    async display(): Promise<void> {
        const {containerEl} = this;

        containerEl.empty();

        if (this.plugin.settings.new_version != this.plugin.settings.current_version) {
            const updateMessage = containerEl.createEl("div");
            updateMessage.createEl("div", 
                    { 
                        text: "Update your plugin. New version is "+this.plugin.settings.new_version
                    }
                );
            updateMessage.createEl("a", 
                { 
                    href: "https://noteson.ru/whatsnew",
                    text: "whatsnew"
                }
            );
        }

        new Setting(containerEl)
            .setName('Account name')
            .setDesc('User name for NotesOn.ru')
            .addText(text => text
                .setPlaceholder('Enter your user name')
                .setValue(this.plugin.settings.username)
                .onChange(async (value) => {
                            this.plugin.settings.username = value;
                            await this.plugin.saveSettings();
                })
            );
        new Setting(containerEl)
            .setName('Account password')
            .setDesc("User's password for NotesOn.ru")
            .addText(text => text
                .setPlaceholder('Enter your password')
                .setValue(this.plugin.settings.password)
                .onChange(async (value) => {
                            this.plugin.settings.password = value;
                            await this.plugin.saveSettings();
                })
            );

        const warning = containerEl.createEl("div");
        warning.createEl("div", 
                { 
                    text: "I know, this is insecure, but Obsidian don't have input[type=password] and any tools for secrets"
                }
            );

        const options: Record<string, Set<string>> = {};
        try {
            const token = await auth_to_noteson(this.plugin.settings.username, this.plugin.settings.password);

            const templates = await get_templates(token);
            console.log(templates);

            templates.forEach((item: any) => options[item.id] = item.name);
        }
        catch (e) {
            console.error(e);
            return ;
        }

/*
        new Setting(containerEl)
            .setName('Current template')
            .setDesc('Choose current template to publish your notes')
            .addDropdown(dropDown => {
                dropDown.addOptions(options);
                dropDown.onChange(async (value) =>	{
                                    this.plugin.settings.repetitions = value;
                                    await this.plugin.saveSettings();
            })});
*/

        new Setting(containerEl)
        .setName('Feedback')
        .setDesc('Send your feedback to NotesOn.ru')
        .addButton(button => {
            button.setButtonText('Send feedback');
            button.onClick(async(value) => {
                new FeedbackModal(this.app, async(result) => {
                    try {
                        const token = await auth_to_noteson(this.plugin.settings.username, this.plugin.settings.password);

                        const response = await post_feedback(
                                                            result,
                                                            token
                                                        );
                        console.log(response);
                        new Notice(getText('feedbacks.success'));
                    } 
                    catch (e) {
                        console.error(e);
                        new Notice(getText('feedbacks.failure'));
                    }
                }).open();
            })
        });

    }
}

