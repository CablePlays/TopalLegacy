const cookies = require("./cookies");
const sqlDatabase = require('./sql-database');

function hasAnyPermission(permissions) {
    return permissions.manageAwards || permissions.managePermissions;
}

async function isPasswordValid(req) { // requires logged in
    const userId = cookies.getUserId(req);
    if (userId == null) return false;

    const clientPassword = cookies.getPassword(req);
    if (clientPassword == null) return false;

    const password = await sqlDatabase.getPassword(userId);
    return (clientPassword === password);
}

module.exports = {
    hasAnyPermission,
    isPasswordValid
}