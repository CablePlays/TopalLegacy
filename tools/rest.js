const { OAuth2Client } = require('google-auth-library');
const { v4: uuidv4 } = require('uuid');
const cookies = require('./cookies');
const database = require('./database');
const general = require('./general');

const CLIENT_ID = "65424431927-8mpphvtc9k2sct45lg02pfaidhpmhjsf.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    return await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
}

function awardRequests(app) {

    /* Has */

    app.post("/get-awards", async (req, res, next) => { // does not require permissions
        const user = cookies.getUser(req);
        let targetUser = req.body.user || user;

        let record = await database.get(`SELECT * FROM awards WHERE user = "${targetUser}"`);
        record ||= {};

        let awards = {};

        for (let award of Object.getOwnPropertyNames(record)) {
            if (award === "user") continue;
            let has = (record[award] === 1);
            awards[general.awardColumnToKey(award)] = has;
        }

        res.json({
            awards
        });
    });

    /* Set */

    app.post("/set-awards", async (req, res) => { // requires awards permission
        if (await general.sessionTokenValid(req)) {
            const user = cookies.getUser(req);
            let userPermissions = await general.getPermissions(user);

            if (userPermissions.awards) { // check for permission to manage awards
                const { user: targetUser, awards } = req.body;
                let replacing = {};

                // convert object to array of its properties
                for (let award of Object.getOwnPropertyNames(awards)) {
                    let column = general.awardKeyToColumn(award);
                    let has = (awards[award] === true) ? 1 : 0;
                    replacing[column] = has;
                }

                await database.replace("awards", "user", targetUser, replacing);
            }
        }

        res.end();
    });
}

function runRequests(app) {

    /* Get */

    app.post("/get-run-entries", async (req, res) => {
        let json = {};

        const user = cookies.getUser(req);
        let targetUser = req.user;

        if (targetUser == null) {
            if (await general.sessionTokenValid(req)) {
                targetUser = user;
            }
        } else {
            let permissions = general.getPermissions(user);

            if (!permissions.awards) { // check for permission to manage awards
                targetUser = null;
            }
        }
        if (targetUser != null) {
            json.entries = await database.all(`SELECT * FROM runs WHERE user = "${targetUser}"`);
        }

        res.json(json);
    });

    /* Add */

    app.post("/add-run-entry", async (req, res) => {
        if (await general.sessionTokenValid(req)) {
            const { entry } = req.body;
            const user = cookies.getUser(req);
            await database.run(`INSERT INTO runs (user, date, distance, time, description) VALUES ("${user}", "${entry.date}", ${entry.distance}, ${entry.time}, "${entry.description}")`);
        }

        res.end();
    });

    /* Remove */

    app.post("/remove-run-entry", async (req, res) => { // user can only remove their own entries
        if (await general.sessionTokenValid(req)) {
            const { id } = req.body;
            const user = cookies.getUser(req);
            await database.run(`DELETE FROM runs WHERE id = ${id} AND user = "${user}"`);
        }

        res.end();
    });
}

function permissionRequests(app) {

    /* Set */

    app.post("/set-permission-level", async (req, res) => {
        if (await general.sessionTokenValid(req)) {
            const user = cookies.getUser(req);
            let userPermissions = await general.getPermissions(user);

            if (userPermissions.permissions) { // check for permission to manage permissions
                const { user: targetUser, level } = req.body;

                if (await general.isUser(targetUser)) {
                    await database.run(`UPDATE users SET permission_level = ${level} WHERE user = "${targetUser}"`);
                    res.json({
                        status: "success"
                    });
                } else {
                    res.json({
                        status: "error",
                        error: "invalid_user"
                    });
                }

                return;
            }
        }

        res.json({
            status: "error",
            error: "unpermitted"
        });
    });

    /* Get Permission Users */

    app.post("/get-permission-users", async (req, res) => {
        let json = {};

        if (await general.sessionTokenValid(req)) {
            const user = cookies.getUser(req);
            let userPermissions = await general.getPermissions(user);

            if (userPermissions.permissions) { // check for permission to manage permissions
                let records = await database.all("SELECT user, permission_level FROM users WHERE permission_level > 0");
                json.records = records;
            }
        }

        res.json(json);
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

        let sessionToken = await general.getSessionToken(email);

        if (sessionToken == null) { // create session token
            sessionToken = uuidv4();
            await database.replace("users", "user", email, { session_token: sessionToken });
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
        if (await general.sessionTokenValid(req)) {
            const user = cookies.getUser(req);
            await database.replace("users", "user", user, { session_token: null });
        }

        res.end();
    });

    /* Search Users */

    app.post("/search-users", async (req, res) => {
        let { query } = req.body;
        query = query.replaceAll(" ", "");

        const users = await database.all(`SELECT user FROM users WHERE user LIKE "%${query}%"`);
        const emails = [];

        // get only emails
        users.forEach(user => {
            emails.push(user.user);
        });

        res.json({
            users: emails
        })
    });
}

function acceptApp(app) {
    awardRequests(app);
    runRequests(app);
    permissionRequests(app);
    otherRequests(app);
}

module.exports = acceptApp;