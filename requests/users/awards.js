const express = require('express');
const cookies = require("../../server/cookies");
const general = require("../../server/general");
const jsonDatabase = require("../../server/json-database");
const sqlDatabase = require("../../server/sql-database");

const router = express.Router();

router.get("/", async (req, res) => {
    const userId = req.userId;
    const awards = jsonDatabase.getUser(userId).get(jsonDatabase.AWARDS_PATH);
    let values = {};

    if (awards != null) {
        await general.provideUserInfoToStatuses(awards);
        values = awards;
    }

    const signoffRequests = await sqlDatabase.all(`SELECT * FROM signoff_requests WHERE user = ${userId}`);

    for (let signoffRequest of signoffRequests) {
        const { award } = signoffRequest;
        let awardStatus = values[award];

        if (awardStatus == null) {
            awardStatus = {};
            values[award] = awardStatus;
        }

        awardStatus.requested = true;
    }

    res.res(200, { awards: values });
});

router.use("/", (req, res, next) => { // require permission: manageAwards
    if (req.permissions.manageAwards) {
        next();
    } else {
        res.res(403);
    }
});

router.put("/", async (req, res) => {
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

        const recentsDb = jsonDatabase.getRecents();
        const recentAwards = recentsDb.get("awards") ?? [];

        const date = new Date();

        if (recentAwards.length >= general.MAX_RECENT_AWARDS) {
            recentAwards.pop(); // remove from end
        }

        // add to start of recents
        recentAwards.unshift({
            date,
            award: award,
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

        sqlDatabase.deleteMatchingSignoffRequest(targetUserId, award);
    } else {
        db.delete(path);
    }

    res.res(204);
});

module.exports = router;