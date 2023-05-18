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

    if (typeof conditionValue === "string") {
        conditionValue = `"${conditionValue}";`
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

async function getPassword(userId) {
    const record = await get(`SELECT * FROM users WHERE id = "${userId}"`);
    return record?.password;
}

/*
    Returns ID & password from email.
    Creates the user if does not exist.
*/
// async function getUserDetails(email) {
//     await run(`INSERT OR IGNORE INTO users (email) VALUES ("${email}")`);
//     const record = await get(`SELECT * FROM users WHERE email = "${email}"`);

//     if (record == null) {
//         throw new Error("Missing user record");
//     }

//     return {
//         id: record.id,
//         password: record.password
//     };
// }

async function getUserInfo(userId) {
    const { email, name, surname } = await get(`SELECT * FROM users WHERE id = "${userId}"`) ?? {};

    return {
        id: userId,
        email,
        name,
        surname,
        fullName: name + " " + surname
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

    db.all("CREATE TABLE IF NOT EXISTS unverified_users (email TEXT UNIQUE NOT NULL, token TEXT UNIQUE NOT NULL)");
    db.all("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL, surname TEXT NOT NULL)");
    db.all("CREATE TABLE IF NOT EXISTS signoff_requests (id INTEGER PRIMARY KEY AUTOINCREMENT, user INTEGER NOT NULL, award TEXT NOT NULL)");

    /* Records */

    db.all("CREATE TABLE IF NOT EXISTS endurance_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user INTEGER NOT NULL, date TEXT NOT NULL, distance INTEGER NOT NULL, time INTEGER NOT NULL, description TEXT)");
    db.all("CREATE TABLE IF NOT EXISTS midmar_mile_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user INTEGER NOT NULL, date TEXT NOT NULL, distance INTEGER NOT NULL, time INTEGER NOT NULL)");
    db.all("CREATE TABLE IF NOT EXISTS mountaineering_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user INTEGER NOT NULL, start_date TEXT NOT NULL, area TEXT NOT NULL, days INTEGER NOT NULL, distance INTEGER NOT NULL, altitude_gained INTEGER NOT NULL, party_size INTEGER NOT NULL, shelter TEXT NOT NULL, trail INTEGER NOT NULL, leader INTEGER NOT NULL, majority_above_2000m INTEGER NOT NULL, route TEXT, weather TEXT, situations TEXT)");
    db.all("CREATE TABLE IF NOT EXISTS running_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user INTEGER NOT NULL, date TEXT NOT NULL, distance INTEGER NOT NULL, time INTEGER NOT NULL, description TEXT)");
    db.all("CREATE TABLE IF NOT EXISTS service_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user INTEGER NOT NULL, date TEXT NOT NULL, service TEXT NOT NULL, time INTEGER NOT NULL, description TEXT, signer INTEGER)");

    db.all("CREATE TABLE IF NOT EXISTS flat_water_paddling_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user INTEGER NOT NULL, date TEXT, training TEXT, boat TEXT, time INTEGER, distance TEXT, place TEXT, comments TEXT)");
    db.all("CREATE TABLE IF NOT EXISTS river_trip_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user INTEGER NOT NULL, date TEXT, put_in TEXT, take_out TEXT, time INTEGER, distance INTEGER, party_size INTEGER, river TEXT, water_level TEXT, boat TEXT, signer INTEGER)");

    db.all("CREATE TABLE IF NOT EXISTS rock_climbing_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user INTEGER NOT NULL, date TEXT NOT NULL, area TEXT, party_size INTEGER, weather TEXT)");
    db.all("CREATE TABLE IF NOT EXISTS rock_climbing_subrecords (id INTEGER PRIMARY KEY AUTOINCREMENT, record_id INTEGER NOT NULL, route_name TEXT, method TEXT, grade TEXT, pitches INTEGER)");
    db.all("CREATE TABLE IF NOT EXISTS rock_climbing_instruction_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user INTEGER NOT NULL, date TEXT NOT NULL, duration INTEGER NOT NULL, climbers INTEGER NOT NULL, location TEXT NOT NULL, signer INTEGER)");
});

module.exports = {
    all,
    get,
    run,
    replace,

    isUser,
    getUserId,
    getPassword,
    getUserInfo,

    getSignoffRequest,
    doesSignoffRequestExist,
    getSignoffRequests,
    insertSignoffRequest,
    deleteSignoffRequest,
    deleteMatchingSignoffRequest
}