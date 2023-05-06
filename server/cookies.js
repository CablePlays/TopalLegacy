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

function removeCookies(res, cookies) {
    const strings = [];

    for (let cookie of cookies) {
        strings.push(`${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`);
    }

    res.setHeader("Set-Cookie", strings);
}

function logOut(res) {
    removeCookies(res, ["session_token", "user_id"]);
}

function getUserId(req) {
    return getCookie("user_id", req.headers.cookie);
}

function getSessionToken(req) {
    return getCookie("session_token", req.headers.cookie);
}

function isLoggedIn(req) {
    return (getUserId(req) != null) && (getSessionToken(req) != null);
}

module.exports = {
    removeCookies,
    logOut,
    getUserId,
    getSessionToken,
    isLoggedIn
}