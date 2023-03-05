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

function removeCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

function getUserId() {
    return getCookie("user_id");
}

function getSessionToken() {
    return getCookie("session_token");
}

function isLoggedIn() {
    return (getUserId() != null) && (getSessionToken() != null);
}

function logOut() {
    removeCookie("session_token");
    removeCookie("user_email");
}