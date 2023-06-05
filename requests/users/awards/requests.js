const express = require('express');
const cookies = require("../../../server/cookies");
const general = require("../../../server/general");
const jsonDatabase = require("../../../server/json-database");

const router = express.Router();

router.put("/", (req, res) => {
    if (!req.loggedIn) {
        res.res(401, "not_logged_in");
        return;
    }

    const userId = cookies.getUserId(req);
    const targetUserId = req.userId;

    if (userId !== targetUserId) {
        res.res(403, "not_self");
        return;
    }

    const { award } = req.body;

    if (award == null) {
        res.res(400);
    }
    if (!general.isAward(award)) {
        res.res(400, "invalid_award");
        return;
    }

    const db = jsonDatabase.getUser(targetUserId);
    const path = jsonDatabase.AWARDS_PATH + "." + award;

    if (db.get(path + ".complete")) {
        res.res(409, "award_complete");
        return;
    }
    if (db.get(path + ".requestDate")) {
        res.res(409, "request_exists");
        return;
    }

    db.set(path, {
        requestDate: new Date()
    });

    res.res(204);
});

router.delete("/:award", (req, res) => {
    if (!req.permissions.manageAwards) {
        res.res(403);
        return;
    }

    const { award } = req.params;
    const { message } = req.body;

    if (award == null) {
        res.res(400);
        return;
    }
    if (!general.isAward(award)) {
        res.res(404, "invalid_award");
        return;
    }

    const userId = cookies.getUserId(req);
    const targetUserId = req.userId;

    const db = jsonDatabase.getUser(targetUserId);
    const path = jsonDatabase.AWARDS_PATH + "." + award;

    if (!db.get(path + ".requestDate")) {
        res.res(409, "no_request");
        return;
    }

    const declineJson = {
        date: new Date(),
        user: userId
    }

    if (message != null && message.trim().length > 0) { // add message
        declineJson.message = message;
    }

    db.set(path, {
        decline: declineJson
    });

    /* Audit Log */

    jsonDatabase.auditLogRecord({
        type: "declineAwardSignoffRequest",
        actor: userId,
        award,
        user: targetUserId
    });

    res.res(204);
});

module.exports = router;