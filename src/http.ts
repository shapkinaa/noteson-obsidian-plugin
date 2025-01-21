const FormData = require('form-data');

import axios from "axios";

export async function http_get(url: string, token: any = null): Promise<any> {
    try {
        let headers = {
            "Accept": "application/json",
            "Authorization": 'Bearer ' + token,
        }

        let response = await axios.get(url,
                                {
                                    "headers": headers
                                }
                            ).then(result => {
                                    return result.data;
                                }, error => {
                                    console.error(error);
                                }
                            );
        return response;
    } 
    catch (error) {
        console.error(error);
        throw 'Connection to server NotesOn.ru failed';
    }
}

export async function http_post(url: string, data: any = null, token: any = null): Promise<any> {
    try {
        let headers = {
            "Accept": "application/json",
            "Content-Type": (data) ? "application/json": "",
            "Authorization": (token) ? 'Bearer ' + token: "",
        }

        const body = (data ? JSON.stringify(data) : {});

        let response = await axios.post(url, 
                                body,
                                {
                                    "headers": headers
                                }
                            ).then(result => {
                                    return result.data;
                                }, error => {
                                    console.error(error);
                                }
                            );
        return response;
    }
    catch (error) {
        console.error(error);
        throw 'Connection to server NotesOn.ru failed';
    }
}

export async function http_post_formdata(url: string, formdata: FormData, token: string): Promise<any> {
    try {
        let response = await axios.post(url, 
                                        formdata,
                                        {
                                            "headers": {
                                                'Authorization': 'Bearer ' + token
                                            }
                                        }
                                    ).then(result => {
                                            console.log(result);
                                        }, error => {
                                            console.error(error);
                                        }
                                    );
        return response;
    } 
    catch (error) {
        console.error(error);
        throw 'Connection to server NotesOn.ru failed';
    }
}

export async function http_delete(url: string,	token: string): Promise<any> {
    try {
        let response = await axios.delete(url,
                                        {
                                            headers: {
                                                "Accept": "application/json",
                                                "Content-Type": "",
                                                "Authorization": 'Bearer ' + token,
                                            }
                                        }
                                    ).then(result => {
                                            return result.data;
                                        }, error => {
                                            console.error(error);
                                        }
                                    );
        return response;
    } 
    catch (error) {
        console.error(error);
        throw 'Connection to server NotesOn.ru failed';
    }
}
