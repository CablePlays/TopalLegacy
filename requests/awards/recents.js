const express = require('express');
const cookies = require("../../server/cookies");
const general = require("../../server/general");
const jsonDatabase = require("../../server/json-database");
const sqlDatabase = require("../../server/sql-database");

const router = express.Router();

router.get("/", async (req, res) => {
    const db = jsonDatabase.getRecents();
    const recents = db.get(jsonDatabase.RECENTS_AWARDS_PATH) ?? [];
    const values = [];

    for (let recent of recents) {
        const { user: userId } = recent;
        recent.user = await sqlDatabase.getUserInfo(userId);
        values.push(recent);
    }

    res.res(200, { recents: values });
});

module.exports = router;