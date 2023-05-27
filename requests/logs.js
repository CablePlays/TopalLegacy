const express = require('express');
const cookies = require("../server/cookies");
const general = require("../server/general");
const sqlDatabase = require("../server/sql-database");

const router = express.Router();

const typedRouter = express.Router();

router.use("/:type", (req, res, next) => { // verify and provide type
    const { type } = req.params;

    if (!general.isLogType(type)) {
        res.res(404, "invalid_type");
        return;
    }

    req.log = { type };
    next();
});

router.use("/:type", typedRouter);

typedRouter.delete("/sub/:id", selfOrManageAwards, async (req, res) => {
    const { type } = req.log;
    const { id: sublogId } = req.params;

    const subtable = general.getSublogsTable(type);
    await sqlDatabase.run(`DELETE FROM ${subtable} WHERE id = "${sublogId}"`);

    res.res(204);
});

const typedIdRouter = express.Router();

typedRouter.use("/:id", async (req, res, next) => { // verify and provide ID
    const { type } = req.log;
    const { id } = req.params;

    const table = general.getLogsTable(type);
    const log = await sqlDatabase.get(`SELECT * FROM ${table} WHERE id = "${id}"`);

    if (log == null) {
        res.res(404, "invalid_id");
        return;
    }

    req.log.id = id;
    req.log.userId = log.user;

    next();
});

typedRouter.use("/:id", typedIdRouter);

function selfOrManageAwards(req, res, next) {
    const { userId: logUserId } = req.log;
    const userId = cookies.getUserId(req);

    if (userId === logUserId || req.permissions.manageAwards) {
        next();
    } else {
        res.res(403);
    }
}

function checkSublogsSupported(req, res, next) {
    const { type } = req.log;

    if (general.hasSublogs(type)) {
        next();
    } else {
        res.res(400, "sublogs_not_supported");
    }
}

typedIdRouter.delete("/", selfOrManageAwards, async (req, res) => {
    const { type, id: logId } = req.log;

    const table = general.getLogsTable(type);

    if (general.hasSublogs(type)) {
        const subtable = general.getSublogsTable(type);

        await Promise.all([
            sqlDatabase.run(`DELETE FROM ${table} WHERE id = "${logId}"`),
            sqlDatabase.run(`DELETE FROM ${subtable} WHERE log_id = "${logId}"`)
        ]);
    } else {
        await sqlDatabase.run(`DELETE FROM ${table} WHERE id = "${logId}"`);
    }

    res.res(204);
});

typedIdRouter.get("/", selfOrManageAwards, checkSublogsSupported, async (req, res) => {
    const { type, id: logId } = req.log;

    const subtable = general.getSublogsTable(type);
    const sublogs = await sqlDatabase.all(`SELECT * FROM ${subtable} WHERE log_id = "${logId}"`);

    res.res(200, { sublogs });
});

typedIdRouter.post("/", selfOrManageAwards, checkSublogsSupported, async (req, res) => {
    const { type: logType, id: logId } = req.log;
    const { sublog } = req.body;

    if (sublog == null) {
        res.res(400);
        return;
    }

    const subtable = general.getSublogsTable(logType);
    const columns = await sqlDatabase.getTableColumns(subtable);

    let columnsString = "";
    let valuesString = "";

    for (let i = 2; i < columns.length; i++) { // start 2: skip ID and user
        if (i > 2) {
            columnsString += ", ";
            valuesString += ", ";
        }

        const column = columns[i];
        const val = sublog[column];

        columnsString += column;

        if (val == null) {
            valuesString += null;
        } else if (typeof val === "string") {
            valuesString += `"${val}"`;
        } else {
            valuesString += val;
        }
    }

    await sqlDatabase.run(`INSERT INTO ${subtable} (log_id, ${columnsString}) VALUES ("${logId}", ${valuesString})`);
    res.res(204);
});

typedIdRouter.put("/", async (req, res) => {
    if (!req.permissions.manageAwards) { // require manageAwards permission
        res.res(403);
        return;
    }

    const { type, id: logId } = req.log;
    const { signedOff } = req.body;
    const userId = cookies.getUserId(req);

    if (!general.isSignable(type)) {
        res.res(400, "signable_not_supported");
        return;
    }
    if (signedOff == null) {
        res.res(400);
        return;
    }

    const table = general.getLogsTable(type);
    const signer = signedOff ? userId : null;
    await sqlDatabase.run(`UPDATE ${table} SET signer = "${signer}" WHERE id = "${logId}"`);

    res.res(204);
});

module.exports = router;