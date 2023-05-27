const express = require('express');
const jsonDatabase = require("../../server/json-database");

const router = express.Router();

router.get("/", (req, res) => {
    const targetUserId = req.userId;
    const awards = jsonDatabase.getUser(targetUserId).get(jsonDatabase.AWARDS_PATH) ?? {};
    const totalAwards = 0;

    for (let award of Object.getOwnPropertyNames(awards)) {
        if (award.complete === true) {
            totalAwards++;
        }
    }

    const milestones = {
        team: totalAwards >= 4,
        halfColors: totalAwards >= 7,
        colors: totalAwards >= 10,
        merit: false, // TODO
        honors: false // TODO
    };

    res.res(200, { milestones });
});

module.exports = router;