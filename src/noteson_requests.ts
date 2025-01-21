const FormData = require('form-data');
// import FormData from 'form-data';


import { http_get, http_post, http_post_formdata, http_delete } from './http';


// const baseUrl = "https://api.noteson.ru";
const baseUrl = 'http://localhost:5000';

export async function auth_to_noteson(username: string, password: string): Promise<string> {
    try {
        let data = { username: username, password: password };

        // let headers = {
        //     "Accept": "application/json",
        //     "Content-Type": "application/json",
        //     "Authorization": "",
        // }

        // const body = JSON.stringify(data);

        // let response = await axios.post(`${baseUrl}/auth`, 
        //                         body,
        //                         {
        //                             "headers": headers
        //                         }
        //                 ).then(result => {
        //                         console.log(result.data);
        //                         return result.data;
        //                     }, error => {
        //                         console.error(error);
        //                     });
        const response = await http_post(`${baseUrl}/auth`,
                                        data
                                        // ,
                                        // token
                                    );
        console.log(response);
        return response.access_token;
    } 
    catch (error) {
        console.error(error);
        throw 'Connection to server NotesOn.ru failed';
    }
}

export async function post_note(data: any, token: string): Promise<any> {
    try {
        const response = http_post(`${baseUrl}/notes`,
                                        data,
                                        token
                                    );
        return response;
    } 
    catch (error) {
        console.error(error);
        throw 'Connection to server NotesOn.ru failed';
    }
}

export async function post_file(file: FormData, token: string): Promise<void> {
    http_post_formdata(`${baseUrl}/files`, file, token);
}

export async function delete_note(id: any, token: string): Promise<void> {
    await http_delete(`${baseUrl}/note/${id}`, token);
}

export async function get_templates(token: string): Promise<any> {
		const response = await http_get(`${baseUrl}/templates`, token);
		const templates = JSON.parse(response.templates);
		return templates;
}
