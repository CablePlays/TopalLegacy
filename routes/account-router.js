const express = require('express');
const middleware = require("./middleware");
const sqlDatabase = require("../server/sql-database");

const router = express.Router();

router.get("/signup/success", (req, res) => {
    res.advancedRender("entry/account-created");
});

router.use("/reset-password", middleware.requireLoggedIn);
router.get("/reset-password", (req, res) => {
    res.advancedRender("entry/reset-password");
});

router.use("/", middleware.requireLoggedOut);

router.get("/create-account", async (req, res) => {
    const token = req.query.token;

    if (token == null) {
        res.redirect("/");
    } else {
        const record = await sqlDatabase.get(`SELECT * FROM unverified_users WHERE token = "${token}"`);

        if (record == null) {
            res.advancedRender("entry/invalid-token");
        } else {
            res.advancedRender("entry/create-account");
        }
    }
});

router.get("/forgot-password", (req, res) => {
    res.advancedRender("entry/forgot-password");
});

router.get("/login", (req, res) => {
    res.advancedRender("entry/login");
});

router.get("/signup", (req, res) => {
    res.advancedRender("entry/signup");
});

router.get("/signup/verify", (req, res) => {
    res.advancedRender("entry/verify");
});

module.exports = router;