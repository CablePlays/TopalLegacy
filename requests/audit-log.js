const express = require('express');
const cookies = require("../server/cookies");
const general = require("../server/general");
const jsonDatabase = require("../server/json-database");
const sqlDatabase = require("../server/sql-database");

const router = express.Router();

router.use("/", (req, res, next) => { // require permission: viewAuditLog
    if (req.permissions.viewAuditLog) {
        next();
    } else {
        res.res(403);
    }
});

router.get("/", async (req, res) => {
    const records = jsonDatabase.getAuditLog().get(jsonDatabase.AUDIT_LOG_RECORDS_PATH) ?? [];

    await general.forEachAndWait(records, async record => { // provide user info to actor and user
        await general.forEachAndWait(["actor", "user"], async key => {
            if (record[key]) {
                record[key] = await sqlDatabase.getUserInfo(record[key]);
            }
        });
    });

    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // sort newest first
    res.res(200, { records });
});

module.exports = router;