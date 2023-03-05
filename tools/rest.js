const { OAuth2Client } = require('google-auth-library');
const { v4: uuidv4 } = require('uuid');
const cookies = require('./cookies');
const jsonDatabase = require('./json-database');
const sqlDatabase = require('./sql-database');
const general = require('./general');

const MAX_AWARD_RECENTS = 10;
const CLIENT_ID = "65424431927-8mpphvtc9k2sct45lg02pfaidhpmhjsf.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

/*
    Runs an async function on an array of items and waits for all of them to be completed.
*/
async function doAllPromises(array, func) {
    const promises = [];

    for (let o of array) {
        promises.push(func(o));
    }

    return Promise.all(promises);
}

async function provideUserInfoToStatus(status) {
    const { message, signer } = status;

    if (signer != null && await sqlDatabase.isUser(signer)) {
        status.signer = await sqlDatabase.getUserInfo(signer);
    }
    if (message != null) {
        const { from } = message;

        if (from != null && await sqlDatabase.isUser(from)) {
            message.from = await sqlDatabase.getUserInfo(from);
        }
    }
}

async function provideUserInfoToStatuses(statuses) {
    await doAllPromises(Object.getOwnPropertyNames(statuses), async property => {
        const status = statuses[property];
        await provideUserInfoToStatus(statuses[property]);
    });
}

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

function awardRequests(app) {

    /* Has */

    app.post("/get-awards", async (req, res) => { // permission: none
        const userId = cookies.getUserId(req);
        const targetUserId = req.body.user ?? userId;

        let values = {};

        if (targetUserId != null && await sqlDatabase.isUser(targetUserId)) {
            const a = jsonDatabase.getUser(targetUserId).get("awards");

            if (a != null) {
                await provideUserInfoToStatuses(a);
                values = a;
            }
        }

        res.json({
            values
        });
    });

    /* Set */

    app.post("/set-award", async (req, res) => { // permission: manageAwards
        if (await general.sessionTokenValid(req)) {
            const userId = cookies.getUserId(req);
            const userPermissions = jsonDatabase.getPermissions(userId);

            if (userPermissions.manageAwards) {
                const { complete, id, user: targetUserId } = req.body;

                if (id != null && userId != null && isValidAward(id) && await sqlDatabase.isUser(targetUserId)) {
                    const db = jsonDatabase.getUser(targetUserId);
                    const path = "awards." + id;

                    if (complete === true) {

                        /* Recents */

                        const recentsDb = jsonDatabase.getRecents();
                        const recentAwards = recentsDb.get("awards") ?? [];

                        const date = new Date();

                        if (recentAwards.length >= MAX_AWARD_RECENTS) {
                            recentAwards.pop();
                        }

                        // add to start of recents
                        recentAwards.unshift({
                            date,
                            award: id,
                            user: targetUserId
                        });

                        recentsDb.set("awards", recentAwards);

                        /* User Data */

                        db.set(path, {
                            complete: true,
                            date,
                            signer: userId
                        });

                        /* Remove Signoff Requests */

                        sqlDatabase.deleteMatchingSignoffRequest(targetUserId, id);
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
        const userId = cookies.getUserId(req);
        const targetUserId = req.body.user ?? userId;

        let values = {};

        if (targetUserId != null) {
            const awards = jsonDatabase.getUser(targetUserId).get("awards") ?? {};
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
    function isValidPermission(permission) {
        return [
            "manageAwards",
            "managePermissions",
            "viewLogs"
        ].includes(permission);
    }

    /* Set */

    app.post("/set-permission", async (req, res) => { // permission: managePermissions
        if (await general.sessionTokenValid(req)) {
            const userId = cookies.getUserId(req);
            const userPermissions = jsonDatabase.getPermissions(userId);

            if (userPermissions.managePermissions) {
                const { user: targetUserEmail, permission, has } = req.body;
                const targetUserId = await sqlDatabase.getUserId(targetUserEmail);

                if (targetUserId == null) {
                    res.json({
                        status: "error",
                        error: "invalid_user"
                    });
                } else if (isValidPermission(permission)) {
                    jsonDatabase.getUser(targetUserId).set("permissions." + permission, has === true);
                    res.json({
                        status: "success"
                    });
                } else {
                    res.json({
                        status: "error",
                        error: "invalid_permission"
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

    app.post("/get-permission-users", async (req, res) => { // permission: managePermissions
        const values = [];

        if (await general.sessionTokenValid(req)) {
            const userId = cookies.getUserId(req);
            const userPermissions = jsonDatabase.getPermissions(userId);

            if (userPermissions.managePermissions) {
                const promises = [];

                jsonDatabase.forEachUser((id, db) => {
                    const permissions = db.get("permissions") ?? {};

                    if (permissions.manageAwards === true || permissions.managePermissions === true) {
                        promises.push(new Promise(async r => {
                            values.push({
                                user: await sqlDatabase.getUserInfo(id),
                                permissions
                            });

                            r();
                        }));
                    }
                });

                await Promise.all(promises);
            }
        }

        res.json({ values });
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

    app.post(`/get-rock-climbing-signoffs`, async (req, res) => { // permission: manageAwards
        let values = {};

        const userId = cookies.getUserId(req);
        let { user: targetUserId } = req.body;

        if (await general.sessionTokenValid(req)) {
            if (targetUserId == null) {
                targetUserId = userId;
            } else {
                const permissions = jsonDatabase.getPermissions(userId);

                if (!permissions.manageAwards) {
                    targetUserId = null;
                }
            }
            if (targetUserId != null && await sqlDatabase.isUser(targetUserId)) {
                const a = await jsonDatabase.getUser(targetUserId).get(SIGNOFFS_PATH);

                if (a != null) {
                    await provideUserInfoToStatuses(a);
                    values = a;
                }
            }
        }

        res.json({
            values
        });
    });

    /* Set */

    app.post(`/set-rock-climbing-signoff`, async (req, res) => { // permission: manageAwards
        if (await general.sessionTokenValid(req)) {
            const userId = cookies.getUserId(req);
            const userPermissions = jsonDatabase.getPermissions(userId);

            if (userPermissions.manageAwards) {
                const { id, complete, user: targetUserId } = req.body;

                if (isValidRockClimbingSignoff(id) && await sqlDatabase.isUser(targetUserId)) {
                    const db = jsonDatabase.getUser(targetUserId);
                    const path = SIGNOFFS_PATH + "." + id;

                    if (complete === true) {
                        db.set(path, {
                            complete: true,
                            date: new Date(),
                            signer: userId
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
        const { user: targetUserId } = req.body;
        let value = {};

        if (targetUserId != null && await sqlDatabase.isUser(targetUserId)) {
            const a = await jsonDatabase.getUser(targetUserId).get(BELAYER_PATH);

            if (a != null) {
                await provideUserInfoToStatus(a);
                value = a;
            }
        }

        res.json({
            value
        });
    });

    /* Set Belayer Signoff */

    app.post(`/set-rock-climbing-belayer-signoff`, async (req, res) => { // permission: manageAwards
        if (await general.sessionTokenValid(req)) {
            const userId = cookies.getUserId(req);
            const userPermissions = jsonDatabase.getPermissions(userId);

            if (userPermissions.manageAwards) {
                const { complete, user: targetUserId } = req.body;

                if (await sqlDatabase.isUser(targetUserId)) {
                    const db = jsonDatabase.getUser(targetUserId);

                    if (complete === true) {
                        db.set(BELAYER_PATH, {
                            complete: true,
                            date: new Date(),
                            signer: userId
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

function signoffRequests(app) {

    /* Request Signoff */

    app.post("/request-signoff", async (req, res) => {
        if (await general.sessionTokenValid(req)) {
            const userId = cookies.getUserId(req);
            const { award } = req.body;

            if (isValidAward(award)) {
                const complete = jsonDatabase.getUser(userId).get("awards." + award + ".complete") === true;

                // check not completed & user does not have request for the award
                if (!complete && !await sqlDatabase.doesSignoffRequestExist(userId, award)) {
                    // remove message
                    jsonDatabase.getUser(userId).delete("awards." + award + ".message");

                    // add signoff
                    await sqlDatabase.insertSignoffRequest(userId, award);
                }
            }
        }

        res.end();
    });

    /* Get Signoff Requests */

    app.post("/get-signoff-requests", async (req, res) => { // permission: manageAwards
        const json = {};

        if (await general.sessionTokenValid(req)) {
            const userId = cookies.getUserId(req);
            const userPermissions = jsonDatabase.getPermissions(userId);

            if (userPermissions.manageAwards) {
                const values = [];

                await doAllPromises(await sqlDatabase.getSignoffRequests(), async value => {
                    value.user = await sqlDatabase.getUserInfo(value.user);
                    values.push(value);
                });

                json.values = values;
            }
        }

        res.json(json);
    });

    /* Decline Signoff Requests */

    app.post("/decline-signoff-request", async (req, res) => { // permission: manageAwards
        if (await general.sessionTokenValid(req)) {
            const userId = cookies.getUserId(req);
            const userPermissions = jsonDatabase.getPermissions(userId);

            if (userPermissions.manageAwards) {
                const { id, message } = req.body;
                const signoffRequest = await sqlDatabase.getSignoffRequest(id);

                if (signoffRequest != null) {
                    const { award, user: signoffRequestUserId } = signoffRequest;
                    await sqlDatabase.deleteSignoffRequest(id);

                    if (message != null && message.replaceAll(" ", "").length > 0 && await sqlDatabase.isUser(signoffRequestUserId)) {
                        jsonDatabase.getUser(signoffRequestUserId).set("awards." + award + ".message", {
                            date: new Date(),
                            content: message,
                            from: userId
                        });
                    }
                }
            }
        }

        res.end();
    });
}

function miscRequests(app) {

    /* Status Data */
    // used by the award status system

    app.post("/get-status-data", async (req, res) => { // restrictions: self
        const json = {};

        if (await general.sessionTokenValid(req)) {
            const userId = cookies.getUserId(req);
            const { award } = req.body;

            const awardStatus = jsonDatabase.getUser(userId).get("awards." + award);

            if (awardStatus == null) {
                json.award = {};
            } else {
                await provideUserInfoToStatus(awardStatus);
                json.award = awardStatus;
            }

            json.requested = await sqlDatabase.doesSignoffRequestExist(userId, award);
        }

        res.json(json);
    });

    /* Names */

    app.post("/get-user-info", async (req, res) => { // permission: none
        const { user: targetUserId } = req.body;
        let values;

        if (targetUserId == null) {
            values = {};
        } else {
            values = await sqlDatabase.getUserInfo(targetUserId);
        }

        res.json({
            values
        });
    });

    /* Invalidate Session Token */

    app.post("/invalidate-session-token", async (req, res) => { // restrictions: self
        if (await general.sessionTokenValid(req)) {
            const userId = cookies.getUserId(req);
            await sqlDatabase.replace("users", "id", userId, { session_token: null });
        }

        res.end();
    });

    /* Search Users */

    app.post("/search-users", async (req, res) => {
        let { query } = req.body;
        query = query.replaceAll(" ", "");

        const users = await sqlDatabase.all(
            `SELECT * FROM users WHERE email LIKE "%${query}%" OR name LIKE "%${query}%" OR given_name LIKE "%${query}%"`);
        const values = [];

        for (let user of users) {
            const { id, name } = user;
            values.push({ id, name });
        }

        res.json({
            values
        })
    });

    /* Get Distance Run */

    app.post("/get-distance-run", async (req, res) => { // permission: none
        const { user: targetUserId } = req.body;
        let value = 0;

        if (targetUserId != null) {
            const result = await sqlDatabase.get(`SELECT SUM(distance) FROM running_records WHERE user = "${targetUserId}"`);
            value = result["SUM(distance)"] ?? 0;
        }

        res.json({
            value
        });
    });

    /* Get Service Time */

    app.post("/get-service-time", async (req, res) => { // permission: none
        const { user: targetUserId } = req.body;
        let value = 0;

        if (targetUserId != null) {
            const result = await sqlDatabase.get(`SELECT SUM(time) FROM service_records WHERE user = "${targetUserId}"`);
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
            const { user: userId } = recent;
            recent.user = await sqlDatabase.getUserInfo(userId);
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
            decoded = await client.verifyIdToken({
                idToken: credential,
                audience: CLIENT_ID
            });
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

        let { id, sessionToken } = await sqlDatabase.getUserDetails(email);

        const replace = {
            name,
            given_name,
            family_name
        };

        if (sessionToken == null) { // create session token
            sessionToken = uuidv4();
            replace.session_token = sessionToken;
        }

        await sqlDatabase.replace("users", "id", id, replace);

        res.setHeader("Set-Cookie", [
            `session_token=${sessionToken}`,
            `user_id=${id}`
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

    app.post(`/get-${name}-records`, async (req, res) => { // permission: none/manageAwards
        let json = {};

        const userId = cookies.getUserId(req);
        let { user: targetUserId } = req.body;

        if (await general.sessionTokenValid(req)) {
            if (targetUserId == null) {
                targetUserId = userId;
            } else {
                const permissions = jsonDatabase.getPermissions(userId);

                if (!permissions.manageAwards) {
                    targetUserId = null;
                }
            }
            if (targetUserId != null) {
                json.records = await sqlDatabase.all(`SELECT * FROM ${table} WHERE user = "${targetUserId}"`);
            }
        }

        res.json(json);
    });

    /* Add */

    app.post(`/add-${name}-record`, async (req, res) => { // restrictions: self
        if (await general.sessionTokenValid(req)) {
            const record = req.body.record ?? {};
            const userId = cookies.getUserId(req);

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

            await sqlDatabase.run(`INSERT INTO ${table} (user, ${columnsString}) VALUES ("${userId}", ${valuesString})`);
        }

        res.end();
    });

    /* Remove */

    app.post(`/remove-${name}-record`, async (req, res) => { // restrictions: self
        if (await general.sessionTokenValid(req)) {
            const { id } = req.body;
            const userId = cookies.getUserId(req);
            await sqlDatabase.run(`DELETE FROM ${table} WHERE id = ${id} AND user = "${userId}"`);
        }

        res.end();
    });
}

function acceptApp(app) {
    awardRequests(app);
    milestoneRequests(app);
    permissionRequests(app);
    rockClimbingRequests(app);
    signoffRequests(app);
    miscRequests(app);

    registerRecordType(app, "endurance", "endurance_records");
    registerRecordType(app, "running", "running_records");
    registerRecordType(app, "service", "service_records");
}

module.exports = acceptApp;