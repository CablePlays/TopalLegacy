const express = require('express');
const jsonDatabase = require("../server/json-database");
const sqlDatabase = require("../server/sql-database");

const router = express.Router();

router.get("/", async (req, res, next) => {
    if (!req.permissions.manageAwards) {
        res.res(403);
        return;
    }

    const totalRequests = {};
    const userRequests = [];

    await jsonDatabase.forEachUser(async (userId, db) => {
        const awards = db.get(jsonDatabase.AWARDS_PATH);
        const signoffs = db.get(jsonDatabase.SIGNOFFS_PATH);
        const requests = {};

        const increaseCount = award => {
            // total
            let totalCount = totalRequests[award] ?? 0;
            totalRequests[award] = totalCount + 1;

            // user
            let count = requests[award] ?? 0;
            requests[award] = count + 1;
        };

        if (awards != null) {
            for (let awardId of Object.keys(awards)) {
                if (awards[awardId].requestDate) {
                    increaseCount(awardId);
                }
            }
        }
        if (signoffs != null) {
            for (let awardId of Object.keys(signoffs)) {
                const awardSignoffs = signoffs[awardId];

                for (let signoffId of Object.keys(awardSignoffs)) {
                    if (awardSignoffs[signoffId].requestDate) {
                        increaseCount(awardId);
                    }
                }
            }
        }
        if (Object.keys(requests).length > 0) {
            userRequests.push({
                details: await sqlDatabase.getUserInfo(userId),
                requests
            });
        }
    });

    res.res(200, {
        total: totalRequests,
        users: userRequests
    });
});

module.exports = router;