const express = require('express');
const cookies = require("../../server/cookies");
const general = require("../../server/general");
const jsonDatabase = require("../../server/json-database");

const router = express.Router();

router.get("/", async (req, res) => {
    const { type } = req.query;
    const targetUserId = req.userId;

    if (type == null) {
        res.res(400);
        return;
    }

    let signoffs = await jsonDatabase.getUser(targetUserId).get(jsonDatabase.SIGNOFFS_PATH + "." + type);

    if (signoffs == null) {
        signoffs = {};
    } else {
        await general.provideUserInfoToStatuses(signoffs);
    }

    res.res(200, { signoffs });
});

router.put("/", (req, res) => {
    if (!req.permissions.manageAwards) {
        res.res(403);
        return;
    }

    let { signoff, type, complete } = req.body;
    const targetUserId = req.userId;
    const userId = cookies.getUserId(req);

    if (!general.isSignoff(type, signoff)) {
        res.res(400, "invalid_signoff");
        return;
    }

    const db = jsonDatabase.getUser(targetUserId);
    const path = jsonDatabase.SIGNOFFS_PATH + "." + type + "." + signoff;

    if (complete === true) {
        db.set(path, {
            complete: true,
            date: new Date(),
            signer: userId
        });
    } else {
        db.delete(path);
    }

    /* Audit Log */

    jsonDatabase.auditLogRecord({
        type: (complete ? "grantSignoff" : "revokeSignoff"),
        actor: userId,
        signoff,
        signoffType: type,
        user: targetUserId
    });

    res.res(204);
});

router.put("/requests", (req, res) => {
    if (!req.loggedIn) {
        res.res(403, "logged_out");
        return;
    }

    const userId = cookies.getUserId(req);
    const targetUserId = req.userId;

    if (userId !== targetUserId) {
        res.res(403, "not_self");
        return;
    }

    let { signoff, type, complete } = req.body;

    if (!general.isSignoff(type, signoff)) {
        res.res(400, "invalid_signoff");
        return;
    }

    const db = jsonDatabase.getUser(targetUserId);
    const path = jsonDatabase.SIGNOFFS_PATH + "." + type + "." + signoff;
    const requestPath = path + ".requestDate";

    if (complete === true) {
        db.set(requestPath, new Date());
    } else if (db.get(path + ".complete")) { // check if already signed off
        res.res(409, "already_complete");
        return;
    }

    db.delete(requestPath);
    res.res(204);
});

module.exports = router;