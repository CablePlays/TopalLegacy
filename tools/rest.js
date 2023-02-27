const { OAuth2Client } = require('google-auth-library');
const { v4: uuidv4 } = require('uuid');
const cookies = require('./cookies');
const jsonDatabase = require('./json-database');
const sqlDatabase = require('./sql-database');
const general = require('./general');

const MAX_AWARD_RECENTS = 10;
const CLIENT_ID = "65424431927-8mpphvtc9k2sct45lg02pfaidhpmhjsf.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

function verify(token) {
    return client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
}

async function getNames(user) { // not user-safe
    const { name, given_name, family_name } = await sqlDatabase.get(`SELECT * FROM users WHERE user = "${user}"`) ?? {};
    return {
        name,
        given: given_name,
        family: family_name,
        email: user
    };
}

async function provideNamesSingle(data) {
    const signer = data.signer;

    if (signer != null && await general.isUser(signer)) {
        data.signer = await getNames(signer);
    }
}

async function provideNames(data) {
    const promises = [];

    for (let a of Object.getOwnPropertyNames(data)) {
        const b = data[a];
        promises.push(provideNamesSingle(b));
    }

    await Promise.all(promises);
}

function awardRequests(app) {
    function isValidAward(award) {
        return [
            "drakensberg",
            "endurance",
            "kayaking",
            "midmarMile",
            "mountainBiking",
            "polarBear",
            "rockClimbing",
            "running",
            "service",
            "solitaire",
            "summit",
            "traverse",
            "venture"
        ].includes(award);
    }

    /* Has */

    app.post("/get-awards", async (req, res) => { // permission: none
        const user = cookies.getUser(req);
        const targetUser = req.body.user ?? user;

        let values = {};

        if (targetUser != null && await general.isUser(targetUser)) {
            const a = jsonDatabase.getUser(targetUser).get("awards");

            if (a != null) {
                await provideNames(a);
                values = a;
            }
        }

        res.json({
            values
        });
    });

    /* Set */

    app.post("/set-award", async (req, res) => { // permission: awards
        if (await general.sessionTokenValid(req)) {
            const user = cookies.getUser(req);
            const userPermissions = await general.getPermissions(user);

            if (userPermissions.awards) {
                const { complete, id, user: targetUser } = req.body;

                if (id != null && user != null && isValidAward(id) && await general.isUser(targetUser)) {
                    const db = jsonDatabase.getUser(targetUser);
                    const path = `awards.${id}`;

                    if (complete === true) {
                        const recentsDb = jsonDatabase.getRecents();
                        const recentAwards = recentsDb.get("awards") ?? [];

                        const date = new Date();

                        if (recentAwards.length >= MAX_AWARD_RECENTS) {
                            recentAwards.pop();
                        }

                        recentAwards.unshift({
                            date,
                            award: id,
                            user: targetUser
                        });

                        recentsDb.set("awards", recentAwards);

                        db.set(path, {
                            complete: true,
                            date,
                            signer: user
                        });
                    } else {
                        db.delete(path);
                    }
                }
            }
        }

        res.end();
    });
}

function milestoneRequests(app) {

    /* Has */

    app.post("/get-milestones", async (req, res) => { // permission: none
        const user = cookies.getUser(req);
        const targetUser = req.body.user ?? user;

        let values = {};

        if (targetUser != null) {
            const awards = jsonDatabase.getUser(targetUser).get("awards") ?? {};
            let totalAwards = Object.getOwnPropertyNames(awards).length;

            values = {
                team: totalAwards >= 4,
                halfColors: totalAwards >= 7,
                colors: totalAwards >= 10,
                merit: false, // TODO
                honors: false // TODO
            };
        }

        res.json({
            values
        });
    });
}

function permissionRequests(app) {

    /* Set */

    app.post("/set-permission-level", async (req, res) => { // permission: permissions
        if (await general.sessionTokenValid(req)) {
            const user = cookies.getUser(req);
            let userPermissions = await general.getPermissions(user);

            if (userPermissions.permissions) {
                const { user: targetUser, level } = req.body;

                if (await general.isUser(targetUser)) {
                    await sqlDatabase.run(`UPDATE users SET permission_level = ${level} WHERE user = "${targetUser}"`);
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

    app.post("/get-permission-users", async (req, res) => { // permission: permissions
        let json = {};

        if (await general.sessionTokenValid(req)) {
            const user = cookies.getUser(req);
            let userPermissions = await general.getPermissions(user);

            if (userPermissions.permissions) {
                let records = await sqlDatabase.all("SELECT user, permission_level FROM users WHERE permission_level > 0");
                json.records = records;
            }
        }

        res.json(json);
    });
}

function rockClimbingRequests(app) {
    const ROCK_CLIMBING_PATH = "rockClimbing";
    const BELAYER_PATH = ROCK_CLIMBING_PATH + ".belayer";
    const SIGNOFFS_PATH = ROCK_CLIMBING_PATH + ".signoffs";

    function isValidRockClimbingSignoff(award) {
        const valid = [
            ["knots", 4],
            ["harness", 7],
            ["belaying", 11],
            ["wallLeadClimb", 3],
            ["abseiling", 3],
            ["finalTests", 3]
        ];

        for (let type of valid) {
            for (let i = 1; i <= type[1]; i++) {
                if (award === type[0] + i) {
                    return true;
                }
            }
        }

        return false;
    }

    /* Get */

    app.post(`/get-rock-climbing-signoffs`, async (req, res) => { // permission: awards
        let values = {};

        const user = cookies.getUser(req);
        let { user: targetUser } = req.body;

        if (await general.sessionTokenValid(req)) {
            if (targetUser == null) {
                targetUser = user;
            } else {
                let permissions = await general.getPermissions(user);

                if (!permissions.awards) {
                    targetUser = null;
                }
            }
            if (targetUser != null && await general.isUser(targetUser)) {
                const a = await jsonDatabase.getUser(targetUser).get(SIGNOFFS_PATH);

                if (a != null) {
                    await provideNames(a);
                    values = a;
                }
            }
        }

        res.json({
            values
        });
    });

    /* Set */

    app.post(`/set-rock-climbing-signoff`, async (req, res) => { // permission: awards
        if (await general.sessionTokenValid(req)) {
            const user = cookies.getUser(req);
            const userPermissions = await general.getPermissions(user);

            if (userPermissions.awards) {
                const { id, complete, user: targetUser } = req.body;

                if (isValidRockClimbingSignoff(id) && await general.isUser(targetUser)) {
                    const db = jsonDatabase.getUser(targetUser);
                    const path = SIGNOFFS_PATH + "." + id;

                    if (complete === true) {
                        db.set(path, {
                            complete: true,
                            date: new Date(),
                            signer: user
                        });
                    } else {
                        db.delete(path);
                    }
                }
            }
        }

        res.end();
    });

    /* Get Belayer Signoff */

    app.post(`/get-rock-climbing-belayer-signoff`, async (req, res) => { // permission: none
        const { user: targetUser } = req.body;
        let value = {};

        if (targetUser != null && await general.isUser(targetUser)) {
            const a = await jsonDatabase.getUser(targetUser).get(BELAYER_PATH);

            if (a != null) {
                await provideNamesSingle(a);
                value = a;
            }
        }

        res.json({
            value
        });
    });

    /* Set Belayer Signoff */

    app.post(`/set-rock-climbing-belayer-signoff`, async (req, res) => { // permission: awards
        if (await general.sessionTokenValid(req)) {
            const user = cookies.getUser(req);
            const userPermissions = await general.getPermissions(user);

            if (userPermissions.awards) {
                const { complete, user: targetUser } = req.body;

                if (await general.isUser(targetUser)) {
                    const db = jsonDatabase.getUser(targetUser);

                    if (complete === true) {
                        db.set(BELAYER_PATH, {
                            complete: true,
                            date: new Date(),
                            signer: user
                        });
                    } else {
                        db.delete(BELAYER_PATH);
                    }
                }
            }
        }

        res.end();
    });
}

function miscRequests(app) {

    /* Names */

    app.post("/get-user-names", async (req, res) => { // permission: none
        const targetUser = req.body.user;
        let values;

        if (targetUser == null) {
            values = {};
        } else {
            values = await getNames(targetUser);
        }

        res.json({
            values
        });
    });

    /* Invalidate Session Token */

    app.post("/invalidate-session-token", async (req, res) => {
        if (await general.sessionTokenValid(req)) {
            const user = cookies.getUser(req);
            await sqlDatabase.replace("users", "user", user, { session_token: null });
        }

        res.end();
    });

    /* Search Users */

    app.post("/search-users", async (req, res) => {
        let { query } = req.body;
        query = query.replaceAll(" ", "");

        const users = await sqlDatabase.all(
            `SELECT * FROM users WHERE user LIKE "%${query}%" OR name LIKE "%${query}%" OR given_name LIKE "%${query}%"`);
        const values = [];

        for (let user of users) {
            const email = user.user;

            values.push({
                email,
                names: await getNames(email)
            });
        }

        res.json({
            values
        })
    });

    /* Get Distance Run */

    app.post("/get-distance-run", async (req, res) => { // permission: none
        const { user: targetUser } = req.body;
        let value = 0;

        if (targetUser != null) {
            const result = await sqlDatabase.get(`SELECT SUM(distance) FROM running_records WHERE user = "${targetUser}"`);
            value = result["SUM(distance)"] ?? 0;
        }

        res.json({
            value
        });
    });

    /* Get Service Time */

    app.post("/get-service-time", async (req, res) => { // permission: none
        const { user: targetUser } = req.body;
        let value = 0;

        if (targetUser != null) {
            const result = await sqlDatabase.get(`SELECT SUM(time) FROM service_records WHERE user = "${targetUser}"`);
            value = result["SUM(time)"] ?? 0;
        }

        res.json({
            value
        });
    });

    /* Get Recent Awards */

    app.post("/get-recent-awards", async (req, res) => {
        const db = jsonDatabase.getRecents();
        const recents = db.get("awards") ?? [];
        const values = [];

        for (let recent of recents) {
            const { user } = recent;
            recent.names = await getNames(user);
            values.push(recent);
        }

        res.json({
            values
        });
    });

    /* Login */

    app.post("/login", async (req, res) => {
        const { credential } = req.body;
        let decoded;

        try {
            decoded = await verify(credential);
        } catch (error) {
            console.warn("Invalid JWT: " + error.message);

            res.json({
                status: "error",
                error: "invalid_jwt"
            });

            return;
        }

        const { email, family_name, given_name, hd, name } = decoded.getPayload();

        if (hd !== "treverton.co.za") { // check domain
            res.json({
                status: "error",
                error: "invalid_email"
            });

            return;
        }

        let sessionToken = await general.getSessionToken(email);
        const replace = {
            family_name,
            given_name,
            name
        };

        if (sessionToken == null) { // create session token
            sessionToken = uuidv4();
            replace.session_token = sessionToken;
        }

        await sqlDatabase.replace("users", "user", email, replace);

        res.setHeader("Set-Cookie", [
            `session_token=${sessionToken}`,
            `user_email=${email}`
        ]);
        res.json({
            status: "success"
        });
    });
}

async function registerRecordType(app, name, table) {
    async function getColumns() {
        let allColumns = await sqlDatabase.get(`SELECT GROUP_CONCAT(name, ',') FROM PRAGMA_TABLE_INFO('${table}')`);
        allColumns = allColumns["GROUP_CONCAT(name, ',')"];
        const allColumnsArray = allColumns.split(",");
        return allColumnsArray.slice(2, allColumnsArray.length);
    }

    /* Get */

    app.post(`/get-${name}-records`, async (req, res) => { // permission: none/awards
        let json = {};

        const user = cookies.getUser(req);
        let { user: targetUser } = req.body;

        if (await general.sessionTokenValid(req)) {
            if (targetUser == null) {
                targetUser = user;
            } else {
                let permissions = await general.getPermissions(user);

                if (!permissions.awards) { // check for permission to manage awards
                    targetUser = null;
                }
            }
            if (targetUser != null) {
                json.records = await sqlDatabase.all(`SELECT * FROM ${table} WHERE user = "${targetUser}"`);
            }
        }

        res.json(json);
    });

    /* Add */

    app.post(`/add-${name}-record`, async (req, res) => { // restricted: self
        if (await general.sessionTokenValid(req)) {
            const record = req.body.record ?? {};
            const user = cookies.getUser(req);

            let columnsString = "";
            let valuesString = "";

            for (let column of await getColumns()) {
                if (columnsString.length > 0) {
                    columnsString += ", ";
                    valuesString += ", ";
                }

                columnsString += column;
                valuesString += `"${record[column]}"`;
            }

            await sqlDatabase.run(`INSERT INTO ${table} (user, ${columnsString}) VALUES ("${user}", ${valuesString})`);
        }

        res.end();
    });

    /* Remove */

    app.post(`/remove-${name}-record`, async (req, res) => { // restricted: self
        if (await general.sessionTokenValid(req)) {
            const { id } = req.body;
            const user = cookies.getUser(req);
            await sqlDatabase.run(`DELETE FROM ${table} WHERE id = ${id} AND user = "${user}"`);
        }

        res.end();
    });
}

function acceptApp(app) {
    awardRequests(app);
    milestoneRequests(app);
    permissionRequests(app);
    rockClimbingRequests(app);
    miscRequests(app);

    registerRecordType(app, "endurance", "endurance_records");
    registerRecordType(app, "running", "running_records");
    registerRecordType(app, "service", "service_records");
}

module.exports = acceptApp;