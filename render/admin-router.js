const express = require('express');
const middleware = require("./middleware");

const router = express.Router();

router.get("/admin", middleware.createPermissionMiddleware("any"), (req, res) => {
    res.advancedRender("admin/admin", true);
});

router.get("/permissions", middleware.createPermissionMiddleware("managePermissions"), (req, res) => {
    res.advancedRender("admin/permissions", true);
});

router.get("/signoff-requests", middleware.createPermissionMiddleware("manageAwards"), (req, res) => {
    res.advancedRender("admin/signoff-requests", true);
});

module.exports = router;