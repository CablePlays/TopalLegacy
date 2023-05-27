/*
    Permissions:
        manageAwards
        managePermissions
*/

const fs = require("fs");
const fsdb = require("file-system-db");

const DIRECTORY = "./database";
const RECENTS_DIRECTORY = DIRECTORY + "/recents";
const USER_DIRECTORY = DIRECTORY + "/user_data";
const COMPACT = false;

const APPROVALS_PATH = "approvals";
const AWARDS_PATH = "awards";
const PERMISSIONS_PATH = "permissions";
const RECENTS_AWARDS_PATH = "awards";
const SIGNOFFS_PATH = "signoffs";
const SINGLETON_LOGS_PATH = "singletonLogs";

function getRecents() {
    return new fsdb(RECENTS_DIRECTORY, COMPACT);
}

function getUser(userId) {
    const path = `${USER_DIRECTORY}/user${userId}`;
    return new fsdb(path, COMPACT);
}

function getPermissions(userId) {
    const permissions = getUser(userId).get(PERMISSIONS_PATH) ?? {};

    if (permissions.managePermissions === true) {
        permissions.manageAwards = true;
    }

    return permissions;
}

module.exports = {
    APPROVALS_PATH,
    AWARDS_PATH,
    PERMISSIONS_PATH,
    RECENTS_AWARDS_PATH,
    SIGNOFFS_PATH,
    SINGLETON_LOGS_PATH,

    getRecents,
    getUser,
    getPermissions
}