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

async function selfOrManageAwards(req, func) {
    if (await general.sessionTokenValid(req)) {
        const userId = cookies.getUserId(req);
        let { user: targetUserId } = req.body;

        if (targetUserId == null) {
            await func(userId);
        } else if (await sqlDatabase.isUser(targetUserId)) {
            const permissions = jsonDatabase.getPermissions(userId);

            if (permissions.manageAwards) {
                await func(targetUserId);
            }
        }
    }
}

async function provideUserInfoToStatus(status) {
    const { decline, signer } = status;

    if (signer != null && await sqlDatabase.isUser(signer)) {
        status.signer = await sqlDatabase.getUserInfo(signer);
    }
    if (decline != null) {
        const { user } = decline;

        if (user != null && await sqlDatabase.isUser(user)) {
            decline.user = await sqlDatabase.getUserInfo(user);
        }
    }
}

async function provideUserInfoToStatuses(statuses) {
    await doAllPromises(Object.getOwnPropertyNames(statuses), async property => {
        const status = statuses[property];
        await provideUserInfoToStatus(statuses[property]);
    });
}

function isAward(award) {
    return [
        "drakensberg",
        "endurance",
        "kayaking",
        "midmarMile", "midmarMileInstructor", "midmarMileLeader",
        "mountainBiking",
        "polarBear", "polarBearInstructor", "polarBearLeader",
        "rockClimbing",
        "running",
        "service",
        "solitaire", "solitaireInstructor", "solitaireLeader",
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

                if (id != null && userId != null && isAward(id) && await sqlDatabase.isUser(targetUserId)) {
                    const db = jsonDatabase.getUser(targetUserId);
                    const path = "awards." + id;

                    if (complete === true) {

                        /* Recents */

                        const recentsDb = jsonDatabase.getRecents();
                        const recentAwards = recentsDb.get("awards") ?? [];

                        const date = new Date();

                        if (recentAwards.length >= MAX_AWARD_RECENTS) {
                            recentAwards.pop(); // remove from end
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

function signoffRequests(app) {
    const APPROVALS_PATH = "approvals";
    const SIGNOFFS_PATH = "signoffs";

    /* Request Award */

    app.post("/request-award", async (req, res) => {
        if (await general.sessionTokenValid(req)) {
            const userId = cookies.getUserId(req);
            const { award } = req.body;

            if (isAward(award)) {
                const complete = jsonDatabase.getUser(userId).get("awards." + award + ".complete") === true;

                // check not completed & user does not have request for the award
                if (!complete && !await sqlDatabase.doesSignoffRequestExist(userId, award)) {
                    // remove decline
                    jsonDatabase.getUser(userId).delete("awards." + award + ".decline");

                    // add signoff
                    await sqlDatabase.insertSignoffRequest(userId, award);
                }
            }
        }

        res.end();
    });

    /* Get Award Requests */

    app.post("/get-award-requests", async (req, res) => { // permission: manageAwards
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

    /* Decline Award Requests */

    app.post("/decline-award-request", async (req, res) => { // permission: manageAwards
        if (await general.sessionTokenValid(req)) {
            const userId = cookies.getUserId(req);
            const userPermissions = jsonDatabase.getPermissions(userId);

            if (userPermissions.manageAwards) {
                const { id: signoffRequestId, message } = req.body;
                const signoffRequest = await sqlDatabase.getSignoffRequest(signoffRequestId);

                if (signoffRequest != null) {
                    const { award, user: signoffRequestUserId } = signoffRequest;
                    await sqlDatabase.deleteSignoffRequest(signoffRequestId);

                    const declineJson = {
                        date: new Date(),
                        user: userId
                    }

                    // add message
                    if (message != null && message.replaceAll(" ", "").length > 0 && await sqlDatabase.isUser(signoffRequestUserId)) {
                        declineJson.message = message;
                    }

                    jsonDatabase.getUser(signoffRequestUserId).set("awards." + award + ".decline", declineJson);
                }
            }
        }

        res.end();
    });

    /* Get Signoffs */

    app.post("/get-signoffs", async (req, res) => { // permission: none/manageAwards
        const { type } = req.body;
        let values = {};

        await selfOrManageAwards(req, async targetUserId => {
            const a = await jsonDatabase.getUser(targetUserId).get(SIGNOFFS_PATH + "." + type);

            if (a != null) {
                await provideUserInfoToStatuses(a);
                values = a;
            }
        });

        res.json({
            values
        });
    });

    /* Set Signoff */

    function isValidSignoff(type, id) {
        if (type === "drakensberg") {
            return [
                "cooker",
                "backPack",
                "ecologicalAwareness",
                "pitchTent"
            ].includes(id);
        } else if (type === "rockClimbing") {
            const valid = [
                ["knots", 4],
                ["harness", 7],
                ["belaying", 11],
                ["wallLeadClimb", 3],
                ["abseiling", 3],
                ["finalTests", 3]
            ];

            for (let a of valid) {
                for (let i = 1; i <= a[1]; i++) {
                    if (id === a[0] + i) {
                        return true;
                    }
                }
            }
        } else if (type === "summit") {
            return [
                "mapReading",
                "preparedness",
                "routeFinding"
            ].includes(id);
        } else if (type === "traverse") {
            return [
                "hikePlan",
                "summary"
            ].includes(id);
        }

        return false;
    }

    app.post("/set-signoff", async (req, res) => { // permission: manageAwards
        if (await general.sessionTokenValid(req)) {
            const userId = cookies.getUserId(req);
            const userPermissions = jsonDatabase.getPermissions(userId);

            if (userPermissions.manageAwards) {
                const { complete, id, type, user: targetUserId } = req.body;

                if (isValidSignoff(type, id) && await sqlDatabase.isUser(targetUserId)) {
                    const db = jsonDatabase.getUser(targetUserId);
                    const path = SIGNOFFS_PATH + "." + type + "." + id;

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

    /* Get Approval */

    app.post("/get-approval", async (req, res) => { // permission: none
        const userId = cookies.getUserId(req);
        const { id, user: targetUserId = userId } = req.body;
        let status = {}; // same as in get-status-data

        if (await sqlDatabase.isUser(targetUserId)) {
            const a = await jsonDatabase.getUser(targetUserId).get(APPROVALS_PATH + "." + id);

            if (a != null) {
                await provideUserInfoToStatus(a);
                status = a;
            }
        }

        res.json({
            status
        });
    });

    /* Set Approval */

    function isValidApproval(id) {
        return [
            "rockClimbingBelayer",
            "ventureProposal"
        ].includes(id);
    }

    app.post("/set-approval", async (req, res) => { // permission: manageAwards
        if (await general.sessionTokenValid(req)) {
            const userId = cookies.getUserId(req);
            const userPermissions = jsonDatabase.getPermissions(userId);

            if (userPermissions.manageAwards) {
                const { complete, id, user: targetUserId } = req.body;

                if (isValidApproval(id) && await sqlDatabase.isUser(targetUserId)) {
                    const db = jsonDatabase.getUser(targetUserId);
                    const path = APPROVALS_PATH + "." + id;

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
}

function miscRequests(app) {

    /* Status Data */
    // used by the status system

    app.post("/get-status-data", async (req, res) => { // restrictions: self
        const json = {};

        if (await general.sessionTokenValid(req)) {
            const userId = cookies.getUserId(req);
            const { id } = req.body;

            const awardStatus = jsonDatabase.getUser(userId).get("awards." + id);

            if (awardStatus == null) {
                json.status = {};
            } else {
                await provideUserInfoToStatus(awardStatus);
                json.status = awardStatus;
            }

            json.requested = await sqlDatabase.doesSignoffRequestExist(userId, id);
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

function registerRecordType(app, name, table, options) {
    const { signable, subrecordsTable } = options ?? {};

    async function getColumns(tableName) {
        let allColumns = await sqlDatabase.get(`SELECT GROUP_CONCAT(name, ',') FROM PRAGMA_TABLE_INFO('${tableName}')`);
        allColumns = allColumns["GROUP_CONCAT(name, ',')"];
        const allColumnsArray = allColumns.split(",");
        return allColumnsArray.slice(2, allColumnsArray.length); // exclude ID and user columns
    }

    /* Get */

    app.post(`/get-${name}-records`, async (req, res) => { // permission: none/manageAwards
        let values = {};

        await selfOrManageAwards(req, async targetUserId => {
            values = await sqlDatabase.all(`SELECT * FROM ${table} WHERE user = "${targetUserId}"`);
        });

        res.json({
            values
        });
    });

    /* Add */

    app.post(`/add-${name}-record`, async (req, res) => { // restrictions: self
        if (await general.sessionTokenValid(req)) {
            const { value = {} } = req.body;
            const userId = cookies.getUserId(req);

            const columns = await getColumns(table);
            let columnsString = "";
            let valuesString = "";

            for (let i = 0; i < columns.length; i++) {
                const column = columns[i];
                const val = value[column];

                if (val == null) {
                    continue;
                }
                if (i > 0) {
                    columnsString += ", ";
                    valuesString += ", ";
                }

                columnsString += column;

                if (typeof val === "string") {
                    valuesString += `"${val}"`;
                } else {
                    valuesString += val;
                }
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

            if (subrecordsTable == null) {
                await sqlDatabase.run(`DELETE FROM ${table} WHERE id = ${id} AND user = "${userId}"`);
            } else {
                const record = await sqlDatabase.get(`SELECT * FROM ${table} WHERE id = ${id} AND user = "${userId}"`);

                if (record != null) {
                    await Promise.all([
                        sqlDatabase.run(`DELETE FROM ${table} WHERE id = ${id} AND user = "${userId}"`),
                        sqlDatabase.run(`DELETE FROM ${subrecordsTable} WHERE record_id = ${id}`)
                    ]);
                }
            }
        }

        res.end();
    });

    /* Sign */

    if (signable) {
        app.post(`/sign-${name}-record`, async (req, res) => { // permission: manageAwards
            if (await general.sessionTokenValid(req)) {
                const { id } = req.body;
                const userId = cookies.getUserId(req);

                const permissions = jsonDatabase.getPermissions(userId);

                if (permissions.manageAwards) {
                    await sqlDatabase.run(`UPDATE ${table} SET signer = "${userId}" WHERE id = "${id}" AND signer IS NULL`);
                }
            }

            res.end();
        });
    }

    if (subrecordsTable != null) {

        /* Get */

        app.post(`/get-${name}-subrecords`, async (req, res) => { // permission: none/manageAwards
            let values = {};

            if (await general.sessionTokenValid(req)) {
                const { recordId } = req.body;
                const userId = cookies.getUserId(req);
                const permissions = jsonDatabase.getPermissions(userId);

                let canAccess;

                if (permissions.manageAwards) {
                    canAccess = true;
                } else {
                    const { user: recordUserId } = await sqlDatabase.get(`SELECT * FROM ${table} WHERE id = "${recordId}"`);
                    canAccess = (recordUserId === userId);
                }
                if (canAccess) {
                    values = await sqlDatabase.all(`SELECT * FROM ${subrecordsTable} WHERE record_id = "${recordId}"`);
                }
            }

            res.json({
                values
            });
        });

        /* Add */

        app.post(`/add-${name}-subrecord`, async (req, res) => { // restrictions: self
            if (await general.sessionTokenValid(req)) {
                const { recordId, value = {} } = req.body;
                const userId = cookies.getUserId(req);

                const record = await sqlDatabase.get(`SELECT * FROM ${table} WHERE id = "${recordId}" AND user = "${userId}"`);

                if (record != null) { // user owns record
                    const columns = await getColumns(subrecordsTable);
                    let valid = true;
                    let columnsString = "";
                    let valuesString = "";

                    for (let i = 0; i < columns.length; i++) {
                        if (i > 0) {
                            columnsString += ", ";
                            valuesString += ", ";
                        }

                        const column = columns[i];

                        columnsString += column;
                        const val = value[column];

                        if (val == null) {
                            valid = false;
                            break;
                        }

                        if (typeof val === "string") {
                            valuesString += `"${val}"`;
                        } else {
                            valuesString += val;
                        }
                    }

                    if (valid) {
                        await sqlDatabase.run(`INSERT INTO ${subrecordsTable} (record_id, ${columnsString}) VALUES (${recordId}, ${valuesString})`);
                    }
                }
            }

            res.end();
        });

        /* Remove */

        app.post(`/remove-${name}-subrecord`, async (req, res) => { // restrictions: self
            if (await general.sessionTokenValid(req)) {
                const { id } = req.body;
                const userId = cookies.getUserId(req);

                const subrecord = await sqlDatabase.get(`SELECT * FROM ${subrecordsTable} WHERE id = "${id}"`);

                if (subrecord != null) {
                    const { record_id: recordId } = subrecord;
                    const record = await sqlDatabase.get(`SELECT * FROM ${table} WHERE id = ${recordId} AND user = "${userId}"`);

                    if (record != null) { // user owns subrecord
                        await sqlDatabase.run(`DELETE FROM ${subrecordsTable} WHERE id = "${id}"`);
                    }
                }
            }

            res.end();
        });
    }
}

function registerSingletonRecordType(app, name, path, keys) {
    const PATH = "singleton-records";
    path = PATH + "." + path;

    app.post(`/get-${name}-record`, async (req, res) => { // permission: none/manageAwards
        const json = {};

        await selfOrManageAwards(req, async targetUserId => {
            const db = jsonDatabase.getUser(targetUserId);
            const value = db.get(path);

            json.exists = (value != null);
            json.value = value ?? {};
        });

        res.json(json);
    });

    app.post(`/add-${name}-record`, async (req, res) => { // restrictions: self
        const json = {};

        if (await general.sessionTokenValid(req)) {
            const { value } = req.body;

            if (value != null) {
                const userId = cookies.getUserId(req);
                const setting = {};

                for (let key of keys) {
                    setting[key] = value[key];
                }

                jsonDatabase.getUser(userId).set(path, setting);
            }
        }

        res.json(json);
    });

    app.post(`/remove-${name}-record`, async (req, res) => { // restrictions: self
        if (await general.sessionTokenValid(req)) {
            const userId = cookies.getUserId(req);
            jsonDatabase.getUser(userId).delete(path);
        }

        res.end();
    });
}

function acceptApp(app) {
    awardRequests(app);
    milestoneRequests(app);
    permissionRequests(app);
    signoffRequests(app);
    miscRequests(app);

    registerRecordType(app, "endurance", "endurance_records");
    registerRecordType(app, "flatWaterPaddling", "flat_water_paddling_records", {
        signable: true
    });
    registerRecordType(app, "midmarMile", "midmar_mile_records");
    registerRecordType(app, "mountaineering", "mountaineering_records");
    registerRecordType(app, "riverTrip", "river_trip_records", {
        signable: true
    });
    registerRecordType(app, "rockClimbing", "rock_climbing_records", {
        subrecordsTable: "rock_climbing_subrecords"
    });
    registerRecordType(app, "rockClimbingSub", "rock_climbing_subrecords");
    registerRecordType(app, "running", "running_records");
    registerRecordType(app, "service", "service_records", {
        signable: true
    });

    registerSingletonRecordType(app, "solitaire", "solitaire", [
        "date", "location", "othersInvolved", "supervisors", "items", "experience"
    ]);
    registerSingletonRecordType(app, "solitaireInstructor", "solitaireInstructor", [
        "date", "location", "groupSupervised", "comments"
    ]);
    registerSingletonRecordType(app, "solitaireLeader", "solitaireLeader", [
        "date", "location", "groupSupervised", "comments"
    ]);
    registerSingletonRecordType(app, "traverseHikePlan", "traverse.hikePlan", ["link"]);
    registerSingletonRecordType(app, "traverseSummaries", "traverse.summaries", ["link"]);
}

module.exports = acceptApp;