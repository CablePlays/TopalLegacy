const { OAuth2Client } = require('google-auth-library');
const { v4: uuidv4 } = require('uuid');
const cookies = require('./cookies');
const general = require('./general');
const sheetsApi = require('./sheets-api');

const CLIENT_ID = "65424431927-8mpphvtc9k2sct45lg02pfaidhpmhjsf.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    return await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
}

function awardRequests(app) {
    const LAST_COLUMN = "C";
    const TOTAL_AWARDS = 2;

    function getAwardColumn(award) {
        switch (award) {
            case "POLAR_BEAR": return 1;
            case "RUNNING": return 2;
            default: throw new Error("Unexpected award: " + award);
        }
    }

    /* Has */

    app.post("/has-award", async (req, res) => {
        let { user, award } = req.body;
        user ||= cookies.getUser(req);

        const column = getAwardColumn(award);
        const value = await sheetsApi.search(`Awards!A2:${LAST_COLUMN}`, user, undefined, column);
        const has = (value != null) && (value.toLowerCase() === "true");

        res.json({
            has
        });
    });

    /* Set */

    app.post("/set-has-award", async (req, res) => {
        if (await general.sessionTokenValid(req)) {
            const clientUser = cookies.getUser(req);
            let userPermissions = await general.getPermissions(clientUser);

            if (userPermissions.awards) { // check for permission to manage awards
                const { user, award, has } = req.body;
                const column = getAwardColumn(award);

                let replace = [];

                for (let i = 0; i < TOTAL_AWARDS; i++) {
                    replace[i] = null;
                }

                replace[column - 1] = (has ? true : "");

                sheetsApi.upsert("Awards!A2:B", [
                    [user, ...replace]
                ], true);
            }
        }

        res.end();
    });

    /* Run Data */

    app.post("/get-run-entries", async (req, res) => {
        let json = {};

        if (await general.sessionTokenValid(req)) {
            const user = cookies.getUser(req);
            const values = await sheetsApi.get("Runs!A2:E");

            const entries = [];

            if (values != null) {
                for (let i = 0; i < values.length; i++) {
                    let row = values[i];

                    if (row[0] === user) {
                        let sheetRow = i + 2;
                        entries.push([sheetRow, row[1], row[2], row[3], row[4]]);
                    }
                }
            }

            json.entries = entries;
        }

        res.json(json);
    });

    app.post("/add-run-entry", async (req, res) => {
        if (await general.sessionTokenValid(req)) {
            const { entry } = req.body;
            const user = cookies.getUser(req);
            sheetsApi.add(`Runs!A2:E`, [[user, ...entry]]);
        }

        res.end();
    });

    app.post("/remove-run-entry", async (req, res) => {
        // TODO: check that user owns the entry being removed

        if (await general.sessionTokenValid(req)) {
            const { row } = req.body;
            sheetsApi.set(`Runs!A${row}:E`, [["", "", "", "", ""]]);
        }

        res.end();
    });
}

function permissionRequests(app) {

    /* Get */

    app.post("/get-permission-users", async (req, res) => {
        let json = {};

        if (await general.sessionTokenValid(req)) {
            const user = cookies.getUser(req);
            let userPermissions = await general.getPermissions(user);

            if (userPermissions.permissions) { // check for permission to manage permissions
                const values = await sheetsApi.get("Permissions!A2:B");
                json.values = values;
            }
        }

        res.json(json);
    });

    /* Set */

    app.post("/set-permission", async (req, res) => {
        if (await general.sessionTokenValid(req)) {
            const user = cookies.getUser(req);
            let userPermissions = await general.getPermissions(user);

            if (userPermissions.permissions) { // check for permission to manage permissions
                const { user, level } = req.body;
                sheetsApi.upsert("Permissions!A2:B", [[user, level]]);
            }
        }

        res.end();
    });
}

function otherRequests(app) {

    /* Login */

    app.post("/login", async (req, res) => {
        const { credential } = req.body;
        let decoded;

        try {
            decoded = await verify(credential).then();
        } catch (error) {
            console.console.warn("Invalid JWT: " + error.message);

            res.json({
                status: "error",
                error: "invalid_jwt"
            });

            return;
        }

        const { email, hd } = decoded.getPayload();

        if (hd !== "treverton.co.za") { // check domain
            res.json({
                status: "error",
                error: "invalid_email"
            });

            return;
        }

        let sessionToken = await sheetsApi.search("Users!A2:B", email);

        if (sessionToken == null) { // create session token
            sessionToken = uuidv4();
            await sheetsApi.upsert("Users!A2:B", [[email, sessionToken]]);
        }

        res.setHeader("Set-Cookie", [
            `session_token=${sessionToken}`,
            `user_email=${email}`
        ]);
        res.json({
            status: "success"
        });
    });

    /* Invalidate Session Token */

    app.post("/invalidate-session-token", async (req, res) => {
        const user = cookies.getUser(req);

        if (await general.sessionTokenValid(req)) {
            await sheetsApi.replace("Users!A2:B", [[user, "", ""]], false);
        }

        res.end();
    });
}

function acceptApp(app) {
    awardRequests(app);
    permissionRequests(app);
    otherRequests(app);
}

module.exports = acceptApp;