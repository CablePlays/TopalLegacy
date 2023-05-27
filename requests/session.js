const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cookies = require("../server/cookies");
const general = require("../server/general");
const sqlDatabase = require("../server/sql-database");

const router = express.Router();

router.post("/account", async (req, res) => {
    let { name, surname, password, token } = req.body;

    if (name == null || surname == null || password == null || token == null) {
        res.res(400);
        return;
    }

    name = name.trim();
    surname = surname.trim();

    const unverifiedUserRecord = await sqlDatabase.get(`SELECT * FROM unverified_users WHERE token = "${token}"`);

    if (unverifiedUserRecord == null) {
        res.res(404, "invalid_token");
        return;
    }

    const email = unverifiedUserRecord.email;

    await sqlDatabase.run(`INSERT INTO users (email, password, name, surname) VALUES ("${email}", "${password}", "${name}", "${surname}")`);

    const userRecord = await sqlDatabase.get(`SELECT * FROM users WHERE email = "${email}"`);

    if (userRecord == null) {
        console.warn("Missing user record which was just created");
        res.res(500);
        return;
    }

    sqlDatabase.run(`DELETE FROM unverified_users WHERE token = "${token}"`); // no need to await

    res.cookie(cookies.USER_COOKIE, userRecord.id);
    res.cookie(cookies.PASSWORD_COOKIE, password);

    res.res(204);
});

router.put("/account", async (req, res) => {
    const { email, password } = req.body;
    const record = await sqlDatabase.get(`SELECT * FROM users WHERE email = "${email}" AND password = "${password}"`);

    if (record == null) {
        res.res(400, "invalid_details");
        return;
    }

    res.cookie(cookies.USER_COOKIE, record.id);
    res.cookie(cookies.PASSWORD_COOKIE, password);
    res.res(204);
});

router.put("/change-password", (req, res) => {
    if (!req.loggedIn) {
        res.res(401, "logged_out");
    }

    const { password } = req.body;
    const userId = cookies.getUserId(req);

    if (password == null) {
        res.res(400);
        return;
    }

    sqlDatabase.run(`UPDATE users SET password = "${password}" WHERE id = "${userId}"`);
    res.cookie(cookies.PASSWORD_COOKIE, password);
    res.res(204);
});

router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    if (email == null) {
        res.res(400);
        return;
    }

    const record = await sqlDatabase.get(`SELECT * FROM users WHERE email = "${email}"`);

    if (record == null) {
        res.res(400, "invalid_email");
        return;
    }

    const password = record.password;

    general.sendEmail(email, "Topal - Forgot Password",
        `<h2>Forgot Password</h2>
        <p>If you did not request an email for a forgotten password then please ignore this email.
        If you have forgotten your password then here it is:</p>
        <h3>${password}</h3>`
    ).then(() => res.res(204), error => {
        console.error(error);
        res.res(424, "sending_email");
    });
});

router.post("/verify-email", async (req, res) => {
    const email = req.body.email?.trim();

    /* Check Email */

    if (email == null) {
        res.res(400, "missing_email");
        return;
    }
    if (!email.endsWith("@treverton.co.za")) {
        res.res(400, "invalid_email");
        return;
    }
    if (await sqlDatabase.get(`SELECT * FROM users WHERE email = "${email}"`) != null) {
        res.res(409, "email_unavailable");
        return;
    }

    /* Verification */

    const token = uuidv4();

    // add to database
    await sqlDatabase.run(`INSERT OR REPLACE INTO unverified_users VALUES ("${email}", "${token}")`);

    general.sendEmail(email, "Topal - Create Account",
        `<h2>Topal</h2>
        <h2>Create Account</h2>
        <p> If you are trying to create a Topal account then please continue with
        <a href="topal.click/account/create-account?token=${token}">this</a> link.
        If you are not trying to create a Topal account then please ignore this email.`
    ).then(() => res.res(204), error => {
        console.error(error);
        res.res(424, "sending_email");
    });
});

module.exports = router;