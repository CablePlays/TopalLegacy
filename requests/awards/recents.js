const express = require('express');
const general = require("../../server/general");
const sqlDatabase = require("../../server/sql-database");

const router = express.Router();

function getExpiryMillis() { // recents expire when their date is before or equal to this date
    let date = new Date();
    date.setHours(date.getHours() - general.RECENT_AWARDS_LIFETIME);
    return date.getTime();
}

router.get("/", async (req, res) => {
    const expiryMillis = getExpiryMillis();
    const recents = await sqlDatabase.all(`SELECT user, award, date FROM recent_awards WHERE date > ${expiryMillis} LIMIT ${general.RECENT_AWARDS_MAX}`);

    sqlDatabase.run(`DELETE FROM recent_awards WHERE date <= ${getExpiryMillis()}`); // delete old

    const values = [];

    for (let recent of recents) {
        const { date: millis, user: userId } = recent;
        recent.date = new Date(millis);
        recent.user = await sqlDatabase.getUserInfo(userId);
        values.push(recent);
    }

    res.res(200, { recents: values });
});

module.exports = router;