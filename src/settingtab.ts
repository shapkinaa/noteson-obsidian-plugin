import { App, Notice, PluginSettingTab, Setting, sanitizeHTMLToDom } from 'obsidian';

import { auth_to_noteson, get_notes, get_templates, get_notes, post_feedback } from './noteson_requests';

import { getText } from './text';

import NotesOnPlugin from 'main';

import { FeedbackModal } from './feedbackmodal';
// import { table } from 'console';

export class NotesOnSettingTab extends PluginSettingTab {
    plugin: NotesOnPlugin;

    constructor(app: App, plugin: NotesOnPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    async display(): Promise<void> {
        const {containerEl} = this;

        containerEl.empty();

        containerEl.createEl("h3", { text: "Donations" });
        const donations_href = sanitizeHTMLToDom(`<a href="https://www.donationalerts.com/r/shapkinaa">donationalerts.com</a>`);
        containerEl.appendChild(donations_href)


        containerEl.createEl("h3", { text: "User Account" });

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
            .addText((text) => {
                text.inputEl.type = "password"
                text.setPlaceholder('Enter your password')
                text.setValue(this.plugin.settings.password)
                text.onChange(async (value) => {
                            this.plugin.settings.password = value;
                            await this.plugin.saveSettings();
                })
            });

/*
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

        // new Setting(containerEl)
            // .setName('Current template')
            // .setDesc('Choose current template to publish your notes')
            // .addDropdown(dropDown => {
            //     dropDown.addOptions(options);
            //     dropDown.onChange(async (value) =>	{
            //                         this.plugin.settings.repetitions = value;
            //                         await this.plugin.saveSettings();
            // })});
*/
        containerEl.createEl("h3", { text: "Settings" });
        new Setting(containerEl)
            .setName('Recursive level')
            .setDesc('Number of levels for inline notes (tag ![[inline_note]])')
            .addText((text) => {
                text.inputEl.type = "number"
                text.setPlaceholder('Enter recursive value')
                text.setValue(String(this.plugin.settings.maximum_notes_recursive))
                text.onChange(async (value) => {
                            this.plugin.settings.maximum_notes_recursive = Number(value);
                            await this.plugin.saveSettings();
                })
            });


        containerEl.createEl("h3", { text: "Published notes" });
        let dom;
        try {
            const token = await auth_to_noteson(this.plugin.settings.username, this.plugin.settings.password);

            const notes = await get_notes(token);
            // console.log(notes)

            let dom_string = "";
            notes.forEach((item: any) => {
                dom_string = dom_string + '<tr><td><a href="'+item.link+'">'+item.filename+'</a></td><td>'+item.created_at+'</td></tr>';
            });

            new Setting(containerEl);
            dom = sanitizeHTMLToDom(`
                <table border='1px'>
                    <thead>
                        <tr>
                            <th>filename</th>
                            <th>update at</th>
                        </tr>
                    </thead>
                    <tbody>
                        `+dom_string+`
                    </tbody>
                </table>
                `);
        }
        catch (e) {
            console.error(e);
            new Notice("Connection error");
            dom = sanitizeHTMLToDom(`
                <p style="color: red">
                    Connection to NotesOn.ru failed
                </p>
                `);
        }
        containerEl.appendChild(dom)
       

        containerEl.createEl("h3", { text: "Feedback" });

        new Setting(containerEl)
            .setName('Feedback')
            .setDesc('Send your feedback to NotesOn.ru')
            .addButton(button => {
                button.setButtonText('Send feedback');
                button.onClick(async(value) => {
                    new FeedbackModal(this.app, async(result) => {
                        try {
                            const token = await auth_to_noteson(this.plugin.settings.username, this.plugin.settings.password);

                            /* const response = */
                            await post_feedback(
                                                                result,
                                                                token
                                                            );
                            // console.log(response);
                            new Notice(getText('feedbacks.success'));
                        } 
                        catch (e) {
                            console.error(e);
                            new Notice(getText('feedbacks.failure'));
                        }
                    }).open();
                })
            });

        // if (this.plugin.settings.new_version != this.plugin.settings.current_version) {
        containerEl.createEl("h3", { text: "WhatsNew" });

        dom = sanitizeHTMLToDom(`
            <textarea readonly style='width: 100%; height: 200px'>
9 july 2025
- [Obsidian] Rebuilded plugin settings tab. Password input element is secured now

30 may 2025
- [Obsidian] Now supports obsidians inline notes, from 1.0.8 plugin version

13 may 2025
- [Obsidian] Now supports changing the image to obsidian

21 january 2025
- [all] Now you can publish mind maps. Kminder-mindmap plugin is supported on Joplin (https://github.com/calandradas/Kminder-Mindmap-Joplin-Plugin). Mindmap plugin is supported on Obsidian (https://github.com/OneCalmCloud/obsidian-mindmap)
- [server] Fixed a bug with posting images on Joplin

26 september 2024
- [Server] The server supports the ability to select colors and table styles for published pages. The choice of colors and styles can be made on the personal page in the personal account on the site
- [Site] On your personal page, you can now select the colors and table styles that will be used to publish pages

09 august 2024
- [Obsidian] Note tags are now displayed on the published page, like on Obsidian page
- [Joplin] Note tags are now displayed on the published page on the top of page

25 june 2024
- [Site] Now, you could change your password :)

05 june 2024
- [Obsidian] fix bug. When pictures was placed in different folders, may be pictures not showed on page (https://github.com/shapkinaa/noteson-obsidian-plugin/issues/2)

02 june 2024
- fix urls on personal page (https://github.com/shapkinaa/noteson-obsidian-plugin/issues/3)

20 may 2024
- [Obsidian] added links to another obsidian notes. If linked note has been published then link will be active. If linked note has been not published, it will be simple text (not link)

13 may 2024
- [Obsidian] added support for inserting images into notes
- [Server] fix bug with uploaded pictures

february 2024
- add Obsidian plugin 
            </textarea>
			`);

        containerEl.appendChild(dom)

    }
}

