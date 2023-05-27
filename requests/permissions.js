const express = require('express');
const cookies = require("../server/cookies");
const general = require("../server/general");
const jsonDatabase = require("../server/json-database");
const sqlDatabase = require("../server/sql-database");

const router = express.Router();

router.use("/", (req, res, next) => { // require permission: managePermissions
    if (req.permissions.managePermissions) {
        next();
    } else {
        res.res(403);
    }
});

router.get("/users", async (req, res) => {
    const users = [];
    const promises = [];
    const userIds = await sqlDatabase.getUsers();

    for (let userId of userIds) {
        const permissions = jsonDatabase.getPermissions(userId);

        if (general.hasAnyPermission(permissions)) {
            promises.push(new Promise(async r => {
                users.push({
                    user: await sqlDatabase.getUserInfo(userId),
                    permissions
                });

                r();
            }));
        }
    }

    await Promise.all(promises);
    res.res(200, { users });
});

router.put("/users", async (req, res) => {
    const { permission, has, user: userEmail } = req.body;

    if (permission == null || has == null || userEmail == null) {
        res.res(400);
        return;
    }

    const record = await sqlDatabase.get(`SELECT * FROM users WHERE email = "${userEmail}"`);

    if (record == null) {
        res.res(400, "invalid_user");
        return;
    }

    const targetUserId = record.id;
    const userId = cookies.getUserId(req);

    if (targetUserId === userId) {
        res.res(403, "self");
        return;
    }
    if (!general.isPermission(permission)) {
        res.res(400, "invalid_permission");
        return;
    }

    const path = jsonDatabase.PERMISSIONS_PATH + "." + permission;
    const db = jsonDatabase.getUser(targetUserId);

    if (has === true) {
        db.set(path, true);
    } else {
        db.delete(path);
    }

    /* Audit Log */

    jsonDatabase.auditLogRecord({
        type: "changePermission",
        actor: userId,
        has,
        permission,
        user: targetUserId
    });

    res.res(204);
});

module.exports = router;