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

    app.use('/awards/rock-climbing', router("awards/rock-climbing", { loggedIn: true }));
    app.use('/awards/running', router("awards/running", { loggedIn: true }));
    app.use('/awards/venture', router("awards/venture", { loggedIn: true }));

    // endurance
    app.use('/awards/endurance', router("awards/endurance/endurance", { loggedIn: true }));
    app.use('/awards/endurance-instructor', router("awards/endurance/endurance-instructor", { loggedIn: true }));
    app.use('/awards/endurance-leader', router("awards/endurance/endurance-leader", { loggedIn: true }));

    // kayaking
    app.use('/awards/kayaking', router("awards/kayaking/kayaking", { loggedIn: true }));
    app.use('/awards/kayaking-instructor', router("awards/kayaking/kayaking-instructor", { loggedIn: true }));
    app.use('/awards/kayaking-leader', router("awards/kayaking/kayaking-leader", { loggedIn: true }));

    // midmar mile
    app.use('/awards/midmar-mile', router("awards/midmar_mile/midmar-mile", { loggedIn: true }));
    app.use('/awards/midmar-mile-instructor', router("awards/midmar_mile/midmar-mile-instructor", { loggedIn: true }));
    app.use('/awards/midmar-mile-leader', router("awards/midmar_mile/midmar-mile-leader", { loggedIn: true }));

    // mountaineering
    app.use('/awards/mountaineering', router("awards/mountaineering/mountaineering", { loggedIn: true }));
    app.use('/awards/mountaineering-instructor', router("awards/mountaineering/mountaineering-instructor", { loggedIn: true }));
    app.use('/awards/mountaineering-leader', router("awards/mountaineering/mountaineering-leader", { loggedIn: true }));
    app.use('/awards/drakensberg', router("awards/mountaineering/drakensberg", { loggedIn: true }));
    app.use('/awards/summit', router("awards/mountaineering/summit", { loggedIn: true }));
    app.use('/awards/traverse', router("awards/mountaineering/traverse", { loggedIn: true }));

    // polar bear
    app.use('/awards/polar-bear', router("awards/polar_bear/polar-bear", { loggedIn: true }));
    app.use('/awards/polar-bear-instructor', router("awards/polar_bear/polar-bear-instructor", { loggedIn: true }));
    app.use('/awards/polar-bear-leader', router("awards/polar_bear/polar-bear-leader", { loggedIn: true }));

    // service
    app.use('/awards/service', router("awards/service/service", { loggedIn: true }));
    app.use('/awards/service-instructor', router("awards/service/service-instructor", { loggedIn: true }));
    app.use('/awards/service-leader', router("awards/service/service-leader", { loggedIn: true }));

    // solitaire
    app.use('/awards/solitaire', router("awards/solitaire/solitaire", { loggedIn: true }));
    app.use('/awards/solitaire-instructor', router("awards/solitaire/solitaire-instructor", { loggedIn: true }));
    app.use('/awards/solitaire-leader', router("awards/solitaire/solitaire-leader", { loggedIn: true }));

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