const express = require('express');
const cookies = require("../../../server/cookies");
const general = require("../../../server/general");
const jsonDatabase = require("../../../server/json-database");
const sqlDatabase = require("../../../server/sql-database");

const requestsRouter = require("./requests");

const router = express.Router();

router.get("/", async (req, res) => {
    const userId = req.userId;
    const awards = jsonDatabase.getUser(userId).get(jsonDatabase.AWARDS_PATH) ?? {};

    await general.provideUserInfoToStatuses(awards);
    res.res(200, { awards });
});

router.put("/", async (req, res) => {
    if (!req.permissions.manageAwards) {
        res.res(403);
        return;
    }

    const { award, complete } = req.body;
    const targetUserId = req.userId;
    const userId = cookies.getUserId(req);

    if (award == null || complete == null) {
        res.res(400);
        return;
    }
    if (!general.isAward(award)) {
        res.res(400, "invalid_award");
        return;
    }

    const db = jsonDatabase.getUser(targetUserId);
    const path = "awards." + award;

    if (complete === true) {

        /* Recents */

        const date = new Date();
        sqlDatabase.run(`INSERT INTO recent_awards (user, award, date) VALUES ("${targetUserId}", "${award}", ${date.getTime()})`);

        /* User Data */

        db.set(path, {
            complete: true,
            date,
            signer: userId
        });
    } else {
        db.delete(path);
    }

    /* Audit Log */

    jsonDatabase.auditLogRecord({
        type: (complete ? "grantAward" : "revokeAward"),
        actor: userId,
        award,
        user: targetUserId
    });

    res.res(204);
});

router.use("/requests", requestsRouter);

module.exports = router;