import { App, Notice, PluginSettingTab, Setting, sanitizeHTMLToDom } from 'obsidian';

import { auth_to_noteson, get_notes, get_templates, post_feedback } from './noteson_requests';

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

        containerEl.createEl("h3", { text: "Tariffs" });
        const tariffs_href = sanitizeHTMLToDom(`
                <p>
        Tariffs now not worked, yet. But very soon i should do it.
    </p>
    <table class="tariffs_table" border="1px" style="border: 1px solid black; border-collapse: collapse; padding: 15px;">
        <tr>
            <td align="center">Functions</td>
            <td align="center">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='37' height='43' viewBox='0 0 37 43'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='86.328%25' x2='8.51%25' y1='11.463%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23F59C07'/%3E%3Cstop offset='100%25' stop-color='%23F57507'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath fill='url(%23a)' fill-rule='nonzero' d='M18.692 25.041h-2.906a.63.63 0 0 1-.445-.175.502.502 0 0 1-.152-.415l.257-2.626c.025-.28.285-.495.596-.494h2.907c.17 0 .33.063.445.176.113.112.169.263.152.414l-.257 2.627c-.025.28-.285.494-.597.493zm.466-5.143h-2.96a.582.582 0 0 1-.593-.571l.806-8.875a.585.585 0 0 1 .592-.503h2.96c.327 0 .593.256.593.571l-.83 8.88a.585.585 0 0 1-.568.498zM36.566 9.549L28.898.63A1.81 1.81 0 0 0 27.525 0H4.56a1.803 1.803 0 0 0-1.8 1.616L.006 32.896c-.044.503.126 1 .468 1.373a1.81 1.81 0 0 0 1.332.582h4.51L5.63 43l8.869-8.143h10.074c.47 0 .922-.18 1.26-.507l9.462-9.155c.312-.302.504-.705.541-1.137l1.157-13.184a1.794 1.794 0 0 0-.427-1.325zm-7.013 11.994a1.796 1.796 0 0 1-.541 1.142l-5.478 5.197a1.81 1.81 0 0 1-1.249.496h-13.4a1.831 1.831 0 0 1-1.324-.59 1.816 1.816 0 0 1-.476-1.365L8.707 8.11a1.803 1.803 0 0 1 1.8-1.616h13.628c.522 0 1.02.226 1.362.62l4.326 4.976c.326.358.494.832.465 1.314l-.735 8.138z'/%3E%3C/svg%3E%0A" style="width: 40px; height: 40px;"/><br>
                    donate<br>(or free)
            </td>
            <td align="center"><a href="https://boosty.to/shapkinaa/purchase/3576938?ssource=DIRECT&share=subscription_link"><img src="data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 24.2.1, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='Слой_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 235.6 292.2' style='enable-background:new 0 0 235.6 292.2;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:url(%23SVGID_1_);%7D%0A%3C/style%3E%3Cg id='b_1_'%3E%3ClinearGradient id='SVGID_1_' gradientUnits='userSpaceOnUse' x1='145.0777' y1='76.148' x2='80.5868' y2='296.0785'%3E%3Cstop offset='0' style='stop-color:%23EF7829'/%3E%3Cstop offset='5.189538e-02' style='stop-color:%23F07529'/%3E%3Cstop offset='0.3551' style='stop-color:%23F0672B'/%3E%3Cstop offset='0.6673' style='stop-color:%23F15E2C'/%3E%3Cstop offset='1' style='stop-color:%23F15A2C'/%3E%3C/linearGradient%3E%3Cpath class='st0' d='M44.3,164.5L76.9,51.6H127l-10.1,35c-0.1,0.2-0.2,0.4-0.3,0.6L90,179.6h24.8c-10.4,25.9-18.5,46.2-24.3,60.9 c-45.8-0.5-58.6-33.3-47.4-72.1 M90.7,240.6l60.4-86.9h-25.6l22.3-55.7c38.2,4,56.2,34.1,45.6,70.5 c-11.3,39.1-57.1,72.1-101.7,72.1C91.3,240.6,91,240.6,90.7,240.6z'/%3E%3C/g%3E%3C/svg%3E" style="width: 40px; height: 40px"/><br>Tariff #1</a><br> 1 $/month</td>
            <td align="center"><a href="https://boosty.to/shapkinaa/purchase/3576939?ssource=DIRECT&share=subscription_link"><img src="data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 24.2.1, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='Слой_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 235.6 292.2' style='enable-background:new 0 0 235.6 292.2;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:url(%23SVGID_1_);%7D%0A%3C/style%3E%3Cg id='b_1_'%3E%3ClinearGradient id='SVGID_1_' gradientUnits='userSpaceOnUse' x1='145.0777' y1='76.148' x2='80.5868' y2='296.0785'%3E%3Cstop offset='0' style='stop-color:%23EF7829'/%3E%3Cstop offset='5.189538e-02' style='stop-color:%23F07529'/%3E%3Cstop offset='0.3551' style='stop-color:%23F0672B'/%3E%3Cstop offset='0.6673' style='stop-color:%23F15E2C'/%3E%3Cstop offset='1' style='stop-color:%23F15A2C'/%3E%3C/linearGradient%3E%3Cpath class='st0' d='M44.3,164.5L76.9,51.6H127l-10.1,35c-0.1,0.2-0.2,0.4-0.3,0.6L90,179.6h24.8c-10.4,25.9-18.5,46.2-24.3,60.9 c-45.8-0.5-58.6-33.3-47.4-72.1 M90.7,240.6l60.4-86.9h-25.6l22.3-55.7c38.2,4,56.2,34.1,45.6,70.5 c-11.3,39.1-57.1,72.1-101.7,72.1C91.3,240.6,91,240.6,90.7,240.6z'/%3E%3C/g%3E%3C/svg%3E" style="width: 40px; height: 40px"/><br>Tariff #5</a><br> 5 $/month</td>
        </tr>
        <tr>
            <td>publishing notes</td>
            <td>unlimited</td>
            <td>unlimited</td>
            <td>unlimited</td>
        </tr>
        <tr>
            <td>pre-made templates</td>
            <td>unlimited</td>
            <td>unlimited</td>
            <td>unlimited</td>
        </tr>
        <tr>
            <td style="color: #aaa;">NotesOn Copyright (planned)</td>
            <td style="color: #aaa;">hosted</td>
            <td style="color: #aaa;">not hosted</td>
            <td style="color: #aaa;">not hosted</td>
        </tr>
        <tr>
            <td class="inactive_text" style="color: #aaa;">Custom templates (planned)</td>
            <td class="inactive_text" style="color: #aaa;">not available</td>
            <td class="inactive_text" style="color: #aaa;">available (one)</td>
            <td class="inactive_text" style="color: #aaa;">available (three)</td>
        </tr>
        <tr>
            <td class="inactive_text" style="color: #aaa;">Custom web domain (planned)</td>
            <td class="inactive_text" style="color: #aaa;">not available</td>
            <td class="inactive_text" style="color: #aaa;">not available</td>
            <td class="inactive_text" style="color: #aaa;">available (one)</td>
        </tr>
        <tr>
            <td class="inactive_text" style="color: #aaa;">Page traffic analytics (planned)</td>
            <td class="inactive_text" style="color: #aaa;">not available</td>
            <td class="inactive_text" style="color: #aaa;">not available</td>
            <td class="inactive_text" style="color: #aaa;">available</td>
        </tr>
        <tr>
            <td class="inactive_text" style="color: #aaa;">Limited access to selected pages (planned)</td>
            <td class="inactive_text" style="color: #aaa;">not available</td>
            <td class="inactive_text" style="color: #aaa;">not available</td>
            <td class="inactive_text" style="color: #aaa;">available</td>
        </tr>
    </table>
            `);
        containerEl.appendChild(tariffs_href)

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

