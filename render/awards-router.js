const express = require('express');
const fs = require('fs');
const path = require('path');
const middleware = require("./middleware");;

const router = express.Router();

router.use("/", middleware.requireLoggedIn);

router.get("/drakensberg", (req, res) => {
    res.advancedRender("awards/mountaineering/drakensberg");
});

router.get("/summit", (req, res) => {
    res.advancedRender("awards/mountaineering/summit");
});

router.get("/traverse", (req, res) => {
    res.advancedRender("awards/mountaineering/traverse");
});

router.get("/:type", (req, res, next) => {
    let current = req.params.type;
    const sequelTypes = ["instructor", "leader"];
    let currentSequelType;

    for (let sequelType of sequelTypes) {
        if (current.endsWith(sequelType)) {
            current = current.substring(0, current.length - sequelType.length - 1);
            currentSequelType = sequelType;
            break;
        }
    }

    let filePath = "awards/" + current.replaceAll("-", "_") + "/" + current;

    if (currentSequelType != null) {
        filePath += "-" + currentSequelType;
    }

    const check = path.resolve("views/" + filePath + ".pug");

    fs.access(check, fs.constants.F_OK, err => {
        if (err) {
            next(); // does not exist
        } else {
            res.advancedRender(filePath);
        }
    });
});

module.exports = router;