const express = require('express');
const cookies = require('./cookies');
const general = require('./general');
const jsonDatabase = require('./json-database');
const sqlDatabase = require('./sql-database');

async function render(req, res, path, adminPage = false) {
    const loggedIn = cookies.isLoggedIn(req);
    const userId = cookies.getUserId(req);
    let permissions = {};

    if (loggedIn && await general.sessionTokenValid(req)) {
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
                any: generateDisplays(general.hasAnyPermission(permissions)),
                manageAwards: generateDisplays(permissions.manageAwards),
                managePermissions: generateDisplays(permissions.managePermissions),
            }
        }
    };

    res.render(path, placeholders);
}

function router(path, options) {
    const router = express.Router();
    const {
        permission,
        loggedIn,
        validateUser = false
    } = options ?? {};

    router.get('/', async (req, res) => {
        const requestedPath = req.baseUrl;
        const params = new URLSearchParams(req.originalUrl.split("?")[1]);

        const isLoggedIn = cookies.isLoggedIn(req);
        let userPermissions = {};

        const onGet = async () => {

            /* Verify Session Token */

            if (isLoggedIn) {
                if (!await general.sessionTokenValid(req)) { // invalid session token
                    cookies.logOut(res);
                    if (requestedPath === "/") return true;  // requested destination desired; render
                    res.redirect("/"); // requested destination unwanted; redirect
                    return false;
                }

                const userId = cookies.getUserId(req);
                userPermissions = jsonDatabase.getPermissions(userId);
            }

            /* Check Permission */

            if (permission != null && (!isLoggedIn || (permission === "any")
                ? !general.hasAnyPermission(userPermissions) : !userPermissions[permission])) {
                render(req, res, "errors/not-found");
                return false;
            }

            /* Check Logged In */

            if (loggedIn === true) { // ensure logged in
                if (!isLoggedIn) {
                    res.redirect("/login?return_path=" + requestedPath);
                    return false;
                }
            } else if (loggedIn === false && isLoggedIn) { // ensure not logged in
                res.redirect("/");
                return false;
            }

            /* Validate User */
            // checks that the user in the user parameter is valid

            if (validateUser === true) {
                const paramUser = params.get("user");

                if (paramUser == null || paramUser === "" || !await sqlDatabase.isUser(paramUser)) {
                    render(req, res, "errors/invalid-user");
                    return false;
                }
            }

            return true;
        };

        if (await onGet()) {
            render(req, res, path, permission != null);
        }
    });

    return router;
}

function redirectRouter(path) {
    const router = express.Router();

    router.get('/', async (req, res) => {
        const url = req.originalUrl;
        const params = url.split("?")[1];

        res.redirect("/" + path + (params == null ? "" : "?" + params));
    });

    return router;
}

function acceptApp(app) {
    /* Admin */

    app.use('/admin', router("admin/admin", { permission: "any" }));
    app.use('/permissions', router("admin/permissions", { permission: "managePermissions" }));
    app.use('/signoff-requests', router("admin/signoff-requests", { permission: "manageAwards" }));

    /* General */

    app.use('/', router("general/home"));
    app.use('/login', router("general/login", { loggedIn: false }));
    app.use('/search-users', router("general/search-users"));
    app.use('/settings', router("general/settings", { loggedIn: true }));

    /* Awards */

    app.use('/awards/endurance', router("awards/endurance", { loggedIn: true }));
    app.use('/awards/kayaking', router("awards/kayaking", { loggedIn: true }));
    app.use('/awards/midmar-mile', router("awards/midmar-mile", { loggedIn: true }));
    app.use('/awards/rock-climbing', router("awards/rock-climbing", { loggedIn: true }));
    app.use('/awards/running', router("awards/running", { loggedIn: true }));
    app.use('/awards/service', router("awards/service", { loggedIn: true }));
    app.use('/awards/solitaire', router("awards/solitaire", { loggedIn: true }));
    app.use('/awards/venture', router("awards/venture", { loggedIn: true }));

    // mountaineering
    app.use('/awards/mountaineering', router("awards/mountaineering/mountaineering", { loggedIn: true }));
    app.use('/awards/mountaineering/drakensberg', router("awards/mountaineering/drakensberg", { loggedIn: true }));
    app.use('/awards/mountaineering/summit', router("awards/mountaineering/summit", { loggedIn: true }));
    app.use('/awards/mountaineering/traverse', router("awards/mountaineering/traverse", { loggedIn: true }));

    // polar bear
    app.use('/awards/polar-bear', router("awards/polar_bear/polar-bear", { loggedIn: true }));
    app.use('/awards/polar-bear-instructor', router("awards/polar_bear/polar-bear-instructor", { loggedIn: true }));
    app.use('/awards/polar-bear-leader', router("awards/polar_bear/polar-bear-leader", { loggedIn: true }));

    /* Profile */

    app.use('/profile', redirectRouter("profile/awards"));
    app.use('/profile/admin', router("profile/admin", { permission: "manageAwards", validateUser: true }));
    app.use('/profile/awards', router("profile/awards", { validateUser: true }));
    app.use('/profile/milestones', router("profile/milestones", { validateUser: true }));
}

module.exports = {
    acceptApp,
    render
};