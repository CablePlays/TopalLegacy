const express = require('express');
const middleware = require("./middleware");
const sqlDatabase = require("../server/sql-database");

const router = express.Router();

router.get("/:id", (req, res) => { // shortcut redirect
    res.redirect(req.originalUrl + "/awards");
});

router.use("/:id", async (req, res, next) => { // verify user ID
    const targetUserId = req.params.id;

    if (targetUserId === "" || !await sqlDatabase.isUser(targetUserId)) {
        res.advancedRender("errors/invalid-user");
    } else {
        next();
    }
});

const idRouter = express.Router();
router.use("/:id", idRouter);

idRouter.get("/admin", middleware.requirePermission("manageAwards"), (req, res) => {
    res.advancedRender("profile/admin", true);
});

idRouter.get("/awards", (req, res) => {
    res.advancedRender("profile/awards");
});

idRouter.get("/milestones", (req, res) => {
    res.advancedRender("profile/milestones");
});

idRouter.get("/requests", middleware.requirePermission("manageAwards"), (req, res) => {
    res.advancedRender("profile/requests", true);
});

module.exports = router;