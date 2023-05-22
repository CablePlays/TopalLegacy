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

function getUsers(consumer) {
    const children = fs.readdirSync(USER_DIRECTORY);
    const users = [];

    for (let child of children) {
        const userId = getUserIdFromFileName(child);
        users.push(userId);
    }

    return users;
}

function getPermissions(userId) {
    const permissions = getUser(userId).get("permissions") ?? {};

    if (permissions.managePermissions === true) {
        permissions.manageAwards = true;
    }

    return permissions;
}

function setPermissions(userId, value) {
    getUser(userId).set("permissions", value);
}

module.exports = {
    getRecents,
    getUser,
    getUsers,
    getPermissions,
    setPermissions
}