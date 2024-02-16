export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";

export default async function (
	method: HTTPMethod,
	url: string,
	data: any = null,
	token: any = null
) {
	var headers = new Headers({
		Accept: "application/json",
	});
	if (data) {
		headers.set("Content-Type", "application/json");
	}
	if (token) {
		headers.set('Authorization', 'Bearer ' + token);
	}

	var resp = null;
	try {
		resp = await fetch(url, {
			method,
			headers,
			...(data ? { body: JSON.stringify(data) } : {}),
		});
	} 
	catch (error) {
		console.error(error);
		throw 'Connection to server NotesOn.ru failed';
	}

	if (!resp.ok) {
		const resp_body = await resp.text();
		const message = JSON.parse(resp_body);
		throw message['message'];
	}

	return await resp.json();
}
