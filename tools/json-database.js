const fsdb = require("file-system-db");
const general = require('./general');

const COMPACT = false;

function getRecents() {
    return new fsdb("./database/recents.json", COMPACT);
}

function getUser(user) {
    if (general.isUser(user)) {
        const name = user.split("@")[0];
        return new fsdb("./database/user_data/" + name, COMPACT);
    }

    throw new Error("Invalid user: " + user);
}

module.exports = {
    getRecents,
    getUser
}