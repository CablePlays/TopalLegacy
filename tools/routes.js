const express = require('express');
const cookies = require('./cookies');
const general = require('./general');

function router(path, options) {
    const router = express.Router();
    const {
        permission,
        requireLoggedIn = false
    } = options || {};

    router.get('/', async function (req, res) {
        const requestedPath = req.originalUrl;
        const loggedIn = cookies.isLoggedIn(req);
        let userPermissions = general.getPermissionsForLevel(0);

        const onGet = async () => {
            // verify session token
            if (loggedIn && !await general.sessionTokenValid(req)) {
                general.logout(res);

                if (requestedPath === "/") {
                    // requested destination desired; render
                    return true;
                }

                // requested destination unwanted; redirect
                res.redirect("/");
                return false;
            }

            const user = cookies.getUser(req);
            userPermissions = await general.getPermissions(user);

            // check permission
            if (permission != null && (!loggedIn || !userPermissions[permission])) {
                res.redirect("/");
                return false;
            }

            // check logged in
            if (!loggedIn && requireLoggedIn) {
                res.redirect("/login?return_path=" + requestedPath);
                return false;
            }

            // check logged in on login page
            if (loggedIn && requestedPath === "/login") {
                res.redirect("/");
                return false;
            }

            return true;
        };

        if (await onGet()) {
            const placeholders = {
                permissionDisplays: {
                    awards: {
                        block: (userPermissions.awards ? "block" : "none"),
                        flex: (userPermissions.awards ? "flex" : "none"),
                        inlineBlock: (userPermissions.awards ? "inline-block" : "none")
                    },
                    permissions: {
                        block: (userPermissions.permissions ? "block" : "none"),
                        flex: (userPermissions.permissions ? "flex" : "none"),
                        inlineBlock: (userPermissions.permissions ? "inline-block" : "none")
                    }
                }
            };

            res.render(path, placeholders);
        }
    });

    return router;
}

function acceptApp(app) {
    app.use('/', router("index"));
    app.use('/login', router("login")); // require not logged in handled in router
    app.use('/permissions', router("permissions", { permission: "permissions" }));
    app.use('/settings', router("settings", { requireLoggedIn: true }));

    app.use('/awards/midmar-mile', router("awards/midmar-mile", { requireLoggedIn: true }));
    app.use('/awards/polar-bear', router("awards/polar-bear", { requireLoggedIn: true }));
    app.use('/awards/running', router("awards/running", { requireLoggedIn: true }));

    app.use('/profile/achievements', router("profile/achievements"));
    app.use('/profile/admin', router("profile/admin"));
    app.use('/profile/awards', router("profile/awards"));
}

module.exports = acceptApp;