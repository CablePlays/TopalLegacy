const express = require('express');
const middleware = require("./middleware");

const router = express.Router();

router.get("/admin", middleware.requirePermission("any"), (req, res) => {
    res.advancedRender("admin/admin", true);
});

router.get("/audit-log", middleware.requirePermission("viewAuditLog"), (req, res) => {
    res.advancedRender("admin/audit-log", true);
});

router.get("/permissions", middleware.requirePermission("managePermissions"), (req, res) => {
    res.advancedRender("admin/permissions", true);
});

router.get("/signoff-requests", middleware.requirePermission("manageAwards"), (req, res) => {
    res.advancedRender("admin/signoff-requests", true);
});

module.exports = router;