const { google } = require("googleapis");

const SPREADSHEET_ID = "1mB88Tw-DAjQWGlB1bXOqFZZQmoozmjfJezl6pZfqJEQ";

const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets"
});

function createSheets(client) {
    return google.sheets({ version: "v4", auth: client });
}

/* Add */

async function add(range, values) {
    const client = await auth.getClient();
    const googleSheets = createSheets(client);

    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId: SPREADSHEET_ID,
        range,
        valueInputOption: "RAW",
        resource: {
            values
        }
    });
}

/* Get */

async function get(range) {
    const client = await auth.getClient();
    const googleSheets = createSheets(client);

    let getRows = googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId: SPREADSHEET_ID,
        range
    });

    return (await getRows).data.values;
}

async function search(range, match, colSearch = 0, colGet = 1) {
    let rows = await get(range);

    if (rows != null) {
        for (let row of rows) {
            if (row[colSearch] === match) {
                return row[colGet];
            }
        }
    }

    return null;
}

/* Set */

async function set(range, values) {
    const client = await auth.getClient();
    const googleSheets = createSheets(client);

    await googleSheets.spreadsheets.values.update({
        auth,
        spreadsheetId: SPREADSHEET_ID,
        range,
        valueInputOption: "RAW",
        resource: {
            values
        }
    });
}

async function replace(range, desiredRows, append) {
    let sheetRows = await get(range);

    let parts = range.split("!");
    let sheetName = parts[0];
    let fromTo = parts[1].split(":");
    let matcher = /[a-zA-Z]+|[0-9]+/g; // separates numbers and letters
    let from = fromTo[0].match(matcher);
    let fromColumn = from[0];
    let fromRow = from[1];
    let to = fromTo[1].match(matcher);
    let toColumn = to[0];

    let promises = [];

    if (sheetRows != null) {
        for (let i = 0; i < sheetRows.length; i++) {
            let sheetRow = sheetRows[i];

            for (let desiredRow of desiredRows) {
                if (sheetRow[0] === desiredRow[0]) {
                    desiredRows.splice(desiredRows.indexOf(desiredRow), 1); // remove so it does not get appended

                    let rowNumber = parseInt(fromRow) + i;
                    let updatingRange = `${sheetName}!${fromColumn}${rowNumber}:${toColumn}${rowNumber}`;

                    desiredRow.shift(); // remove target

                    let promise = set(updatingRange, [desiredRow]);
                    promises.push(promise);
                    break;
                }
            }
        }
    }

    if (append && desiredRows.length > 0) { // add remaining values
        for (let desiredRow of desiredRows) {
            desiredRow.shift(); // remove target
        }

        let promise = add(range, desiredRows);
        promises.push(promise);
    }

    await Promise.all(promises);
}

async function upsert(range, rows) {
    for (let row of rows) {
        row.unshift(row[0]); // set target to first replacing
    }

    await replace(range, rows, true);
}

module.exports = {
    add,
    get,
    search,
    set,
    replace,
    upsert
}