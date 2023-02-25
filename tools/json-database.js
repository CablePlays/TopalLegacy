const fsdb = require("file-system-db");

function get(user) {
    const name = user.split("@")[0];
    return new fsdb("./user_data/" + name, false);
}

module.exports = {
    get
}