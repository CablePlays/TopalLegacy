const express = require('express');
const cookies = require("../server/cookies");
const general = require("../server/general");
const jsonDatabase = require("../server/json-database");

// routers
const accountRouter = require("./account");
const auditLogRouter = require("./audit-log");
const awardsRouter = require("./awards");
const logsRouter = require("./logs");
const permissionsRouter = require("./permissions");
const requestsRouter = require("./requests");
const usersRouter = require("./users");

const router = express.Router();

/* Middleware */

router.use("/", async (req, res, next) => { // provide permissions
    if (await general.isPasswordValid(req)) {
        const userId = cookies.getUserId(req);
        req.permissions = jsonDatabase.getPermissions(userId);
        req.loggedIn = true;
    } else {
        req.permissions = {};
        req.loggedIn = false;
    }

    next();
});

router.use("/", (req, res, next) => { // provide response methods
    res.res = (responseCode, extra) => {
        if (extra == null) {
            res.sendStatus(responseCode);
        } else if (typeof extra === "string") { // error: ID or message
            res.status(responseCode).json({ error: extra });
        } else if (typeof extra === "object") { // success: json
            res.status(responseCode).json(extra);
        } else {
            throw new Error("Invalid type of extra: " + typeof extra);
        }
    };

    next();
});

/* Routers */

router.use('/account', accountRouter);
router.use('/audit-log', auditLogRouter);
router.use('/awards', awardsRouter);
router.use('/logs', logsRouter);
router.use('/permissions', permissionsRouter);
router.use('/requests', requestsRouter);
router.use('/users', usersRouter);

module.exports = router;