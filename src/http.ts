export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";

export default async function (
	method: HTTPMethod,
	url: string,
	data: any = null,
	token: any = null
) {
	let resp = null;
	try {
		let headers = {
			"Accept": "application/json",
			"Content-Type": (data) ? "application/json": "",
			"Authorization": (token) ? 'Bearer ' + token: "",
		}

		const body = (data ? JSON.stringify(data) : {});

		const options: RequestUrlParam = {
																		    url: url,
																		    method: method,
																		    headers: headers,
																		    body: body,
																		}
		resp = await requestUrl(options);
	} 
	catch (error) {
		console.error(error);
		throw 'Connection to server NotesOn.ru failed';
	}

	if (resp.status != 200) {
		const message = await resp.json;

		throw message['message'];
	}

	return await resp.json;
}
