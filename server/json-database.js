const fs = require("fs");
const path = require("path");
const fsdb = require("file-system-db");

const DIRECTORY = "./database";
const AUDIT_LOG_DIRECTORY = DIRECTORY + "/audit-log";
const USER_DIRECTORY = DIRECTORY + "/user_data";
const COMPACT = false;

// user
const APPROVALS_PATH = "approvals";
const AWARDS_PATH = "awards";
const PERMISSIONS_PATH = "permissions";
const SIGNOFFS_PATH = "signoffs";
const SINGLETON_LOGS_PATH = "singletonLogs";

// other
const AUDIT_LOG_RECORDS_PATH = "records";

/* Get File */

function getAuditLog() {
    return new fsdb(AUDIT_LOG_DIRECTORY, COMPACT);
}

function getUser(userId) {
    const path = `${USER_DIRECTORY}/user${userId}`;
    return new fsdb(path, COMPACT);
}

async function forEachUser(consumer) {
    await new Promise(r => fs.readdir(USER_DIRECTORY, async (error, files) => {
        if (error) {
            console.error(error);
        } else {
            const promises = [];

            for (let fileName of files) {
                const userId = parseInt(fileName.substring("user".length, fileName.length - ".json".length));
                const db = new fsdb(path.join(USER_DIRECTORY, fileName), COMPACT);
                const promise = consumer(userId, db);

                if (promise instanceof Promise) {
                    promises.push(promise);
                }
            }

            if (promises.length > 0) {
                await Promise.all(promises);
            }
        }

        r();
    }));
}

/* Audit Log */

function auditLogRecord(record) {
    record.date = new Date();
    console.info("Creating audit log record: " + record.type);
    getAuditLog().push(AUDIT_LOG_RECORDS_PATH, record);
}

/* Get Permissions */

function getPermissions(userId) {
    const permissions = getUser(userId).get(PERMISSIONS_PATH) ?? {};

    if (permissions.managePermissions === true) {
        permissions.manageAwards = true;
        permissions.viewAuditLog = true;
    }

    return permissions;
}

module.exports = {
    APPROVALS_PATH,
    AUDIT_LOG_RECORDS_PATH,
    AWARDS_PATH,
    PERMISSIONS_PATH,
    SIGNOFFS_PATH,
    SINGLETON_LOGS_PATH,

    getAuditLog,
    getUser,
    forEachUser,
    auditLogRecord,
    getPermissions
}