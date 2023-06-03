const express = require('express');
const cookies = require("../server/cookies");
const general = require("../server/general");
const jsonDatabase = require("../server/json-database");

// routers
const accountRouter = require("./account-router");
const adminRouter = require("./admin-router");
const awardsRouter = require("./awards-router");
const profileRouter = require("./profile-router");

const router = express.Router();

/* Middleware */

async function advancedRender(req, res, path, adminPage) {
    const loggedIn = cookies.isLoggedIn(req);
    const userId = cookies.getUserId(req);
    let permissions = {};

    if (loggedIn && await general.isPasswordValid(req)) {
        const userId = cookies.getUserId(req);
        permissions = jsonDatabase.getPermissions(userId);
    }

    const generateDisplays = condition => {
        return {
            block: (condition ? "block" : "none"),
            flex: (condition ? "flex" : "none"),
            inlineBlock: (condition ? "inline-block" : "none")
        };
    }

    const placeholders = {
        userId,
        displays: {
            adminPage: {
                true: generateDisplays(adminPage)
            },
            loggedIn: {
                false: generateDisplays(!loggedIn),
                true: generateDisplays(loggedIn)
            },
            permission: {
                any: generateDisplays(general.hasAnyPermission(permissions))
            }
        }
    };

    for (let permission of general.PERMISSIONS) {
        placeholders.displays.permission[permission] = generateDisplays(permissions[permission]);
    }

    res.render(path, placeholders);
}

router.use("/", (req, res, next) => { // provide advanced render
    res.advancedRender = (path, adminPage) => {
        advancedRender(req, res, path, adminPage);
    };

    next();
});

router.use("/", async (req, res, next) => { // verify login
    if (cookies.isLoggedIn(req) && !await general.isPasswordValid(req)) { // invalid credentials
        cookies.logOut(res);
        res.redirect("/");
    } else {
        next();
    }
});

/* Get */

router.get("/", (req, res) => {
    res.advancedRender("general/home");
});

router.get("/balls", (req, res) => {
    res.advancedRender("general/balls");
});

router.get("/search", (req, res) => {
    res.advancedRender("general/search");
});

router.get("/settings", (req, res) => {
    res.advancedRender("general/settings");
});

/* Routers */

router.use('/', adminRouter);
router.use('/account', accountRouter);
router.use('/awards', awardsRouter);
router.use('/profile', profileRouter);

module.exports = router;