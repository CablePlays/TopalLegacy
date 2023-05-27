const express = require('express');
const cookies = require("../../server/cookies");
const general = require("../../server/general");
const jsonDatabase = require("../../server/json-database");
const sqlDatabase = require("../../server/sql-database");

const router = express.Router();

router.get("/", async (req, res) => {
    if (!req.permissions.manageAwards) {
        res.res(403);
        return;
    }

    const requests = [];

    // provide user data for each request
    await general.forEachAndWait(await sqlDatabase.getSignoffRequests(), async request => {
        request.user = await sqlDatabase.getUserInfo(request.user);
        requests.push(request);
    });

    res.res(200, { requests });
});

router.post("/", async (req, res) => {
    if (!req.loggedIn) {
        res.res(401, "logged_out");
        return;
    }

    const { award } = req.body;

    if (award == null) {
        res.res(400, "missing_parameters");
        return;
    }
    if (!general.isAward(award)) {
        res.res(400, "invalid_award");
        return;
    }

    const userId = cookies.getUserId(req);
    const db = jsonDatabase.getUser(userId);
    const complete = db.get(jsonDatabase.AWARDS_PATH + "." + award + ".complete") === true;

    if (complete) {
        res.res(409, "The provided award has alreay been achieved");
        return;
    }
    if (await sqlDatabase.doesSignoffRequestExist(userId, award)) {
        res.res(409, "User already has a request for the award");
        return;
    }

    db.delete(jsonDatabase.AWARDS_PATH + "." + award + ".decline"); // remove decline
    await sqlDatabase.insertSignoffRequest(userId, award); // add signoff
    res.res(201);
});

router.delete("/:id", async (req, res) => {
    if (!req.permissions.manageAwards) {
        res.res(403);
        return;
    }

    const { id: signoffRequestId } = req.params;
    const { message } = req.body;

    const signoffRequest = await sqlDatabase.getSignoffRequest(signoffRequestId);

    if (signoffRequest == null) {
        res.res(404, "invalid_signoff_request");
        return;
    }

    const { award, user: signoffRequestUserId } = signoffRequest;
    const userId = cookies.getUserId(req);

    await sqlDatabase.deleteSignoffRequest(signoffRequestId);

    if (await sqlDatabase.isUser(signoffRequestUserId)) { // decline notice
        const declineJson = {
            date: new Date(),
            user: userId
        }

        if (message != null && message.replaceAll(" ", "").length > 0) { // add message
            declineJson.message = message;
        }

        jsonDatabase.getUser(signoffRequestUserId).set("awards." + award + ".decline", declineJson);
    }

    res.res(200);
});

module.exports = router;