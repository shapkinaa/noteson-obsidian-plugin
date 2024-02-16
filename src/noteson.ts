import http from './http';
import { TFile } from 'obsidian';

const baseUrl = "http://noteson.ru:8000";
// const baseUrl = 'http://localhost:5000';

interface CreateResponse {
	id: string;
	secret: string;
}

const notesonWrapper = {
	async authToBackend(username: string, password: string): string {
		var error_header = 'Error authorization';

		try {
			const url = `${baseUrl}/auth`;

			const response = await http('POST', `${baseUrl}/auth`, {username: username, password: password});
			return response['access_token'];
		}
		catch (error) {
			console.log(error);
			// throw `${error_header}: ${error}`;
			throw error;
		}
	},
	async createPost(id: string, title: string, content: string, filename: string, username: string, password: string): Promise<CreateResponse> {
		var token = null;
		try {
			token = await this.authToBackend(username, password);
		}
		catch (error) {
			console.log(error);
			throw error;
		}
		console.log(token);

		var note_filename = filename.replace(/[^a-zA-Z0-9_-]/g,'');
		if (note_filename == '') {
			note_filename = null;
		}

		var response = null;
		try {
			response = await http('POST', `${baseUrl}/notes`, {
			 																					note_uid: id,
																								note_content: content,
																								note_filename: note_filename,
																								note_title: title,
																						},
																						token);
			console.log(response);
		}
		catch (error) {
			console.log(error);
			throw error;
		}

		response.id = id;
		response.secret = 'idontknowwhatisdoinghere';
		return response;
	},
	async deletePost(id: string, secret: string, username: string, password: string): Promise<void> {
		var token = null;
		try {
			token = await this.authToBackend(username, password);
		}
		catch (error) {
			console.error(error);
			throw error;
		}

		try {
			await http('DELETE', `${baseUrl}/note/${id}`, {'secret': 'secret'}, token);
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

	getUrl(view: TFile): string;

	// updatePost(view: TFile): Promise<void>;

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
		},
		async getFileId(file: TFile): string {
			const id = file.name+file.stat.ctime;
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
				await saveData(data);

				return response.public_url;
			} catch (e) {
				console.error(e);
				throw e;
			}
		},
		getUrl(file: TFile): string {
			const post = data.posts[file.path];
			if (!post) {
				return null;
			}

			return `${baseUrl}/${post.id}`;
		},
		// TODO: показывает что заметку удалил, хотя сервер не ответил
		async deletePost(file: TFile, username: string, password: string) {
			const post = data.posts[file.path];

			try {
				await notesonWrapper.deletePost(post.id, post.secret, username, password);
				delete data.posts[file.path];
				await saveData(data);
			} catch (e) {
				console.error(e);
				throw e;
			}
		},
	};
}
