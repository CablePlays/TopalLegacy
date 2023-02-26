const fsdb = require("file-system-db");

const COMPACT = false;

function getRecents() {
    return new fsdb("./database/recents.json", COMPACT);
}

function getUser(user) {
    const name = user.split("@")[0];
    return new fsdb("./database/user_data/" + name, COMPACT);
}

module.exports = {
    getRecents,
    getUser
}