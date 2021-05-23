const BASE_URL = "https://habitica.com/api/v3/";
let apiUser = undefined;
let apiKey = undefined;

function getHabiticaHeaders() {
    if (localStorage.getItem(KEY_API_USER) && localStorage.getItem(KEY_API_KEY)) {
        apiUser = localStorage.getItem(KEY_API_USER);
        apiKey = localStorage.getItem(KEY_API_KEY);

    } else if (sessionStorage.getItem(KEY_API_USER) && sessionStorage.getItem(KEY_API_KEY)) {
        apiUser = sessionStorage.getItem(KEY_API_USER);
        apiKey = sessionStorage.getItem(KEY_API_KEY);
    }

    if (!apiUser || !apiKey) {
        window.location.href = LOGIN_PAGE;
        return;
    }

    let habiticaHeaders = {
        'x-api-user': apiUser,
        'x-api-key' : apiKey,
        'Content-Type': 'application/json',
    };
    
    return habiticaHeaders;
}

function removeCredentials() {
    localStorage.removeItem(KEY_API_USER);
    localStorage.removeItem(KEY_API_KEY);

    sessionStorage.removeItem(KEY_API_USER);
    sessionStorage.removeItem(KEY_API_KEY);
}

function getRequest(urlParts, options={}) {
    let getOptions = {
        method: 'GET',
        headers: getHabiticaHeaders(),
        ...options
    };

    return request(urlParts, getOptions);
}

function postRequest(urlParts, options={}) {
    let postOptions = {
        method: 'POST',
        headers: getHabiticaHeaders(),
        ...options
    };

    return request(urlParts, postOptions);
}

function putRequest(urlParts, options={}) {
    let putOptions = {
        method: 'PUT',
        headers: getHabiticaHeaders(),
        ...options
    };

    return request(urlParts, putOptions);
}

function request(urlParts, options) {
    return new Promise((resolve, reject) => {
        fetch(`${BASE_URL}${urlParts}`, options)
            .then((resp) => {
                if (!resp.ok)
                    reject(`HTTP error! status: ${resp.status}`);

                return resp.json();
            })
            .then(function(resp) {
                if (!resp.success) 
                    reject(`API error! status: ${resp.message}`)
                
                return resp;
            })
            .then(function(resp) {
                resolve(resp);
            });
    });
}