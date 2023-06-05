const cookies = require("../server/cookies");
const general = require("../server/general");
const jsonDatabase = require("../server/json-database");

function requireLoggedIn(req, res, next) {
    if (cookies.isLoggedIn(req)) {
        next();
    } else {
        res.redirect("/account/signup");
    }
}

function requireLoggedOut(req, res, next) {
    if (cookies.isLoggedIn(req)) {
        res.redirect("/");
    } else {
        next();
    }
}

function getPermissionMiddleware(permission) {
    return (req, res, next) => {
        if (cookies.isLoggedIn(req)) {
            const userId = cookies.getUserId(req);
            const permissions = jsonDatabase.getPermissions(userId);

            if (permission === "any" && general.hasAnyPermission(permissions) || permissions[permission] === true) {
                next();
                return;
            }
        }

        res.advancedRender("errors/not-found"); // make it look like page does not exist
    };
}

module.exports = {
    requireLoggedIn,
    requireLoggedOut,
    getPermissionMiddleware
}