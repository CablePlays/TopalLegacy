const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const cookies = require("../server/cookies");
const sqlDatabase = require("../server/sql-database");

const router = express.Router();

const authClient = new OAuth2Client();

router.put("/handle-login", async (req, res) => {
    const { token } = req.body;
    let ticket;

    try {
        ticket = await authClient.verifyIdToken({
            idToken: token,
            audience: "234912320633-vfi8srp2bhol1lb0a814mn4e4oo7a920.apps.googleusercontent.com"
        });
    } catch (error) {
        console.warn("Invalid JWT: " + error.message);
        res.res(500);
        return;
    }

    const { email, given_name, family_name } = ticket.getPayload();
    const domain = email.split("@")[1];

    if (false && domain !== "treverton.co.za") {
        res.res(500, "invalid_email");
        return;
    }

    const record = await sqlDatabase.get(`SELECT * FROM users WHERE email = "${email}"`);
    let userId;
    let password;

    if (record) {
        const { id, password: p } = record;
        userId = id;
        password = p;

        if (!password) {
            password = uuidv4();
        }

        await sqlDatabase.run(`UPDATE users SET password = "${password}", name = "${given_name}", surname = "${family_name}" WHERE id = ${id}`);
    } else {
        password = uuidv4();
        await sqlDatabase.run(`INSERT INTO users (email, password, name, surname) VALUES ("${email}", "${password}", "${given_name}", "${family_name}")`);
        userId = (await sqlDatabase.get(`SELECT * FROM users WHERE email = "${email}"`)).id;
    }

    res.cookie(cookies.USER_COOKIE, userId);
    res.cookie(cookies.PASSWORD_COOKIE, password);
    res.res(204);
});

module.exports = router;