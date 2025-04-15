import { App, Modal, Setting } from 'obsidian';

export class FeedbackModal extends Modal {
    constructor(app: App, onSubmit: (result: string) => void) {
        super(app);
        this.setTitle('Send feedback to Noteson.ru');

        let name = '';
        new Setting(this.contentEl)
          .setName('Feedback')
          .addTextArea((text) =>
            text
                .onChange((value) => {
                    name = value;
                })
                .setPlaceholder('Enter your feedback here!')
            );
    
        new Setting(this.contentEl)
          .addButton((btn) =>
            btn
              .setButtonText('Submit')
              .setCta()
              .onClick(() => {
                this.close();
                onSubmit(name);
              }));
      }
}
