/*
    Permissions:
        awards
        permissions
*/

const cookies = require("./cookies");
const database = require("./database");

/* Awards */

function awardKeyToColumn(value) {
    switch (value) {
        case "midmarMile": return "midmar_mile";
        case "polarBear": return "polar_bear";
        case "running": return "running";
        default: throw new Error("Unexpected value: " + value);
    }
}

function awardColumnToKey(value) {
    switch (value) {
        case "midmar_mile": return "midmarMile";
        case "polar_bear": return "polarBear";
        case "running": return "running";
        default: throw new Error("Unexpected value: " + value);
    }
}

/* Permissions */

async function getPermissions(user) {
    let record = await database.get(`SELECT permission_level FROM users WHERE user = "${user}"`);
    let level = (record == null) ? 0 : record.permission_level;
    return getPermissionsForLevel(level);
}

function getPermissionsForLevel(level) {
    return {
        awards: level >= 1,
        permissions: level >= 2
    }
}

/* Session Token */

async function getSessionToken(user) {
    let sessionToken = await database.get(`SELECT session_token FROM users WHERE user = "${user}"`);

    if (sessionToken == null) {
        return null;
    }

    return sessionToken.session_token;
}

async function sessionTokenValid(req) { // requires logged in
    const user = cookies.getUser(req);
    if (user == null) return false;

    const savedSessionToken = cookies.getSessionToken(req);
    if (savedSessionToken == null) return false;

    const sessionToken = await getSessionToken(user);
    return (savedSessionToken === sessionToken);
}

/* Other */

function logout(res) {
    res.setHeader("Set-Cookie", [
        cookies.generateRemoveString("session_token"),
        cookies.generateRemoveString("user_email")
    ]);
}

async function isUser(user) {
    const value = await database.get(`SELECT user FROM users WHERE user = "${user}"`);
    return (value != null);
}

module.exports = {
    awardKeyToColumn,
    awardColumnToKey,
    getPermissions,
    getPermissionsForLevel,
    getSessionToken,
    sessionTokenValid,
    logout,
    isUser
}