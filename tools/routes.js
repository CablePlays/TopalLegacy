const express = require('express');
const cookies = require('./cookies');
const general = require('./general');

async function render(req, res, path) {
    let permissions;

    if (cookies.isLoggedIn(req) && await general.sessionTokenValid(req)) {
        const user = cookies.getUser(req);
        permissions = await general.getPermissions(user);
    } else {
        permissions = general.getPermissionsForLevel(0);
    }

    const placeholders = {
        permissionDisplays: {
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
    };

    res.render(path, placeholders);
}

function router(path, options) {
    const router = express.Router();
    const {
        permission,
        requireLoggedIn = false
    } = options || {};

    router.get('/', async (req, res) => {
        const requestedPath = req.baseUrl;
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
                render(req, res, "errors/not-found");
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
            render(req, res, path);
        }
    });

    return router;
}

function profileRouter(path) {
    const router = express.Router();

    router.get('/', async (req, res) => {
        const paramsString = req.originalUrl.split("?")[1];
        const params = new URLSearchParams(paramsString);
        const user = params.get("user");

        if (user == null || !await general.isUser(user)) {
            render(req, res, "errors/invalid-user");
        } else {
            render(req, res, "profile/" + path);
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
    app.use('/settings', router("general/settings", { requireLoggedIn: true }));

    app.use('/awards/drakensberg', router("awards/drakensberg", { requireLoggedIn: true }));
    app.use('/awards/endurance', router("awards/endurance", { requireLoggedIn: true }));
    app.use('/awards/kayaking', router("awards/kayaking", { requireLoggedIn: true }));
    app.use('/awards/midmar-mile', router("awards/midmar-mile", { requireLoggedIn: true }));
    app.use('/awards/polar-bear', router("awards/polar-bear", { requireLoggedIn: true }));
    app.use('/awards/rock-climbing', router("awards/rock-climbing", { requireLoggedIn: true }));
    app.use('/awards/running', router("awards/running", { requireLoggedIn: true }));
    app.use('/awards/service', router("awards/service", { requireLoggedIn: true }));
    app.use('/awards/solitare', router("awards/solitare", { requireLoggedIn: true }));
    app.use('/awards/summit', router("awards/summit", { requireLoggedIn: true }));
    app.use('/awards/traverse', router("awards/traverse", { requireLoggedIn: true }));
    app.use('/awards/venture', router("awards/venture", { requireLoggedIn: true }));

    app.use('/profile', redirectRouter("profile/awards"));
    app.use('/profile/admin', profileRouter("admin"));
    app.use('/profile/awards', profileRouter("awards"));
    app.use('/profile/milestones', profileRouter("milestones"));
}

module.exports = {
    acceptApp,
    render
};