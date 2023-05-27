const express = require('express');
const cookies = require("../../server/cookies");
const general = require("../../server/general");
const jsonDatabase = require("../../server/json-database");

const router = express.Router();

router.get("/", async (req, res) => {
    const userId = req.userId;
    let approvals = await jsonDatabase.getUser(userId).get(jsonDatabase.APPROVALS_PATH);

    if (approvals == null) {
        approvals = {};
    } else {
        await general.provideUserInfoToStatuses(approvals);
    }

    res.res(200, { approvals });
});

router.put("/", (req, res) => {
    if (!req.permissions.manageAwards) {
        res.res(403);
        return;
    }

    const { approval, complete } = req.body;
    const targetUserId = req.userId;
    const userId = cookies.getUserId(req);

    if (!general.isApproval(approval)) {
        res.res(400, "invalid_approval");
        return;
    }

    const db = jsonDatabase.getUser(targetUserId);
    const path = jsonDatabase.APPROVALS_PATH + "." + approval;

    if (complete === true) {
        db.set(path, {
            complete: true,
            date: new Date(),
            signer: userId
        });
    } else {
        db.delete(path);
    }

    /* Audit Log */

    jsonDatabase.auditLogRecord({
        type: (complete ? "grantApproval" : "revokeApproval"),
        actor: userId,
        approval,
        user: targetUserId
    });

    res.res(204);
});

module.exports = router;