let XMLHttpRequest=require('xmlhttprequest').XMLHttpRequest;

export async function request<Request, Response>
(
    method: 'GET' | 'POST',
    url: string,
    content?: Request,
    callback?: (response: any) => void,
    errorCallback?: (err: any) => void
) {
    const request = new XMLHttpRequest();
    request.open(method, url, true);
    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            // Success!
            let data = JSON.parse(this['responseText']);
            if (callback) {
                callback(data);
            }
        } else {
            console.log("reached with error");
            // We reached our target server, but it returned an error
        }
    };

    request.onerror = function (err: any) {
        // There was a connection error of some sort
        console.log("request error");
        if (errorCallback) {
            errorCallback(err);
        }
    };
    if (method === 'POST') {
        request.setRequestHeader(
            'Content-Type',
            'application/json');
    }
    request.send(JSON.stringify(content));
}

// Using promises:
export function request2<Request, Response>
(
    method: 'GET' | 'POST',
    url: string,
    content?: Request
): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
        request(method, url, content, resolve, reject);
    });
}