const express = require('express');
const fs = require('fs');
const path = require('path');
const middleware = require("./middleware");;

const router = express.Router();

router.use("/", middleware.requireLoggedIn);

router.get("/:type", (req, res, next) => {
    let type = req.params.type;
    const sequelTypes = ["instructor", "leader"];
    let currentSequelType;

    for (let sequelType of sequelTypes) {
        if (type.endsWith(sequelType)) {
            type = type.substring(0, type.length - sequelType.length - 1);
            currentSequelType = sequelType;
            break;
        }
    }

    let filePath = "awards/" + type.replaceAll("-", "_") + "/" + type;

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