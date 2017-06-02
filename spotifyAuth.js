const request = require('request');

module.exports = function () {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            url: 'https://accounts.spotify.com/api/token',
            headers:
            {
                authorization: 'Basic OGRlMzIzNjE0N2QyNDU5Y2FjNTg5YTMxMTIxOTIzZTA6MzgxN2YyOTc5NjBhNDI0MDg5NTQ0ODc4NGM4ZGY0ZjY='
            },
            form: { grant_type: 'client_credentials' }
        };

        request(options, (error, response, body) => {
            if (error) {
                console.error(error);
                reject(error);
            }
            var authObj = JSON.parse(body);
            authObj.expirationTime = new Date().getTime() + (authObj.expires_in * 1000);
            resolve(authObj);
        });
    });
};



