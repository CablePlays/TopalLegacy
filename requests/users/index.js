const express = require('express');
const sqlDatabase = require("../../server/sql-database");

const approvalsRouter = require("./approvals");
const awardsRouter = require("./awards");
const logsRouter = require("./logs");
const milestonesRouter = require("./milestones");
const signoffsRouter = require("./signoffs");

const router = express.Router();

router.get("/", async (req, res) => {
    const { search } = req.query;

    const users = await sqlDatabase.all(
        `SELECT * FROM users WHERE email LIKE "%${search}%" OR name LIKE "%${search}%" OR surname LIKE "%${search}%"`);
    const values = [];

    for (let user of users) {
        const { id } = user;
        const userInfo = await sqlDatabase.getUserInfo(id);
        values.push(userInfo);
    }

    res.res(200, { users });
});

router.use("/:id", async (req, res, next) => { // verify user
    const { id } = req.params;

    if (await sqlDatabase.isUser(id)) {
        req.userId = id;
        next();
    } else {
        res.res(404, "invalid_user");
    }
});

const idRouter = express.Router();
router.use("/:id", idRouter);

idRouter.get("/", async (req, res) => {
    const values = await sqlDatabase.getUserInfo(req.userId);
    res.res(200, { values });
});

idRouter.use("/approvals", approvalsRouter);
idRouter.use("/awards", awardsRouter);
idRouter.use("/logs", logsRouter);
idRouter.use("/milestones", milestonesRouter);
idRouter.use("/signoffs", signoffsRouter);

module.exports = router;