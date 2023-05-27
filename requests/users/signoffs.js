const express = require('express');
const cookies = require("../../server/cookies");
const general = require("../../server/general");
const jsonDatabase = require("../../server/json-database");

const router = express.Router();

router.get("/", async (req, res) => {
    const { type } = req.query;

    if (type == null) {
        res.res(400);
        return;
    }

    let signoffs = await jsonDatabase.getUser(req.userId).get(jsonDatabase.SIGNOFFS_PATH + "." + type);

    if (signoffs == null) {
        signoffs = {};
    } else {
        await general.provideUserInfoToStatuses(signoffs);
    }

    res.res(200, { signoffs });
});

router.put("/", (req, res) => {
    if (!req.permissions.manageAwards) {
        res.res(403);
        return;
    }

    let { signoff, type, complete } = req.body;
    const userId = cookies.getUserId(req);

    if (!general.isSignoff(type, signoff)) {
        res.res(400, "invalid_signoff");
        return;
    }

    const db = jsonDatabase.getUser(req.userId);
    const path = jsonDatabase.SIGNOFFS_PATH + "." + type + "." + signoff;

    if (complete === true) {
        db.set(path, {
            complete: true,
            date: new Date(),
            signer: userId
        });
    } else {
        db.delete(path);
    }

    res.res(204);
});

module.exports = router;