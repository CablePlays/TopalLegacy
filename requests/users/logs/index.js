const express = require('express');
const general = require("../../../server/general");
const sqlDatabase = require("../../../server/sql-database");

const router = express.Router();

router.get("/distance-run", async (req, res) => {
    const targetUserId = req.userId;
    let distance = 0;

    const result = await sqlDatabase.get(`SELECT SUM(distance) FROM running_logs WHERE user = "${targetUserId}"`);
    distance = result["SUM(distance)"] ?? 0;

    res.res(200, { distance });
});

router.get("/service-hours", async (req, res) => {
    const targetUserId = req.userId;
    let time = 0;

    const result = await sqlDatabase.get(`SELECT SUM(time) FROM service_logs WHERE user = "${targetUserId}"`);
    time = result["SUM(time)"] ?? 0;

    res.res(200, { time });
});

const typedRouter = require("./typed");

router.use("/:type", (req, res, next) => {
    const { type } = req.params;

    if (general.isLogType(type)) {
        req.log = { type };
        next();
    } else {
        res.res(404, "invalid_type");
    }
});

router.use("/:type", typedRouter);

module.exports = router;