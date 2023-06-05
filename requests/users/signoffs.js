const express = require('express');
const cookies = require("../../server/cookies");
const general = require("../../server/general");
const jsonDatabase = require("../../server/json-database");

const router = express.Router();

router.get("/", async (req, res) => {
    const { type } = req.query;
    const targetUserId = req.userId;

    let signoffs = jsonDatabase.getUser(targetUserId).get(jsonDatabase.SIGNOFFS_PATH + (type ? "." + type : ""));

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

    let { type, signoff, complete } = req.body;
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

const requestsRouter = express.Router();
router.use("/requests", requestsRouter);

requestsRouter.put("/", (req, res) => {
    if (!req.loggedIn) {
        res.res(401, "logged_out");
        return;
    }

    const userId = cookies.getUserId(req);
    const targetUserId = req.userId;

    if (userId !== targetUserId) {
        res.res(403, "not_self");
        return;
    }

    let { signoff, type, complete } = req.body;

    if (signoff == null || type == null || complete == null) {
        res.res(400);
        return;
    }
    if (!general.isSignoff(type, signoff)) {
        res.res(400, "invalid_signoff");
        return;
    }

    const db = jsonDatabase.getUser(targetUserId);
    const path = jsonDatabase.SIGNOFFS_PATH + "." + type + "." + signoff;

    if (db.get(path + ".complete")) { // check if already complete
        res.res(409, "already_complete");
        return;
    }
    if (complete === true) {
        db.set(path, {
            requestDate: new Date()
        });
    } else {
        db.delete(path);
    }

    res.res(204);
});

requestsRouter.delete("/:type/:signoff", (req, res) => {
    if (!req.permissions.manageAwards) {
        res.res(403);
        return;
    }

    const { type, signoff } = req.params;

    if (type == null || signoff == null) {
        res.res(400);
        return;
    }
    if (!general.isSignoff(type, signoff)) {
        res.res(404, "invalid_signoff");
        return;
    }

    const userId = cookies.getUserId(req);
    const targetUserId = req.userId;

    const db = jsonDatabase.getUser(targetUserId);
    const path = jsonDatabase.SIGNOFFS_PATH + "." + type + "." + signoff;

    if (!db.get(path + ".requestDate")) {
        res.res(409, "no_request");
        return;
    }

    db.set(path, {
        declined: true
    });

    /* Audit Log */

    jsonDatabase.auditLogRecord({
        type: "declineSignoffRequest",
        actor: userId,
        signoffType: type,
        signoff,
        user: targetUserId
    });

    res.res(204);
});

module.exports = router;