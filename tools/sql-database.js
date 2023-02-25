const sqlite3 = require("sqlite3").verbose();

function useDatabase(consumer) {
    const db = new sqlite3.Database("database.db", error => {
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
                    if (error) throw error;
                    resolve(rows);
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
                    if (error) throw error;
                    resolve(row);
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
                    if (error) throw error;
                    resolve();
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

// create tables if they do not exist
useDatabase(db => {
    // db.all("CREATE TABLE IF NOT EXISTS awards (user TEXT PRIMARY KEY, midmar_mile INTEGER DEFAULT 0 NOT NULL, polar_bear INTEGER DEFAULT 0 NOT NULL, running INTEGER DEFAULT 0 NOT NULL)");

    /* General */

    db.all("CREATE TABLE IF NOT EXISTS users (user TEXT PRIMARY KEY, permission_level INTEGER DEFAULT 0 NOT NULL, session_token TEXT)");

    /* Records */

    db.all("CREATE TABLE IF NOT EXISTS endurance_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT NOT NULL, date TEXT NOT NULL, distance INTEGER NOT NULL, time INTEGER NOT NULL, description TEXT)");
    db.all("CREATE TABLE IF NOT EXISTS running_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT NOT NULL, date TEXT NOT NULL, distance INTEGER NOT NULL, time INTEGER NOT NULL, description TEXT)");
    db.all("CREATE TABLE IF NOT EXISTS service_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT NOT NULL, date TEXT NOT NULL, service TEXT NOT NULL, time INTEGER NOT NULL, description TEXT)");
});

module.exports = {
    useDatabase,
    all,
    get,
    run,
    replace
}