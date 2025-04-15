import { http_post, http_post_formdata, http_delete } from './http';
import { TAbstractFile, FileSystemAdapter, TFile } from 'obsidian';
const path = require('path');
const FormData = require('form-data');

const baseUrl = "https://api.noteson.ru";
// const baseUrl = 'http://localhost:5000';

interface CreateResponse {
	id: string;
	secret: string;
}

const notesonWrapper = {
	async authToBackend(username: string, password: string): string {
		try {
			const response = await http_post(`${baseUrl}/auth`, {username: username, password: password});
			return response.access_token;
		}
		catch (error) {
			console.log(error);
			throw error;
		}
	},
	async createPost(id: string, title: string, content: string, filename: string, username: string, password: string): Promise<CreateResponse> {
		let token = null;
		try {
			token = await this.authToBackend(username, password);
		}
		catch (error) {
			console.log(error);
			throw error;
		}

		let note_filename = filename.replace(/[^a-zA-Z0-9_-]/g,'');
		if (note_filename == '') {
			note_filename = null;
		}

		let response = null;
		try {
			response = await http_post(`${baseUrl}/notes`, {
															note_uid: id,
															note_content: content,
															note_filename: note_filename,
															note_title: title,
															is_obsidian: true,
													},
													token);
		}
		catch (error) {
			console.log(error);
			throw error;
		}

		response.id = id;
		response.secret = 'idontknowwhatisdoinghere';
		return response;
	},
	
	async sendFile(file: TFile, file_path: string, username: string, password: string) {

		let adap = file.vault.adapter as FileSystemAdapter;
		let pathToVault = adap.getBasePath();

		const srcPath = path.join(pathToVault, file_path);

		let token = null;
		try {
			token = await this.authToBackend(username, password);
		}
		catch (error) {
			console.log(error);
			throw error;
		}
		console.log('token:' + token);

		const fi: TAbstractFile = await file.vault.getAbstractFileByPath(file_path);
    if (!fi) {
        console.log(`failed to load file ${file_path}`);
        return;
    }

		const data = await file.vault.readBinary(fi);
		const blob = new Blob([data]);
		const big_file = new File([blob], file_path, { type: 'image/png' });

		const formData = new FormData();
		formData.append('file', big_file, big_file.name);

		http_post_formdata(`${baseUrl}/files`, formData, token);
	},
	async deletePost(id: string, username: string, password: string): Promise<void> {
		let token = null;
		try {
			token = await this.authToBackend(username, password);
		}
		catch (error) {
			console.error(error);
			throw error;
		}

		try {
			await http_delete(`${baseUrl}/note/${id}`, token);
		}
		catch (error) {
			console.error(error);
			throw error;
		}
	},
};

export interface Post {
	id: string;
	secret: string;
}

export interface Data {
	posts: Record<string, Post>;
}

export interface NotesOnClient {
	data(): Data;

	createPost(view: TFile, username: string, password: string): Promise<string>;

	sendFile(file: TFile, path: string, username: string, password: string): Promise<string>;

	deletePost(view: TFile, username: string, password: string): Promise<void>;
}

export async function createClient(
	loadData: () => Promise<Data>,
	saveData: (data: Data) => Promise<void>
): Promise<NotesOnClient> {
	const data = await loadData();

	return {
		data() {
			return data;
			// return null;
		},
		async getFileId(file: TFile): string {
			const id = file.name;
			return id.replace(/[^a-zA-Z0-9_-]/g,'');
		},
		async createPost(file: TFile, username: string, password: string) {
			const title = file.basename;
			const filename = file.basename;
			const content = await file.vault.read(file);
			const id = await this.getFileId(file);

			try {
				const response = await notesonWrapper.createPost(id, title, content, filename, username, password);
				data.posts[file.path] = {
					id: response.id,
					secret: response.secret,
					url: response.public_url,
				};

				return response.public_url;
			} catch (e) {
				console.error(e);
				throw e;
			}
		},
		async sendFile(file: TFile, file_path: string, username: string, password: string) {
			try {
				await notesonWrapper.sendFile(file, file_path, username, password); 
			} catch (e) {
				console.error(e);
				throw e;
			}
		},
		async deletePost(file: TFile, username: string, password: string) {
			const id = await this.getFileId(file);

			try {
				await notesonWrapper.deletePost(id, username, password);
			} catch (e) {
				console.error(e);
				throw e;
			}
		},
	};
}
