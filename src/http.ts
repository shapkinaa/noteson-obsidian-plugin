const FormData = require('form-data');

import axios from "axios";

export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";

export async function http_post(url: string, data: any = null,	token: any = null) {
	let resp = null;
	try {
		let headers = {
			"Accept": "application/json",
			"Content-Type": (data) ? "application/json": "",
			"Authorization": (token) ? 'Bearer ' + token: "",
		}

		const body = (data ? JSON.stringify(data) : {});

		resp = await axios.post(url, 
								body, {
									"headers": headers
		}).then(res => {
			return res.data;
		}, err => {
			console.error(err);
		})
		
	} 
	catch (error) {
		console.error(error);
		throw 'Connection to server NotesOn.ru failed';
	}

	return resp;
}

export async function http_post_formdata(url: string, formdata: FormData, token: string) {
		axios.post(url, 
								formdata, {
									"headers": {
													'Authorization': 'Bearer ' + token
									}
		}).then(res => {
			console.log(res);
		}, err => {
			console.error(err);
		})
}

export async function http_delete(url: string,	token: string) {
	let response = null;
	try {
		response = await axios.delete(url, {
									headers: {
																"Accept": "application/json",
																"Content-Type": "",
																"Authorization": 'Bearer ' + token,
															}
		}).then(result => {
			return result.data;
		}, error => {
			console.error(error);
		})
	} 
	catch (error) {
		console.error(error);
		throw 'Connection to server NotesOn.ru failed';
	}
	return response;
}
