/*
    Using Cookies:
        session_token: user's "password" for current session
        user_email: user's email
*/

function getCookie(name) {
    let cookies = decodeURIComponent(document.cookie || "").split(";");
    let cname = name + "=";

    for (let cookie of cookies) {
        cookie = cookie.trim();

        if (cookie.startsWith(cname)) {
            return cookie.substring(cname.length, cookie.length);
        }
    }

    return null;
}

function setCookie(cname, cvalue, exdays) {
    let d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function removeCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

function getUser() {
    return getCookie("user_email");
}

function getSessionToken() {
    return getCookie("session_token");
}

function isLoggedIn() {
    return (getUser() != null) && (getSessionToken() != null);
}

function logOut() {
    removeCookie("session_token");
    removeCookie("user_email");
}