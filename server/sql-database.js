const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

if (!fs.existsSync("database")) {
    fs.mkdirSync("database");
}

/* Use */

function useDatabase(consumer) {
    const db = new sqlite3.Database("./database/database.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, error => {
        if (error) console.warn(error.message);
    });

    consumer(db);

    db.close(error => {
        if (error) console.warn(error.message);
    });
}

function all(sql) {
    return new Promise(resolve => {
        useDatabase(db => {
            db.serialize(() => {
                db.all(sql, [], (error, rows) => {
                    if (error) {
                        console.error(error.message);
                    } else {
                        resolve(rows);
                    }
                });
            });
        });
    });
}

function get(sql) {
    return new Promise(resolve => {
        useDatabase(db => {
            db.serialize(() => {
                db.get(sql, [], (error, row) => {
                    if (error) {
                        console.error(error.message);
                    } else {
                        resolve(row);
                    }
                });
            });
        });
    });
}

function run(sql) {
    return new Promise(resolve => {
        useDatabase(db => {
            db.serialize(() => {
                db.run(sql, [], error => {
                    if (error) {
                        console.error(error.message);
                    } else {
                        resolve();
                    }
                });
            });
        });
    });
}

async function replace(table, conditionColumn, conditionValue, values) {
    let columns = Object.getOwnPropertyNames(values);
    if (columns.length === 0) return; // nothing to replace

    if (typeof conditionValue === "string") conditionValue = `"${conditionValue}"`;

    let setting = "";
    let columnsString = "";
    let valuesString = "";

    for (let column of columns) {
        // value
        let value = values[column];
        if (typeof value === "string") value = `"${value}"`; // add quotes if necessary

        // setting
        if (setting.length > 0) setting += ", ";
        setting += column + " = " + value;

        // columns
        if (columnsString.length > 0) columnsString += ", ";
        columnsString += column;

        // values
        if (valuesString.length > 0) valuesString += ", ";
        valuesString += value;
    }

    await Promise.all([
        run(`UPDATE ${table} SET ${setting} WHERE ${conditionColumn} = ${conditionValue}`),
        run(`INSERT OR IGNORE INTO ${table} (${conditionColumn}, ${columnsString}) VALUES (${conditionValue}, ${valuesString})`)
    ]);
}

/* Users */

/*
    Checks that the given user is a valid one.
*/
async function isUser(userId) {
    const record = await get(`SELECT * FROM users WHERE id = "${userId}"`);
    return (record != null);
}

async function getUserId(userEmail) {
    const record = await get(`SELECT id FROM users WHERE email = "${userEmail}"`);
    return record?.id;
}

async function getSessionToken(userId) {
    const record = await get(`SELECT session_token FROM users WHERE id = "${userId}"`);
    return record?.session_token;
}

/*
    Returns ID & session token from email.
    Creates the user if does not exist.
*/
async function getUserDetails(userEmail) {
    await run(`INSERT OR IGNORE INTO users (email) VALUES ("${userEmail}")`);
    const record = await get(`SELECT * FROM users WHERE email = "${userEmail}"`);

    if (record == null) {
        throw new Error("Missing user record");
    }

    return {
        id: record.id,
        sessionToken: record.session_token
    };
}

async function getUserInfo(userId) {
    const { email, name, given_name, family_name } = await get(`SELECT * FROM users WHERE id = "${userId}"`) ?? {};

    return {
        id: userId,
        email,
        name,
        givenName: given_name,
        familyName: family_name,
    };
}

/* Signoff Requests */

function getSignoffRequest(id) {
    return get(`SELECT * FROM signoff_requests WHERE id = ${id}`);
}

async function doesSignoffRequestExist(userId, award) {
    const val = await get(`SELECT * FROM signoff_requests WHERE user = ${userId} AND award = "${award}"`);
    return (val != null);
}

function getSignoffRequests() {
    return all(`SELECT * FROM signoff_requests`);
}

function insertSignoffRequest(userId, award) {
    return run(`INSERT INTO signoff_requests (user, award) VALUES (${userId}, "${award}")`);
}

function deleteSignoffRequest(id) {
    return run(`DELETE FROM signoff_requests WHERE id = ${id}`);
}

function deleteMatchingSignoffRequest(userId, award) {
    return run(`DELETE FROM signoff_requests WHERE user = ${userId} AND award = "${award}"`);
}

/* Create Tables */

useDatabase(db => {

    /* General */

    db.all("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, session_token TEXT, name TEXT, given_name TEXT, family_name TEXT)");
    db.all("CREATE TABLE IF NOT EXISTS signoff_requests (id INTEGER PRIMARY KEY AUTOINCREMENT, user INTEGER NOT NULL, award TEXT NOT NULL)");

    /* Records */

    db.all("CREATE TABLE IF NOT EXISTS endurance_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user INTEGER NOT NULL, date TEXT NOT NULL, distance INTEGER NOT NULL, time INTEGER NOT NULL, description TEXT)");
    db.all("CREATE TABLE IF NOT EXISTS midmar_mile_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user INTEGER NOT NULL, date TEXT NOT NULL, distance INTEGER NOT NULL, time INTEGER NOT NULL)");
    db.all("CREATE TABLE IF NOT EXISTS mountaineering_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user INTEGER NOT NULL, start_date TEXT NOT NULL, area TEXT NOT NULL, days INTEGER NOT NULL, distance INTEGER NOT NULL, altitude_gained INTEGER NOT NULL, party_size INTEGER NOT NULL, shelter_type TEXT NOT NULL, trail INTEGER NOT NULL, leader INTEGER NOT NULL, majority_above_2000m INTEGER NOT NULL, route TEXT, weather TEXT, situations TEXT)");
    db.all("CREATE TABLE IF NOT EXISTS running_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user INTEGER NOT NULL, date TEXT NOT NULL, distance INTEGER NOT NULL, time INTEGER NOT NULL, description TEXT)");
    db.all("CREATE TABLE IF NOT EXISTS service_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user INTEGER NOT NULL, date TEXT NOT NULL, service TEXT NOT NULL, time INTEGER NOT NULL, description TEXT, signer INTEGER)");

    db.all("CREATE TABLE IF NOT EXISTS flat_water_paddling_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user INTEGER NOT NULL, date TEXT, training TEXT, boat TEXT, time INTEGER, distance TEXT, place TEXT, comments TEXT)");
    db.all("CREATE TABLE IF NOT EXISTS river_trip_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user INTEGER NOT NULL, date TEXT, put_in TEXT, take_out TEXT, time INTEGER, distance INTEGER, party_size INTEGER, river TEXT, water_level TEXT, boat TEXT, signer INTEGER)");

    db.all("CREATE TABLE IF NOT EXISTS rock_climbing_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user INTEGER NOT NULL, date TEXT NOT NULL, area TEXT, party_size INTEGER, weather TEXT)");
    db.all("CREATE TABLE IF NOT EXISTS rock_climbing_subrecords (id INTEGER PRIMARY KEY AUTOINCREMENT, record_id INTEGER NOT NULL, route_name TEXT, method TEXT, grade TEXT, pitches INTEGER)");
});

module.exports = {
    useDatabase,

    all,
    get,
    run,
    replace,

    isUser,
    getUserId,
    getSessionToken,
    getUserDetails,
    getUserInfo,

    getSignoffRequest,
    doesSignoffRequestExist,
    getSignoffRequests,
    insertSignoffRequest,
    deleteSignoffRequest,
    deleteMatchingSignoffRequest
}