const express = require('express');
const cookies = require("../../../server/cookies");
const general = require("../../../server/general");
const jsonDatabase = require("../../../server/json-database");
const sqlDatabase = require("../../../server/sql-database");

const router = express.Router();

router.use("/", (req, res, next) => { // require self or manageAward permission
    const targetUserId = req.userId;
    const userId = cookies.getUserId(req);

    if (targetUserId === userId || req.permissions.manageAwards) {
        next();
    } else {
        res.res(403);
    }
});

router.delete("/", (req, res) => {
    const { type } = req.log;
    const userId = req.userId;

    jsonDatabase.getUser(userId).delete(jsonDatabase.SINGLETON_LOGS_PATH + "." + type);
    res.res(204);
});

router.get("/", async (req, res) => {
    const { type: logType } = req.log;
    const userId = req.userId;
    let logs = [];

    if (general.isSingleton(logType)) {
        const db = jsonDatabase.getUser(userId);
        const log = db.get(jsonDatabase.SINGLETON_LOGS_PATH + "." + logType);

        if (log != null) {
            logs[0] = log;
        }
    } else {
        const table = general.getLogsTable(logType);
        logs = await sqlDatabase.all(`SELECT * FROM ${table} WHERE user = "${userId}"`);
    }

    res.res(200, { logs });
});

router.post("/", async (req, res) => {
    const { type: logType } = req.log;
    const { log } = req.body;
    const userId = req.userId;

    if (log == null) {
        res.res(400);
        return;
    }
    if (general.isSingleton(logType)) {
        const keys = general.getSingletonKeys(logType);
        const setting = {};

        for (let key of keys) {
            setting[key] = log[key];
        }

        jsonDatabase.getUser(userId).set(jsonDatabase.SINGLETON_LOGS_PATH + "." + logType, setting);
    } else {
        const table = general.getLogsTable(logType);
        const columns = await sqlDatabase.getTableColumns(table);

        let columnsString = "";
        let valuesString = "";

        for (let i = 2; i < columns.length; i++) { // start 2: skip ID and user
            if (i > 2) {
                columnsString += ", ";
                valuesString += ", ";
            }

            const column = columns[i];
            const val = log[column];

            columnsString += column;

            if (val == null) {
                valuesString += null;
            } else if (typeof val === "string") {
                valuesString += `"${val}"`;
            } else {
                valuesString += val;
            }
        }

        await sqlDatabase.run(`INSERT INTO ${table} (user, ${columnsString}) VALUES ("${userId}", ${valuesString})`);
    }

    res.res(204);
});

module.exports = router;