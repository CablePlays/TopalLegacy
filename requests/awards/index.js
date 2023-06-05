const express = require('express');

const recentsRouter = require("./recents");

const router = express.Router();

router.use("/recents", recentsRouter);

module.exports = router;