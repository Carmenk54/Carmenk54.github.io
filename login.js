function login() {
    let urlParts = 'user/auth/local/login';
    
    let username = getElmtValueById('username');
    let password = getElmtValueById('password');

    let errorMsg = "";
    if (!username)
        errorMsg += "\nMissing username.";
    if (!password)
        errorMsg += "\nMissing password.";
    if (errorMsg) {
        alert(errorMsg);
        return;
    }

    let rememberMe = getCheckboxChecked('remember-credentials');
    
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState === xhttp.DONE && xhttp.status === 200) {
            let resp = JSON.parse(xhttp.responseText);

            let data = resp.data;
            if (!data.id || !data.apiToken)  {
                console.log('resp', data);
                alert("No credential returned");
                return;
            }

            if (rememberMe) {
                sessionStorage.removeItem(KEY_API_USER);
                sessionStorage.removeItem(KEY_API_KEY);
    
                localStorage.setItem(KEY_API_USER, data.id);
                localStorage.setItem(KEY_API_KEY, data.apiToken);
    
            } else {
                localStorage.removeItem(KEY_API_USER);
                localStorage.removeItem(KEY_API_KEY);
    
                sessionStorage.setItem(KEY_API_USER, data.id);
                sessionStorage.setItem(KEY_API_KEY, data.apiToken);
            }
            
            window.location.href = HOME_PAGE;
            
        } else if (xhttp.readyState === xhttp.DONE && xhttp.status >= 400) {
            let resp = JSON.parse(xhttp.responseText);
            if (! resp.success) {
                alert(resp.error + " " + resp.message);
                return;
            }
        }

        
    };
    xhttp.open("POST", `${BASE_URL}${urlParts}`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(`username=${username}&password=${password}`);
}

function init() {
    removeCredentials();
}

init();