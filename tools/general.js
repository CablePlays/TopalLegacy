/*
    Permissions:
        awards
        permissions
*/

const cookies = require("./cookies");
const sheetsApi = require("./sheets-api");

async function getPermissions(user) {
    let level = await sheetsApi.search("Permissions!A2:B", user) || 0;
    return getPermissionsForLevel(level);
}

function getPermissionsForLevel(level) {
    return {
        awards: level >= 1,
        permissions: level >= 2
    }
}

async function getSessionToken(user) {
    return sheetsApi.search("Users!A2:B", user);
}

async function sessionTokenValid(req) {
    const user = cookies.getUser(req);
    if (user == null) return false;

    const savedSessionToken = cookies.getSessionToken(req);
    if (savedSessionToken == null) return false;

    const sessionToken = await getSessionToken(user);
    return (savedSessionToken === sessionToken);
}

function logOut(res) {
    res.setHeader("Set-Cookie", [
        cookies.generateRemoveString("session_token"),
        cookies.generateRemoveString("user_email")
    ]);
}

module.exports = {
    getPermissions,
    getPermissionsForLevel,
    getSessionToken,
    sessionTokenValid,
    logOut
}