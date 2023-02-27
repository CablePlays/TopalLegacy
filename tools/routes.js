const express = require('express');
const cookies = require('./cookies');
const general = require('./general');

async function render(req, res, path) {
    const loggedIn = cookies.isLoggedIn(req);
    let permissions;

    if (loggedIn && await general.sessionTokenValid(req)) {
        const user = cookies.getUser(req);
        permissions = await general.getPermissions(user);
    } else {
        permissions = general.getPermissionsForLevel(0);
    }

    const placeholders = {
        displays: {
            loggedIn: {
                false: {
                    block: (loggedIn ? "none" : "block"),
                    flex: (loggedIn ? "none" : "flex"),
                    inlineBlock: (loggedIn ? "none" : "inline-block")
                },
                true: {
                    block: (loggedIn ? "block" : "none"),
                    flex: (loggedIn ? "flex" : "none"),
                    inlineBlock: (loggedIn ? "inline-block" : "none")
                }
            },
            permission: {
                awards: {
                    block: (permissions.awards ? "block" : "none"),
                    flex: (permissions.awards ? "flex" : "none"),
                    inlineBlock: (permissions.awards ? "inline-block" : "none")
                },
                permissions: {
                    block: (permissions.permissions ? "block" : "none"),
                    flex: (permissions.permissions ? "flex" : "none"),
                    inlineBlock: (permissions.permissions ? "inline-block" : "none")
                }
            }
        },
        user: cookies.getUser(req)
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
        let userPermissions = general.getPermissionsForLevel(0);

        const onGet = async () => {

            /* Verify Session Token */

            if (isLoggedIn) {
                if (!await general.sessionTokenValid(req)) { // invalid session token
                    general.logout(res);
                    if (requestedPath === "/") return true;  // requested destination desired; render
                    res.redirect("/"); // requested destination unwanted; redirect
                    return false;
                }

                const user = cookies.getUser(req);
                userPermissions = await general.getPermissions(user);
            }

            /* Check Permission */

            if (permission != null && (!isLoggedIn || userPermissions[permission] !== true)) {
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

            if (validateUser === true) {
                const paramUser = params.get("user");

                if (paramUser == null || paramUser === "" || !await general.isUser(paramUser)) {
                    render(req, res, "errors/invalid-user");
                    return false;
                }
            }

            return true;
        };

        if (await onGet()) {
            render(req, res, path);
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
    app.use('/', router("general/home"));
    app.use('/login', router("general/login")); // require not logged in handled in router
    app.use('/mountaineering', router("general/mountaineering"));
    app.use('/permissions', router("general/permissions", { permission: "permissions" }));
    app.use('/search-users', router("general/search-users"));
    app.use('/settings', router("general/settings", { loggedIn: true }));

    app.use('/awards/drakensberg', router("awards/drakensberg", { loggedIn: true }));
    app.use('/awards/endurance', router("awards/endurance", { loggedIn: true }));
    app.use('/awards/kayaking', router("awards/kayaking", { loggedIn: true }));
    app.use('/awards/midmar-mile', router("awards/midmar-mile", { loggedIn: true }));
    app.use('/awards/mountain-biking', router("awards/mountain-biking", { loggedIn: true }));
    app.use('/awards/polar-bear', router("awards/polar-bear", { loggedIn: true }));
    app.use('/awards/rock-climbing', router("awards/rock-climbing", { loggedIn: true }));
    app.use('/awards/running', router("awards/running", { loggedIn: true }));
    app.use('/awards/service', router("awards/service", { loggedIn: true }));
    app.use('/awards/solitaire', router("awards/solitaire", { loggedIn: true }));
    app.use('/awards/summit', router("awards/summit", { loggedIn: true }));
    app.use('/awards/traverse', router("awards/traverse", { loggedIn: true }));
    app.use('/awards/venture', router("awards/venture", { loggedIn: true }));

    app.use('/profile', redirectRouter("profile/awards"));
    app.use('/profile/admin', router("profile/admin", { permission: "awards", validateUser: true }));
    app.use('/profile/awards', router("profile/awards", { validateUser: true }));
    app.use('/profile/milestones', router("profile/milestones", { validateUser: true }));
}

module.exports = {
    acceptApp,
    render
};