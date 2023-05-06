/*
    Permissions:
        manageAwards
        managePermissions
*/

const fs = require("fs");
const fsdb = require("file-system-db");

const DIRECTORY = "./database";
const USER_DIRECTORY = DIRECTORY + "/user_data";
const COMPACT = false;

function getUserIdFromFileName(name) {
    return name.substring("user".length, name.length - 5);
}

function getRecents() {
    return new fsdb(`${DIRECTORY}/recents.json`, COMPACT);
}

function getUser(userId) {
    const path = `${USER_DIRECTORY}/user${userId}`;
    return new fsdb(path, COMPACT);
}

function forEachUser(consumer) {
    const children = fs.readdirSync(USER_DIRECTORY);

    for (let child of children) {
        const userId = getUserIdFromFileName(child);
        const db = new fsdb(USER_DIRECTORY + "/" + child, COMPACT);
        consumer(userId, db);
    }
}

function getPermissions(userId) {
    return getUser(userId).get("permissions") ?? {};
}

function setPermissions(userId, value) {
    getUser(userId).set("permissions", value);
}

module.exports = {
    getRecents,
    getUser,
    forEachUser,
    getPermissions,
    setPermissions
}