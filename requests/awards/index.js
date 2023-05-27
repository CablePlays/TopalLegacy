const express = require('express');

const recentsRouter = require("./recents");
const requestsRouter = require("./requests");

const router = express.Router();

router.use("/recents", recentsRouter);
router.use("/requests", requestsRouter);

module.exports = router;