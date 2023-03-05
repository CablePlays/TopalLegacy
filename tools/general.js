const cookies = require("./cookies");
const sqlDatabase = require('./sql-database');

async function sessionTokenValid(req) { // requires logged in
    const userId = cookies.getUserId(req);
    if (userId == null) return false;

    const clientSessionToken = cookies.getSessionToken(req);
    if (clientSessionToken == null) return false;

    const sessionToken = await sqlDatabase.getSessionToken(userId);
    return (clientSessionToken === sessionToken);
}

module.exports = {
    sessionTokenValid
}