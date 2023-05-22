const express = require('express');
const middleware = require("./middleware");

const router = express.Router();

router.use("/admin", middleware.createPermissionMiddleware("any"));
router.get("/admin", (req, res) => {
    res.advancedRender("admin/admin");
});

router.use("/permissions", middleware.createPermissionMiddleware("managePermissions"));
router.get("/permissions", (req, res) => {
    res.advancedRender("admin/permissions");
});

router.use("/signoff-requests", middleware.createPermissionMiddleware("manageAwards"));
router.get("/signoff-requests", (req, res) => {
    res.advancedRender("admin/signoff-requests");
});

module.exports = router;