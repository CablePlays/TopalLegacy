function getCookie(name, cookies) {
    cookies = decodeURIComponent(cookies || "").split(";");
    let cname = name + "=";

    for (let cookie of cookies) {
        cookie = cookie.trim();

        if (cookie.startsWith(cname)) {
            return cookie.substring(cname.length, cookie.length);
        }
    }

    return null;
}

function generateRemoveString(name) {
    return `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

function getUser(req) {
    return getCookie("user_email", req.headers.cookie);
}

function getSessionToken(req) {
    return getCookie("session_token", req.headers.cookie);
}

function isLoggedIn(req) {
    return (getUser(req) != null) && (getSessionToken(req) != null);
}

module.exports = {
    generateRemoveString,
    getUser,
    getSessionToken,
    isLoggedIn
}